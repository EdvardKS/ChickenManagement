import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import type { BusinessHours } from "@shared/schema";
import puppeteer from 'puppeteer';

// Initialize the OAuth2 client (This part is kept for potential future use with the Google API)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Load credentials from the JSON file (This part is kept for potential future use with the Google API)
const credentialsPath = path.join(process.cwd(), 'google', 'client_secret_417296580036-n1a3ea53b2g6cejieql4orkdfhdhdhjn.apps.googleusercontent.com.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Configure authentication (This part is kept for potential future use with the Google API)
oauth2Client.setCredentials(credentials);

// Initialize the Business Profile API client (This part is kept for potential future use with the Google API)
const businessProfile = google.mybusinessbusinessinformation({
  version: 'v1',
  auth: oauth2Client
});

export async function scrapeGoogleBusinessHours(): Promise<BusinessHours[]> {
  try {
    // Iniciar navegador
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      executablePath: '/nix/store/chrome/chrome'
    });

    const page = await browser.newPage();

    // Buscar el negocio en Google
    await page.goto('https://www.google.com/search?q=asador+la+morenica+villena');

    // Esperar a que cargue la información del negocio
    await page.waitForSelector('div[data-attrid="kc:/location/location:hours"]', { timeout: 5000 });

    // Extraer los horarios
    const hoursData = await page.evaluate(() => {
      const hoursElement = document.querySelector('div[data-attrid="kc:/location/location:hours"]');
      if (!hoursElement) return null;

      // Obtener todos los días y horarios
      const days = Array.from(hoursElement.querySelectorAll('tr.K7Ltle')).map(row => {
        const cells = row.querySelectorAll('td');
        const day = cells[0]?.textContent?.trim() || '';
        const hours = cells[1]?.textContent?.trim() || '';
        return { day, hours };
      });

      return days;
    });

    await browser.close();

    if (!hoursData) {
      throw new Error('No se pudieron encontrar los horarios');
    }

    // Mapear los días de la semana
    const dayMap: { [key: string]: number } = {
      'lunes': 1,
      'martes': 2,
      'miércoles': 3,
      'jueves': 4,
      'viernes': 5,
      'sábado': 6,
      'domingo': 0
    };

    // Convertir los datos extraídos al formato BusinessHours
    const businessHours: BusinessHours[] = hoursData.map(({ day, hours }) => {
      const dayLower = day.toLowerCase();
      const dayOfWeek = dayMap[dayLower] || 0;

      let openTime = "00:00";
      let closeTime = "00:00";
      let isOpen = false;

      if (hours !== 'Cerrado') {
        isOpen = true;
        // Convertir el formato "9:00–17:00" a "09:00" y "17:00"
        const [open, close] = hours.split('–').map(time => {
          const [hours, minutes] = time.trim().split(':');
          return `${hours.padStart(2, '0')}:${minutes}`;
        });
        openTime = open;
        closeTime = close;
      }

      return {
        id: dayOfWeek + 1,
        dayOfWeek,
        openTime,
        closeTime,
        isOpen,
        autoUpdate: true
      };
    });

    return businessHours;
  } catch (error) {
    console.error("Error scraping business hours:", error);

    // En caso de error, devolver horarios por defecto
    const defaultHours: BusinessHours[] = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      dayOfWeek: i,
      openTime: "10:00",
      closeTime: "22:00",
      isOpen: i !== 0, // Cerrado los domingos por defecto
      autoUpdate: true
    }));

    return defaultHours;
  }
}

export async function updateGoogleBusinessHours(hours: BusinessHours[]): Promise<void> {
  // Como estamos usando web scraping, no podemos actualizar los horarios en Google
  // Solo actualizamos localmente
  console.log("Actualizando horarios localmente:", hours);
}