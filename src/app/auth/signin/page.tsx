"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PasswordInput from "@/components/PasswordInput";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("⚠️ Username dan password wajib diisi");
      return;
    }

   try {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, role") // 🔹 ambil role dari DB
    .eq("username", username)
    .eq("password", password) // ⚠️ plaintext, idealnya hash
    .single();

  if (error || !data) {
    toast.error("❌ Username atau password salah");
    return;
  }

localStorage.setItem("user", JSON.stringify({
  id: data.id,
  username: data.username,
  role: data.role
}));


  toast.success("✅ Login berhasil!");
  router.push("/");
} catch (err) {
  console.error(err);
  toast.error("❌ Terjadi kesalahan saat login");
}
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSignIn}
        className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">🔑 Login</h2>

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
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Masuk
        </button>
       
        <button
  onClick={() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.error("⚠️ Harap login dulu!");
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      toast.error("🚫 Hanya admin yang bisa akses Kelola User!");
      return;
    }

    localStorage.setItem("shortcutPage", "kelolaUser");
    window.location.href = "/";
  }}
  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg mt-3"
>
  🚀 Masuk Kelola User
</button>




        <p className="text-sm text-gray-500 text-center">
          Belum punya akun?{" "}
          <a href="/auth/signup" className="text-blue-600 hover:underline">
            Daftar
          </a>
        </p>
      </form>
    </div>
  );
}
