import MasterLanding from "@/components/MasterLanding";
import AdminOnly from "@/components/AdminOnly";

export default function MasterPage() {
  return (
    <AdminOnly>
      <MasterLanding />
    </AdminOnly>
  );
}
