"use client";

import KelolaWarehouse from "@/components/KelolaWarehouse";

import AdminOnly from "@/components/AdminOnly";

export default function KelolaWare() {
  return (
    <AdminOnly>
      <div className="min-h-screen w-full bg-white px-6 py-6">
        <KelolaWarehouse />
      </div>
    </AdminOnly>
  );
}
