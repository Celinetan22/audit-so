"use client";

import KelolaServiceCenter from "@/components/KelolaServiceCenter";

import AdminOnly from "@/components/AdminOnly";

export default function ServiceCenter() {
  return (
    <AdminOnly>
      <div className="min-h-screen w-full bg-white px-6 py-6">
        <KelolaServiceCenter />
      </div>
    </AdminOnly>
  );
}
