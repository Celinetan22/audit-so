"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { Trash2, Plus } from "lucide-react";

type Approver = {
  id: number;
  user: string;
};

export default function KelolaApproval() {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApprovers();
  }, []);

  const fetchApprovers = async () => {
    const { data, error } = await supabase
      .from("approvals_status")
      .select("id, user")
      .order("id", { ascending: true });

    if (error) {
      toast.error("Gagal mengambil data approver");
      return;
    }
    setApprovers(data || []);
  };

  const addApprover = async () => {
    if (!newName.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("approvals_status").insert([
      {
        user: newName,
        checked: false,
        time: null,
        note: null,
        report_id: null,
      },
    ]);
    setLoading(false);

    if (error) {
      toast.error("Gagal menambah approver");
    } else {
      toast.success("Approver berhasil ditambahkan");
      setNewName("");
      fetchApprovers();
    }
  };

  const deleteApprover = async (id: number) => {
    const { error } = await supabase.from("approvals_status").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus approver");
    } else {
      toast.success("Approver dihapus");
      fetchApprovers();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center items-start py-12">
      <div className="bg-white w-full max-w-3xl p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Kelola Status Approval
        </h2>

        {/* Form tambah approver */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Masukkan nama approver..."
            className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={addApprover}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition disabled:opacity-60"
          >
            <Plus size={18} />
            {loading ? "Menyimpan..." : "Tambah"}
          </button>
        </div>

        {/* Tabel approver */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold border-b border-gray-200">
                  Nama Approver
                </th>
                <th className="px-4 py-3 text-center font-semibold border-b border-gray-200 w-32">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {approvers.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Belum ada approver
                  </td>
                </tr>
              ) : (
                approvers.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition`}
                  >
                    <td className="px-4 py-2 border-b border-gray-200">
                      {a.user}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 text-center">
                      <button
                        onClick={() => deleteApprover(a.id)}
                        className="text-red-500 hover:text-red-700 flex items-center justify-center gap-1 mx-auto"
                      >
                        <Trash2 size={16} /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
