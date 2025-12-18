"use client";

import KelolaPIC from "@/components/KelolaPIC";
import AdminOnly from "@/components/AdminOnly";

export default function KelolaPICPage() {
  return (
    <AdminOnly>
      <div className="min-h-screen w-full bg-white px-6 py-6">
        <KelolaPIC />
      </div>
    </AdminOnly>
  );
}
