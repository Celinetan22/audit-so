"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import * as XLSX from "xlsx-js-style";
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Edit2,
  Check,
  X,
} from "lucide-react";

type Cabang = {
  id: number;
  name: string;
  parent_id: number | null;
  children?: Cabang[];
};

export default function KelolaCabang() {
  const [cabangs, setCabangs] = useState<Cabang[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [showChildForm, setShowChildForm] = useState<number | null>(null);
  const [childName, setChildName] = useState("");
  const [newParentName, setNewParentName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const fetchCabangs = async () => {
    const { data, error } = await supabase.from("cabangs").select("*").order("id");
    if (error) return console.error(error);

    const map: Record<number, Cabang> = {};
    const roots: Cabang[] = [];

    data.forEach((c) => (map[c.id] = { ...c, children: [] }));
    data.forEach((c) => {
      if (c.parent_id) map[c.parent_id]?.children?.push(map[c.id]);
      else roots.push(map[c.id]);
    });

    setCabangs(roots);
  };

  useEffect(() => {
    fetchCabangs();
  }, []);

  const handleAddParent = async () => {
    if (!newParentName.trim()) return;
    const { error } = await supabase
      .from("cabangs")
      .insert([{ name: newParentName, parent_id: null }]);
    if (!error) {
      toast.success("Cabang utama ditambahkan");
      setNewParentName("");
      fetchCabangs();
    }
  };

  const handleAddChild = async (parentId: number) => {
    if (!childName.trim()) return;
    const { error } = await supabase
      .from("cabangs")
      .insert([{ name: childName, parent_id: parentId }]);
    if (!error) {
      toast.success("Anak cabang ditambahkan");
      setChildName("");
      setShowChildForm(null);
      fetchCabangs();
    }
  };

  const handleEditCabang = async (id: number) => {
    if (!editName.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    const { error } = await supabase.from("cabangs").update({ name: editName }).eq("id", id);
    if (!error) {
      toast.success("Nama cabang diperbarui");
      setEditId(null);
      setEditName("");
      fetchCabangs();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("cabangs").delete().eq("id", deleteId);
    if (!error) {
      toast.success("Cabang dihapus");
      setDeleteId(null);
      setDeleteName("");
      fetchCabangs();
    }
  };

  const toggleExpand = (id: number) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleImportCabang = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const mappedData = (jsonData as any[])
          .map((row) => ({
            name: row["NAMA CABANG"] || row["Cabang"] || "",
            parent_id: null,
          }))
          .filter((d) => d.name !== "");

        if (mappedData.length === 0) {
          toast.error("Tidak ada data cabang valid di file");
          return;
        }

        const { error } = await supabase.from("cabangs").insert(mappedData);
        if (error) throw error;

        toast.success("Cabang berhasil diimport");
        fetchCabangs();
      } catch (err: any) {
        console.error("Import error:", err.message);
        toast.error("Gagal import cabang: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const renderCabangs = (list: Cabang[], isParentLevel = true) => (
    <ul className="ml-6 border-l pl-4 border-gray-200">
      {list.map((c) => (
        <li key={c.id} className="mb-3">
          <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition">
            <div className="flex items-center gap-2">
              {c.children && c.children.length > 0 && (
                <button
                  onClick={() => toggleExpand(c.id)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  {expanded.includes(c.id) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              )}
              {editId === c.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border rounded p-1 text-sm"
                />
              ) : (
                <span className="font-medium text-gray-800">{c.name}</span>
              )}
            </div>

            <div className="flex gap-2">
              {editId === c.id ? (
                <>
                  <button
                    onClick={() => handleEditCabang(c.id)}
                    className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600 flex items-center gap-1"
                  >
                    <Check size={14} /> Simpan
                  </button>
                  <button
                    onClick={() => {
                      setEditId(null);
                      setEditName("");
                    }}
                    className="bg-gray-400 text-white px-2 py-1 text-xs rounded hover:bg-gray-500 flex items-center gap-1"
                  >
                    <X size={14} /> Batal
                  </button>
                </>
              ) : (
                <>
                  {isParentLevel && (
                    <button
                      onClick={() =>
                        setShowChildForm(showChildForm === c.id ? null : c.id)
                      }
                      className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600"
                    >
                      <Plus size={14} /> Anak
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditId(c.id);
                      setEditName(c.name);
                    }}
                    className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 text-xs rounded hover:bg-yellow-600"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeleteId(c.id);
                      setDeleteName(c.name);
                    }}
                    className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </>
              )}
            </div>
          </div>

          {showChildForm === c.id && isParentLevel && (
            <div className="ml-6 mt-2 bg-white border rounded-lg p-3 shadow-sm">
              <label className="block text-sm font-medium mb-1">
                Nama Anak Cabang
              </label>
              <input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Masukkan nama anak cabang..."
                className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddChild(c.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setShowChildForm(null);
                    setChildName("");
                  }}
                  className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {c.children && c.children.length > 0 && expanded.includes(c.id) && (
            <div className="mt-2">{renderCabangs(c.children, false)}</div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 p-10">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Kelola Cabang
        </h1>

        <div className="max-w-lg mb-10 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Cabang Utama
          </label>
          <input
            value={newParentName}
            onChange={(e) => setNewParentName(e.target.value)}
            placeholder="Masukkan cabang utama..."
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddParent}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Simpan Cabang Utama
          </button>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Import Cabang dari Excel/CSV
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImportCabang}
            className="border p-2 rounded"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Daftar Cabang</h3>
          {cabangs.length > 0 ? (
            renderCabangs(cabangs, true)
          ) : (
            <p className="text-gray-500 italic">Belum ada cabang</p>
          )}
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Konfirmasi Hapus
            </h2>
            <p className="mb-6 text-gray-600">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-semibold">{deleteName}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteId(null);
                  setDeleteName("");
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
