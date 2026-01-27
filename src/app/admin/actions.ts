'use server';

import { eventService } from "@/services/eventService";
import { Event, EventStatus, EventType } from "@/types/event";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-utils";

export async function saveEventAction(prevState: unknown, formData: FormData) {
  try {
    console.log("Admin Action: Saving Event...");
    await requireAdmin();

    const id = formData.get("id") as string;
    const isNew = !id;
    console.log(`Event ID: ${id || 'NEW'}, Title: ${formData.get("title")}`);
    
    // Basic fields
    const event: Partial<Event> = {
      id: id || `${formData.get("date")}-${(formData.get("title") as string).toLowerCase().replace(/\s+/g, '-')}`,
      title: formData.get("title") as string,
      date: formData.get("date") as string,
      district: formData.get("district") as string,
      type: formData.get("type") as EventType, 
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      image: formData.get("image") as string || '/images/events/placeholder.jpg',
      status: formData.get("status") as EventStatus,
      categories: (formData.get("categories") as string).split(',').map(s => s.trim()).filter(Boolean),
    };

    // Registration config
    event.registration = {
      isOpen: formData.get("reg_isOpen") === 'on',
      url: formData.get("reg_url") as string,
      fee: formData.get("reg_fee") as string,
      deadline: formData.get("reg_deadline") as string,
    };

    // Organizer
    event.organizer = {
      name: formData.get("org_name") as string,
      contact: {
        name: formData.get("org_contact_name") as string,
        phone: formData.get("org_contact_phone") as string,
      }
    };

    // Audit
    const now = new Date().toISOString();
    event.audit = {
      updatedAt: now,
      updatedBy: 'admin', // In real app, get session user email
      createdAt: now, // Default to now, will be overwritten if existing
    };

    // If existing, we should probably fetch it first to preserve creation date, 
    // but for now we'll just overwrite or assume the service handles partials (it does a Put, so it replaces).
    // To be safe for "createdAt", we could fetch first. 
    if (!isNew) {
      const existing = await eventService.getEventById(id);
      if (existing?.audit?.createdAt) {
        event.audit.createdAt = existing.audit.createdAt;
      }
    }

    await eventService.saveEvent(event as Event);
    revalidateTag('events', 'default');
    
    return { success: true, message: "Event saved successfully!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to save event." };
  }
}

export async function deleteEventAction(id: string) {
    await requireAdmin();
    // Implementation of delete in service is missing, we need to add it.
    // await eventService.deleteEvent(id);
    // revalidateTag('events', 'default');
}
