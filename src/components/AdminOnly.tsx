"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const user = localStorage.getItem("user");
      if (!user) {
        setStatus("denied");
        return;
      }
      const parsed = JSON.parse(user);

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", parsed.id)
        .single();

      if (!error && data?.role?.toLowerCase() === "admin") {
        setStatus("allowed");
      } else {
        setStatus("denied");
      }
    };

    checkRole();
  }, []);

  // Tampilan loading di tengah layar
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-gray-600 text-lg font-medium"
        >
          Checking access...
        </motion.div>
      </div>
    );
  }

  // Tampilan akses ditolak
  if (status === "denied") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white shadow-md rounded-lg px-8 py-6 border border-red-200 text-center"
        >
          <p className="text-red-600 text-xl font-semibold">Akses Ditolak</p>
          <p className="text-gray-600 text-sm mt-2">
            Halaman ini hanya dapat diakses oleh admin.
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
