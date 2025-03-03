import { apiRequest } from "./queryClient";
import type { BusinessHours } from "@shared/schema";

export async function scrapeGoogleBusinessHours(): Promise<BusinessHours[]> {
  try {
    const response = await apiRequest("GET", "/api/business-hours/sync");
    return response;
  } catch (error) {
    console.error("Failed to scrape business hours:", error);
    throw error;
  }
}

export async function updateBusinessHours(hours: BusinessHours): Promise<void> {
  try {
    // First update our database
    await apiRequest("PATCH", `/api/business-hours/${hours.id}`, hours);

    // Then sync with Google if auto-update is enabled
    if (hours.autoUpdate) {
      await apiRequest("POST", "/api/business-hours/sync", { hours });
    }
  } catch (error) {
    console.error("Failed to update business hours:", error);
    throw error;
  }
}

export function formatBusinessHours(hours: BusinessHours): string {
  const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return `${DAYS[hours.dayOfWeek]}: ${hours.openTime} - ${hours.closeTime}`;
}