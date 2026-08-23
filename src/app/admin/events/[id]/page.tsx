import EventForm from "@/components/admin/EventForm";
import { isAdmin } from "@/lib/auth-utils";
import { eventService } from "@/services/eventService";
import { notFound, redirect } from "next/navigation";
import styles from "@/components/admin/Admin.module.css";

export default async function EditEventPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const isAllowed = await isAdmin();
  if (!isAllowed) redirect("/");

  const { id } = await params;
  const event = await eventService.getEventById(id);

  if (!event) return notFound();

  return (
    <>
      <h1 className={styles.pageHeading}>Edit Event: {event.title}</h1>
      <EventForm event={event} />
    </>
  );
}
