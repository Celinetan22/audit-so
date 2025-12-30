"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, Check, X, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Item = {
  id: number;
  name: string;
};

export default function KelolaTradisional() {
  const [list, setList] = useState<Item[]>([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("service_center")
      .select("*")
      .order("id");

    if (error) {
      toast.error("Gagal ambil data");
      return;
    }
    setList(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addData = async () => {
    if (!newName.trim()) return toast.error("Nama wajib diisi");
    const { error } = await supabase.from("tradisional").insert([{ name: newName }]);
    if (!error) {
      toast.success("Berhasil ditambahkan");
      setNewName("");
      fetchData();
    }
  };

  const saveEdit = async (id: number) => {
    if (!editName.trim()) return toast.error("Nama wajib diisi");
    const { error } = await supabase
      .from("service_center")
      .update({ name: editName })
      .eq("id", id);

    if (!error) {
      toast.success("Berhasil diupdate");
      setEditId(null);
      fetchData();
    }
  };

  const deleteData = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from("service_center")
      .delete()
      .eq("id", deleteId);

    if (!error) {
      toast.success("Berhasil dihapus");
      setDeleteId(null);
      fetchData();
    }
  };

  const filtered = list.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/master">
          <ArrowLeft className="cursor-pointer" />
        </Link>
        <h1 className="text-2xl font-bold">Kelola Service Center</h1>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama tradisional..."
          className="border rounded px-3 py-2"
        />
        <button onClick={addData} className="bg-black text-white px-4 rounded">
          <Plus size={16} />
        </button>
      </div>

      <input
        placeholder="Cari..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 mb-4 w-full"
      />

      {/* List */}
      {filtered.map((i) => (
        <div key={i.id} className="flex justify-between border p-2 mb-2">
          {editId === i.id ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border px-2"
            />
          ) : (
            <span>{i.name}</span>
          )}

          <div className="flex gap-2">
            {editId === i.id ? (
              <>
                <button onClick={() => saveEdit(i.id)}>
                  <Check size={16} />
                </button>
                <button onClick={() => setEditId(null)}>
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => {
                  setEditId(i.id);
                  setEditName(i.name);
                }}>
                  <Edit2 size={16} />
                </button>
                <button onClick={() => {
                  setDeleteId(i.id);
                  setDeleteName(i.name);
                }}>
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Confirm Delete */}
      {deleteId && (
        <div className="mt-4">
          <p>Hapus <b>{deleteName}</b>?</p>
          <button onClick={deleteData} className="bg-red-500 text-white px-3 py-1">
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}
