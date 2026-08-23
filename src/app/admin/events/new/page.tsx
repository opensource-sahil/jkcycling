import EventForm from "@/components/admin/EventForm";
import { isAdmin } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import styles from "@/components/admin/Admin.module.css";

export default async function NewEventPage() {
  const isAllowed = await isAdmin();
  if (!isAllowed) redirect("/");

  return (
    <>
      <h1 className={styles.pageHeading}>Create New Event</h1>
      <EventForm />
    </>
  );
}
