"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PasswordInput from "@/components/PasswordInput";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("⚠️ Username dan password wajib diisi");
      return;
    }

    try {
      // 🔹 simpan user tanpa role (hanya username + password)
      const { error } = await supabase.from("users").insert([
        {
          username,
          password, // ⚠️ masih plaintext (sebaiknya nanti di-hash pakai bcrypt)
        },
      ]);

      if (error) {
        toast.error("❌ " + error.message);
      } else {
        toast.success("✅ Akun berhasil dibuat, silakan login");
        router.push("/auth/signin");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Terjadi kesalahan saat membuat akun");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSignUp}
        className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">📝 Daftar</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Daftar
        </button>

        <p className="text-sm text-gray-500 text-center">
          Sudah punya akun?{" "}
          <a href="/auth/signin" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
