"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Check, X, Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Warehouse = {
  id: number;
  name: string;
};

export default function KelolaWarehouse() {
  const router = useRouter();

  const [warehouseList, setWarehouseList] = useState<Warehouse[]>([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchWarehouse = async () => {
    const { data, error } = await supabase
      .from("warehouse")
      .select("*")
      .order("id");

    if (error) {
      console.error(error);
      toast.error("Gagal mengambil data warehouse");
      return;
    }

    setWarehouseList(data || []);
  };

  useEffect(() => {
    fetchWarehouse();
  }, []);

  // ===============================
  // TAMBAH
  // ===============================
  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("Nama warehouse tidak boleh kosong");
      return;
    }

    const { error } = await supabase
      .from("warehouse")
      .insert([{ name: newName.trim() }]);

    if (error) {
      console.error(error);
      toast.error("Gagal menambahkan warehouse");
      return;
    }

    toast.success("Warehouse berhasil ditambahkan");
    setNewName("");
    fetchWarehouse();
  };

  // ===============================
  // EDIT
  // ===============================
  const handleEdit = async (id: number) => {
    if (!editName.trim()) {
      toast.error("Nama warehouse tidak boleh kosong");
      return;
    }

    const { error } = await supabase
      .from("warehouse")
      .update({ name: editName.trim() })
      .eq("id", id);

    if (error) {
      console.error(error);
      toast.error("Gagal memperbarui warehouse");
      return;
    }

    toast.success("Warehouse berhasil diperbarui");
    setEditId(null);
    setEditName("");
    fetchWarehouse();
  };

  // ===============================
  // DELETE
  // ===============================
  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("warehouse")
      .delete()
      .eq("id", deleteId);

    if (error) {
      console.error(error);
      toast.error("Gagal menghapus warehouse");
      return;
    }

    toast.success("Warehouse berhasil dihapus");
    setDeleteId(null);
    setDeleteName("");
    fetchWarehouse();
  };

  // ===============================
  // FILTER
  // ===============================
  const filteredList = warehouseList.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-10 border border-gray-200"
      >
        {/* ================= HEADER ================= */}
        <button
          onClick={() => router.push("/master")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition mb-6"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        <h1 className="text-3xl font-bold text-gray-800 text-center mb-10">
          Kelola Data Warehouse
        </h1>

        {/* ================= LAYOUT ================= */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* KIRI */}
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Tambah Warehouse
            </h3>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Masukkan nama warehouse..."
                className="flex-1 border-2 border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-gray-400 outline-none"
              />
              <button
                onClick={handleAdd}
                className="bg-gray-800 text-white px-5 py-2 rounded-xl hover:bg-black flex items-center gap-2"
              >
                <Plus size={18} /> Tambah
              </button>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Cari Warehouse
            </h3>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari warehouse..."
                className="w-full border-2 border-gray-300 rounded-xl pl-10 pr-3 py-2 focus:ring-2 focus:ring-gray-400 outline-none"
              />
            </div>
          </div>

          {/* KANAN */}
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Daftar Warehouse
            </h3>

            {filteredList.length > 0 ? (
              <ul className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {filteredList.map((w) => (
                  <li
                    key={w.id}
                    className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border shadow-sm"
                  >
                    {editId === w.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border rounded-lg p-1 text-sm flex-1 mr-2"
                      />
                    ) : (
                      <span className="font-medium">{w.name}</span>
                    )}

                    <div className="flex gap-2">
                      {editId === w.id ? (
                        <>
                          <button
                            onClick={() => handleEdit(w.id)}
                            className="bg-green-600 text-white px-3 py-1 text-xs rounded-lg"
                          >
                            <Check size={14} /> Simpan
                          </button>
                          <button
                            onClick={() => {
                              setEditId(null);
                              setEditName("");
                            }}
                            className="bg-gray-400 text-white px-3 py-1 text-xs rounded-lg"
                          >
                            <X size={14} /> Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditId(w.id);
                              setEditName(w.name);
                            }}
                            className="bg-yellow-500 text-white px-3 py-1 text-xs rounded-lg"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleteId(w.id);
                              setDeleteName(w.name);
                            }}
                            className="bg-red-500 text-white px-3 py-1 text-xs rounded-lg"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic text-center py-4">
                Tidak ada data warehouse
              </p>
            )}
          </div>
        </div>

        {/* ================= MODAL DELETE ================= */}
        {deleteId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-96">
              <h2 className="text-lg font-semibold mb-4">
                Konfirmasi Hapus
              </h2>
              <p className="mb-6">
                Hapus warehouse <b className="text-red-600">{deleteName}</b>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteId(null);
                    setDeleteName("");
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
