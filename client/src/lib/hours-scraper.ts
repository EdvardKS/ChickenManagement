import { apiRequest } from "./queryClient";
import type { BusinessHours } from "@shared/schema";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ScrapedHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export async function scrapeGoogleBusinessHours(): Promise<ScrapedHours[]> {
  try {
    // Note: In a real implementation, this would use a server-side API
    // to scrape Google Business hours. For this demo, we return mock data.
    const mockHours: ScrapedHours[] = [
      { dayOfWeek: 1, openTime: "09:00", closeTime: "22:00" }, // Monday
      { dayOfWeek: 2, openTime: "09:00", closeTime: "22:00" }, // Tuesday
      { dayOfWeek: 3, openTime: "09:00", closeTime: "22:00" }, // Wednesday
      { dayOfWeek: 4, openTime: "09:00", closeTime: "22:00" }, // Thursday
      { dayOfWeek: 5, openTime: "09:00", closeTime: "23:00" }, // Friday
      { dayOfWeek: 6, openTime: "10:00", closeTime: "23:00" }, // Saturday
      { dayOfWeek: 0, openTime: "10:00", closeTime: "22:00" }, // Sunday
    ];

    return mockHours;
  } catch (error) {
    console.error("Failed to scrape business hours:", error);
    throw error;
  }
}

export async function updateBusinessHours(): Promise<void> {
  try {
    const scrapedHours = await scrapeGoogleBusinessHours();
    
    // Update each day's hours
    for (const hours of scrapedHours) {
      await apiRequest("PATCH", `/api/business-hours/${hours.dayOfWeek}`, {
        openTime: hours.openTime,
        closeTime: hours.closeTime,
      });
    }
  } catch (error) {
    console.error("Failed to update business hours:", error);
    throw error;
  }
}

export function formatBusinessHours(hours: BusinessHours): string {
  return `${DAYS[hours.dayOfWeek]}: ${hours.openTime} - ${hours.closeTime}`;
}
