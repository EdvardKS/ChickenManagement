import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import type { BusinessHours } from "@shared/schema";

// Initialize the OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Load credentials from the JSON file
const credentialsPath = path.join(process.cwd(), 'google', 'web2-452608-a3c00a713126.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Configure authentication
oauth2Client.setCredentials(credentials);

// Initialize the Business Profile API client
const businessProfile = google.mybusinessbusinessinformation({
  version: 'v1',
  auth: oauth2Client
});

export async function scrapeGoogleBusinessHours(): Promise<BusinessHours[]> {
  try {
    // Get the location ID from environment variables
    const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID;
    if (!locationId) {
      throw new Error('Google Business location ID not configured');
    }

    // Fetch business hours from Google Business Profile API
    const response = await businessProfile.locations.get({
      name: `locations/${locationId}`,
      readMask: 'regularHours'
    });

    const regularHours = response.data.regularHours?.periods || [];

    // Transform Google's format to our BusinessHours format
    const businessHours: BusinessHours[] = Array.from({ length: 7 }, (_, i) => {
      const dayPeriod = regularHours.find(period => period.openDay === i);

      return {
        id: i + 1,
        dayOfWeek: i,
        openTime: dayPeriod?.openTime || "00:00",
        closeTime: dayPeriod?.closeTime || "00:00",
        isOpen: !!dayPeriod,
        autoUpdate: true
      };
    });

    return businessHours;
  } catch (error) {
    console.error("Error fetching business hours from Google:", error);
    throw error;
  }
}

export async function updateGoogleBusinessHours(hours: BusinessHours[]): Promise<void> {
  try {
    const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID;
    if (!locationId) {
      throw new Error('Google Business location ID not configured');
    }

    // Transform our format to Google's format
    const regularHours = {
      periods: hours
        .filter(hour => hour.isOpen)
        .map(hour => ({
          openDay: hour.dayOfWeek,
          openTime: hour.openTime,
          closeDay: hour.dayOfWeek,
          closeTime: hour.closeTime
        }))
    };

    // Update hours in Google Business Profile
    await businessProfile.locations.patch({
      name: `locations/${locationId}`,
      updateMask: 'regularHours',
      requestBody: {
        regularHours
      }
    });
  } catch (error) {
    console.error("Error updating Google Business hours:", error);
    throw error;
  }
}