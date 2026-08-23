'use server';

import { requireAdmin } from "@/lib/auth-utils";
import { ActionResult, failure } from "@/lib/action-result";
import { buildRideGroupFromForm } from "@/lib/ride-group-form";
import { rideGroupService } from "@/services/rideGroupService";
import { revalidateTag } from "next/cache";

export async function saveRideGroupAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireAdmin();

    const submittedId = (formData.get("id") as string | null)?.trim();
    // Saving is a full Put, so the stored record is needed to carry forward
    // anything the form does not submit.
    const existing = submittedId ? await rideGroupService.getById(submittedId) : null;

    const group = buildRideGroupFromForm(formData, existing, {
      now: new Date().toISOString(),
      actor,
    });

    if (!group.name || !group.district) {
      return { success: false, message: "Name and district are required." };
    }
    if (!group.id) {
      return { success: false, message: "That name does not produce a usable id." };
    }

    await rideGroupService.save(group);
    revalidateTag('ride-groups', 'default');

    return { success: true, message: "Ride group saved." };
  } catch (error) {
    console.error("Failed to save ride group:", error);
    return failure(error, "Failed to save ride group.");
  }
}

export async function deleteRideGroupAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id?.trim()) {
      return { success: false, message: "Missing group id." };
    }

    await rideGroupService.delete(id);
    revalidateTag('ride-groups', 'default');

    return { success: true, message: "Ride group deleted." };
  } catch (error) {
    console.error("Failed to delete ride group:", error);
    return failure(error, "Failed to delete ride group.");
  }
}
