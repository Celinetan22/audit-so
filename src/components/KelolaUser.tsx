"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function KelolaUser() {
  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "user" });
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});
  const [editRow, setEditRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ username: string; password: string; role: string }>({
    username: "",
    password: "",
    role: "user",
  });

  // === Fetch Users ===
  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*").order("id", { ascending: true });
    if (error) {
      console.error(error);
      toast.error("Gagal mengambil data user");
    } else {
      setUsers(data || []);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // === Tambah User ===
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      toast.error("Username dan Password wajib diisi");
      return;
    }

    const { error } = await supabase.from("users").insert([newUser]);
    if (error) {
      console.error(error);
      toast.error("Gagal menambah user");
    } else {
      toast.success("User berhasil ditambahkan");
      setNewUser({ username: "", password: "", role: "user" });
      fetchUsers();
    }
  };

  // === Hapus User ===
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      console.error(error);
      toast.error("Gagal menghapus user");
    } else {
      toast.success("User berhasil dihapus");
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  // === Edit User ===
  const handleStartEdit = (user: any) => {
    setEditRow(user.id);
    setEditData({ username: user.username, password: user.password, role: user.role });
  };

  const handleSaveEdit = async (id: number) => {
    const { error } = await supabase
      .from("users")
      .update({
        username: editData.username,
        password: editData.password,
        role: editData.role,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      toast.error("Gagal memperbarui user");
    } else {
      toast.success("User berhasil diperbarui");
      setEditRow(null);
      fetchUsers();
    }
  };

  const handleCancelEdit = () => {
    setEditRow(null);
    setEditData({ username: "", password: "", role: "user" });
  };

  // === UI ===
  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-10 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8 tracking-tight">
          Kelola User
        </h2>

        {/* Form Tambah User */}
        <form onSubmit={handleAddUser} className="flex flex-col md:flex-row items-center gap-3 mb-10">
          <input
            type="text"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            className="border border-gray-300 rounded-xl px-4 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-gray-400 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="border border-gray-300 rounded-xl px-4 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-gray-400 outline-none"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="border border-gray-300 rounded-xl px-3 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-gray-400 outline-none"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-gray-800 text-white px-6 py-2 rounded-xl hover:bg-gray-700 transition font-medium w-full md:w-auto"
          >
            Tambah
          </button>
        </form>

        {/* Tabel User */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-2xl overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left border-b">ID</th>
                <th className="p-3 text-left border-b">Username</th>
                <th className="p-3 text-left border-b">Role</th>
                <th className="p-3 text-left border-b">Password</th>
                <th className="p-3 text-center border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="even:bg-gray-50 hover:bg-gray-100 transition">
                  <td className="p-3 border-b">{u.id}</td>

                  {/* Username */}
                  <td className="p-3 border-b">
                    {editRow === u.id ? (
                      <input
                        type="text"
                        value={editData.username}
                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                        className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-gray-400 outline-none"
                      />
                    ) : (
                      u.username
                    )}
                  </td>

                  {/* Role */}
                  <td className="p-3 border-b">
                    {editRow === u.id ? (
                      <select
                        value={editData.role}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-gray-400 outline-none"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="capitalize">{u.role}</span>
                    )}
                  </td>

                  {/* Password */}
                  <td className="p-3 border-b">
                    {editRow === u.id ? (
                      <input
                        type="text"
                        value={editData.password}
                        onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                        className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-gray-400 outline-none"
                      />
                    ) : (
                      <>
                        {showPassword[u.id] ? u.password : "••••••••"}
                        <button
                          onClick={() =>
                            setShowPassword((prev) => ({ ...prev, [u.id]: !prev[u.id] }))
                          }
                          className="ml-3 text-gray-600 text-sm hover:underline"
                        >
                          {showPassword[u.id] ? "Sembunyikan" : "Lihat"}
                        </button>
                      </>
                    )}
                  </td>

                  {/* Aksi */}
                  <td className="p-3 border-b text-center space-x-2">
                    {editRow === u.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(u.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-400 text-white px-3 py-1 rounded-lg hover:bg-gray-500 transition"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                        >
                          Hapus
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-6 border-t">
                    Belum ada user
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
