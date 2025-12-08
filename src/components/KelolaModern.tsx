"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Check, X, Search } from "lucide-react";

type Modern = {
  id: number;
  name: string;
};

export default function KelolaModern() {
  const [modernList, setModernList] = useState<Modern[]>([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchModern = async () => {
    const { data, error } = await supabase.from("modern").select("*").order("id");
    if (error) {
      console.error(error);
      toast.error("Gagal mengambil data");
      return;
    }
    setModernList(data || []);
  };

  useEffect(() => {
    fetchModern();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return toast.error("Nama tidak boleh kosong");
    const { error } = await supabase.from("modern").insert([{ name: newName }]);
    if (!error) {
      toast.success("Modern berhasil ditambahkan");
      setNewName("");
      fetchModern();
    }
  };

  const handleEdit = async (id: number) => {
    if (!editName.trim()) return toast.error("Nama tidak boleh kosong");
    const { error } = await supabase.from("modern").update({ name: editName }).eq("id", id);
    if (!error) {
      toast.success("Modern berhasil diperbarui");
      setEditId(null);
      setEditName("");
      fetchModern();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("modern").delete().eq("id", deleteId);
    if (!error) {
      toast.success("Modern berhasil dihapus");
      setDeleteId(null);
      setDeleteName("");
      fetchModern();
    }
  };

  const filteredList = modernList.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-10 border border-gray-200"
      >
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-gray-800 text-center mb-10 tracking-tight"
        >
          Kelola Data Modern
        </motion.h1>

        {/* Layout Dua Kolom */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Kolom Kiri: Tambah & Cari */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-inner"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Tambah Modern
            </h3>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Masukkan nama modern..."
                className="flex-1 border-2 border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition"
              />
              <button
                onClick={handleAdd}
                className="bg-gray-800 text-white px-5 py-2 rounded-xl hover:bg-black flex items-center gap-2 transition font-medium shadow-sm"
              >
                <Plus size={18} /> Tambah
              </button>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Cari Modern
            </h3>

            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari modern..."
                className="w-full border-2 border-gray-300 rounded-xl pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition"
              />
            </div>
          </motion.div>

          {/* Kolom Kanan: Daftar Modern */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-inner"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Daftar Modern
            </h3>

            {filteredList.length > 0 ? (
              <ul className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {filteredList.map((m, i) => (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.4 }}
                    className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
                  >
                    {editId === m.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border rounded-lg p-1 text-sm flex-1 mr-2 border-gray-300 focus:ring-2 focus:ring-gray-400 outline-none"
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{m.name}</span>
                    )}

                    <div className="flex gap-2">
                      {editId === m.id ? (
                        <>
                          <button
                            onClick={() => handleEdit(m.id)}
                            className="bg-green-600 text-white px-3 py-1 text-xs rounded-lg hover:bg-green-700 flex items-center gap-1 shadow-sm"
                          >
                            <Check size={14} /> Simpan
                          </button>
                          <button
                            onClick={() => {
                              setEditId(null);
                              setEditName("");
                            }}
                            className="bg-gray-400 text-white px-3 py-1 text-xs rounded-lg hover:bg-gray-500 flex items-center gap-1 shadow-sm"
                          >
                            <X size={14} /> Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditId(m.id);
                              setEditName(m.name);
                            }}
                            className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 text-xs rounded-lg hover:bg-yellow-600 transition shadow-sm"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleteId(m.id);
                              setDeleteName(m.name);
                            }}
                            className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 text-xs rounded-lg hover:bg-red-600 transition shadow-sm"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic text-center py-4">
                Tidak ada hasil ditemukan
              </p>
            )}
          </motion.div>
        </div>

        {/* Modal Konfirmasi Hapus */}
        {deleteId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-96 border border-gray-100"
            >
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Konfirmasi Hapus
              </h2>
              <p className="mb-6 text-gray-600">
                Apakah Anda yakin ingin menghapus{" "}
                <span className="font-semibold text-red-600">{deleteName}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteId(null);
                    setDeleteName("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
