import RideGroupForm from "@/components/admin/RideGroupForm";
import { isAdmin } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import styles from "@/components/admin/Admin.module.css";

export default async function NewRideGroupPage() {
  const isAllowed = await isAdmin();
  if (!isAllowed) redirect("/");

  return (
    <>
      <h1 className={styles.pageHeading}>Add Ride Group</h1>
      <RideGroupForm />
    </>
  );
}
