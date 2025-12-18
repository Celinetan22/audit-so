"use client";

import KelolaUser from "@/components/KelolaUser";
import AdminOnly from "@/components/AdminOnly";

export default function KelolaUserPage() {
  return (
    <AdminOnly>
      <div className="min-h-screen w-full bg-white px-6 py-6">
        <KelolaUser />
      </div>
    </AdminOnly>
  );
}
