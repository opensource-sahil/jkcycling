import EventForm from "@/components/admin/EventForm";
import { isAdmin } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function NewEventPage() {
  const isAllowed = await isAdmin();
  if (!isAllowed) redirect("/");

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
      <EventForm />
    </div>
  );
}
