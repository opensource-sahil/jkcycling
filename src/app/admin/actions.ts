'use server';

import { requireAdmin } from "@/lib/auth-utils";
import { buildEventFromForm } from "@/lib/event-form";
import { eventService } from "@/services/eventService";
import { revalidateTag } from "next/cache";

export type ActionResult = { success: boolean; message: string };

const UNAUTHORIZED = "Unauthorized Access";

function failure(error: unknown, fallback: string): ActionResult {
  if (error instanceof Error && error.message === UNAUTHORIZED) {
    return { success: false, message: "You are not authorized to do that." };
  }
  return { success: false, message: fallback };
}

export async function saveEventAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();

    const submittedId = (formData.get("id") as string | null)?.trim();
    // The save is a full Put, so the stored record is needed to carry forward
    // the fields this form does not submit (results, notice, created-at).
    const existing = submittedId ? await eventService.getEventById(submittedId) : null;

    const event = buildEventFromForm(formData, existing, {
      now: new Date().toISOString(),
      actor,
    });

    if (!event.title || !event.date) {
      return { success: false, message: "Title and date are required." };
    }

    await eventService.saveEvent(event);
    revalidateTag('events', 'default');

    return { success: true, message: "Event saved successfully!" };
  } catch (error) {
    console.error("Failed to save event:", error);
    return failure(error, "Failed to save event.");
  }
}

export async function deleteEventAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id?.trim()) {
      return { success: false, message: "Missing event id." };
    }

    await eventService.deleteEvent(id);
    revalidateTag('events', 'default');

    return { success: true, message: "Event deleted." };
  } catch (error) {
    console.error("Failed to delete event:", error);
    return failure(error, "Failed to delete event.");
  }
}
