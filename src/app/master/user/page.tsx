"use client";

import KelolaUser from "@/components/KelolaUser";
import { useRouter } from "next/navigation";

export default function KelolaUserPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-gray-50 px-6 py-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">
          Kelola User
        </h1>

        <button
          onClick={() => router.push("/master")}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-100"
        >
          ← Kembali ke Kelola Master
        </button>
      </div>

      {/* CONTENT */}
      <KelolaUser />
    </div>
  );
}
