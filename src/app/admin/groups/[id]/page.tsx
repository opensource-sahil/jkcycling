import RideGroupForm from "@/components/admin/RideGroupForm";
import { isAdmin } from "@/lib/auth-utils";
import { rideGroupService } from "@/services/rideGroupService";
import { notFound, redirect } from "next/navigation";
import styles from "@/components/admin/Admin.module.css";

export default async function EditRideGroupPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const isAllowed = await isAdmin();
  if (!isAllowed) redirect("/");

  const { id } = await params;
  const group = await rideGroupService.getById(id);

  if (!group) return notFound();

  return (
    <>
      <h1 className={styles.pageHeading}>Edit Group: {group.name}</h1>
      <RideGroupForm group={group} />
    </>
  );
}
