"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
} from "lucide-react";

interface PicSOItem {
  id: string;
  kategori: string;
  tipe: "CABANG" | "STORE" | null;
  nama: string;
}

interface PicSO {
  id: string;
  nama_team_so: string;
  pic_so_items: PicSOItem[];
}

interface PicMaster {
  id: string;
  name: string;
}


export default function PicSOPage() {
  const router = useRouter();
  const [data, setData] = useState<PicSO[]>([]);
  const [loading, setLoading] = useState(true);

  /* ===== FORM STATE ===== */
  const [showForm, setShowForm] = useState(false);
  const [namaTeam, setNamaTeam] = useState("");
  const [kategori, setKategori] = useState("DALAM_KOTA");
const [tipe, setTipe] = useState<"CABANG" | "STORE" | null>(null);

  const [namaItem, setNamaItem] = useState("");
  const [saving, setSaving] = useState(false);

const [picMaster, setPicMaster] = useState<PicMaster[]>([]);
const [selectedPicId, setSelectedPicId] = useState<string>("");
const [selectedPicName, setSelectedPicName] = useState("");


  /* ===== EDIT STATE ===== */
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

const fetchPicMaster = async () => {
  const { data, error } = await supabase
    .from("pic")
    .select("id, name")
    .order("name");

  if (!error) setPicMaster(data || []);
};


useEffect(() => {
  fetchData();
  fetchPicMaster();
}, []);


  const fetchData = async () => {
    const { data } = await supabase
      .from("pic_so")
      .select(
        `
        id,
        nama_team_so,
        pic_so_items (
          id,
          kategori,
          tipe,
          nama
        )
      `
      )
      .order("nama_team_so");

    setData(data || []);
    setLoading(false);
  };

  /* ================= CREATE ================= */
const handleSave = async () => {
  if (saving) return;

  const teamUpper = namaTeam.trim().toUpperCase();
  const lokasiUpper = namaItem.trim().toUpperCase();

  if (!teamUpper || !lokasiUpper) {
    toast.error("Lengkapi data");
    return;
  }

  if (
    (kategori === "DALAM_KOTA" || kategori === "LUAR_KOTA") &&
    !tipe
  ) {
    toast.error("Pilih Cabang / Store");
    return;
  }

  try {
    setSaving(true);

    const { data: existingTeam } = await supabase
      .from("pic_so")
      .select("id")
      .eq("nama_team_so", teamUpper)
      .maybeSingle();

    const teamId =
      existingTeam?.id ??
      (
        await supabase
          .from("pic_so")
          .insert({ nama_team_so: teamUpper }) // ✅ CAPITAL
          .select("id")
          .single()
      ).data?.id;

    if (!teamId) throw new Error("Gagal menyimpan team");

    await supabase.from("pic_so_items").insert({
      pic_so_id: teamId,
      kategori,
      tipe:
        kategori === "DALAM_KOTA" || kategori === "LUAR_KOTA"
          ? tipe
          : null,
      nama: lokasiUpper, // ✅ CAPITAL
    });

    setData((prev) => {
      const newItem: PicSOItem = {
        id: crypto.randomUUID(),
        kategori,
        tipe,
        nama: lokasiUpper, // ✅ CAPITAL
      };

      const teamExist = prev.find((t) => t.id === teamId);

      if (!teamExist) {
        return [
          ...prev,
          {
            id: teamId,
            nama_team_so: teamUpper,
            pic_so_items: [newItem],
          },
        ];
      }

      return prev.map((t) =>
        t.id === teamId
          ? { ...t, pic_so_items: [...t.pic_so_items, newItem] }
          : t
      );
    });

    toast.success("Data tersimpan");
    setNamaItem("");

  } catch (err: any) {
    toast.error(err.message ?? "Terjadi kesalahan");
  } finally {
    setSaving(false);
  }
};


  /* ================= UPDATE ================= */
  const handleUpdate = async (id: string) => {
    await supabase
      .from("pic_so_items")
      .update({ nama: editValue })
      .eq("id", id);

    toast.success("Data diperbarui");
    setEditId(null);
    fetchData();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data ini?")) return;
    await supabase.from("pic_so_items").delete().eq("id", id);
    toast.success("Data dihapus");
    fetchData();
  };

  /* ================= RENDER ITEM ================= */
  const renderItem = (item: PicSOItem) => {
    if (editId === item.id) {
      return (
        <div className="flex gap-2">
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm w-full"
          />
          <button onClick={() => handleUpdate(item.id)}>
            <Check className="w-4 h-4 text-green-600" />
          </button>
          <button onClick={() => setEditId(null)}>
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      );
    }





    return (
      <div className="flex justify-between items-center group">
        <span className="text-sm">{item.nama}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => {
              setEditId(item.id);
              setEditValue(item.nama);
            }}
          >
            <Pencil className="w-4 h-4 text-blue-600" />
          </button>
          <button onClick={() => handleDelete(item.id)}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    );
  };

  const renderBy = (
    items: PicSOItem[],
    kategori: string,
    tipe?: "CABANG" | "STORE"
  ) =>
    items
      .filter(
        (i) =>
          i.kategori === kategori && (tipe ? i.tipe === tipe : true)
      )
      .map((i) => (
        <div
          key={i.id}
          className="py-1 border-b border-dashed last:border-b-0"
        >
          {renderItem(i)}
        </div>
      ));

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          ← Kembali
        </button>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Input Data
        </button>
      </div>

      <h1 className="text-2xl font-bold">PIC SO Data</h1>

      {/* FORM INPUT */}
      {showForm && (
        <Card className="border-blue-200 shadow-md">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">Tambah Data PIC SO</h2>

<select
  value={selectedPicId}
  onChange={(e) => {
    const id = e.target.value;
    setSelectedPicId(id);

    const pic = picMaster.find((p) => p.id === id);
setSelectedPicName(pic?.name || "");
setNamaTeam(pic?.name || ""); // ✅ FIX

  }}
  className="border rounded-lg px-3 py-2 col-span-2"
>

  <option value="">Pilih PIC</option>
  {picMaster.map((p) => (
    <option key={p.id} value={p.id}>
      {p.name}
    </option>
  ))}
</select>


            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
  {/* ===== KATEGORI ===== */}
  <select
    value={kategori}
    onChange={(e) => {
      setKategori(e.target.value);
      setTipe(null); // reset tipe saat kategori berubah
    }}
    className="border rounded-lg px-3 py-2"
  >
    <option value="DALAM_KOTA">Dalam Kota</option>
    <option value="LUAR_KOTA">Luar Kota</option>
    <option value="WAREHOUSE">Warehouse</option>
    <option value="TRADISIONAL">Traditional</option>
    <option value="MODERN">Modern</option>
    <option value="SERVICE_CENTER">Service Center</option>
  </select>


              {(kategori === "DALAM_KOTA" ||
                kategori === "LUAR_KOTA") && (
<select
  value={tipe ?? ""}
  onChange={(e) => {
    const value = e.target.value;
    setTipe(value === "" ? null : (value as "CABANG" | "STORE"));
  }}
  className="border rounded-lg px-3 py-2"
>
  <option value="">Pilih Tipe</option>
  <option value="CABANG">Cabang</option>
  <option value="STORE">Store</option>
</select>

              )}

              <input
                placeholder="Nama Lokasi"
                value={namaItem}
                onChange={(e) => setNamaItem(e.target.value)}
                className="border rounded-lg px-3 py-2 col-span-2"
              />

<button
  onClick={() => {
  if (saving) return;
  handleSave();
}}

  disabled={saving}
className={`px-4 py-2 rounded-lg text-white ${
  saving ? "bg-green-500/70 cursor-wait" : "bg-green-600 hover:bg-green-700"
}`}

>
  {saving ? "Menyimpan..." : "Simpan"}
</button>

            </div>
          </CardContent>
        </Card>
      )}

      {/* PER TEAM */}
      {data.map((team) => (
        <Card key={team.id} className="rounded-2xl shadow-sm">
          <CardContent className="p-0 overflow-auto">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="font-bold text-lg">
                {team.nama_team_so}
              </h2>
            </div>

            <table className="w-full text-sm border-collapse">
<thead>
  {/* ===== HEADER LEVEL 1 ===== */}
  <tr className="bg-gray-50 border-b text-center text-sm font-semibold">
    <th colSpan={2} className="px-4 py-3 border-r">
      Dalam Kota
    </th>
    <th colSpan={2} className="px-4 py-3 border-r">
      Luar Kota
    </th>
    <th rowSpan={2} className="px-4 py-3 border-r">
      Warehouse
    </th>
    <th rowSpan={2} className="px-4 py-3 border-r">
      Traditional
    </th>
    <th rowSpan={2} className="px-4 py-3 border-r">
      Modern
    </th>
    <th rowSpan={2} className="px-4 py-3">
      Service
    </th>
  </tr>

  {/* ===== HEADER LEVEL 2 ===== */}
  <tr className="bg-gray-100 border-b text-sm">
    <th className="px-4 py-2 border-r">Cabang</th>
    <th className="px-4 py-2 border-r">Store</th>
    <th className="px-4 py-2 border-r">Cabang</th>
    <th className="px-4 py-2 border-r">Store</th>
  </tr>
</thead>


              <tbody>
                <tr className="align-top">
                  <td className="px-4 py-3 border-r">
                    {renderBy(team.pic_so_items, "DALAM_KOTA", "CABANG")}
                  </td>
                  <td className="px-4 py-3 border-r">
                    {renderBy(team.pic_so_items, "DALAM_KOTA", "STORE")}
                  </td>
                  <td className="px-4 py-3 border-r">
                    {renderBy(team.pic_so_items, "LUAR_KOTA", "CABANG")}
                  </td>
                  <td className="px-4 py-3 border-r">
                    {renderBy(team.pic_so_items, "LUAR_KOTA", "STORE")}
                  </td>
                  <td className="px-4 py-3 border-r">
                    {renderBy(team.pic_so_items, "WAREHOUSE")}
                  </td>
                  <td className="px-4 py-3 border-r">
                    {renderBy(team.pic_so_items, "TRADISIONAL")}
                  </td>
                  <td className="px-4 py-3 border-r">
                    {renderBy(team.pic_so_items, "MODERN")}
                  </td>
                  <td className="px-4 py-3">
                    {renderBy(team.pic_so_items, "SERVICE_CENTER")}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
