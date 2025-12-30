"use client";


import AdminOnly from "@/components/AdminOnly";
import KelolaJabodetabek from "@/components/KelolaJabodetabek";


export default function WarehousePage() {
  return (
    <AdminOnly>
      <div className="min-h-screen w-full bg-white px-6 py-6">
        <KelolaJabodetabek />
      </div>
    </AdminOnly>
  );
}
