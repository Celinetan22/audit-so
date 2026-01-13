"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type User = {
  id: number;
  username: string;
  password: string;
  role: string;
};

export default function KelolaUser() {
  const [list, setList] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user",
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    username: "",
    password: "",
    role: "user",
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});

  // ================= FETCH =================
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id");

    if (error) {
      toast.error("Gagal ambil data user");
      return;
    }
    setList(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= ADD =================
  const addUser = async () => {
    if (!newUser.username || !newUser.password)
      return toast.error("Username & password wajib diisi");

    const { error } = await supabase.from("users").insert([newUser]);

    if (!error) {
      toast.success("User berhasil ditambahkan");
      setNewUser({ username: "", password: "", role: "user" });
      fetchData();
    }
  };

  // ================= EDIT =================
  const saveEdit = async (id: number) => {
    const { error } = await supabase
      .from("users")
      .update(editData)
      .eq("id", id);

    if (!error) {
      toast.success("User berhasil diupdate");
      setEditId(null);
      fetchData();
    }
  };

  // ================= DELETE =================
  const deleteUser = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", deleteId);

    if (!error) {
      toast.success("User berhasil dihapus");
      setDeleteId(null);
      fetchData();
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/master">
          <ArrowLeft className="cursor-pointer" />
        </Link>
        <h1 className="text-2xl font-bold">Kelola User</h1>
      </div>

      {/* Input User */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          placeholder="Username"
          value={newUser.username}
          onChange={(e) =>
            setNewUser({ ...newUser, username: e.target.value })
          }
          className="border rounded px-3 py-2"
        />
        <input
          placeholder="Password"
          type="password"
          value={newUser.password}
          onChange={(e) =>
            setNewUser({ ...newUser, password: e.target.value })
          }
          className="border rounded px-3 py-2"
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button onClick={addUser} className="bg-black text-white px-4 rounded">
          <Plus size={16} />
        </button>
      </div>

      {/* List */}
      {list.map((u) => (
        <div
          key={u.id}
          className="flex justify-between items-center border p-2 mb-2 rounded"
        >
          {editId === u.id ? (
            <div className="flex gap-2">
              <input
                value={editData.username}
                onChange={(e) =>
                  setEditData({ ...editData, username: e.target.value })
                }
                className="border px-2"
              />
              <input
                value={editData.password}
                onChange={(e) =>
                  setEditData({ ...editData, password: e.target.value })
                }
                className="border px-2"
              />
              <select
                value={editData.role}
                onChange={(e) =>
                  setEditData({ ...editData, role: e.target.value })
                }
                className="border px-2"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ) : (
            <div>
              <b>{u.username}</b> ({u.role})
              <div className="text-sm text-gray-500 flex items-center gap-2">
                {showPassword[u.id] ? u.password : "••••••••"}
                <button
                  onClick={() =>
                    setShowPassword((p) => ({
                      ...p,
                      [u.id]: !p[u.id],
                    }))
                  }
                >
                  {showPassword[u.id] ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {editId === u.id ? (
              <>
                <button onClick={() => saveEdit(u.id)}>
                  <Check size={16} />
                </button>
                <button onClick={() => setEditId(null)}>
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditId(u.id);
                    setEditData({
                      username: u.username,
                      password: u.password,
                      role: u.role,
                    });
                  }}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    setDeleteId(u.id);
                    setDeleteName(u.username);
                  }}
                >
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
          <p>
            Hapus user <b>{deleteName}</b>?
          </p>
          <button
            onClick={deleteUser}
            className="bg-red-500 text-white px-3 py-1"
          >
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}
