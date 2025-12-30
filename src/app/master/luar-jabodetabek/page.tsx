"use client";


import AdminOnly from "@/components/AdminOnly";

import KelolaLuarJabodetabek from "@/components/KelolaLuarJabodetabek";


export default function WarehousePage() {
  return (
    <AdminOnly>
      <div className="min-h-screen w-full bg-white px-6 py-6">
        <KelolaLuarJabodetabek />
      </div>
    </AdminOnly>
  );
}
