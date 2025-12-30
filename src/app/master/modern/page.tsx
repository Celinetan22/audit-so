"use client";

import KelolaModern from "@/components/KelolaModern";
import AdminOnly from "@/components/AdminOnly";

export default function Kelola() {
  return (
    <AdminOnly>
      <div className="min-h-screen w-full bg-white px-6 py-6">
        <KelolaModern />
      </div>
    </AdminOnly>
  );
}
