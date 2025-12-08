"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Trash2, Plus } from "lucide-react";

export default function KelolaPIC() {
  const [namaPIC, setNamaPIC] = useState("");
  const [listPIC, setListPIC] = useState([
    "MAULANA ALIF BUNYAMIN",
    "MULYADI",
    "RICKY WIDIANTO",
    "PANDU PUTRA",
    "PANJI NUGRAHA ADIWJAYA",
    "PHILIPS MACARIOS",
    "ANDHIKA PURWANTO",
    "FAIZ ALFATHAN",
    "TEUKU ALVIAN SYAFRIL",
  ]);

  const tambahPIC = () => {
    if (namaPIC.trim() !== "") {
      setListPIC([...listPIC, namaPIC.trim()]);
      setNamaPIC("");
    }
  };

  const hapusPIC = (nama: string) => {
    setListPIC(listPIC.filter((pic) => pic !== nama));
  };

  return (
    <div className="flex justify-center items-center w-full h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
          Kelola PIC
        </h2>

        {/* Input */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Nama PIC baru..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={namaPIC}
            onChange={(e) => setNamaPIC(e.target.value)}
          />
          <button
            onClick={tambahPIC}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={18} />
            Tambah
          </button>
        </div>

        {/* List PIC */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {listPIC.map((pic) => (
            <motion.div
              key={pic}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg border border-gray-200"
            >
              <span className="text-gray-800 font-medium">{pic}</span>
              <button
                onClick={() => hapusPIC(pic)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium"
              >
                <Trash2 size={16} />
                Hapus
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
