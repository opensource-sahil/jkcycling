'use server';

import { requireAdmin } from "@/lib/auth-utils";
import { buildEventFromForm } from "@/lib/event-form";
import { sendEventAnnouncement } from "@/lib/announcement";
import { eventService } from "@/services/eventService";
import { subscriberService } from "@/services/subscriberService";
import { revalidateTag } from "next/cache";
import { ActionResult, failure } from "@/lib/action-result";

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

/**
 * Email every confirmed subscriber about an upcoming event.
 *
 * Refuses an already-announced event unless `resend` is set, so a stale admin
 * page cannot double-send. Sending is not reversible.
 */
export async function notifyEventAction(
  id: string,
  options: { resend?: boolean } = {},
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id?.trim()) {
      return { success: false, message: "Missing event id." };
    }

    const event = await eventService.getEventById(id);
    if (!event) {
      return { success: false, message: "Event not found." };
    }
    if (event.status !== 'UPCOMING') {
      return {
        success: false,
        message: `Only upcoming events can be announced (this one is ${event.status.toLowerCase()}).`,
      };
    }
    if (event.notifiedAt && !options.resend) {
      return {
        success: false,
        message: "This event has already been announced. Confirm again to send it a second time.",
      };
    }

    const subscribers = await subscriberService.listConfirmed();
    if (subscribers.length === 0) {
      return { success: false, message: "There are no confirmed subscribers to notify." };
    }

    const report = await sendEventAnnouncement(event, subscribers);

    if (report.sent === 0) {
      return {
        success: false,
        message: `Nothing was sent; all ${report.failed.length} attempt(s) failed. Check the logs.`,
      };
    }

    await eventService.saveEvent({ ...event, notifiedAt: new Date().toISOString() });
    revalidateTag('events', 'default');

    const parts = [`Announced to ${report.sent} subscriber${report.sent === 1 ? '' : 's'}.`];
    if (report.failed.length > 0) parts.push(`${report.failed.length} failed.`);
    if (report.skipped > 0) parts.push(`${report.skipped} beyond the per-run cap were not emailed.`);

    return { success: true, message: parts.join(' ') };
  } catch (error) {
    console.error("Failed to notify subscribers:", error);
    return failure(error, "Failed to notify subscribers.");
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
