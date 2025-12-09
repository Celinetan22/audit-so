"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient"
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { highlightText } from "@/lib/highlightText";
import toast from "react-hot-toast";
import PICTabsPage from "@/components/PICTabsPage";


import Pagination from "@/components/Pagination";
import { Clock, Pencil, Trash2} from "lucide-react";
import { Loader2 } from "lucide-react";
import KelolaPIC from "@/components/KelolaPIC";
import KelolaCabang from "@/components/KelolaCabang";
import EllipsisPagination from "@/components/EllipsisPagination";
import KelolaApproval from "@/components/KelolaApproval";
import AdminOnly from "@/components/AdminOnly";
import KelolaModern from "@/components/KelolaModern";
import KelolaUser from "@/components/KelolaUser";

import { Check, X } from "lucide-react";
import { Plus, Download, ListChecks } from "lucide-react";
import { useRouter } from "next/navigation";
import { RefreshCcw, Upload, Search, FileSpreadsheet, RotateCcw } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";





import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Legend,
} from "recharts";

import {
  LayoutDashboard,
  FilePlus2,
  FileText,
   UserCog,
  ClipboardList,
  Database,
  Settings,
  User,
  Building,
  CheckCircle,
  ShoppingCart,
  Users,
  LogOut,
  ChevronDown,
  ChevronUp,
  Menu,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ApprovalStep = {
  step: number;
  user: string;
  checked: boolean;
  time?: string| null;
  note?: string;
};

type ChartRow = {
  bulan: string;
  [key: string]: number | string;
};

type AuditData = {
  id?: number;
  pic: string[];
  team: string[];
  bulan: string;
  minggu: string; 
  tanggal: string;
  tanggalAwal?: string;   // ✅ tambah ini
  tanggalAkhir?: string;
    // TAMBAHKAN INI ⬇⬇⬇
  tanggal_estimasi_full?: string | null;
  tanggal_realisasi_full?: string | null;
  // ⬆⬆⬆
  tahun?: string; 
  realisasi?: string;
  realisasi_bulan?: string; 
  jabodetabek: string;
  luarJabodetabek: string;
  cabang: string;
  warehouse: string;
  tradisional: string;
  modern: string;
  whz: string;
  description?: string;
  status: string;
  created_at?: string | null;
  edited_at?: string | null;
  file_url?: string | null;
  approvals_status?: ApprovalStep[];
  report_name?: string | null;
  report_description?: string | null;
  uploaded_by?: string | null;
  no_laporan?: string | null;
  jenisData?: "visit" | "non-visit" | "";
  company?: string;
  anakCabang?: string;
  approved_by?: string[]; // ✅ tambahkan ini
  customPic?: string;
};

type Cabang = {
  id: number;
  name: string;
  parent_id: number | null;
};

const monthOrder = [
  "JANUARI",
  "FEBRUARY",
  "MARET",
  "APRIL",
  "MEI",
  "JUNI",
  "JULY",
  "AGUSTUS",
  "SEPTEMBER",
  "OKTOBER",
  "NOVEMBER",
  "DESEMBER",
];

const kategoriHeaders = [
  { key: "jabodetabek", label: "Jabodetabek" },
  { key: "luarJabodetabek", label: "Luar Jabo" },
  { key: "cabang", label: "Cabang" },
  { key: "warehouse", label: "Warehouse" },
  { key: "tradisional", label: "Tradisional" },
  { key: "modern", label: "Modern" },
  { key: "whz", label: "WH-Z" },
];

function getMonthNumber(monthName: string): number {
  const monthMap: Record<string, number> = {
    JANUARI: 1, FEBRUARI: 2, FEBRUARY: 2,
    MARET: 3, APRIL: 4, MEI: 5,
    JUNI: 6, JUNE: 6,
    JULI: 7, JULY: 7,
    AGUSTUS: 8, SEPTEMBER: 9,
    OKTOBER: 10, OCTOBER: 10,
    NOVEMBER: 11, DESEMBER: 12, DECEMBER: 12,
  };

  const key = monthName.trim().toUpperCase();
  return monthMap[key] || 0;
}

type AuditItem = {
  id?: string | number;
  pic: string | string[];   // FIX DI SINI
  bulan?: string;
  tanggal?: string;
  cabang?: string;
  status?: string;
};


interface TimelineProps {
  start: string; // tanggal estimasi
  end: string;   // tanggal realisasi
}

const TimelineBox: React.FC<TimelineProps> = ({ start, end }) => {
  return (
    <div className="flex items-center gap-4">
      {/* Start Date */}
      <div className="flex items-center justify-between w-[160px] px-3 py-2 bg-gray-100 rounded-lg shadow-sm border border-gray-300">
        <span className="text-sm font-medium">{start}</span>
        <span className="text-gray-500 font-semibold">{">"}</span>
      </div>

      {/* End Date */}
      <div className="flex items-center justify-between w-[160px] px-3 py-2 bg-gray-100 rounded-lg shadow-sm border border-gray-300">
        <span className="text-sm font-medium">{end}</span>
        <span className="text-gray-500 font-semibold">{">"}</span>
      </div>
    </div>
  );
};


function AutoResizeTextarea({
  value,
  onChange,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto"; // reset dulu
      ref.current.style.height = ref.current.scrollHeight + "px"; // sesuaikan isi
    }
  }, [value]);

  return (
    <textarea
      {...props}
      ref={ref}
      value={value}
      onChange={onChange}
      className={`border p-2 rounded w-full resize-none ${props.className || ""}`}
    />
  );
}



function getWeekOfMonth(day: string | number, monthName: string, year: string | number): string {
  if (!day || !monthName || !year) return "";

  const month = getMonthNumber(monthName);
  const formattedDay = String(day).padStart(2, "0");
  const formattedMonth = String(month).padStart(2, "0");
  const fullDate = `${year}-${formattedMonth}-${formattedDay}`;

  const date = new Date(fullDate);
  if (isNaN(date.getTime())) return "";

  const weekNumber = Math.ceil(date.getDate() / 7);
  const romanWeeks = ["I", "II", "III", "IV", "V"];
  return romanWeeks[weekNumber - 1] || "";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";

  // Jika format range "22-24/mm/yyyy"
  const rangeMatch = dateStr.match(/^(\d{1,2})(?:-(\d{1,2}))?\/(\d{1,2})\/(\d{4})$/);
  if (rangeMatch) {
    const startDay = rangeMatch[1].padStart(2, "0");
    const endDay = rangeMatch[2]?.padStart(2, "0");
    const month = rangeMatch[3].padStart(2, "0");
    const year = rangeMatch[4];
    return endDay ? `${startDay}-${endDay}/${month}/${year}` : `${startDay}/${month}/${year}`;
  }

  // Jika format "yyyy-mm-dd"
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }

  // Jika format lain, kembalikan apa adanya
  return dateStr;
}

function formatTanggalDisplay(tanggalStr: string) {
  if (!tanggalStr) return "-";

  const monthNames: Record<string, string> = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
    "05": "Mei", "06": "Jun", "07": "Jul", "08": "Agu",
    "09": "Sep", "10": "Okt", "11": "Nov", "12": "Des",
  };

  const [dayPart, month, year] = tanggalStr.split("/");

  const monthName = monthNames[month];

  // range → 22 - 24/01/2025
  if (dayPart.includes("-")) {
    const [start, end] = dayPart.split("-").map((v) => v.trim());
    return `${start} ${monthName} ${year} - ${end} ${monthName} ${year}`;
  }

  // single → 23/05/2025
  return `${dayPart} ${monthName} ${year}`;
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "-";

  const bulanNama: Record<string, string> = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "Mei",
    "06": "Jun",
    "07": "Jul",
    "08": "Agu",
    "09": "Sep",
    "10": "Okt",
    "11": "Nov",
    "12": "Des",
  };

  // Range: 22-24/01/2025
  if (dateStr.includes("-")) {
    const [range, month, year] = dateStr.split("/");
    const [start, end] = range.split("-").map((x) => x.padStart(2, "0"));
    return `${start} ${bulanNama[month]} ${year} - ${end} ${bulanNama[month]} ${year}`;
  }

  // Single date: 22/01/2025
  const [day, month, year] = dateStr.split("/");
  return `${day.padStart(2, "0")} ${bulanNama[month]} ${year}`;
}




export default function AuditApp() {
  const [activePage, setActivePage] = useState("dashboard");
  const [dataList, setDataList] = useState<AuditData[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchBulanStatusPlan, setSearchBulanStatusPlan] = useState<string>("");
  const [selectedBulanUpdatePlan, setSelectedBulanUpdatePlan] = useState(""); // Sekarang digunakan

  const [searchTanggal, setSearchTanggal] = useState("");
  const [statusTab, setStatusTab] = useState<""| "Belum" | "Sudah" | "On Progress">("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedPICDetail, setSelectedPICDetail] = useState("");

  const [searchPicUpdatePlan, setSearchPicUpdatePlan] = useState(""); // Sekarang digunakan
  const [searchPicStatusPlan, setSearchPicStatusPlan] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingData, setEditingData] = useState<AuditData | null>(null);

  const [searchTextStatusPlan, setSearchTextStatusPlan] = useState("");
  const [searchFull, setSearchFull] = useState("");
  const [selectedBulanFull, setSelectedBulanFull] = useState("");
  const [selectedPicFull, setSelectedPicFull] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showRealisasiDetail, setShowRealisasiDetail] = useState(false);
  const [selectedProgressBulan, setSelectedProgressBulan] = useState("ALL");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedApproval, setSelectedApproval] = useState<AuditData | null>(null);
  const [searchJabodetabek, setSearchJabodetabek] = useState("");
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [reportName, setReportName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [approvalsRows, setApprovalsRows] = useState<ApprovalRow[]>([]);
  const [selectedPic, setSelectedPic] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBulanPIC, setSelectedBulanPIC] = useState("ALL");
  const [username, setUsername] = useState<string | null>(null); // 👈
  const [picOptions, setPicOptions] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<
  | string
  | null
  | { key: string; position: { top: number; left: number } }
>(null);

  
  const [filterBulan, setFilterBulan] = useState(""); // contoh: "MEI"
  const [teamOptions, setTeamOptions] = useState<string[]>([]);
  const [showSwitchAccount, setShowSwitchAccount] = useState(false);
  const [cabangOptions, setCabangOptions] = useState<Cabang[]>([]);
  const [anakCabangOptions, setAnakCabangOptions] = useState<Cabang[]>([]);
  const [selectedCabang, setSelectedCabang] = useState<string>("");
  const [selectedAnakCabang, setSelectedAnakCabang] = useState<string>("");
  const [currentPageCabang, setCurrentPageCabang] = useState(1);
  const rowsPerPageCabang = 20;
  const [selectedBulan, setSelectedBulan] = useState("");
  const [selectedKategoriUpdatePlan, setSelectedKategoriUpdatePlan] = useState<string>("");
  // 🔹 State baru
  const [searchCabangDetail, setSearchCabangDetail] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedKategori, setSelectedKategori] = useState<"jabodetabek" | "luarJabodetabek" | "cabang" | "warehouse" | "tradisional" | "modern" | "whz" | "">("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedDashboardBulan, setSelectedDashboardBulan] = useState<string | null>(null);
  const [modernOptions, setModernOptions] = useState<{ id: number; name: string }[]>([]);
  const [reportFilesMap, setReportFilesMap] = useState<Record<string, boolean>>({});
  const [originalNoLaporan, setOriginalNoLaporan] = useState<string | null>(null);
  const [filterNoLaporan, setFilterNoLaporan] = useState<"" | "ada" | "belum">("");
const [filterNoLaporanUpdate, setFilterNoLaporanUpdate] = useState<string>("");
const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
const [approvalMonthFilter, setApprovalMonthFilter] = useState<string>("");

const [isCollapsed, setIsCollapsed] = useState(false);
const router = useRouter();
const [showUserMenu, setShowUserMenu] = useState(false);
const [selectedMonthForNo, setSelectedMonthForNo] = useState<string>(""); 
const [approvalTab, setApprovalTab] = useState<"pending" | "approved">("pending");


// === STATE UNTUK TAB & PENCARIAN ===
const [activeTab, setActiveTab] = useState("Semua");
const [searchTerm, setSearchTerm] = useState("");

const approvalFilteredData = dataList.filter((lap) => {
  const approvals = approvalsRows.filter((a) => a.report_id === lap.id);
  const allApproved = approvals.every((a) => a.checked);
  const hasPending = approvals.some((a) => !a.checked);

  if (activeTab === "Approved" && !allApproved) return false;
  if (activeTab === "To Review" && allApproved) return false;
  if (activeTab === "On Hold" && (!hasPending || allApproved)) return false;

  const keyword = searchTerm.toLowerCase();
  const matchNo = lap.no_laporan?.toLowerCase().includes(keyword);

  // 👇 ini bagian penting — kasih tahu TypeScript kalau 'p' itu string
  const matchPIC = Array.isArray(lap.pic)
    ? (lap.pic as string[]).some((p: string) =>
        p.toLowerCase().includes(keyword)
      )
    : (lap.pic as string | undefined)?.toLowerCase().includes(keyword);

  return matchNo || matchPIC;
});

const handleGoToUpdate = (status?: string) => {
  setSelectedStatus(status || ""); // kalau kamu punya state filter status
  setActivePage("updatePlanSO");
};

const getWeekNumber = (dateStr: string): number => {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const diff = (date.getTime() - firstDay.getTime()) / 86400000;
  return Math.ceil((diff + firstDay.getDay() + 1) / 7);
};

// Hitung jumlah Jabodetabek per bulan
const jabodetabekPerBulan = Object.values(
  dataList.reduce((acc: any, d: any) => {
    if (!d.bulan) return acc;
    const bulanKey = d.bulan.toUpperCase();

    if (!acc[bulanKey]) {
      acc[bulanKey] = { bulan: bulanKey, jabodetabek: 0 };
    }

    if (d.jabodetabek) {
      acc[bulanKey].jabodetabek++;
    }

    return acc;
  }, {})
).sort(
  (a: any, b: any) =>
    monthOrder.findIndex((m) => m.toUpperCase() === a.bulan) -
    monthOrder.findIndex((m) => m.toUpperCase() === b.bulan)
);

const handleBarClick = (data: any) => {
  if (!data || !data.bulan) return;

  setSelectedKategoriUpdatePlan(kategoriChart);
  setSelectedBulanUpdatePlan(data.bulan);
  setActivePage("updatePlanSO");   // pindah halaman tanpa routing
};


const toggleRowExpand = (id: number) => {
  setExpandedRowId(expandedRowId === id ? null : id);
};

const filteredByKategori = selectedKategori
  ? dataList.filter((d) => d[selectedKategori as keyof AuditData])
  : dataList;

const pieDataKategori = [
  { name: "Sudah", value: filteredByKategori.filter((d) => d.status === "Sudah").length, color: "#A7F3D0" },
  { name: "Belum", value: filteredByKategori.filter((d) => d.status === "Belum").length, color: "#FDE68A" },
  { name: "On Progress", value: filteredByKategori.filter((d) => d.status === "On Progress").length, color: "#BFDBFE" },
];







const filteredCabangData = dataList.filter((d) => {
  const cabangName = d.cabang?.trim().toLowerCase();
  const anakCabangName = (d.anakCabang ?? (d as any).anak_cabang ?? "")
    .toString()
    .trim()
    .toLowerCase();

  return (
    cabangName &&
    (!selectedCabang ||
      cabangName === selectedCabang.trim().toLowerCase()) &&
    (!selectedAnakCabang ||
      anakCabangName === selectedAnakCabang.trim().toLowerCase()) &&
    (!selectedBulan || d.bulan === selectedBulan) &&
    (!selectedPic ||
      (Array.isArray(d.pic)
        ? d.pic.includes(selectedPic)
        : d.pic === selectedPic))
  );
});

// 🧩 Buat approval default untuk satu laporan
const createDefaultApprovals = async (reportId: number) => {
  const approvers = ["Aprilia", "NOVIE", "Andreas"];
  const { error } = await supabase.from("approvals_status").insert(
    approvers.map((name, index) => ({
      report_id: reportId,
      step: index + 1,
      user: name,
      checked: false,
      note: `Menunggu persetujuan ${name}`,
      status: "Belum",
    }))
  );

  if (error) {
    console.error("❌ Gagal membuat approval default:", error.message);
  } else {
    console.log(`✅ Approval default dibuat untuk report_id: ${reportId}`);
  }
};

const [kategoriChart, setKategoriChart] = useState("jabodetabek");

const kategoriOptions = [
  { key: "jabodetabek", label: "Jabodetabek" },
  { key: "luarJabodetabek", label: "Luar Jabodetabek" },
  { key: "cabang", label: "Cabang" },
  { key: "warehouse", label: "Warehouse" },
  { key: "tradisional", label: "Tradisional" },
  { key: "modern", label: "Modern" },
  { key: "whz", label: "WH-Z" },
];

const barDataKategoriFilter = Object.values(
  dataList.reduce((acc: any, d: any) => {
    if (!d.bulan) return acc;

    const bulanKey = d.bulan.toUpperCase();
    if (!acc[bulanKey]) {
      acc[bulanKey] = { bulan: bulanKey, total: 0 };
    }

    // Hitung hanya kategori yang sedang difilter
    if (d[kategoriChart]) {
      acc[bulanKey].total++;
    }

    return acc;
  }, {})
).sort(
  (a: any, b: any) =>
    monthOrder.findIndex((m) => m.toUpperCase() === a.bulan) -
    monthOrder.findIndex((m) => m.toUpperCase() === b.bulan)
);


const renderValue = (value: any) => {
  if (value == null) return "-";

  // kalau array string → gabung
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value.join(", ");
  }

  // kalau ApprovalStep[]
  if (Array.isArray(value) && typeof value[0] === "object" && "user" in value[0]) {
return (value as ApprovalStep[]).map((a, i) => (
  <div key={i} className="flex items-center gap-2 mb-1">
    <span className="font-medium">{a.user}</span>
    {a.checked ? (
      <Check className="w-4 h-4 text-green-500" />
    ) : (
      <X className="w-4 h-4 text-red-500" />
    )}
    {a.time && (
      <span className="text-xs text-slate-500">
        {new Date(a.time).toLocaleString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    )}
  </div>
));

  }

  // default (string/number)
  return value as React.ReactNode;
};


const paginatedCabangData = filteredCabangData.slice(
  (currentPageCabang - 1) * rowsPerPageCabang,
  currentPageCabang * rowsPerPageCabang
);

const picPerBulan = dataList.reduce((acc: any, d: any) => {
  if (!d.bulan || !d.pic) return acc;

  const bulanKey = d.bulan.toUpperCase();

  if (!acc[bulanKey]) acc[bulanKey] = { bulan: bulanKey };

  d.pic.forEach((p: string) => {
    if (!acc[bulanKey][p]) acc[bulanKey][p] = 0;
    acc[bulanKey][p]++;
  });

  return acc;
}, {});

const picPerBulanChart = Object.values(picPerBulan).sort(
  (a: any, b: any) =>
    monthOrder.indexOf(a.bulan) - monthOrder.indexOf(b.bulan)
);

const leaderPerBulan = dataList.reduce((acc: any, d: any) => {
  if (!d.bulan || !d.team) return acc;

  const bulanKey = d.bulan.toUpperCase();

  if (!acc[bulanKey]) acc[bulanKey] = { bulan: bulanKey };

  d.team.forEach((t: string) => {
    if (!acc[bulanKey][t]) acc[bulanKey][t] = 0;
    acc[bulanKey][t]++;
  });

  return acc;
}, {});

const leaderPerBulanChart = Object.values(leaderPerBulan).sort(
  (a: any, b: any) =>
    monthOrder.indexOf(a.bulan) - monthOrder.indexOf(b.bulan)
);

const [selectedBulanTEAM, setSelectedBulanTEAM] = useState("ALL");

const filteredPIC = selectedBulanPIC === "ALL"
  ? picPerBulanChart
  : picPerBulanChart.filter((d: any) => d.bulan === selectedBulanPIC);

const filteredTEAM = selectedBulanTEAM === "ALL"
  ? leaderPerBulanChart
  : leaderPerBulanChart.filter((d: any) => d.bulan === selectedBulanTEAM);

const picListForSelectedMonth =
  selectedBulanPIC === "ALL"
    ? picOptions
        .map((picName: string) => {
          let total = 0;

          picPerBulanChart.forEach((row: any) => {
            if (row[picName]) total += row[picName]; // total semua bulan
          });

          return { nama: picName, total };
        })
        .sort((a, b) => b.total - a.total) // 🔥 URUTKAN DESC
    : picOptions
        .map((picName: string) => {
          let total = 0;

          filteredPIC.forEach((row: any) => {
            if (row[picName]) total += row[picName];
          });

          return { nama: picName, total };
        })
        .sort((a, b) => b.total - a.total); // 🔥 URUTKAN DESC



const teamListForSelectedMonth =
  selectedBulanTEAM === "ALL"
    ? teamOptions.map((teamName: string) => {
        let total = 0;

        leaderPerBulanChart.forEach((row: any) => {
          if (row[teamName]) total += row[teamName];
        });

        return { nama: teamName, total };
      })
    : teamOptions.map((teamName: string) => {
        let total = 0;

        filteredTEAM.forEach((row: any) => {
          if (row[teamName]) total += row[teamName];
        });

        return { nama: teamName, total };
      });

// 🔥 URUTKAN DARI YANG TOTAL PALING BESAR → PALING KECIL
const teamListForSelectedMonthSorted = [...teamListForSelectedMonth].sort(
  (a, b) => b.total - a.total
);



  // ambil PIC awal
  useEffect(() => {
    const fetchPIC = async () => {
      const { data, error } = await supabase.from("pic").select("name").order("name");
      if (!error && data) {
        setPicOptions(data.map((d: any) => d.name));
      }
    };
    fetchPIC();

    // 🔥 Realtime listener untuk update otomatis
    const channel = supabase
      .channel("pic-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pic" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPicOptions((prev) => [...prev, payload.new.name]);
          }
          if (payload.eventType === "DELETE") {
            setPicOptions((prev) => prev.filter((p) => p !== payload.old.name));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".relative")) setShowUserMenu(false);
  };
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);


useEffect(() => {
  const fetchCabang = async () => {
    const { data, error } = await supabase
      .from("cabangs")
      .select("id, name, parent_id")
      .order("name", { ascending: true });

    if (error) {
      console.error("❌ Gagal fetch cabang:", error.message);
      return;
    }
    if (data) setCabangOptions(data as Cabang[]);
  };

  fetchCabang();
}, []);

useEffect(() => {
  const fetchModernOptions = async () => {
    const { data, error } = await supabase.from("modern").select("id, name").order("name");
    if (!error && data) setModernOptions(data);
  };
  fetchModernOptions();
}, []);


const statusKeyMap: Record<string, string> = {
  "Sudah": "sudah",
  "Belum": "belum",
  "On Progress": "onprogress",
};

const fetchDataUpdatePlan = async () => {
  try {
    const { data, error } = await supabase
      .from("audit_full")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    setDataList(data || []);
    toast.success("Data Update Plan SO berhasil dimuat!");
  } catch (err) {
    console.error("❌ Gagal fetch audit_full:", err);
    toast.error("Gagal memuat data Update Plan SO!");
  }
};

const handleRefresh = async () => {
  const toastId = toast.loading("⏳ Refreshing data...");

  try {
    // 🔄 ambil ulang data
    await fetchDataUpdatePlan();

    // 🗓️ ambil tahun & bulan sekarang
    const year = new Date().getFullYear().toString().slice(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, "0");

    // 🔧 renumber SOV
    await renumberNoLaporan("SOV", year, month);

    // 🔧 renumber SONV
    await renumberNoLaporan("SONV", year, month);

    toast.success("✅ Data & nomor laporan berhasil dirapikan!", { id: toastId });
  } catch (err) {
    console.error(err);
    toast.error("❌ Gagal melakukan refresh / renumber!", { id: toastId });
  }
};


const getPieDataForPic = (pic: string | "ALL", bulanFilter: string | "ALL") => {
  const todayNum = today.getDate();

  const isOnProgress = (d: AuditData) =>
    d.bulan?.trim().toUpperCase() === currentMonth &&
    !!d.tanggal &&
    isTodayInRange(d.tanggal, todayNum);

  let filtered =
    pic === "ALL"
      ? dataList
      : dataList.filter((d) =>
          Array.isArray(d.pic)
            ? d.pic.includes(pic)
            : d.pic === pic
        );

  // ✅ pastikan perbandingan case-insensitive
  if (bulanFilter !== "ALL") {
    filtered = filtered.filter(
      (d) =>
        d.bulan &&
        d.bulan.toString().trim().toUpperCase() === bulanFilter.trim().toUpperCase()
    );
  }

  return [
    { name: "Sudah", value: filtered.filter((d) => d.status === "Sudah").length, color: "#22c55e" },
    { name: "Belum", value: filtered.filter((d) => d.status === "Belum").length, color: "#facc15" },
    { name: "On Progress", value: filtered.filter((d) => isOnProgress(d)).length, color: "#3b82f6" },
  ];
};

  const groupedByPicDetail = dataList.reduce(
  (acc: Record<string, Record<string, any[]>>, d) => {
    const bulanKey = d.bulan ? d.bulan.toUpperCase() : "";

    if (Array.isArray(d.pic)) {
      d.pic.forEach((pic) => {
        if (!acc[pic]) acc[pic] = {};
        if (!acc[pic][bulanKey]) acc[pic][bulanKey] = [];

        acc[pic][bulanKey].push({
          tanggal: d.tanggal,
          jabodetabek: d.jabodetabek,
          luarJabodetabek: d.luarJabodetabek,
          cabang: d.cabang,
          warehouse: d.warehouse,
          tradisional: d.tradisional,
          modern: d.modern,
          whz: d.whz,
        });
      });
    }
    return acc;
  },
  {} as Record<string, Record<string, any[]>>
);




  const formatTanggal = (dateString?: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


  // Pagination Update Plan SO
  const [currentPageUpdate, setCurrentPageUpdate] = useState(1);
  const rowsPerPageUpdate = 50;

const [currentPageStatus, setCurrentPageStatus] = useState(1);
const rowsPerPageStatus = 50;




const today = new Date();
const hari = today.toLocaleDateString("id-ID", { weekday: "long" });
const tanggal = today.toLocaleDateString("id-ID", { day: "numeric" });
const bulan = today.toLocaleDateString("id-ID", { month: "long" });
const tahun = today.getFullYear();



  // Bulan sekarang
const currentMonth = new Date().toLocaleString("id-ID", { month: "long" }).toUpperCase();

const bulanTarget = selectedDashboardBulan || currentMonth;

const bulanTargetData = dataList.filter(
  (d) => d.bulan?.toUpperCase() === bulanTarget.toUpperCase()
);

const totalBulanTarget = bulanTargetData.length;
const sudahBulanTarget = bulanTargetData.filter((d) => d.status === "Sudah").length;
const belumBulanTarget = bulanTargetData.filter((d) => d.status === "Belum").length;


const onProgressBulanTarget = bulanTargetData.filter((d) => {
  const todayNum = new Date().getDate();
  const currentMonthStr = new Date()
    .toLocaleString("id-ID", { month: "long" })
    .toUpperCase();

  // 🔹 Gunakan logika status efektif agar konsisten
  return getEffectiveStatus(d, todayNum, currentMonthStr) === "On Progress";
}).length;





// Group per bulan sesuai status
const groupedByBulanStatus = dataList.reduce((acc: any, d) => {
  const bulanKey = d.bulan ? d.bulan.trim().toUpperCase() : "";
  if (!bulanKey) return acc;

  // 🔹 inisialisasi data bulan
  if (!acc[bulanKey]) {
    acc[bulanKey] = { bulan: bulanKey, sudah: 0, belum: 0, onprogress: 0 };
  }

  // 🔹 Gunakan getEffectiveStatus agar logika konsisten
  const todayNum = new Date().getDate();
  const currentMonthStr = new Date()
    .toLocaleString("id-ID", { month: "long" })
    .toUpperCase();

  const statusEfektif = getEffectiveStatus(d, todayNum, currentMonthStr);

  // 🔹 Tambahkan ke kategori sesuai status efektif
  if (statusEfektif === "Sudah") acc[bulanKey].sudah++;
  else if (statusEfektif === "On Progress") acc[bulanKey].onprogress++;
  else acc[bulanKey].belum++;

  return acc;
}, {});


const statusbarChartData = Object.values(groupedByBulanStatus).sort(
  (a: any, b: any) =>
    monthOrder.findIndex((m) => m.toUpperCase() === a.bulan.toUpperCase()) -
    monthOrder.findIndex((m) => m.toUpperCase() === b.bulan.toUpperCase())
);




// Statistik ringkas
const total = dataList.length;
const selesai = dataList.filter(d => d.status === "Sudah").length;
const belum = total - selesai;
const progress = total > 0 ? Math.round((selesai / total) * 100) : 0;

// Ranking PIC
const picCount: Record<string, number> = {};
dataList.forEach(d => d.pic.forEach(p => { picCount[p] = (picCount[p] || 0) + 1; }));
const topPic = Object.entries(picCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

// Ranking Cabang
const cabangCount: Record<string, { total: number; selesai: number }> = {};
dataList.forEach(d => {
  if (!cabangCount[d.cabang]) cabangCount[d.cabang] = { total: 0, selesai: 0 };
  cabangCount[d.cabang].total++;
  if (d.status === "Sudah") cabangCount[d.cabang].selesai++;
});
const cabangRanking = Object.entries(cabangCount).map(([cabang, val]) => ({
  cabang,
  progress: Math.round((val.selesai / val.total) * 100)
})).sort((a, b) => b.progress - a.progress);

// Trend Data
const trendData = Array.from(new Set(dataList.map(d => d.bulan))).map(bulan => ({
  bulan,
  selesai: dataList.filter(d => d.bulan === bulan && d.status === "Sudah").length
}));

  const bulanOptions = ["ALL", ...new Set(dataList.map(d => d.bulan.toUpperCase()))];

const filteredData = selectedProgressBulan === "ALL"
  ? dataList
  : dataList.filter(d => d.bulan.toUpperCase() === selectedProgressBulan);

const totalProgress = filteredData.length;
const selesaiProgress = filteredData.filter(d => d.status === "Sudah").length;
const belumProgress = totalProgress - selesaiProgress;
const progressPercent = totalProgress > 0
  ? Math.round((selesaiProgress / totalProgress) * 100)
  : 0;


function getDaysInMonth(monthName: string, year: number): number {
  const monthIndex = monthOrder.findIndex(
    (m) => m.toLowerCase() === monthName.toLowerCase()
  );
  if (monthIndex === -1) return 31;
  return new Date(year, monthIndex + 1, 0).getDate();
}


useEffect(() => {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("audit_full")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("❌ Gagal fetch data:", error.message);
      return;
    }

    if (data) {
      // 🔹 Normalisasi nama kolom supaya konsisten di frontend
      const normalized = data.map((item: any) => ({
        ...item,
        luarJabodetabek: item.luar_jabodetabek ?? item.luarJabodetabek ?? "",
        anakCabang: item.anak_cabang ?? item.anakCabang ?? "",
        noLaporan: item.no_laporan ?? item.noLaporan ?? "",
        jenisData: item.jenis_data ?? item.jenisdata ?? "",
      }));

      setDataList(normalized);

      // ✅ Tambahkan logika sinkronisasi status otomatis
      const todayNum = new Date().getDate();
      const currentMonthStr = new Date()
        .toLocaleString("id-ID", { month: "long" })
        .toUpperCase();

      // 🔍 Cari data yang seharusnya On Progress tapi belum diupdate
      const needUpdate = normalized.filter(
        (d) =>
          getEffectiveStatus(d, todayNum, currentMonthStr) === "On Progress" &&
          d.status !== "On Progress"
      );

      if (needUpdate.length > 0) {
        const idsToUpdate = needUpdate.map((d) => d.id);

        // 🔥 Update batch di Supabase
        const { error: updateError } = await supabase
          .from("audit_full")
          .update({ status: "On Progress" })
          .in("id", idsToUpdate);

        if (updateError) {
          console.error("❌ Gagal update otomatis:", updateError.message);
        } else {
          console.log(`✅ ${idsToUpdate.length} data diupdate ke "On Progress"`);

          // 🔄 Update state React juga biar langsung tampil
          setDataList((prev) =>
            prev.map((row) =>
              idsToUpdate.includes(row.id)
                ? { ...row, status: "On Progress" }
                : row
            )
          );
        }
      }
    }
  };

  fetchData();


  
  // === Optional: Realtime listener (kalau kamu mau data auto refresh) ===
  const channel = supabase
    .channel("audit_full_realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "audit_full" },
      (payload) => {
        console.log("📡 Realtime update:", payload);

        const newData = payload.new as any;
        setDataList((prev) => {
          if (payload.eventType === "INSERT") {
            return [newData, ...prev];
          } else if (payload.eventType === "UPDATE") {
            return prev.map((row) =>
              row.id === newData.id ? newData : row
            );
          } else if (payload.eventType === "DELETE") {
            return prev.filter((row) => row.id !== payload.old.id);
          }
          return prev;
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);







const groupedByYearPercent = dataList.reduce((acc: any, d) => {
  // Ambil tahun (dari field 'tahun' atau fallback ke created_at)
  let year = d.tahun;
  if (!year && d.created_at) {
    year = new Date(d.created_at).getFullYear().toString();
  }
  if (!year) {
    year = new Date().getFullYear().toString();
  }

  if (!acc[year]) {
    acc[year] = { tahun: year, sudah: 0, belum: 0, onprogress: 0, total: 0 };
  }

  // Hitung status efektif (biar 'On Progress' benar)
  const todayNum = new Date().getDate();
  const currentMonth = new Date()
    .toLocaleString("id-ID", { month: "long" })
    .toUpperCase();

  let statusEfektif = d.status;
  if (
    d.bulan?.toUpperCase() === currentMonth &&
    d.tanggal &&
    isTodayInRange(d.tanggal, todayNum)
  ) {
    statusEfektif = "On Progress";
  }

  // Naikkan counter sesuai status efektif
  acc[year].total++;
  if (statusEfektif === "Sudah") acc[year].sudah++;
  else if (statusEfektif === "On Progress") acc[year].onprogress++;
  else acc[year].belum++;

  return acc;
}, {});



const yearPercentData = Object.values(groupedByYearPercent).map((y: any) => ({
  tahun: y.tahun,
  Sudah: y.total ? Math.round((y.sudah / y.total) * 100) : 0,
  Belum: y.total ? Math.round((y.belum / y.total) * 100) : 0,
  "On Progress": y.total ? Math.round((y.onprogress / y.total) * 100) : 0,
}));



// --- tipe data yang aman ---
type ApprovalRow = {
  id: number;
  step: number;
  user: string | null;
  checked: boolean;
  time: string | null;
  note: string | null | undefined;
  report_id?: number | null;
  approved_by?: string[]; // ✅ tambahkan ini
  description?: string;
  status?: string;
  updated_at?: string | null; // 🆕 tambahkan ini
};
// 🟢 Taruh di luar useEffect agar bisa dipanggil di mana pun
const fetchApprovals = async () => {
  try {
    const { data, error } = await supabase
      .from("approvals_status")
      .select(`
        id,
        step,
        user,
        checked,
        time,
        note,
        file_url,
        report_id,
        audit_full (
          id,
          file_url
        )
      `)
      .order("step", { ascending: true });

    if (error) {
      console.error("❌ Gagal fetch approvals:", error.message);
      return;
    }

    const rows: ApprovalRow[] = (data || []).map((r: any) => ({
      id: r.id,
      step: r.step,
      user: r.user ?? "—",
      checked: !!r.checked,
      time: r.time ?? null,
      note: r.note ?? null,
      file_url: r.audit_full?.file_url ?? r.file_url ?? null,
      report_id: r.audit_full?.id ?? r.report_id ?? null,
      approved_by: r.approved_by || [],
    }));

    setApprovalsRows(rows);
  } catch (err) {
    console.error("Unexpected error fetching approvals:", err);
  }
};

// 🔁 useEffect hanya buat panggil sekali di awal
useEffect(() => {
  fetchApprovals();
}, []);


// sebelumnya:
// const [formData, setFormData] = useState<AuditData>({...});

const [formList, setFormList] = useState<AuditData[]>([
  {
    pic: [],
    team: [], 
    customPic: "",
    bulan: "",
    minggu: "",
    tanggal: "",
    tahun: new Date().getFullYear().toString(),
    jabodetabek: "",
    luarJabodetabek: "",
    tanggalAwal: "",   // ✅ baru
    tanggalAkhir: "",  // ✅ baru
    cabang: "",
    warehouse: "",
    tradisional: "",
    modern: "",
    whz: "",
    company: "",
    jenisData: "",
    status: "Belum",
  },
]);

const topPIC = picOptions
  .map((pic) => ({
    pic,
    total: dataList.filter((d) =>
      Array.isArray(d.pic) ? d.pic.includes(pic) : d.pic === pic
    ).length,
  }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 3); // ambil 3 teratas


const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files?.[0]) {
    setSelectedFile(e.target.files[0]);
  }
};


const handleDeleteFile = async (rowId: number, fileUrl: string) => {
  try {
    // Ambil path relatif dari URL publik
    const url = new URL(fileUrl);
    const path = url.pathname.split("/storage/v1/object/public/report-plan/")[1];

    if (!path) {
      toast.error("❌ Gagal ambil path file");
      return;
    }

    // Hapus dari storage (pakai path lengkap termasuk "reports/")
    const { error: storageError } = await supabase.storage
      .from("report-plan")
      .remove([path]);

    if (storageError) throw storageError;

    // Hapus dari tabel
    const { error: dbError } = await supabase
      .from("report_files")
      .delete()
      .eq("report_id", rowId)
      .eq("file_url", fileUrl);

    if (dbError) throw dbError;

    toast.success("File berhasil dihapus!");
    setFileHistory((prev) => prev.filter((f) => f.file_url !== fileUrl));
  } catch (err) {
    console.error("Unexpected error:", err);
    toast.error("❌ Terjadi error saat hapus file");
  }
};

const handleTeamCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!editData) return;

  const { value, checked } = e.target;

  let updatedTeam = Array.isArray(editData.team)
    ? [...editData.team]
    : editData.team
    ? [editData.team]
    : [];

  if (checked) {
    if (!updatedTeam.includes(value)) updatedTeam.push(value);
  } else {
    updatedTeam = updatedTeam.filter((t) => t !== value);
  }

  setEditData({
    ...editData,
    team: updatedTeam,
  });
};



  // Edit mode
  const [editIndex, setEditIndex] = useState<number | null>(null); // Perbaikan tipe
  const [editData, setEditData] = useState<AuditData | null>(null); // Perbaikan tipe


const [fileHistory, setFileHistory] = useState<any[]>([]);

const fetchFiles = async () => {
  // 🔒 Cek dulu apakah approval sudah dipilih
  if (!selectedApproval?.id) {
    console.warn("⚠️ Tidak ada selectedApproval.id, fetchFiles dibatalkan");
    return;
  }

  try {
    console.log("📂 Fetching file history untuk report_id:", selectedApproval.id);

    // 🔹 Query data dari Supabase
    const { data, error } = await supabase
      .from("report_files")
      .select("*") // cukup ambil semua kolom
      .eq("report_id", selectedApproval.id)
      .order("id", { ascending: false }); // pakai id, lebih aman dari created_at

    // 🔹 Cek error Supabase
    if (error) {
      console.error("❌ Gagal fetch files:", error.message);
      toast.error("Gagal mengambil history file");
      return;
    }

    // 🔹 Update state
    if (data && data.length > 0) {
      console.log(`✅ Ditemukan ${data.length} file`);
      setFileHistory(data);
    } else {
      console.log("ℹ️ Tidak ada file ditemukan untuk report_id ini");
      setFileHistory([]);
    }
  } catch (err) {
    console.error("🚨 Error tak terduga saat fetchFiles:", err);
    toast.error("Terjadi kesalahan saat memuat file");
  }
};


useEffect(() => {
  if (!selectedApproval?.id) return;

  fetchFiles();
}, [selectedApproval]);

const handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >,
  index: number
) => {
  const { name, value } = e.target;

  // === 'pic' ditangani di handlePicCheckboxChange ===
  if (name === "pic") return;

  setFormList((prev) => {
    const updated = [...prev];
    const current = { ...updated[index] };

    // === 🗓️ Jika mengubah tanggalAwal / tanggalAkhir ===
    if (name === "tanggalAwal" || name === "tanggalAkhir") {
      current[name] = value;

      // Gabungkan jadi "5 - 10" untuk field `tanggal`
      current.tanggal =
        current.tanggalAwal && current.tanggalAkhir
          ? `${current.tanggalAwal} - ${current.tanggalAkhir}`
          : current.tanggalAwal || current.tanggalAkhir || "";

      // Hitung minggu otomatis
      if (current.bulan && current.tahun) {
        const awal = current.tanggalAwal;
        const akhir = current.tanggalAkhir;

        if (awal && akhir) {
          const mingguAwal = getWeekOfMonth(awal, current.bulan, current.tahun);
          const mingguAkhir = getWeekOfMonth(akhir, current.bulan, current.tahun);
          current.minggu =
            mingguAwal === mingguAkhir
              ? mingguAwal
              : `${mingguAwal}-${mingguAkhir}`;
        } else if (awal || akhir) {
          const referensi = (awal || akhir) as string;
          current.minggu = getWeekOfMonth(referensi, current.bulan, current.tahun);
        } else {
          current.minggu = "";
        }
      }

      updated[index] = current;
      return updated;
    }


    // === 🆙 Auto-uppercase untuk beberapa field ===
    const uppercaseFields = [
      "bulan",
      "jabodetabek",
      "luarJabodetabek",
      "cabang",
      "warehouse",
      "tradisional",
      "modern",
      "whz",
    ];

    (current as any)[name] = uppercaseFields.includes(name)
      ? value.toUpperCase()
      : value;

    updated[index] = current;
    return updated;
  });
};


const handlePicCheckboxChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  index: number
) => {
  const { value, checked } = e.target;

  setFormList((prev) => {
    const updated = [...prev];
    let updatedPICs = [...updated[index].pic];

    if (checked) {
      if (!updatedPICs.includes(value)) {
        updatedPICs.push(value);
      }
    } else {
      updatedPICs = updatedPICs.filter((p) => p !== value);
    }

    updated[index].pic = updatedPICs;
    return updated;
  });
};



const handleApprovalUpdate = async (
  id: number,
  username: string,
  action: "approve" | "reject" | "unapprove"
) => {
  try {
    const timeNow = new Date().toISOString();

    // 🔍 Ambil semua approval dengan report_id yang sama
    const reportApprovals = approvalsRows.filter(
      (a) => Number(a.report_id) === Number(id)
    );

    // 🧩 Jika belum ada approval sama sekali, buat default-nya
    if (!reportApprovals.length) {
      console.warn(`⚠️ Tidak ada approval ditemukan untuk report_id: ${id}. Membuat default...`);
      await createDefaultApprovals(id);
      await fetchApprovals();
      toast("Approval default dibuat. Silakan klik Approve lagi.");
      return;
    }

    // 🔹 Temukan approval sesuai user login (Aprilia/NOVIE/Andreas)
    const currentApproval = reportApprovals.find(
      (a) => a.user?.toLowerCase() === username.toLowerCase()
    );

    if (!currentApproval) {
      toast.error("Kamu tidak punya akses approve di tahap ini!");
      console.warn("⚠️ Tidak ada row approval untuk user:", username);
      return;
    }

    const approvers = ["Aprilia", "NOVIE", "Andreas"];
    const alreadyApproved = reportApprovals.filter((r) => r.checked).map((r) => r.user);
    const nextApprover =
      approvers[alreadyApproved.length] || "Semua approval selesai";
    const isFinal = alreadyApproved.length + 1 >= approvers.length;

    // ⚠️ CEK URUTAN BATAL APPROVE
    if (action === "unapprove") {
      const userIndex = approvers.findIndex(
        (u) => u.toLowerCase() === username.toLowerCase()
      );

      // cari siapa saja approver setelah dia
      const laterApprovers = approvers.slice(userIndex + 1);

      // apakah masih ada yang sudah approve di bawah dia?
      const stillApproved = reportApprovals.some(
        (r) =>
          laterApprovers.includes(r.user || "") &&
          r.checked === true &&
          (r.status === "On Progress" || r.status === "Sudah")
      );

      if (stillApproved) {
        const blocker = laterApprovers.find((a) =>
          reportApprovals.find(
            (r) =>
              r.user?.toLowerCase() === a.toLowerCase() &&
              r.checked === true
          )
        );

        toast.error(
          `❌ Tidak bisa batalkan approve sebelum ${blocker} membatalkan dulu.`
        );
        return; // 🚫 stop di sini, gak lanjut update
      }
    }

    // 🔸 REJECT
    if (action === "reject") {
      const { error } = await supabase
        .from("approvals_status")
        .update({
          checked: false,
          note: `❌ Ditolak oleh ${username}`,
          time: timeNow,
          status: "Rejected",
        })
        .eq("id", currentApproval.id);

      if (error) throw error;

      setApprovalsRows((prev) =>
        prev.map((a) =>
          a.id === currentApproval.id
            ? {
                ...a,
                checked: false,
                note: `Ditolak oleh ${username}`,
                time: timeNow,
                status: "Rejected",
              }
            : a
        )
      );

      toast.success(`Laporan ditolak oleh ${username}`);
      await fetchApprovals();
      return;
    }

    // 🔸 UNAPPROVE (Batalkan Approve)
    if (action === "unapprove") {
      const { error } = await supabase
        .from("approvals_status")
        .update({
          checked: false,
          note: `Approval dibatalkan oleh ${username}`,
          time: timeNow,
          status: "Belum",
        })
        .eq("id", currentApproval.id);

      if (error) throw error;

      setApprovalsRows((prev) =>
        prev.map((a) =>
          a.id === currentApproval.id
            ? {
                ...a,
                checked: false,
                note: `Approval dibatalkan oleh ${username}`,
                time: timeNow,
                status: "Belum",
              }
            : a
        )
      );

      toast(`Approval oleh ${username} telah dibatalkan`);
      await fetchApprovals();
      return;
    }

    // 🔸 APPROVE
    const { error } = await supabase
      .from("approvals_status")
      .update({
        checked: true,
        note: isFinal
          ? `✅ Disetujui final oleh ${username}`
          : `Disetujui oleh ${username} • Menunggu ${nextApprover}`,
        time: timeNow,
        status: isFinal ? "Sudah" : "On Progress",
      })
      .eq("id", currentApproval.id);

    if (error) throw error;

    setApprovalsRows((prev) =>
      prev.map((a) =>
        a.id === currentApproval.id
          ? {
              ...a,
              checked: true,
              note: isFinal
                ? `Disetujui final oleh ${username}`
                : `Disetujui oleh ${username} • Menunggu ${nextApprover}`,
              time: timeNow,
              status: isFinal ? "Sudah" : "On Progress",
            }
          : a
      )
    );

    toast.success(
      isFinal
        ? `Laporan disetujui final oleh ${username}`
        : `Laporan disetujui oleh ${username}, menunggu ${nextApprover}`
    );

    // 🔁 Refresh ulang
    await fetchApprovals();
  } catch (err) {
    console.error("❌ Error approval:", err);
    toast.error("Terjadi error saat update approval");
  }
};

const handleSubmitAll = async (e: React.FormEvent) => {
  e.preventDefault();

  const loadingToast = toast.loading("⏳ Menyimpan semua data...");

  const year = new Date().getFullYear().toString().slice(-2); // contoh: "25"

  try {
    for (const form of formList) {
      // === 🧩 Validasi per form ===
      if (form.pic.length === 0 && !form.customPic) {
        toast.error("Isi minimal satu PIC di salah satu form!");
        continue;
      }
      if (!form.bulan) {
        toast.error("Bulan wajib diisi di setiap form!");
        continue;
      }

      // === 🧮 Ambil bulan plan & ubah ke format angka dua digit
      const monthIndex = monthOrder.findIndex(
        (b) => b.toLowerCase() === form.bulan.toLowerCase()
      );
      const monthNum = String(monthIndex + 1).padStart(2, "0");

      // === Tentukan prefix berdasarkan jenisData
      const prefix = form.jenisData === "visit" ? "SOV" : "SONV";

      // === Cari nomor laporan terakhir untuk bulan itu
      const { data: latestData, error: fetchError } = await supabase
        .from("audit_full")
        .select("no_laporan")
        .ilike("no_laporan", `${prefix}/${year}/${monthNum}/%`);

      if (fetchError) {
        console.error("❌ Gagal ambil data terakhir:", fetchError.message);
        toast.error("Gagal ambil data terakhir untuk nomor laporan");
        continue;
      }

      // === Hitung nomor urut berikutnya
      const existingNumbers = (latestData || [])
        .map((d) => d.no_laporan?.split("/")?.[3])
        .filter((n) => n && !isNaN(Number(n)))
        .map((n) => Number(n));

      const lastNumber =
        existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
      const nextNumber = String(lastNumber + 1).padStart(3, "0");
      const noLaporan = `${prefix}/${year}/${monthNum}/${nextNumber}`;

      // === Gabungkan tanggal awal dan akhir biar tidak kosong
      const tanggalGabung =
        form.tanggalAwal && form.tanggalAkhir
          ? `${form.tanggalAwal} - ${form.tanggalAkhir}`
          : form.tanggalAwal || form.tanggalAkhir || "";

      // === Gabungkan PIC dan custom PIC manual
      const allPIC = [
        ...form.pic,
        ...(form.customPic
          ? form.customPic.split(",").map((x) => x.trim()).filter(Boolean)
          : []),
      ];

      // === 💾 Simpan ke Supabase
      const { data, error } = await supabase
        .from("audit_full")
        .insert([
          {
            no_laporan: noLaporan,
            pic: allPIC, // ✅ pakai gabungan
            bulan: form.bulan.toUpperCase(),
            minggu: form.minggu,
            tanggal: tanggalGabung,
            tahun: form.tahun,
            jabodetabek: form.jabodetabek,
            luar_jabodetabek: form.luarJabodetabek,
            cabang: form.cabang,
            warehouse: form.warehouse,
            tradisional: form.tradisional,
            modern: form.modern,
            whz: form.whz,
            description: form.description,
            status: "Belum",
            company: form.company,
            jenisData: form.jenisData,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("❌ Gagal insert:", error.message);
        toast.error("Gagal menyimpan salah satu data form!");
        continue;
      }

      const newReport = data?.[0];
      console.log(`✅ Data ${noLaporan} tersimpan`, newReport);

      // ✅ Update state React agar tabel langsung tampil tanpa refresh
      setDataList((prev) => [newReport, ...prev]);

      // === 🧾 Buat data approval otomatis
      const approvers = ["Aprilia", "NOVIE", "Andreas"];
      const approvalData = approvers.map((name, idx) => ({
        report_id: newReport.id,
        step: idx + 1,
        user: name,
        checked: false,
        note: "Menunggu persetujuan",
        status: "Belum",
      }));

      const { error: approvalError } = await supabase
        .from("approvals_status")
        .insert(approvalData);

      if (approvalError)
        console.warn("⚠️ Gagal bikin approvals:", approvalError.message);
    }

    toast.success("✅ Semua data berhasil disimpan!", { id: loadingToast });

    // 🧹 Reset formList setelah semua data tersimpan
    setFormList([
      {
        pic: [],
        team: [],
        customPic: "",
        bulan: "",
        minggu: "",
        tanggal: "",
        tahun: new Date().getFullYear().toString(),
        jabodetabek: "",
        luarJabodetabek: "",
        cabang: "",
        warehouse: "",
        tradisional: "",
        modern: "",
        whz: "",
        company: "",
        jenisData: "",
        status: "Belum",
      },
    ]);

    // await fetchData(); // bisa diaktifkan kalau mau refresh dari server
  } catch (err: any) {
    console.error("❌ Gagal simpan:", err.message || err);
    toast.error("Gagal menyimpan data!", { id: loadingToast });
  }
};



function isTodayInRange(tanggalStr: string, today: number): boolean {
  if (!tanggalStr) return false;

  // Bersihkan spasi
  const clean = tanggalStr.trim();

  // Kalau ada tanda "-", berarti range
  if (clean.includes("-")) {
    const [startStr, endStr] = clean.split("-").map((s) => s.trim());
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    if (isNaN(start) || isNaN(end)) return false;
    return today >= start && today <= end;
  }

  // Kalau single date (misal "23")
  const num = parseInt(clean, 10);
  return !isNaN(num) && num === today;
}

// helper: hitung status 'efektif' sebuah record
function getEffectiveStatus(d: AuditData, todayNum: number, currentMonthStr: string): "Sudah" | "On Progress" | "Belum" {
  // jika sudah jelas 'Sudah' di DB -> tetap Sudah
  if (d.status === "Sudah") return "Sudah";

  // jika di DB memang On Progress -> On Progress
  if (d.status === "On Progress") return "On Progress";

  // jika bulan sama dengan bulan target/now dan tanggal mencakup hari ini -> On Progress
  if (
    d.bulan?.toUpperCase() === currentMonthStr.toUpperCase() &&
    !!d.tanggal &&
    isTodayInRange(d.tanggal, todayNum)
  ) {
    return "On Progress";
  }

  // sisanya dianggap Belum
  return "Belum";
}


const parseDate = (str: string): Date | null => {
  const parts = str.split("/");

  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(n => parseInt(n, 10));

  if (!day || !month || !year) return null;

  return new Date(year, month - 1, day);
};

{/* range hari*/}
const getRealisasiRangeDays = (fullDate?: string | null) => {
  if (!fullDate) return null;

  const clean = fullDate.trim();

  // CASE 1: Single date → return 1
  if (!clean.includes("-")) {
    const d = clean.trim();
    const parsed = parseDate(d);
    return parsed ? 1 : null;
  }

  // CASE 2: Range → "22/01/2025 - 24/01/2025"
  const [startStr, endStr] = clean.split("-").map(s => s.trim());

  const startDate = parseDate(startStr);
  const endDate = parseDate(endStr);

  if (!startDate || !endDate) return null;

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays + 1; // termasuk hari pertama
};


function normalizeMonth(value?: string | null): string {
  if (!value) return "";

  const v = value.toLowerCase().trim();

  const map: Record<string, string> = {
    jan: "JANUARI",
    januari: "JANUARI",
    feb: "FEBRUARI",
    februari: "FEBRUARI",
    mar: "MARET",
    maret: "MARET",
    apr: "APRIL",
    april: "APRIL",
    mei: "MEI",
    may: "MEI",
    jun: "JUNI",
    juni: "JUNI",
    jul: "JULI",
    juli: "JULI",
    aug: "AGUSTUS",
    agustus: "AGUSTUS",
    sep: "SEPTEMBER",
    september: "SEPTEMBER",
    okt: "OKTOBER",
    oct: "OKTOBER",
    oktober: "OKTOBER",
    nov: "NOVEMBER",
    november: "NOVEMBER",
    des: "DESEMBER",
    dec: "DESEMBER",
    desember: "DESEMBER",
    december: "DESEMBER",
  };

  return map[v] || v.toUpperCase();
}

function getMonthFromTanggalEstimasi(value?: string | null): string {
  if (!value) return "";

  // Harapkan format: "22/01/2025" atau "22-24/01/2025" (atau terkadang "22/1/2025")
  // normalisasi: ubah semua spasi, lalu ambil bagian bulan
  const clean = value.trim();

  // cari pola /MM/ atau /M/ di tengah (contoh: 22/01/2025 atau 22/1/2025)
  const regex = /\/\s*0?(\d{1,2})\s*\//;
  const match = clean.match(regex);

  if (!match) {
    // coba cari setelah '-' jika format "22-24/01/2025"
    const regex2 = /\/\s*0?(\d{1,2})\s*$/;
    const match2 = clean.match(regex2);
    if (match2) {
      const m = match2[1].padStart(2, "0");
      return monthNumToName(m);
    }
    return "";
  }

  const monthNum = match[1].padStart(2, "0");
  return monthNumToName(monthNum);
}

function monthNumToName(mm: string): string {
  const map: Record<string, string> = {
    "01": "JANUARI",
    "02": "FEBRUARI",
    "03": "MARET",
    "04": "APRIL",
    "05": "MEI",
    "06": "JUNI",
    "07": "JULI",
    "08": "AGUSTUS",
    "09": "SEPTEMBER",
    "10": "OKTOBER",
    "11": "NOVEMBER",
    "12": "DESEMBER",
  };
  return map[mm] || "";
}

function normalizeMonthInput(v?: string | null): string {
  if (!v) return "";
  // jika user memilih "Jan" / "January" / "JANUARI" / "01" — kita dukung beberapa bentuk
  const s = v.toString().trim().toLowerCase();
  // nomor bulan?
  if (/^\d{1,2}$/.test(s)) {
    return monthNumToName(s.padStart(2, "0"));
  }

  // nama pendek / panjang
  const map: Record<string, string> = {
    jan: "JANUARI",
    januari: "JANUARI",
    january: "JANUARI",
    feb: "FEBRUARI",
    februari: "FEBRUARI",
    mar: "MARET",
    maret: "MARET",
    apr: "APRIL",
    april: "APRIL",
    mei: "MEI",
    may: "MEI",
    jun: "JUNI",
    juni: "JUNI",
    jul: "JULI",
    juli: "JULI",
    aug: "AGUSTUS",
    agustus: "AGUSTUS",
    sep: "SEPTEMBER",
    sept: "SEPTEMBER",
    september: "SEPTEMBER",
    okt: "OKTOBER",
    oct: "OKTOBER",
    october: "OKTOBER",
    oktober: "OKTOBER",
    nov: "NOVEMBER",
    november: "NOVEMBER",
    des: "DESEMBER",
    dec: "DESEMBER",
    desember: "DESEMBER",
    december: "DESEMBER",
  };

  return map[s] || s.toUpperCase();
}


const filteredStatusPlanData = dataList.filter((d) => {
  let matchStatus = false;
  const todayNum = today.getDate();

if (statusTab === "On Progress") {
  matchStatus =
    d.status === "On Progress" || // 🔹 tambahkan ini agar status dari DB juga terdeteksi
    (
      d.bulan?.toUpperCase() === currentMonth &&
      !!d.tanggal &&
      isTodayInRange(d.tanggal, todayNum)
    );
} else if (statusTab === "Belum") {
  matchStatus =
    d.status === "Belum" &&
    !(
      d.bulan?.toUpperCase() === currentMonth &&
      !!d.tanggal &&
      isTodayInRange(d.tanggal, todayNum)
    );
} else if (statusTab === "Sudah") {
  matchStatus = d.status === "Sudah";
}

  // filter PIC
  const matchPic =
    !searchPicStatusPlan ||
    (Array.isArray(d.pic)
      ? (d.pic as string[]).some((p) =>
          p.toLowerCase().includes(searchPicStatusPlan.toLowerCase())
        )
      : (d.pic as string | undefined)?.toLowerCase().includes(
          searchPicStatusPlan.toLowerCase()
        ));

  // filter Bulan
  const matchBulan =
    !searchBulanStatusPlan ||
    d.bulan?.toLowerCase() === searchBulanStatusPlan.toLowerCase();

  // filter Search Text
  const searchText = searchTextStatusPlan.toLowerCase();
  const matchText =
    !searchText ||
    Object.values(d).some((val) =>
      String(val ?? "").toLowerCase().includes(searchText)
    );

  return matchStatus && matchPic && matchBulan && matchText;
});





const todayNum = new Date().getDate();
const currentMonthStr = new Date()
  .toLocaleString("id-ID", { month: "long" })
  .toUpperCase();

// 🔹 Filter dulu berdasarkan tahun yang dipilih
const filteredYearData = dataList.filter((d) => {
  const year = d.tahun || (d.created_at ? new Date(d.created_at).getFullYear().toString() : "");
  return year === selectedYear;
});

const totalData = filteredYearData.length;
let totalSudah = 0;
let totalOnProgress = 0;
let totalBelum = 0;

// 🔹 Hitung status efektif
filteredYearData.forEach((d) => {
  const statusEfektif = getEffectiveStatus(d, todayNum, currentMonthStr);
  if (statusEfektif === "Sudah") totalSudah++;
  else if (statusEfektif === "On Progress") totalOnProgress++;
  else totalBelum++;
});

// 🔹 Persentase (biar 100%)
const percentSudah = totalData ? Math.round((totalSudah / totalData) * 100) : 0;
const percentOnProgress = totalData ? Math.round((totalOnProgress / totalData) * 100) : 0;
const percentBelum = totalData
  ? Math.max(0, 100 - (percentSudah + percentOnProgress))
: 0;


const groupedByBulanKategori = dataList.reduce((acc: any, d) => {
  const bulanKey = d.bulan ? d.bulan.trim().toUpperCase() : "";
  if (!bulanKey) return acc;

  // 🔹 gunakan bulan saja sebagai key
  if (!acc[bulanKey]) {
    acc[bulanKey] = {
      bulan: bulanKey,
      jabodetabek: 0,
      luarJabodetabek: 0,
      cabang: 0,
      whz: 0,
      modern: 0,
      tradisional: 0,
    };
  }

  // Tambahkan jumlah kategori
  if (d.jabodetabek) acc[bulanKey].jabodetabek++;
  if (d.luarJabodetabek) acc[bulanKey].luarJabodetabek++;
  if (d.cabang) acc[bulanKey].cabang++;
  if (d.whz) acc[bulanKey].whz++;
  if (d.modern) acc[bulanKey].modern++;
  if (d.tradisional) acc[bulanKey].tradisional++;

  return acc;
}, {});


const barChartData = Object.values(groupedByBulanKategori).sort(
  (a: any, b: any) =>
    monthOrder.findIndex((m) => m.toUpperCase() === a.bulan.toUpperCase()) -
    monthOrder.findIndex((m) => m.toUpperCase() === b.bulan.toUpperCase())
);



const onProgressToday = dataList.filter((d) => {
  if (d.bulan?.toUpperCase() !== currentMonth) return false;

  return (
    d.status === "On Progress" || 
    (!!d.tanggal && isTodayInRange(d.tanggal, todayNum))
  );
});



// ✅ Pagination untuk Status Plan
const paginatedStatusPlanData = filteredStatusPlanData.slice(
  (currentPageStatus - 1) * rowsPerPageStatus,
  currentPageStatus * rowsPerPageStatus
);

const renumberNoLaporan = async (prefix: string, year: string, month: string) => {
  toast(`⏳ Menyusun ulang nomor laporan ${prefix}/${year}/${month}...`);

  try {
    // 1️⃣ Ambil semua data untuk prefix + bulan yang sama
    const { data, error } = await supabase
      .from("audit_full")
      .select("id, no_laporan")
      .ilike("no_laporan", `${prefix}/${year}/${month}/%`)
      .order("no_laporan", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      toast("⚠️ Tidak ada data untuk dirapikan");
      return;
    }

    // 2️⃣ Filter hanya nomor laporan yang *tidak punya tanda kurung*
    const validList = data.filter(
      (d) => d.no_laporan && !/\(.*\)/.test(d.no_laporan)
    );

    // 3️⃣ Loop dan update nomor baru untuk yang valid
    let updatedCount = 0;
    for (let i = 0; i < validList.length; i++) {
      const oldNo = validList[i].no_laporan;
      const newNo = `${prefix}/${year}/${month}/${String(i + 1).padStart(3, "0")}`;

      if (oldNo !== newNo) {
        await supabase
          .from("audit_full")
          .update({ no_laporan: newNo })
          .eq("id", validList[i].id);
        updatedCount++;
      }
    }

    toast.success(
      `✅ Nomor laporan ${prefix}/${year}/${month} berhasil dirapikan (${updatedCount} data diubah)`
    );
  } catch (err) {
    console.error("❌ Gagal renumber:", err);
    toast.error("❌ Gagal menomori ulang laporan!");
  }
};


const handleDelete = async (id: number) => {
  const yakin = window.confirm("⚠️ Apakah Anda yakin ingin menghapus data ini?");
  if (!yakin) return;

  try {
    // 1️⃣ Ambil data lengkap baris yang mau dihapus (buat undo/redo)
    const { data: originalData, error: fetchError } = await supabase
      .from("audit_full")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !originalData) {
      console.error("❌ Gagal ambil data:", fetchError?.message);
      toast.error("Gagal mengambil data yang akan dihapus!");
      return;
    }

    const noLaporan = originalData.no_laporan;

   
    const { error: auditError } = await supabase
      .from("audit_full")
      .delete()
      .eq("id", id);

    if (auditError) {
      console.error("❌ Gagal hapus audit_full:", auditError.message);
      toast.error("Gagal menghapus data di tabel Audit!");
      return;
    }

   
    if (noLaporan && typeof noLaporan === "string" && noLaporan.trim() !== "") {
      try {
        const [prefix, year, month] = noLaporan.split("/");

        const { error: planError } = await supabase
          .from("audit_full")
          .delete()
          .eq("no_laporan", noLaporan);

        if (planError) {
          console.error("❌ Gagal hapus audit_full:", planError.message);
        } else {
          await renumberNoLaporan(prefix, year, month);
        }
      } catch {
        console.warn("⚠️ Format no_laporan tidak valid, skip renumber:", noLaporan);
      }
    }

    // 4️⃣ Update UI state lokal
    setDataList((prev) => prev.filter((d) => d.id !== id));

 

    // 6️⃣ Toast konfirmasi
    toast.success("Data berhasil dihapus (bisa dikembalikan lewat tombol Redo)");

  } catch (err) {
    console.error("Unexpected error saat hapus:", err);
    toast.error("Terjadi kesalahan saat menghapus data!");
  }
};




const selectedMonth = selectedDashboardBulan || currentMonth;
const filteredMonthData = dataList.filter(
  (d) => d.bulan?.toUpperCase() === selectedMonth.toUpperCase()
);



const handleStartEdit = (index: number, data: AuditData) => {
  let parsedPIC: string[] = [];

  try {
    if (Array.isArray(data.pic)) {
      // ✅ kalau memang array
      parsedPIC = data.pic;
    } else if (typeof (data as any).pic === "string") {
      // ✅ kalau string JSON
      const str = (data as any).pic;
      parsedPIC = JSON.parse(str);
    }
  } catch {
    // ✅ fallback kalau JSON.parse gagal
    const raw = (data as any).pic;
    if (typeof raw === "string") {
      parsedPIC = raw.split(",").map((p) => p.trim());
    }
  }

  setEditIndex(index);
  setEditData({
    ...data,
    pic: parsedPIC,
    minggu: data.minggu || "",
  });
  setOriginalNoLaporan(data.no_laporan || null);
};

const handleSaveEditModal = async (data: any) => {
  if (!data) return;

  // ambil data lama dari dataList
  const oldData = dataList.find((d) => d.id === data.id);
  if (!oldData) return;

  const toYYYYMMDD_2025 = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `2025-${m}-${d}`;
  };

  const toDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  // ========================
  //  PROSES ESTIMASI
  // ========================
  let finalEstimasiDB = oldData.tanggal || "";
  let finalEstimasiUI = oldData.tanggal || "";

  if (data.tanggalAwal || data.tanggalAkhir) {
    const awal = data.tanggalAwal || oldData.tanggalAwal;
    const akhir = data.tanggalAkhir || oldData.tanggalAkhir;

    if (awal && akhir) {
      finalEstimasiDB = `${toYYYYMMDD_2025(awal)} - ${toYYYYMMDD_2025(akhir)}`;
      finalEstimasiUI = `${toDDMMYYYY(toYYYYMMDD_2025(awal))} - ${toDDMMYYYY(
        toYYYYMMDD_2025(akhir)
      )}`;
    } else {
      finalEstimasiDB = toYYYYMMDD_2025(awal);
      finalEstimasiUI = toDDMMYYYY(finalEstimasiDB);
    }
  }

  // ========================
  //  PROSES REALISASI
  // ========================
  let finalRealisasiDB = oldData.realisasi || "";
  let finalRealisasiUI = oldData.realisasi || "";

  if (data.realisasi) {
    if (data.realisasi.includes(" - ")) {
      const [awal, akhir] = data.realisasi.split(" - ");
      finalRealisasiDB = `${toYYYYMMDD_2025(awal)} - ${toYYYYMMDD_2025(akhir)}`;
      finalRealisasiUI = `${toDDMMYYYY(toYYYYMMDD_2025(awal))} - ${toDDMMYYYY(
        toYYYYMMDD_2025(akhir)
      )}`;
    } else {
      finalRealisasiDB = toYYYYMMDD_2025(data.realisasi);
      finalRealisasiUI = toDDMMYYYY(finalRealisasiDB);
    }
  }

  // ========================
  // PIC & TEAM aman (fallback oldData)
  // ========================

  const combinedPic = [
    ...(data.pic || oldData.pic || []),
    ...(data.customPic
      ? data.customPic.split(",").map((x: string) => x.trim()).filter(Boolean)
      : oldData.customPic
      ? oldData.customPic.split(",").map((x: string) => x.trim())
      : []),
  ];

  // ========================
  // FINAL DATA UNTUK UPDATE DB & UI
  // ========================

  const updatedDataForDB = {
    minggu: data.minggu || oldData.minggu,
    tanggal: finalEstimasiDB,
    realisasi: finalRealisasiDB,

    pic: combinedPic,
    team: Array.isArray(data.team) ? data.team : oldData.team,


    jabodetabek: data.jabodetabek ?? oldData.jabodetabek,
    luar_jabodetabek: data.luarJabodetabek ?? oldData.luarJabodetabek,
    cabang: data.cabang ?? oldData.cabang,
    warehouse: data.warehouse ?? oldData.warehouse,
    tradisional: data.tradisional ?? oldData.tradisional,
    modern: data.modern ?? oldData.modern,
    whz: data.whz ?? oldData.whz,

    description: data.description ?? oldData.description,
    status: data.status ?? oldData.status,
    company: data.company ?? oldData.company,

    no_laporan: data.no_laporan ?? oldData.no_laporan,
    uploaded_by: data.uploaded_by ?? oldData.uploaded_by,

    edited_at: new Date().toISOString(),
  };

  try {
    await supabase.from("audit_full").update(updatedDataForDB).eq("id", data.id);

    setDataList((prev) =>
      prev.map((d) =>
        d.id === data.id
          ? {
              ...d,
              ...updatedDataForDB,
              tanggal: finalEstimasiUI,
              realisasi: finalRealisasiUI,
            }
          : d
      )
    );

    toast.success("Perubahan berhasil disimpan!");
  } catch (err) {
    console.error(err);
    toast.error("Gagal menyimpan data!");
  }
};


  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditData(null);
  };

const handleEditChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >
) => {
  const { name, value } = e.target;

  if (!editData) return;

  // ✅ Kalau field yang diubah adalah "tanggal"
  if (name === "tanggal") {
    // Ambil bulan dan tahun dari editData (pastikan ada di object-nya)
    const bulan = editData.bulan || "";
    const tahun = editData.tahun || "";

    // Hitung minggu otomatis
    const mingguOtomatis = getWeekOfMonth(value, bulan, tahun);

    // Update tanggal dan minggu sekaligus
    setEditData({
      ...editData,
      tanggal: value,
      minggu: mingguOtomatis,
    });

    return; // ⛔ keluar, biar gak lanjut ke bawah
  }

  // ✨ Default update field biasa
  setEditData({
    ...editData,
    [name]: value,
  });
};


  const handleEditPicCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (editData) {
      let newPic = [...editData.pic];
      if (checked) {
        if (!newPic.includes(value)) newPic.push(value);
      } else {
        newPic = newPic.filter((p) => p !== value);
      }
      setEditData({ ...editData, pic: newPic });
    }
  };

// Toggle Status langsung
const handleToggleStatus = async (id: number, newStatus: string) => {
  const { error } = await supabase
    .from("audit_full")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    console.error("Gagal update:", error.message);
    toast.error("Update status gagal!");
  } else {
    setDataList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
    toast.success(`Status berhasil diubah menjadi ${newStatus}`);
  }
};



const exportToExcel = () => {
  const filteredData = dataList
    .filter((d) => (statusTab === "" ? true : d.status === statusTab))
   
    .filter((d) =>
      searchPicUpdatePlan === "" ? true : d.pic?.includes(searchPicUpdatePlan)
    )
    .filter((d) =>
      selectedBulanUpdatePlan === "" ? true : d.bulan === selectedBulanUpdatePlan
    )
    .filter((d) =>
      selectedKategoriUpdatePlan === ""
        ? true
        : d[selectedKategoriUpdatePlan as keyof AuditData]
    );

  if (filteredData.length === 0) {
    toast.error("Tidak ada data untuk diexport!");
    return;
  }

  // 1️⃣ Mapping data export
  const exportData = filteredData.map((d) => ({
    No_Laporan: d.no_laporan || "",
    PIC: Array.isArray(d.pic) ? d.pic.join(", ") : d.pic || "",
    Bulan: d.bulan || "",
    Minggu: d.minggu || "",
    Tanggal: d.tanggal || "",
    Realisasi: d.realisasi || "",
    Company: d.company || "",
    Jabodetabek: d.jabodetabek || "",
    Luar_Jabodetabek: d.luarJabodetabek || "",
    Cabang: d.cabang || "",
    Warehouse: d.warehouse || "",
    Tradisional: d.tradisional || "",
    Modern: d.modern || "",
    WH_Z: d.whz || "",
    Deskripsi: d.description || "",
    Status: d.status || "Belum",
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const headerKeys = Object.keys(exportData[0]);

  // ✨ Border style
  const borderStyle = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
  };

  // 2️⃣ Header styling
  headerKeys.forEach((_, c) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[cellAddress]) {
      ws[cellAddress] = { t: "s", v: headerKeys[c] || "" };
    }
    ws[cellAddress].s = {
      fill: { patternType: "solid", fgColor: { rgb: "4F81BD" } },
      font: { bold: true, color: { rgb: "FFFFFF" } },
      alignment: { vertical: "center", horizontal: "center", wrapText: true },
      border: borderStyle,
    };
  });

  // 3️⃣ Row styling + border per cell
  exportData.forEach((row, i) => {
    const status = row.Status?.toLowerCase();
    let fillColor: string | null = null;

    if (status === "belum") fillColor = "FFF2CC";         // 🟡
    else if (status === "on progress") fillColor = "DDEBF7"; // 🔵
    else if (status === "sudah") fillColor = "E2EFDA";    // 🟢

    headerKeys.forEach((key, c) => {
      const cellAddress = XLSX.utils.encode_cell({ r: i + 1, c });

      if (!ws[cellAddress]) {
        ws[cellAddress] = { t: "s", v: row[key as keyof typeof row] ?? "" };
      }

      ws[cellAddress].s = {
        fill: fillColor
          ? { patternType: "solid", fgColor: { rgb: fillColor } }
          : undefined,
        alignment: { vertical: "center", horizontal: "left", wrapText: true },
        border: borderStyle,
      };
    });
  });

  // 4️⃣ Kolom lebar tetap
  ws["!cols"] = headerKeys.map(() => ({ wch: 20 }));

  // 5️⃣ Auto filter
  ws['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: exportData.length, c: headerKeys.length - 1 },
    }),
  };

  // 6️⃣ Freeze header
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  // 7️⃣ Buat workbook & download
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock Opname");
  XLSX.writeFile(wb, `StockOpname_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.xlsx`);
};

const handleImportExcelWithJenis = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // 🔸 Pilih jenis data
  const jenis = window.prompt("Pilih jenis data: ketik 'visit' atau 'non-visit'");
  if (!jenis || (jenis !== "visit" && jenis !== "non-visit")) {
    toast.error("Jenis data harus 'visit' atau 'non-visit'");
    return;
  }

  // 🔸 Pilih bulan (angka 1-12 atau nama)
  let inputBulan = window.prompt("Masukkan bulan (contoh: 1 atau Januari):");
  if (!inputBulan) {
    toast.error("Bulan wajib diisi!");
    return;
  }

  // Konversi nama bulan → angka
  const bulanMapping: any = {
    januari: "01",
    febuari: "02",
    februari: "02",
    maret: "03",
    april: "04",
    mei: "05",
    juni: "06",
    juli: "07",
    agustus: "08",
    september: "09",
    oktober: "10",
    november: "11",
    desember: "12",
  };

  inputBulan = inputBulan.toString().trim().toLowerCase();
  const selectedMonth =
    bulanMapping[inputBulan] ||
    (Number(inputBulan) >= 1 && Number(inputBulan) <= 12
      ? String(Number(inputBulan)).padStart(2, "0")
      : null);

  if (!selectedMonth) {
    toast.error("Bulan tidak valid! Ketik angka 1–12 atau nama bulan.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });
      if (!jsonData || jsonData.length === 0) {
        toast.error("File Excel kosong atau format tidak sesuai!");
        return;
      }

      // 🔹 Bersihkan header
      const cleanedData = jsonData.map((row: any) => {
        const cleaned: any = {};
        for (const key in row) {
          const cleanKey = key.replace(/\s+/g, " ").trim().toUpperCase();
          cleaned[cleanKey] = row[key];
        }
        return cleaned;
      });

      // 🔹 Generate nomor laporan
      const yearFull = new Date().getFullYear().toString();
      const year = yearFull.slice(-2);
      const prefix = jenis === "visit" ? "SOV" : "SONV";

      const { data: lastData } = await supabase
        .from("audit_full")
        .select("no_laporan")
        .ilike("no_laporan", `${prefix}/${year}/${selectedMonth}/%`)
        .order("no_laporan", { ascending: false })
        .limit(1);

      let counter = 1;
      if (lastData && lastData.length > 0) {
        const lastNo = lastData[0].no_laporan;
        const lastSeq = parseInt(lastNo.split("/").pop() || "0", 10);
        counter = lastSeq + 1;
      }

      // 🔹 Mapping data
      const importedData = cleanedData
        .map((item: any, idx: number) => {
          if (!item["PIC"]) return null;

          const seq = String(counter + idx).padStart(3, "0");
          const noLaporan = `${prefix}/${year}/${selectedMonth}/${seq}`;

          return {
            pic: String(item["PIC"])
              .split(",")
              .map((p: string) => p.trim()),
            bulan: item["BULAN"] || selectedMonth,
            minggu: item["MINGGU"] || "",
            tanggal: item["TANGGAL"] || "",
            jabodetabek: item["JABODETABEK"] || "",
            luar_jabodetabek: item["LUAR JABO"] || "",
            cabang: item["CABANG"] || "",
            anak_cabang: item["ANAK CABANG"] || "",
            warehouse: item["WAREHOUSE"] || "",
            tradisional: item["TRADISIONAL"] || "",
            modern: item["MODERN"] || "",
            whz: item["WH - Z"] || item["WH-Z"] || item["WHZ"] || "",
            description:
              item["DESCRIPTION"] ||
              item["DESKRIPSI"] ||
              item["NOTES"] ||
              item["KETERANGAN"] ||
              "",
            status: item["STATUS"] || "Belum",
            company: item["COMPANY"] || "",
            jenisData: jenis,
            tahun: item["TAHUN"] || yearFull,
            no_laporan: noLaporan,
          };
        })
        .filter((x) => x !== null);

      if (importedData.length === 0) {
        toast.error("Tidak ada data valid yang bisa diimport!");
        return;
      }

     
      const { data: insertedAudit, error: auditError } = await supabase
        .from("audit_full")
        .insert(importedData)
        .select();

      if (auditError) {
        console.error("❌ Gagal import ke audit_full:", auditError.message);
        toast.error("Gagal import ke tabel Audit!");
        return;
      }

      
const { error: planError } = await supabase
  .from("audit_full")
  .upsert(importedData, { onConflict: "id" });


      if (planError) {
        console.error("❌ Gagal import ke audit_full:", planError.message);
        toast.error("Gagal import ke Update Plan SO!");
      }

      // 🔹 Update tampilan
      setDataList((prev) => [...insertedAudit, ...prev]);
      toast.success(
        `Berhasil import ${insertedAudit.length} data ${jenis.toUpperCase()} untuk bulan ${selectedMonth}`
      );
    } catch (err) {
      console.error("Error saat import:", err);
      toast.error("Terjadi kesalahan saat import Excel!");
    }
  };

  reader.readAsArrayBuffer(file);
};

const filteredAndSortedUpdatePlanData = dataList
  .filter((d) => {
    try {
      const todayNum = new Date().getDate();
      const currentMonth = new Date()
        .toLocaleString("id-ID", { month: "long" })
        .toUpperCase();

      // AMBIL BULAN DARI tanggal_estimasi_full (fallback ke d.estimasi atau d.bulan jika kosong)
      let monthFromEstimasiFull = getMonthFromTanggalEstimasi(d.tanggal_estimasi_full);
      if (!monthFromEstimasiFull) {
        // fallback: kalau ada field estimasi yang berupa "jan" / "Januari"
        monthFromEstimasiFull = normalizeMonthInput((d as any).estimasi || d.bulan || "");
      }

      // AUTO ON PROGRESS
      const isAutoOnProgress =
        monthFromEstimasiFull === currentMonth &&
        !!d.tanggal &&
        isTodayInRange(d.tanggal, todayNum);

      // STATUS TAB
      const matchStatus =
        statusTab === "Belum"
          ? d.status === "Belum"
          : statusTab === "On Progress"
          ? d.status === "On Progress" || isAutoOnProgress
          : statusTab === "Sudah"
          ? d.status === "Sudah"
          : true;

      // FILTER BULAN: normalisasi input selectedBulanUpdatePlan
      const normSelectedBulan = normalizeMonthInput(selectedBulanUpdatePlan);

      const matchBulan = normSelectedBulan
        ? monthFromEstimasiFull === normSelectedBulan
        : true;

      // PIC
      const matchPic = searchPicUpdatePlan
        ? Array.isArray(d.pic)
          ? d.pic.some((p: string) =>
              p.toLowerCase().includes(searchPicUpdatePlan.toLowerCase())
            )
          : ((d.pic ?? "") as string)
              .toLowerCase()
              .includes(searchPicUpdatePlan.toLowerCase())
        : true;

      // TANGGAL
      const matchTanggal = searchTanggal
        ? (d.tanggal ?? "").toLowerCase().includes(searchTanggal.toLowerCase())
        : true;

      // TEXT SEARCH (hati-hati: Object.values bisa punya object -- stringify aman)
      const matchText = searchText
        ? Object.values(d).some((val) =>
            String(val ?? "").toLowerCase().includes(searchText.toLowerCase())
          )
        : true;

      // KATEGORI
      const matchKategori = selectedKategoriUpdatePlan
        ? String((d as any)[selectedKategoriUpdatePlan] || "").trim() !== ""
        : true;

      // NO LAPORAN
      const matchNoLaporanUpdate =
        !filterNoLaporanUpdate ||
        (d.no_laporan ?? "").toLowerCase().includes(filterNoLaporanUpdate.toLowerCase());

      return (
        matchStatus &&
        matchBulan &&
        matchPic &&
        matchTanggal &&
        matchText &&
        matchKategori &&
        matchNoLaporanUpdate
      );
    } catch (err) {
      console.error("Filter error for row:", d, err);
      return false;
    }
  })
  .sort((a, b) => {
    // parsing tanggal_estimasi_full aman (fallback ke tanggal jika kosong)
    const parseDateSafe = (val?: string | null) => {
      if (!val) return null;
      // format "22/01/2025" atau "22-24/01/2025"
      const parts = val.split("/");
      if (parts.length < 3) return null;
      const dayPart = parts[0].includes("-") ? parts[0].split("-")[0] : parts[0];
      const d = Number(dayPart);
      const m = Number(parts[1]) - 1;
      const y = Number(parts[2]);
      if (!y || isNaN(m) || isNaN(d)) return null;
      return new Date(y, m, d);
    };

    const da = parseDateSafe(a.tanggal_estimasi_full) || parseDateSafe(a.tanggal) || new Date(0);
    const db = parseDateSafe(b.tanggal_estimasi_full) || parseDateSafe(b.tanggal) || new Date(0);
    return da.getTime() - db.getTime();
  });

// PAGINATION (tetap sama)
const paginatedUpdatePlanData = filteredAndSortedUpdatePlanData.slice(
  (currentPageUpdate - 1) * rowsPerPageUpdate,
  currentPageUpdate * rowsPerPageUpdate
);

  // Grouping
  const groupedByCabang = dataList.reduce(
    (acc: Record<string, Record<string, Record<string, string[]>>>, d) => {
      // Lewati data jika cabang kosong
      if (!d.cabang || d.cabang.trim() === "") return acc;




    const bulanKey = d.bulan ? d.bulan.toUpperCase() : ""; // 🔑 normalisasi bulan ke CAPS LOCK

    if (!acc[bulanKey]) {
      acc[bulanKey] = {};
    }
    if (!acc[bulanKey][d.cabang]) {
      acc[bulanKey][d.cabang] = {};
    }

    if (Array.isArray(d.pic)) {
      d.pic.forEach((pic) => {
        if (!pic || pic.trim() === "") return;
        if (!acc[bulanKey][d.cabang][pic]) {
          acc[bulanKey][d.cabang][pic] = [];
        }
        if (d.tanggal && d.tanggal.trim() !== "") {
          acc[bulanKey][d.cabang][pic].push(d.tanggal);
        }
      });
    }
    return acc;
  },
  {} as Record<string, Record<string, Record<string, string[]>>>
);


  // Membersihkan entri cabang kosong setelah pengelompokan
  Object.keys(groupedByCabang).forEach((bulan) => {
    Object.keys(groupedByCabang[bulan]).forEach((cabang) => {
      const pics = groupedByCabang[bulan][cabang];
      const hasData = Object.values(pics).some((arr) => arr.length > 0);
      if (!hasData) {
        delete groupedByCabang[bulan][cabang];
      }
    });
  });


  const groupedByPic = dataList.reduce(
  (acc: Record<string, Record<string, { cabang: string; tanggal: string }[]>>, d) => {
    if (!d.cabang || d.cabang.trim() === "") return acc;


    const bulanKey = d.bulan ? d.bulan.toUpperCase() : ""; // 🔑 selalu CAPS LOCK

    if (Array.isArray(d.pic)) {
      d.pic.forEach((pic) => {
        if (!pic || pic.trim() === "") return;

        if (!acc[pic]) acc[pic] = {};
        if (!acc[pic][bulanKey]) acc[pic][bulanKey] = [];

        acc[pic][bulanKey].push({
          cabang: d.cabang,
          tanggal: d.tanggal,
        });
      });
    }
    return acc;
  },
  {} as Record<string, Record<string, { cabang: string; tanggal: string }[]>>
);

const filteredFullData = dataList
  .filter((d) => {
    const noLaporan = (d.no_laporan ?? "").trim();
    const bulan = (d.bulan ?? "").toLowerCase();
    const picList = Array.isArray(d.pic)
      ? d.pic.map((p) => p.toLowerCase())
      : [String(d.pic ?? "").toLowerCase()];

    // ✅ Deteksi jenis data (case-insensitive)
    const jenis = (
      d.jenisData ??
      (noLaporan.toUpperCase().startsWith("SOV") ? "visit" :
       noLaporan.toUpperCase().startsWith("SONV") ? "non-visit" : "")
    ).toLowerCase();

    const matchSearch =
      !searchFull ||
      Object.values(d).some((val) =>
        String(val ?? "").toLowerCase().includes(searchFull.toLowerCase())
      );

    const matchPic =
      !selectedPicFull || picList.some((p) => p.includes(selectedPicFull.toLowerCase()));

    const matchBulan =
      !selectedBulanFull || bulan === selectedBulanFull.toLowerCase();

    const matchKategori =
      !selectedKategori ||
      (!!d[selectedKategori] && String(d[selectedKategori]).trim() !== "");

    const matchNoLaporan =
      filterNoLaporan === ""
        ? true
        : filterNoLaporan === "ada"
        ? !!noLaporan && noLaporan !== ""
        : !noLaporan || noLaporan === "";


    return (
      matchSearch &&
      matchPic &&
      matchBulan &&
      matchKategori &&
      matchNoLaporan
    );
  })
  .sort((a, b) => {
    const monthA = getMonthNumber(a.bulan || "");
    const monthB = getMonthNumber(b.bulan || "");
    return monthA === monthB ? (b.id ?? 0) - (a.id ?? 0) : monthA - monthB;
  });

const handleDeleteUpdatePlan = async (plan: AuditData) => {
  const yakin = window.confirm(
    `⚠️ Yakin ingin menghapus data Update Plan: ${plan.no_laporan || "-"} ?`
  );
  if (!yakin) return;

  try {
    const noLaporan = plan.no_laporan?.trim();
    if (!noLaporan) {
      toast.error("❌ Tidak bisa hapus: No Laporan kosong!");
      return;
    }

   
    const { error: planError } = await supabase
      .from("audit_full")
      .delete()
      .eq("no_laporan", noLaporan);

    if (planError) {
      console.error("❌ Gagal hapus dari audit_full:", planError.message);
      toast.error("Gagal hapus data Update Plan!");
      return;
    }

  
    const { error: auditError } = await supabase
      .from("audit_full")
      .delete()
      .eq("no_laporan", noLaporan);

    if (auditError) {
      console.warn("⚠️ Gagal hapus dari audit_full:", auditError.message);
    }

    // 🟢 Update tampilan
    setDataList((prev) => prev.filter((d) => d.no_laporan !== noLaporan));

    toast.success("✅ Data berhasil dihapus dari Update Plan!");
  } catch (err) {
    console.error("🚨 Error hapus Update Plan:", err);
    toast.error("Terjadi kesalahan saat menghapus data!");
  }
};



  
const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 50;

const paginatedData = filteredFullData.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);

// Hitung status PIC
const totalPIC = dataList.length;
const belumCount = dataList.filter((d) => d.status === "Belum").length;
const sudahCount = dataList.filter((d) => d.status === "Sudah").length;

// Asumsi: "On Progress" = semua yang belum selesai, bisa kamu sesuaikan
const progressCount = totalPIC - sudahCount - belumCount; 

const globalStatus = {
  sudah: dataList.filter(d => d.status === "Sudah").length,
  onprogress: dataList.filter(d => d.status === "On Progress").length,
  belum: dataList.filter(d => d.status === "Belum").length,
};

const pieData = [
  { name: "Sudah", value: globalStatus.sudah },
  { name: "On Progress", value: globalStatus.onprogress },
  { name: "Belum", value: globalStatus.belum },
];

const COLORS = ["#22c55e", "#3b82f6", "#facc15"]; // hijau, biru, kuning


const pieDataDashboard = [
  { name: "Sudah", value: globalStatus.sudah, fill: "#22c55e" },
  { name: "On Progress", value: globalStatus.onprogress, fill: "#3b82f6" },
  { name: "Belum", value: globalStatus.belum, fill: "#facc15" },
];

const [userRole, setUserRole] = useState<string | null>(null);

useEffect(() => {
  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      setUserRole(userData?.role || "user");
    }
  };
  fetchUser();
}, []);

useEffect(() => {
  setTeamOptions(picOptions);
}, [picOptions]);




// --- useEffect untuk fetch map dari Supabase ---
useEffect(() => {
  const fetchReportFilesMap = async () => {
    const { data, error } = await supabase
      .from("report_files")
      .select("report_id, file_url");

    if (!error && data) {
      const map: Record<string, boolean> = {};
      data.forEach((f) => {
        if (f.report_id) {
          map[f.report_id] = true; // artinya report ini sudah ada file
        }
      });
      setReportFilesMap(map);
    }
  };

  fetchReportFilesMap();
}, []);


useEffect(() => {
  const user = localStorage.getItem("user");
  if (!user) {
    window.location.href = "/auth/signin";
  } else {
    const parsed = JSON.parse(user);
    setUsername(parsed.username);
    setCurrentUser(parsed); // ⬅️ parsed sudah ada role
  }
}, []);

  return (
    <div className="flex min-h-screen">
     
{/* Sidebar */}
<div
  className={`${
    isCollapsed ? "w-20" : "w-64"
  } bg-gray-50 text-gray-800 flex flex-col border-r border-gray-200 shadow-md transition-all duration-300`}
>
  {/* Header / Logo */}
  <div
    className="flex items-center justify-between p-4 border-b border-gray-200 bg-white cursor-pointer"
    onClick={() => {
      // klik logo untuk expand/collapse
      if (isCollapsed) setIsCollapsed(false);
    }}
  >
    {!isCollapsed ? (
      <div className="flex items-center gap-3">
        {/* === Logo SO (tombol expand/collapse) === */}
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white font-extrabold text-lg shadow-sm cursor-pointer hover:scale-105 transition"
        >
          SO
        </div>
        <h1 className="text-lg font-bold text-gray-800 tracking-wide select-none">
          <span className="text-blue-600">Stock Opname</span>
        </h1>
      </div>
    ) : (
      <div
        onClick={() => setIsCollapsed(false)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white font-extrabold text-lg mx-auto shadow-sm cursor-pointer hover:scale-110 transition"
        title="Expand Sidebar"
      >
        SO
      </div>
    )}
    {!isCollapsed && (
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="text-gray-500 hover:text-gray-700 transition"
      >
        <Menu className="w-5 h-5" />
      </button>
    )}
  </div>

  {/* Navigation */}
<div className="flex-1 overflow-y-auto overflow-x-visible p-3">
    {[
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "input", label: "Input Data", icon: FilePlus2 },
      {
        key: "laporan",
        label: "Update Plan SO",
        icon: FileText,
        children: [
          { key: "updatePlanSO", label: "Laporan Update Plan", icon: ClipboardList },
          { key: "laporanCabangDetail", label: "Cabang Detail", icon: Building },
        ],
      },
      { key: "statusPlan", label: "Status Plan", icon: Database },
      {
        key: "kelola",
        label: "Kelola",
        icon: Settings,
        children: [
          { key: "kelolaPIC", label: "Kelola PIC", icon: User },
          { key: "kelolaCabang", label: "Kelola Cabang", icon: Building },
          { key: "kelolaApproval", label: "Kelola Approval", icon: CheckCircle },
          { key: "kelolaModern", label: "Kelola Modern", icon: ShoppingCart },
          { key: "kelolaUser", label: "Kelola User", icon: Users },
        ],
      },
    ].map((item) => (
      <div key={item.key} className="mb-1">
        {/* === BUTTON MENU === */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (item.children) {
              setOpenMenu(openMenu === item.key ? null : item.key);
            } else {
              setActivePage(item.key);
            }
          }}
          className={`relative flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200 ${
            activePage === item.key
              ? "bg-blue-100 text-blue-700 font-semibold"
              : "hover:bg-blue-50 text-gray-700 font-semibold"
          }`}
        >
          {/* ICON + Tooltip ketika collapse */}
          <div
            className="relative flex items-center justify-center"
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon
              className={`w-5 h-5 shrink-0 ${
                activePage === item.key ? "text-blue-600" : "text-gray-500"
              }`}
            />
          </div>

          {/* Label hanya muncul saat expand */}
          {!isCollapsed && (
            <>
              <span className="text-sm">{item.label}</span>
              {item.children && (
                <span className="ml-auto">
                  {openMenu === item.key ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </span>
              )}
            </>
          )}
        </motion.button>

{/* === SUBMENU === */}
<>
{/* === SUBMENU === */}
<>
  {/* Submenu normal (sidebar terbuka) */}
  {!isCollapsed && openMenu === item.key && item.children && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="ml-6 mt-1 space-y-1"
    >
      {item.children.map((child) => (
        <motion.button
          key={child.key}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActivePage(child.key)}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-sm transition-colors duration-150 ${
            activePage === child.key
              ? "bg-blue-100 text-blue-700 font-semibold"
              : "hover:bg-blue-50 text-gray-700 font-medium"
          }`}
        >
          <child.icon
            className={`w-4 h-4 shrink-0 ${
              activePage === child.key ? "text-blue-600" : "text-gray-500"
            }`}
          />
          <span>{child.label}</span>
        </motion.button>
      ))}
    </motion.div>
  )}

  {/* Submenu hover saat sidebar collapse */}
  {isCollapsed && item.children && (
    <div
      className="relative"
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setOpenMenu({
          key: item.key,
          position: { top: rect.top, left: rect.right + 12 },
        });
      }}
      onMouseLeave={() => setOpenMenu(null)}
    />
  )}
</>
</>

      </div>
    ))}
  </div>
</div>

{/* === Floating submenu (di luar sidebar) === */}
{openMenu && typeof openMenu === "object" && (
  <motion.div
    key={openMenu.key}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="fixed z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl py-3 w-64"
    style={{
      top: openMenu.position.top,
      left: openMenu.position.left,
    }}
    onMouseEnter={() => setOpenMenu(openMenu)} // biar gak langsung hilang
    onMouseLeave={() => setOpenMenu(null)}
  >
    {[
      { key: "updatePlanSO", label: "Laporan Update Plan", icon: ClipboardList },
      { key: "laporanCabangDetail", label: "Cabang Detail", icon: Building },
    ].map((child) => (
      <button
        key={child.key}
        onClick={() => {
          setActivePage(child.key);
          setOpenMenu(null);
        }}
        className={`flex items-center gap-3 px-5 py-2.5 text-sm w-full text-left rounded-md transition-all duration-150 ${
          activePage === child.key
            ? "bg-blue-50 text-blue-700 font-semibold"
            : "hover:bg-slate-50 text-slate-700"
        }`}
      >
        <child.icon
          className={`w-5 h-5 ${
            activePage === child.key ? "text-blue-600" : "text-slate-500"
          }`}
        />
        <span>{child.label}</span>
      </button>
    ))}
  </motion.div>
)}


{activePage === "kelolaPIC" && (
  <AdminOnly>
    <KelolaPIC />
  </AdminOnly>
)}

{activePage === "kelolaCabang" && (
  <AdminOnly>
    <KelolaCabang />
  </AdminOnly>
)}

{activePage === "kelolaApproval" && (
  <AdminOnly>
    <KelolaApproval />
  </AdminOnly>
)}

{activePage === "kelolaModern" && (
  <AdminOnly>
    <KelolaModern />
  </AdminOnly>
)}

{activePage === "kelolaUser" && (
  <AdminOnly>
    <KelolaUser />
  </AdminOnly>
)}

{activePage === "dashboard" && (
  <div className="w-full mx-auto p-8 space-y-10 text-slate-700 bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen overflow-x-hidden">

{/* === HEADER DASHBOARD (versi modern & dinamis) === */}
<div className="p-8 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-md">

  {/* === Baris atas: Salam + Tanggal + Profil === */}
  <div className="flex flex-wrap justify-between items-center mb-6">
    <div>
      {/* Tanggal */}
      <p className="text-slate-500 text-sm mb-1">
        {hari}, {tanggal} {bulan} {tahun}
      </p>

      {/* Salam Dinamis */}
      <h1 className="text-3xl font-semibold text-slate-800">
        {(() => {
          const hour = new Date().getHours();
          if (hour < 12) return "Good Morning";
          if (hour < 18) return "Good Afternoon";
          return "Good Evening";
        })()}{" "}
        <span className="text-blue-600">
          {currentUser?.username ? currentUser.username + "!" : "User!"}
        </span>
      </h1>
    </div>

    {/* === Profil User === */}
    <div className="relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-3 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm hover:bg-slate-50 transition"
      >
        {/* Avatar */}
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 text-white font-semibold uppercase">
          {currentUser?.username?.charAt(0) || "U"}
        </div>

        {/* Username */}
        <span className="text-sm font-medium text-slate-800">
          {currentUser?.username || "User"}
        </span>

        <ChevronDown className="w-4 h-4 text-slate-500" />
      </button>

      {/* === Dropdown === */}
     <AnimatePresence>
  {showUserMenu && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -5 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute right-0 mt-3 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 origin-top-right"
    >
      {/* === Tombol Ganti Akun === */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          toast.success("Silakan login dengan akun lain");
          router.push("/auth/signin");
        }}
        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2"
      >
        <UserCog className="w-4 h-4 text-blue-500" /> Ganti Akun
      </button>

      {/* === Tombol Logout === */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          toast.success("Berhasil logout");
          router.push("/auth/signin");
        }}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  </div>

  {/* === Baris bawah: Statistik + Tombol Aksi === */}
  <div className="flex flex-wrap justify-between items-center gap-4">

   

    {/* === Tombol Aksi === */}
    <div className="flex flex-wrap justify-end gap-2">
      <button
        onClick={() => setActivePage("input")}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition"
      >
        <Plus className="w-4 h-4" /> Tambah Data
      </button>

      <button
        onClick={() => setActivePage("updatePlanSO")}
        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-100 transition"
      >
        <Download className="w-4 h-4" /> Export Excel
      </button>

      <button
        onClick={() => setActivePage("statusPlan")}
        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-100 transition"
      >
        <ListChecks className="w-4 h-4" /> Lihat Status
      </button>

      
      
    </div>
  </div>
</div>



{/* === BAGIAN ATAS DASHBOARD: STATUS PLAN & PROGRESS BULAN === */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
{/* === STATUS PLAN TAHUNAN === */}
<div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-5">
  {/* Header */}
  <div className="flex justify-between items-start mb-4">
    <div>
      <h3 className="text-slate-800 font-semibold text-base">Status Plan Tahunan</h3>
      <p className="text-xs text-slate-500">Tahun {selectedYear}</p>
    </div>

    <div className="flex items-center gap-2">
      <select
        value={selectedYear || new Date().getFullYear()}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="text-sm border border-slate-300 rounded-lg px-2 py-1 bg-slate-50 hover:bg-white transition"
      >
        {Object.keys(groupedByYearPercent)
          .sort((a, b) => Number(b) - Number(a))
          .map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
      </select>

      {/* Tombol ke status plan */}
      <button
        onClick={() => setActivePage("statusPlan")}
        className="text-xs font-medium text-blue-600 border border-blue-200 rounded-lg px-2 py-1 hover:bg-blue-50 transition"
      >
        Lihat Detail
      </button>
    </div>
  </div>

  {/* Progress bar */}
  <div className="mt-2">
    <div className="flex justify-between text-xs text-slate-500 mb-1">
      <span>{yearPercentData.find(y => y.tahun === selectedYear)?.Belum || 0}%</span>
      <span>{yearPercentData.find(y => y.tahun === selectedYear)?.["On Progress"] || 0}%</span>
      <span>{yearPercentData.find(y => y.tahun === selectedYear)?.Sudah || 0}%</span>
    </div>

    <div className="w-full h-2.5 rounded-full overflow-hidden flex">
      <div
        className="bg-amber-400 h-full"
        style={{ width: `${yearPercentData.find(y => y.tahun === selectedYear)?.Belum || 0}%` }}
      />
      <div
        className="bg-blue-400 h-full"
        style={{ width: `${yearPercentData.find(y => y.tahun === selectedYear)?.["On Progress"] || 0}%` }}
      />
      <div
        className="bg-green-400 h-full"
        style={{ width: `${yearPercentData.find(y => y.tahun === selectedYear)?.Sudah || 0}%` }}
      />
    </div>
  </div>

  {/* Kotak 3 status */}
  <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
    <div className="border border-slate-200 rounded-lg py-2">
      <p className="font-semibold text-amber-600">
        {groupedByYearPercent[selectedYear]?.belum || 0}
      </p>
      <p className="text-slate-500">Belum</p>
    </div>
    <div className="border border-slate-200 rounded-lg py-2">
      <p className="font-semibold text-blue-600">
        {groupedByYearPercent[selectedYear]?.onprogress || 0}
      </p>
      <p className="text-slate-500">On Progress</p>
    </div>
    <div className="border border-slate-200 rounded-lg py-2">
      <p className="font-semibold text-green-600">
        {groupedByYearPercent[selectedYear]?.sudah || 0}
      </p>
      <p className="text-slate-500">Sudah</p>
    </div>
  </div>

  {/* Total bawah */}
  <div className="flex justify-start items-end mt-5 text-slate-600">
    <span className="text-2xl font-bold text-slate-800">
      {groupedByYearPercent[selectedYear]?.total || 0}
    </span>
    <span className="ml-1 text-sm text-slate-500">Total Data</span>
  </div>
</div>


{/* === PROGRESS BULAN TERPILIH === */}
<div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md flex flex-col justify-center">
  {/* === Header === */}
  <div className="flex flex-wrap justify-between items-center mb-6">
    <h3 className="font-semibold text-slate-800 text-lg tracking-tight">
      Progress Bulan{" "}
      <span className="text-blue-600">
        {selectedDashboardBulan || currentMonth}
      </span>
    </h3>
    <p className="text-sm text-slate-500">
      Total Data:{" "}
      <span className="font-semibold text-slate-700">{totalBulanTarget}</span>
    </p>
  </div>

  {/* === Bar Progress (diperhalus & diturunkan ke tengah) === */}
  <div className="flex items-center justify-center my-6">
    <div className="w-full h-5 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
      {/* Urutan: Belum → On Progress → Sudah */}
      <div
        className="bg-amber-400 h-full transition-all duration-700"
        style={{
          width: `${(belumBulanTarget / totalBulanTarget) * 100 || 0}%`,
        }}
      />
      <div
        className="bg-blue-400 h-full transition-all duration-700"
        style={{
          width: `${(onProgressBulanTarget / totalBulanTarget) * 100 || 0}%`,
        }}
      />
      <div
        className="bg-green-400 h-full transition-all duration-700"
        style={{
          width: `${(sudahBulanTarget / totalBulanTarget) * 100 || 0}%`,
        }}
      />
    </div>
  </div>

  {/* === Label Persentase === */}
  <div className="flex justify-between text-xs text-slate-500 mb-4">
    <span>{Math.round((belumBulanTarget / totalBulanTarget) * 100) || 0}% Belum</span>
    <span>{Math.round((onProgressBulanTarget / totalBulanTarget) * 100) || 0}% On Progress</span>
    <span>{Math.round((sudahBulanTarget / totalBulanTarget) * 100) || 0}% Sudah</span>
  </div>

  {/* === Legend === */}
  <div className="flex justify-center flex-wrap gap-8 mt-4 text-sm font-medium">
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-sm bg-amber-400" />
      <span className="text-slate-700">
        Belum{" "}
        <span className="font-semibold text-amber-600">{belumBulanTarget}</span>
      </span>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-sm bg-blue-400" />
      <span className="text-slate-700">
        On Progress{" "}
        <span className="font-semibold text-blue-600">{onProgressBulanTarget}</span>
      </span>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-sm bg-green-400" />
      <span className="text-slate-700">
        Sudah{" "}
        <span className="font-semibold text-green-600">{sudahBulanTarget}</span>
      </span>
    </div>
  </div>
</div>


</div>

{/* === REALISASI & PERSENTASE kategori DALAM 1 CARD === */}
<div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-md p-8 mt-10 hover:shadow-lg transition-all">

  <div className="flex flex-col lg:flex-row gap-8 items-start">
  
  {/* === KIRI: REALISASI PER BULAN & KATEGORI === */}
<div className="flex-1">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="font-semibold text-slate-800 text-lg">
        Realisasi per Bulan & Kategori
      </h3>
      <p className="text-xs text-slate-500">Klik batang untuk detail</p>
    </div>

    {/* 🔽 Dropdown Tahun */}
    <select
      value={selectedYear}
      onChange={(e) => setSelectedYear(e.target.value)}
      className="border border-slate-300 text-sm rounded-lg px-3 py-1.5 bg-white shadow-sm hover:border-slate-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
    >
      <option value="">ALL</option>
      {[...new Set(
        (dataList as AuditData[]).map(
          (d: AuditData) => d.tahun || new Date().getFullYear().toString()
        )
      )]
        .sort((a, b) => Number(b) - Number(a))
        .map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
    </select>
  </div>

  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={
        selectedYear
          ? barChartData.filter((d: any) => {
              // Jika barChartData punya tahun, pakai itu untuk filter
              const tahunData =
                (d.tahun as string) ||
                new Date().getFullYear().toString();
              return tahunData === selectedYear;
            })
          : barChartData
      }
      onClick={(data: any) => {
        const clickedBulan = data?.activeLabel || data?.payload?.bulan;
        if (clickedBulan) {
          const bulanUpper = clickedBulan.toUpperCase();
          setSelectedDashboardBulan(bulanUpper);
          setSelectedBulanPIC(bulanUpper); // 🔥 sinkron ke grafik kanan
          toast.success(`Menampilkan data bulan ${clickedBulan}`);
        }
      }}
    >
     <XAxis
  dataKey="bulan"
  tick={{ fill: "#64748b", fontSize: 12 }}
  axisLine={false}
  tickLine={false}
  tickFormatter={(value) => value.slice(0, 3)} // 🟢 potong jadi 3 huruf
/>

      <YAxis
        tick={{ fill: "#64748b", fontSize: 12 }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip
        cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
        contentStyle={{
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          background: "#fff",
        }}
      />
      <Legend wrapperStyle={{ fontSize: 12, color: "#475569" }} />

      {[
        { key: "jabodetabek", color: "#60A5FA", name: "Jabodetabek" },
        { key: "luarJabodetabek", color: "#F87171", name: "Luar Jabo" },
        { key: "cabang", color: "#4ADE80", name: "Cabang" },
        { key: "warehouse", color: "#A78BFA", name: "Warehouse" },
        { key: "modern", color: "#FACC15", name: "Modern" },
        { key: "tradisional", color: "#94A3B8", name: "Tradisional" },
      ].map((item, i) => (
        <Bar
          key={i}
          dataKey={item.key}
          stackId="a"
          fill={item.color}
          name={item.name}
          radius={[4, 4, 0, 0]}
          cursor="pointer"
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
</div>

{/* === KANAN: CHART PER KATEGORI PER BULAN === */}
<div className="flex-1">
  <div className="bg-white p-4 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-3">
      <h2 className="text-lg font-bold">Chart Per Kategori Per Bulan</h2>

      <select
        value={kategoriChart}
        onChange={(e) => setKategoriChart(e.target.value)}
        className="p-2 border rounded"
      >
        {kategoriOptions.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={barDataKategoriFilter}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="bulan" />
        <YAxis />
        <Tooltip />

        <Bar
          dataKey="total"
          fill="#3b82f6"
          onClick={(data) => handleBarClick(data)}
        >
          <LabelList dataKey="total" position="top" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>




  </div>
</div>




{/* ==== 2 DIAGRAM DALAM 1 BARIS ==== */}
<div className="mt-6 flex gap-6">

  {/* ==== DIAGRAM Team ==== */}
  <div className="flex-1 bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-slate-800">Team</h3>

      <select
        value={selectedBulanPIC}
        onChange={(e) => setSelectedBulanPIC(e.target.value)}
        className="p-2 border border-slate-300 rounded-md text-sm"
      >
        <option value="ALL">Semua Bulan</option>
        {monthOrder.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>

    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={picListForSelectedMonth}
        layout="vertical"
        margin={{ left: 0, right: 50 }}
      >
        <XAxis type="number" />
        <YAxis type="category" dataKey="nama" width={120} />
        <Tooltip />

        <Bar dataKey="total" fill="#3b82f6" radius={0}>
          {picListForSelectedMonth.map((item, index) => (
            <Cell
              key={index}
              fill="#3b82f6"
              style={{ cursor: "pointer" }}
              onDoubleClick={() => {
                setSearchPicUpdatePlan(item.nama);
                setActivePage("picTabs");
              }}
            />
          ))}
          <LabelList dataKey="total" position="right" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>


  {/* ==== DIAGRAM PIC ==== */}
  <div className="flex-1 bg-white p-4 rounded-lg shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-slate-800">PIC</h3>

      <select
        value={selectedBulanTEAM}
        onChange={(e) => setSelectedBulanTEAM(e.target.value)}
        className="p-2 border border-slate-300 rounded-md text-sm"
      >
        <option value="ALL">Semua Bulan</option>
        {monthOrder.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>

    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={teamListForSelectedMonthSorted}
        layout="vertical"
        margin={{ left: 0, right: 50 }}
      >
        <XAxis type="number" />
        <YAxis type="category" dataKey="nama" width={120} />
        <Tooltip />

        <Bar dataKey="total" fill="#22c55e" radius={0}>
          {teamListForSelectedMonthSorted.map((item, index) => (
            <Cell
              key={index}
              fill="#22c55e"
              style={{ cursor: "pointer" }}
              onDoubleClick={() => {
                setSearchPicUpdatePlan(item.nama);
                setActivePage("picTabs");
              }}
            />
          ))}
          <LabelList dataKey="total" position="right" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>

</div>




{/* === ON PROGRESS HARI INI (Scroll Horizontal Style) === */}
<div className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 rounded-2xl shadow-md p-8 mt-8 transition-all">
  {/* Header */}
  <div className="flex justify-between items-center mb-6">
    <h3 className="font-semibold text-slate-900 text-xl tracking-tight">
      On Progress Hari Ini
    </h3>
    <p className="text-sm text-slate-500">
      Total:{" "}
      <span className="font-semibold text-blue-600">
        {onProgressToday.length}
      </span>
    </p>
  </div>

  {onProgressToday.length === 0 ? (
    <p className="text-sm text-slate-500 italic text-center">
      Tidak ada progress hari ini
    </p>
  ) : (
    // ✅ Scroll horizontal container
    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
      {onProgressToday.map((d, i) => (
        <div
          key={i}
          className="min-w-[320px] max-w-[320px] bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all flex-shrink-0 relative"
        >
          {/* Header: PIC + tanggal */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">
                PIC
              </p>
              <div className="flex flex-wrap gap-1">
                {d.pic?.map((p: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-100 text-blue-800 border border-blue-200 shadow-sm"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Tanggal */}
            {d.tanggal && (
              <div className="group/date flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm hover:border-blue-400 hover:bg-blue-100 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-600 transition-transform duration-300 group-hover/date:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10m-11 8h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-semibold text-blue-700 tracking-wide transition-colors duration-300 group-hover/date:text-blue-800">
                  {d.tanggal}
                </span>
              </div>
            )}
          </div>

          {/* Nama perusahaan & bulan */}
          <div className="mb-3">
            {d.company && (
              <h4 className="font-semibold text-slate-900 text-base leading-tight">
                {d.company}
              </h4>
            )}
            {d.bulan && (
              <p className="text-xs text-slate-500 mt-0.5">
                Bulan:{" "}
                <span className="font-semibold text-slate-700">{d.bulan}</span>
              </p>
            )}
          </div>

          {/* Lokasi ringkas */}
          <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 mb-2">
            {[
              d.jabodetabek && `Jabo: ${d.jabodetabek}`,
              d.luarJabodetabek && `Luar Jabo: ${d.luarJabodetabek}`,
              d.cabang && `Cabang: ${d.cabang}`,
              d.warehouse && `WH: ${d.warehouse}`,
              d.tradisional && `Trad: ${d.tradisional}`,
              d.modern && `Modern: ${d.modern}`,
              d.whz && `WH-Z: ${d.whz}`,
            ]
              .filter(Boolean)
              .map((txt, idx) => (
                <div key={idx} className="py-0.5">{txt}</div>
              ))}
          </div>

          {/* Deskripsi */}
          {d.description && (
            <p className="mt-2 text-sm text-slate-600 italic border-t border-slate-100 pt-2">
              “{d.description}”
            </p>
          )}

          {/* Indicator bar kiri saat hover */}
          <div className="absolute left-0 top-0 h-full w-[4px] bg-blue-500 opacity-0 group-hover:opacity-100 rounded-l-xl transition-all"></div>
        </div>
      ))}
    </div>
  )}
</div>

 
</div>

)}


{activePage === "picTabs" && (
  <PICTabsPage dataList={dataList} picOptions={picOptions} />
)}


{/* upload File*/}
{activePage === "uploadReport" && selectedApproval && (
  <div className="flex flex-col items-center w-full relative">
    {/* Card Upload + Form */}
    <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Upload Report</h2>

      {/* Upload File */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          id="fileUpload"
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />
        <label
          htmlFor="fileUpload"
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Pilih File
        </label>

        {selectedFile ? (
          <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
        ) : (
          <p className="mt-2 text-sm text-gray-500 italic">Belum ada file dipilih</p>
        )}
      </div>


{/* Form Detail Report */}
<form
  onSubmit={async (e) => {
    e.preventDefault();
    if (!uploadedBy) {
      toast.error("Field 'Diupload oleh' wajib diisi!");
      return;
    }

    try {
      let fileUrl: string | null = null;

      // 1️⃣ Upload file ke Supabase Storage
      if (selectedFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("report-plan")
          .upload(`reports/${Date.now()}_${selectedFile.name}`, selectedFile);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from("report-plan")
          .getPublicUrl(uploadData.path);

        fileUrl = publicUrl.publicUrl;
      }

      // 2️⃣ Simpan ke tabel report_files (history)
      const { error: fileError } = await supabase.from("report_files").insert([
        {
          report_id: selectedApproval?.id,
          report_name: reportName,
          report_description: description,
          uploaded_by: uploadedBy,
          file_url: fileUrl,
        },
      ]);

      if (fileError) throw fileError;

      // 3️⃣ Update ke tabel audit_full
      const { error: auditError } = await supabase
        .from("audit_full")
        .update({
          uploaded_by: uploadedBy,
          description,
          file_url: fileUrl,
        })
        .eq("no_laporan", selectedApproval?.no_laporan);

      if (auditError) throw auditError;

      // 4️⃣ Pastikan approval sudah ada (kalau belum → buat default)
      if (selectedApproval?.id) {
        const { data: existingApprovals, error: checkError } = await supabase
          .from("approvals_status")
          .select("id")
          .eq("report_id", selectedApproval.id);

        if (checkError)
          console.error("❌ Gagal cek approvals:", checkError.message);

        if (!existingApprovals?.length) {
          const approvers = ["Aprilia", "NOVIE", "Andreas"];
          const { error: createError } = await supabase
            .from("approvals_status")
            .insert(
              approvers.map((name, index) => ({
                report_id: selectedApproval.id,
                step: index + 1,
                user: name,
                checked: false,
                note: `Menunggu persetujuan ${name}`,
                status: "Belum",
                // 🆕 Tambahan: simpan deskripsi laporan di approval (biar tampil di status approval)
                description: description,
              }))
            );

          if (createError)
            console.error(
              "❌ Gagal membuat approval default:",
              createError.message
            );
          else
            console.log(
              `✅ Approval default dibuat untuk laporan: ${selectedApproval.no_laporan}`
            );
        } else {
          // 🆕 Kalau approval sudah ada, update description juga
          await supabase
            .from("approvals_status")
            .update({ description })
            .eq("report_id", selectedApproval.id);
        }
      }

      // 5️⃣ Update state lokal (dataList)
      setDataList((prev) =>
        prev.map((d) =>
          d.id === selectedApproval?.id
            ? {
                ...d,
                report_name: selectedApproval?.no_laporan,
                report_description: description,
                uploaded_by: uploadedBy,
                file_url: fileUrl,
              }
            : d
        )
      );

      // 6️⃣ Refresh data history & approval
      await fetchFiles();
      await fetchApprovals?.();

      // 7️⃣ Notifikasi dan reset form
      toast.success("✅ Report berhasil disimpan dan masuk ke status approval!");
      setReportName("");
      setDescription("");
      setUploadedBy("");
      setSelectedFile(null);
      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Supabase insert error:", err);
      toast.error("❌ Gagal simpan report");
    }
  }}
  className="space-y-4 mt-6"
>


 {/* No Laporan */}
  <div>
  <label className="block font-semibold">No Laporan</label>
  <input
    type="text"
    value={selectedApproval?.no_laporan || "-"}
    readOnly
    className="border p-2 rounded w-full bg-gray-100 text-gray-700"
  />
</div>




        {/* Deskripsi */}
        <div>
          <label className="block font-semibold">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

       

        {/* Tombol Navigasi */}
        <div className="flex justify-between mt-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActivePage("updatePlanSO")}
              className="px-4 py-2 rounded border"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </div>
      </form>
    </div>
 
 {/* ===== Kotak History File di bawah card ===== */}
    <div className="w-full max-w-5xl bg-white p-6 rounded-2xl shadow-lg mt-6">
      <h3 className="text-lg font-semibold mb-3">📜 History File</h3>
      {fileHistory.length === 0 ? (
        <p className="text-gray-500 italic">Belum ada file</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2">Deskripsi</th>
                <th className="px-4 py-2">Diupload oleh</th>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">File</th>
                <th className="px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fileHistory.map((f) => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{f.report_description || "—"}</td>
                  <td className="px-4 py-2">{f.uploaded_by || "—"}</td>
                  <td className="px-4 py-2 text-xs">
                    {f.created_at
                      ? new Date(f.created_at).toLocaleString("id-ID")
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {f.file_url ? (
                      <a
                        href={f.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Lihat File
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(f.report_id, f.file_url)}
                      className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}




      {/* Halaman Utama */}
      <div className="flex-1 bg-gray-100 p-6">


{/* === INPUT DATA SO === */}
{activePage === "input" && (
  <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-200">
    {/* === HEADER === */}
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-2 md:gap-0">
      <h2 className="text-3xl font-bold tracking-tight text-slate-800">
        Input Data Plan SO
      </h2>
      <div className="text-sm text-slate-500">
        Lengkapi data di bawah untuk menambahkan rencana SO baru.
      </div>
    </div>

    {/* === IMPORT EXCEL === */}
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Import dari Excel
      </label>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleImportExcelWithJenis}
        className="block w-full text-sm text-slate-700 border border-slate-300 rounded-lg cursor-pointer bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-all duration-200"
      />
    </div>

   {/* === MULTI FORM (PAKAI ACCORDION) === */}
<form onSubmit={handleSubmitAll} className="space-y-4">
  {formList.map((formData, index) => (
    <details
      key={index}
      className="group border border-slate-200 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm open:shadow-md open:border-blue-300 transition-all duration-300"
      open={index === 0} // otomatis buka form pertama
    >
      {/* === HEADER (judul + tombol hapus + panah) === */}
      <summary className="flex items-center justify-between cursor-pointer px-6 py-4 select-none text-slate-800 font-semibold text-lg bg-slate-50 hover:bg-slate-100 rounded-t-2xl transition-all">
        <span>Form #{index + 1}</span>

        <div className="flex items-center gap-3">
          {formList.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFormList(formList.filter((_, i) => i !== index));
              }}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              ✕
            </button>
          )}
          <span className="transition-transform duration-300 group-open:rotate-180">
  ▾
</span>

        </div>
      </summary>

      {/* === ISI FORM === */}
      <div className="px-6 pb-6 pt-2">

{/* === PILIH PIC === */}
<div className="mb-4">
  <label className="block text-sm font-semibold text-slate-800 mb-2">
    PIC<span className="text-red-500 ml-1">*</span>
  </label>

  {/* Checkbox PIC bawaan */}
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200">
    {picOptions.map((p) => (
      <label
        key={p}
        className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 px-2 py-1 rounded transition"
      >
        <input
          type="checkbox"
          value={p}
          checked={formData.pic.includes(p)}
          onChange={(e) => {
            const updated = [...formList];
            const { value, checked } = e.target;
            let newPICs = [...formData.pic];
            if (checked) {
              if (!newPICs.includes(value)) newPICs.push(value);
            } else {
              newPICs = newPICs.filter((v) => v !== value);
            }
            updated[index].pic = newPICs;
            setFormList(updated);
          }}
          className="accent-blue-600 w-4 h-4"
        />
        <span className="truncate">{p}</span>
      </label>
    ))}
  </div>

  {/* Input tambahan untuk PIC manual */}
  <div className="mt-3">
    <label className="block text-xs font-medium text-slate-600 mb-1">
      Tambah PIC manual (boleh dikosongkan)
    </label>
    <input
      type="text"
      placeholder="Contoh: Budi, Rina"
      value={formData.customPic || ""}
      onChange={(e) => {
        const updated = [...formList];
        updated[index].customPic = e.target.value;
        setFormList(updated);
      }}
      className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
    />
  </div>

  {/* Pesan error hanya jika dua-duanya kosong */}
  {formData.pic.length === 0 && !formData.customPic && (
    <p className="text-xs text-red-500 mt-1">
      Pilih PIC atau isi manual minimal satu.
    </p>
  )}
</div>


        {/* === Tahun, Bulan, Periode Tanggal === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tahun<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.tahun}
              onChange={(e) => {
                const updated = [...formList];
                updated[index].tahun = e.target.value;
                setFormList(updated);
              }}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bulan<span className="text-red-500">*</span>
            </label>
            <select
              value={formData.bulan}
              onChange={(e) => {
                const updated = [...formList];
                updated[index].bulan = e.target.value;
                setFormList(updated);
              }}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
            >
              <option value="">-- Pilih Bulan --</option>
              {monthOrder.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Periode Tanggal<span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                name="tanggalAwal"
                value={formData.tanggalAwal || ""}
                onChange={(e) => handleChange(e, index)}
                disabled={!formData.bulan}
                className="flex-1 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none disabled:bg-slate-100 disabled:text-slate-400 transition"
              >
                <option value="">Awal</option>
                {formData.bulan &&
                  Array.from(
                    { length: getDaysInMonth(formData.bulan, Number(formData.tahun)) },
                    (_, i) => i + 1
                  ).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
              </select>

              <select
                name="tanggalAkhir"
                value={formData.tanggalAkhir || ""}
                onChange={(e) => handleChange(e, index)}
                disabled={!formData.bulan}
                className="flex-1 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none disabled:bg-slate-100 disabled:text-slate-400 transition"
              >
                <option value="">Akhir</option>
                {formData.bulan &&
                  Array.from(
                    { length: getDaysInMonth(formData.bulan, Number(formData.tahun)) },
                    (_, i) => i + 1
                  ).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* === Minggu === */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Minggu
          </label>
          <input
            type="text"
            readOnly
            value={formData.minggu}
            placeholder="Otomatis dihitung"
            className="border border-slate-300 rounded-lg w-full p-2 bg-slate-100 cursor-not-allowed text-slate-600"
          />
        </div>

          {/* Perusahaan */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Perusahaan
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => {
                const updated = [...formList];
                updated[index].company = e.target.value;
                setFormList(updated);
              }}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              placeholder="Masukkan nama perusahaan"
            />
          </div>

          {/* Cabang & Anak Cabang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cabang
              </label>
              <select
                value={formData.cabang}
                onChange={(e) => {
                  const updated = [...formList];
                  updated[index].cabang = e.target.value;
                  updated[index].anakCabang = "";
                  setFormList(updated);
                }}
                className="border border-slate-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              >
                <option value="">-- Pilih Cabang --</option>
                {cabangOptions
                  .filter((c) => !c.parent_id)
                  .map((cabang) => (
                    <option key={cabang.id} value={cabang.name}>
                      {cabang.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Anak Cabang
              </label>
              <select
                value={formData.anakCabang || ""}
                onChange={(e) => {
                  const updated = [...formList];
                  updated[index].anakCabang = e.target.value;
                  setFormList(updated);
                }}
                className="border border-slate-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              >
                <option value="">-- Pilih Anak Cabang --</option>
                {cabangOptions
                  .filter(
                    (c) =>
                      c.parent_id ===
                      cabangOptions.find((p) => p.name === formData.cabang)?.id
                  )
                  .map((anak) => (
                    <option key={anak.id} value={anak.name}>
                      {anak.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* FIELD LAIN */}
          {[ "jabodetabek","luarJabodetabek","warehouse","tradisional","modern","whz" ].map((field) => (
            <div key={field} className="mt-3">
              <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                {field === "whz" ? "WH-Z" : field}
              </label>
              <input
                type="text"
                value={(formData as any)[field]}
                onChange={(e) => {
                  const updated = [...formList];
                  (updated[index] as any)[field] = e.target.value;
                  setFormList(updated);
                }}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              />
            </div>
          ))}

          {/* Jenis Data */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Jenis Data<span className="text-red-500">*</span>
            </label>
            <select
              value={formData.jenisData}
              onChange={(e) => {
                const updated = [...formList];
                updated[index].jenisData = e.target.value as "visit" | "non-visit" | "";
                setFormList(updated);
              }}
              className="border border-slate-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
            >
              <option value="">-- Pilih Jenis --</option>
              <option value="visit">Visit</option>
              <option value="non-visit">Non Visit</option>
            </select>
          </div>
        </div>
        </details>
      ))}

{/* === Tambah Form === */}
<button
  type="button"
  onClick={() =>
    setFormList([
      ...formList,
      {
        pic: [],
        team: [],  // ← FIX: harus array
        bulan: "",
        minggu: "",
        tanggal: "",
        tahun: new Date().getFullYear().toString(),
        jabodetabek: "",
        luarJabodetabek: "",
        cabang: "",
        warehouse: "",
        tradisional: "",
        modern: "",
        whz: "",
        company: "",
        jenisData: "",
        status: "Belum",
      },
    ])
  }
  className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md transition"
>
  + Tambah Form
</button>


  {/* === Simpan Semua === */}
  <div className="pt-6 flex justify-end">
    <button
      type="submit"
      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition"
    >
      Simpan Semua Data
    </button>
  </div>
</form>
  </div>
)}



{/* === Update Plan === */}
{activePage === "updatePlanSO" && (
  <div className="w-full max-w-[1600px] mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 px-10 py-8 transition overflow-x-auto">
    <div className="min-w-[1200px]">
    {/* Header */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
        Update Plan SO
      </h2>
      
      <div className="flex flex-wrap items-center gap-3">
    
      {/* Tombol Refresh */}
<button
  onClick={async () => {
    try {
      toast("⏳ Refreshing data...");

      // 1️⃣ Jalankan fetch data
      await fetchDataUpdatePlan();

      // 2️⃣ Ambil bulan dari dropdown
      const bulan = selectedBulanUpdatePlan || ""; // misal: "MEI"
      const year = new Date().getFullYear().toString().slice(-2);

      // 3️⃣ Map nama bulan ke nomor
      const monthMap: Record<string, string> = {
        JANUARI: "01",
        FEBRUARI: "02",
        MARET: "03",
        APRIL: "04",
        MEI: "05",
        JUNI: "06",
        JULI: "07",
        AGUSTUS: "08",
        SEPTEMBER: "09",
        OKTOBER: "10",
        NOVEMBER: "11",
        DESEMBER: "12",
      };

      const monthNum = monthMap[bulan.toUpperCase()] || String(new Date().getMonth() + 1).padStart(2, "0");

      // 4️⃣ Jalankan renumber hanya untuk bulan yang dipilih
      await renumberNoLaporan("SOV", year, monthNum);
      await renumberNoLaporan("SONV", year, monthNum);

      toast.success(`✅ Laporan bulan ${bulan || "aktif"} berhasil dirapikan`);
    } catch (err) {
      console.error("❌ Refresh error:", err);
      toast.error("Gagal refresh data / renumber!");
    }
  }}
  className="flex items-center gap-2 bg-blue-500/90 hover:bg-blue-600 
             text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm 
             transition-all duration-200 active:scale-[0.98]"
>
  <RefreshCcw className="w-4 h-4" />
  Refresh
</button>



 {/* Tombol Export Excel */}
    <button
      onClick={exportToExcel}
      className="flex items-center gap-2 border border-slate-300 text-slate-700 
                 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-medium 
                 shadow-sm transition-all duration-200 active:scale-[0.98]"
    >
      <FileSpreadsheet className="w-4 h-4" />
      Export Excel
    </button>


 {/* === AKSI DATA TERPILIH === */}
{selectedIndices.length > 0 && (
  <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
    <p className="text-sm text-slate-600 font-medium">
      {selectedIndices.length} data dipilih
    </p>

    <div className="flex items-center gap-2">
      {/* Tandai Selesai */}
      <button
        onClick={async () => {
          const idsToUpdate = selectedIndices
            .map((idx) => filteredAndSortedUpdatePlanData[idx]?.id)
            .filter((id) => id !== undefined) as number[];

          if (idsToUpdate.length === 0) return;

          const newDataList = dataList.map((d) =>
            idsToUpdate.includes(d.id!) ? { ...d, status: "Sudah" } : d
          );
          setDataList(newDataList);
          setSelectedIndices([]);

          const { error } = await supabase
            .from("audit_full")
            .update({ status: "Sudah" })
            .in("id", idsToUpdate);

          if (error) {
            toast.error("Update status gagal!");
          } else {
            toast.success("Status berhasil ditandai selesai!");
          }
        }}
        className="flex items-center gap-2 bg-green-500/90 hover:bg-green-600 
                   text-white px-4 py-2 rounded-lg text-sm font-semibold 
                   shadow-sm transition-all duration-200 active:scale-[0.97]"
      >
        <CheckCircle className="w-4 h-4" />
        Tandai Selesai
      </button>

      {/* Hapus */}
      <button
        onClick={async () => {
          if (confirm(`Hapus ${selectedIndices.length} data terpilih?`)) {
            const idsToDelete = selectedIndices
              .map((idx) => filteredAndSortedUpdatePlanData[idx]?.id)
              .filter((id) => id !== undefined) as number[];

            const newDataList = dataList.filter(
              (d) => !idsToDelete.includes(d.id!)
            );
            setDataList(newDataList);
            setSelectedIndices([]);

            const { error } = await supabase
              .from("audit_full")
              .delete()
              .in("id", idsToDelete);

            if (error) toast.error("Hapus data gagal!");
            else toast.success("Data berhasil dihapus!");
          }
        }}
        className="flex items-center gap-2 bg-red-500/90 hover:bg-red-600 
                   text-white px-4 py-2 rounded-lg text-sm font-semibold 
                   shadow-sm transition-all duration-200 active:scale-[0.97]"
      >
        <Trash2 className="w-4 h-4" />
        Hapus
      </button>
    </div>
  </div>
)}
      </div>
    </div>

{/* === FILTER & SEARCH BAR === */}
<div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
  {/* Filter PIC */}
  <select
    value={searchPicUpdatePlan}
    onChange={(e) => setSearchPicUpdatePlan(e.target.value)}
    className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm 
               focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
  >
    <option value="">Semua PIC</option>
    {picOptions.map((pic) => (
      <option key={pic} value={pic}>
        {pic}
      </option>
    ))}
  </select>

 <select
  value={selectedBulanUpdatePlan}
  onChange={(e) => setSelectedBulanUpdatePlan(e.target.value)}
  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm 
             focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
>
  <option value="">Semua Bulan</option>
  {[
    "JANUARI",
    "FEBRUARI",
    "MARET",
    "APRIL",
    "MEI",
    "JUNI",
    "JULI",
    "AGUSTUS",
    "SEPTEMBER",
    "OKTOBER",
    "NOVEMBER",
    "DESEMBER",
  ].map((bln) => (
    <option key={bln} value={bln}>
      {bln}
    </option>
  ))}
</select>



  {/* Filter Kategori */}
  <select
    value={selectedKategoriUpdatePlan}
    onChange={(e) => setSelectedKategoriUpdatePlan(e.target.value)}
    className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm 
               focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
  >
    <option value="">Semua Kategori</option>
    <option value="jabodetabek">Jabodetabek</option>
    <option value="luarJabodetabek">Luar Jabodetabek</option>
    <option value="warehouse">Warehouse</option>
    <option value="modern">Modern</option>
    <option value="tradisional">Tradisional</option>
    <option value="whz">WH-Z</option>
  </select>

  

  {/* Search */}
  <div className="ml-auto relative flex-1 min-w-[250px] max-w-sm">
    <input
      type="text"
      placeholder="Cari data..."
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg 
                 placeholder-slate-400 text-slate-700 focus:ring-2 focus:ring-blue-400 
                 focus:outline-none transition"
    />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
      />
    </svg>
  </div>

{/* === TAB STATUS (Simple Underline Style) === */}
<div className="flex items-center gap-6 border-b border-slate-200 mt-3 w-full overflow-x-auto">
  {[
    { key: "", label: "Semua" },
    { key: "Belum", label: "Belum" },
    { key: "On Progress", label: "On Progress" },
    { key: "Sudah", label: "Sudah" },
  ].map(({ key, label }) => {
    const isActive = statusTab === key;
    return (
      <button
        key={key || "Semua"}
        onClick={() => setStatusTab(key as "" | "Belum" | "On Progress" | "Sudah")}
        className={`relative pb-2 text-sm font-medium transition-all duration-200
          ${
            isActive
              ? "text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
      >
        {label}
        {isActive && (
          <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full transition-all duration-200" />
        )}
      </button>
    );
  })}
</div>



</div>


{/* === Table Container === */}
<div className="w-full overflow-x-auto overflow-y-auto rounded-xl border border-gray-200 shadow-sm max-h-[700px]">
  <table className="min-w-[1000px] w-full text-sm text-gray-700">
   
    <thead className="bg-gray-100 sticky top-0 z-50 shadow-sm">
      <tr className="text-center font-semibold text-gray-800">
        
        {/* Checkbox master */}
        <th className="border border-gray-200 p-2">
          <input
            type="checkbox"
            checked={
              selectedIndices.length === filteredAndSortedUpdatePlanData.length &&
              filteredAndSortedUpdatePlanData.length > 0
            }
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIndices(
                  filteredAndSortedUpdatePlanData.map((_, idx) => idx)
                );
              } else {
                setSelectedIndices((prev) =>
                  prev.filter(
                    (idx) =>
                      !filteredAndSortedUpdatePlanData
                        .map((_, i) => i)
                        .includes(idx)
                  )
                );
              }
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
          />
        </th>

        {/* Kolom umum */}
       
     
<th className="border border-gray-200 p-2 bg-blue-50 font-medium min-w-[220px] text-center">
  Tanggal Estimasi
</th>

<th className="border border-gray-200 p-2 bg-green-50 font-medium min-w-[220px] text-center">
  Tanggal Realisasi
</th>



           <th className="border border-gray-200 p-2">Minggu</th>
       {/* 🌟 KOLUM BARU: RANGE HARI */}
<th className="border border-gray-200 p-2 bg-yellow-50 font-medium">
  Range Hari
</th>



       
                   <th className="border border-gray-200 p-2 bg-blue-50 font-bold">
  PIC
</th>
       
       
        <th
          className="border border-gray-200 p-2 sticky left-0 bg-yellow-50 
                     font-bold text-gray-900 shadow-sm w-48 z-40"
        >
          Team
        </th>




        <th className="border border-gray-200 p-2">Perusahaan</th>

        {/* === Kolom kategori dinamis === */}
        {kategoriHeaders
          .filter(
            (k) =>
              !selectedKategoriUpdatePlan ||
              selectedKategoriUpdatePlan === k.key
          )
          .map((k) => (
            <th key={k.key} className="border border-gray-200 p-2">
              {k.label}
            </th>
          ))}

        <th className="border border-gray-200 p-2">Deskripsi</th>
        <th className="border border-gray-200 p-2">Status</th>
        <th className="border border-gray-200 p-2">Created At</th>

        <th className="border border-gray-200 p-2">Upload Laporan</th>

{/* Filter No Laporan */}
<th className="border border-gray-200 p-2 text-center">
  <div className="flex flex-col items-center gap-2">
    <span className="font-semibold">No Laporan</span>
    <input
      type="text"
      placeholder="Cari No Laporan..."
      value={filterNoLaporanUpdate}
      onChange={(e) => setFilterNoLaporanUpdate(e.target.value)}
      className="border border-gray-300 rounded-md px-2 py-1 text-sm w-48 text-center
                 focus:ring-2 focus:ring-blue-300 focus:outline-none"
    />
  </div>
</th>



       
        <th className="border border-gray-200 p-2">Aksi</th>
      </tr>
    </thead>

<tbody>
  {filteredAndSortedUpdatePlanData.length === 0 ? (
    <tr>
      <td colSpan={15} className="text-center p-4 text-gray-500">
        Tidak ada data yang sesuai dengan filter.
      </td>
    </tr>
  ) : (
    paginatedUpdatePlanData.map((d, i) => (
      <tr key={d.id || i} className="text-center">

        {/* Checkbox Pilih Baris */}
        <td className="p-2 border border-gray-300">
          <input
            type="checkbox"
            checked={selectedIndices.includes(i)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIndices([...selectedIndices, i]);
              } else {
                setSelectedIndices(selectedIndices.filter((idx) => idx !== i));
              }
            }}
          />
        </td>



      
     {/* Tanggal Estimasi */}
<td className="p-2 border border-gray-300">
  {d.tanggal_estimasi_full ? (
<div className="flex items-center justify-center w-full">

      <div className="w-[180px] px-3 py-2 bg-gray-100 rounded-xl border border-gray-200 shadow-sm text-center">
        <span className="text-sm font-medium text-gray-800">
          {formatDateDisplay(d.tanggal_estimasi_full)}
        </span>
      </div>
    </div>
  ) : (
    "-"
  )}
</td>


{/* Tanggal Realisasi */}
<td className="p-2 border border-gray-300">
  {d.tanggal_realisasi_full ? (
    <div className="flex items-center justify-center w-full">
      <div className="w-[180px] px-3 py-2 bg-gray-100 rounded-xl border border-gray-200 shadow-sm text-center">
        <span className="text-sm font-medium text-gray-800">
          {formatDateDisplay(d.tanggal_realisasi_full)}
        </span>
      </div>
    </div>
  ) : (
    "-"
  )}
</td>





  {/* Minggu */}
        <td className="p-2 border border-gray-300">
          {highlightText(d.minggu || "", searchText)}
        </td>


{/* Range Hari */}
<td className="p-2 border border-gray-300 bg-yellow-50 font-semibold">
  {getRealisasiRangeDays(d.tanggal_realisasi_full)
    ? `${getRealisasiRangeDays(d.tanggal_realisasi_full)} hari`
    : "-"}
</td>





{/* TEAM */}
<td className="p-2 border border-gray-300">
  {Array.isArray(d.team) ? d.team.join(", ") : d.team || "-"}
</td>

        {/* PIC */}
        <td className="p-2 border border-gray-300 text-left">
          {[
            ...(d.pic || []),
            ...(d.customPic ? d.customPic.split(",").map((x) => x.trim()) : []),
          ]
            .filter(Boolean)
            .join(", ") || "-"}
        </td>

        {/* Company */}
        <td className="p-2 border border-gray-300">
          {highlightText(d.company || "", searchText)}
        </td>

        {/* Jabodetabek */}
        {(!selectedKategoriUpdatePlan ||
          selectedKategoriUpdatePlan === "jabodetabek") && (
          <td className="p-2 border border-gray-300">
            {highlightText(d.jabodetabek || "", searchText)}
          </td>
        )}

        {/* Luar Jabodetabek */}
        {(!selectedKategoriUpdatePlan ||
          selectedKategoriUpdatePlan === "luarJabodetabek") && (
          <td className="p-2 border border-gray-300">
            {highlightText(d.luarJabodetabek || "", searchText)}
          </td>
        )}

        {/* Cabang */}
        {(!selectedKategoriUpdatePlan ||
          selectedKategoriUpdatePlan === "cabang") && (
          <td className="p-2 border border-gray-300">
            {highlightText(d.cabang || "", searchText)}
          </td>
        )}

        {/* Warehouse */}
        {(!selectedKategoriUpdatePlan ||
          selectedKategoriUpdatePlan === "warehouse") && (
          <td className="p-2 border border-gray-300">
            {highlightText(d.warehouse || "", searchText)}
          </td>
        )}

        {/* Tradisional */}
        {(!selectedKategoriUpdatePlan ||
          selectedKategoriUpdatePlan === "tradisional") && (
          <td className="p-2 border border-gray-300">
            {highlightText(d.tradisional || "", searchText)}
          </td>
        )}

        {/* Modern */}
        {(!selectedKategoriUpdatePlan ||
          selectedKategoriUpdatePlan === "modern") && (
          <td className="p-2 border border-gray-300">
            {highlightText(d.modern || "", searchText)}
          </td>
        )}

        {/* WH-Z */}
        {(!selectedKategoriUpdatePlan ||
          selectedKategoriUpdatePlan === "whz") && (
          <td className="p-2 border border-gray-300">
            {highlightText(d.whz || "", searchText)}
          </td>
        )}

        {/* Deskripsi */}
        <td className="p-2 border border-gray-300">
          {highlightText(d.description || "", searchText)}
        </td>

        {/* Status (Tetap Editable!) */}
        <td className="p-2 border border-gray-300">
          <select
            value={d.status}
            onChange={(e) => handleToggleStatus(d.id!, e.target.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border
              ${
                d.status === "Sudah"
                  ? "border-green-500 text-green-600 bg-green-50"
                  : d.status === "On Progress"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-yellow-500 text-yellow-600 bg-yellow-50"
              }`}
          >
            <option value="Belum">⏳ Belum</option>
            <option value="On Progress">🔄 On Progress</option>
            <option value="Sudah">✅ Sudah</option>
          </select>
        </td>

        {/* Created At */}
        <td className="p-2 border border-gray-300 text-gray-600">
          {d.created_at
            ? new Date(d.created_at).toLocaleString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </td>

      
        {/* Report */}
        <td className="p-2 border border-gray-300">
          <button
            onClick={() => {
              setSelectedApproval(d);
              setActivePage("uploadReport");
            }}
            className={`px-3 py-1.5 rounded-lg text-sm text-white shadow
              ${
                reportFilesMap[d.id ?? ""]
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            Report
          </button>
        </td>

        {/* No Laporan */}
        <td className="p-2 border border-gray-300">
          {highlightText(d.no_laporan || "", searchText)}
        </td>

        

        {/* Aksi */}
        <td className="p-2 border border-gray-300">
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                setEditingData({ ...d });
                setShowEditModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border 
                         border-blue-400 text-blue-600 hover:bg-blue-50"
            >
              <Pencil size={16} /> Edit
            </button>

            <button
              onClick={() => handleDeleteUpdatePlan(d)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border 
                         border-red-400 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} /> Hapus
            </button>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>



</table>  

{showEditModal && editingData && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 border border-blue-200">

      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-blue-100">
        <h2 className="text-2xl font-semibold text-blue-700">
          Edit Data Sales Order
        </h2>
        <button
          onClick={() => setShowEditModal(false)}
          className="text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>
      </div>

      {/* Form Content */}
      <div className="grid grid-cols-2 gap-5 mt-5">

       

     

{/* Tanggal Estimasi Awal */}
<div>
  <label className="font-semibold text-blue-700">Tanggal Estimasi Awal</label>
  <input
    type="date"
    value={editingData.tanggalAwal || ""}
    onChange={(e) => {
      const newDate = e.target.value;
      const week = getWeekNumber(newDate);

      setEditingData({
        ...editingData,
        tanggalAwal: newDate,
        minggu: week.toString(),   // tetap update minggu otomatis
      });
    }}
    className="w-full border border-blue-300 p-2 rounded-lg"
  />
</div>


     {/* Tanggal Estimasi Akhir */}
<div>
  <label className="font-semibold text-blue-700">Tanggal Estimasi Akhir</label>
  <input
    type="date"
    value={editingData.tanggalAkhir || ""}
    onChange={(e) =>
      setEditingData({
        ...editingData,
        tanggalAkhir: e.target.value,
      })
    }
    className="w-full border border-blue-300 p-2 rounded-lg"
  />
</div>


        {/* Minggu (otomatis) */}
        <div>
          <label className="font-semibold text-blue-700">Minggu (otomatis)</label>
          <input
            type="text"
            value={editingData.minggu || ""}
            disabled
            className="w-full border border-blue-300 p-2 rounded-lg bg-gray-100"
          />
        </div>

       {/* PIC CHECKBOX */}
<div className="col-span-2">
  <label className="font-semibold text-blue-700">PIC</label>

  <div className="grid grid-cols-2 gap-2 mt-2">
    {picOptions.map((name) => (
      <label key={name} className="flex items-center gap-2">
        <input
          type="checkbox"
          value={name}
          checked={
            Array.isArray(editingData?.team)
              ? editingData.team.includes(name)
              : false
          }
          onChange={(e) => {
            const { value, checked } = e.target;

            let updatedTeam = Array.isArray(editingData.team)
              ? [...editingData.team]
              : [];

            if (checked) {
              if (!updatedTeam.includes(value)) updatedTeam.push(value);
            } else {
              updatedTeam = updatedTeam.filter((t) => t !== value);
            }

            setEditingData({
              ...editingData,
              team: updatedTeam,
            });
          }}
        />
        <span>{name}</span>
      </label>
    ))}
  </div>
</div>


        {/* Team*/}
        <div className="col-span-2">
          <label className="font-semibold text-blue-700">Team</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {picOptions.map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editingData.pic?.includes(p)}
                  onChange={(e) => {
                    let updated = [...editingData.pic];
                    if (e.target.checked) {
                      updated.push(p);
                    } else {
                      updated = updated.filter((x) => x !== p);
                    }
                    setEditingData({ ...editingData, pic: updated });
                  }}
                />
                {p}
              </label>
            ))}
          </div>

          <input
            type="text"
            placeholder="Tambah PIC manual (pisahkan koma)"
            value={editingData.customPic || ""}
            onChange={(e) =>
              setEditingData({ ...editingData, customPic: e.target.value })
            }
            className="w-full border border-blue-300 p-2 rounded-lg mt-2"
          />
        </div>

        {/* Company */}
        <div className="col-span-2">
          <label className="font-semibold text-blue-700">Company</label>
          <input
            type="text"
            value={editingData.company || ""}
            onChange={(e) =>
              setEditingData({ ...editingData, company: e.target.value })
            }
            className="w-full border border-blue-300 p-2 rounded-lg"
          />
        </div>

        {/* ========================== */}
        {/*   AREA TEKS (kanan kiri)   */}
        {/* ========================== */}

        <div>
          <label className="font-semibold text-blue-700">Jabodetabek</label>
          <textarea
            value={editingData.jabodetabek || ""}
            onChange={(e) =>
              setEditingData({ ...editingData, jabodetabek: e.target.value })
            }
            className="w-full border border-blue-300 p-2 rounded-lg min-h-[80px]"
          />
        </div>

        <div>
          <label className="font-semibold text-blue-700">Luar Jabodetabek</label>
          <textarea
            value={editingData.luarJabodetabek || ""}
            onChange={(e) =>
              setEditingData({
                ...editingData,
                luarJabodetabek: e.target.value,
              })
            }
            className="w-full border border-blue-300 p-2 rounded-lg min-h-[80px]"
          />
        </div>

        <div>
          <label className="font-semibold text-blue-700">Cabang</label>
          <textarea
            value={editingData.cabang || ""}
            onChange={(e) =>
              setEditingData({ ...editingData, cabang: e.target.value })
            }
            className="w-full border border-blue-300 p-2 rounded-lg min-h-[80px]"
          />
        </div>

        <div>
          <label className="font-semibold text-blue-700">Warehouse</label>
          <textarea
            value={editingData.warehouse || ""}
            onChange={(e) =>
              setEditingData({ ...editingData, warehouse: e.target.value })
            }
            className="w-full border border-blue-300 p-2 rounded-lg min-h-[80px]"
          />
        </div>

        <div>
          <label className="font-semibold text-blue-700">Tradisional</label>
          <textarea
            value={editingData.tradisional || ""}
            onChange={(e) =>
              setEditingData({ ...editingData, tradisional: e.target.value })
            }
            className="w-full border border-blue-300 p-2 rounded-lg min-h-[80px]"
          />
        </div>

        <div>
          <label className="font-semibold text-blue-700">Modern</label>
          <textarea
            value={editingData.modern || ""}
            onChange={(e) =>
              setEditingData({ ...editingData, modern: e.target.value })
            }
            className="w-full border border-blue-300 p-2 rounded-lg min-h-[80px]"
          />
        </div>

        <div>
          <label className="font-semibold text-blue-700">WHZ</label>
          <textarea
            value={editingData.whz || ""}
            onChange={(e) =>
              setEditingData({ ...editingData, whz: e.target.value })
            }
            className="w-full border border-blue-300 p-2 rounded-lg min-h-[80px]"
          />
        </div>

        {/* DESKRIPSI */}
        <div className="col-span-2">
          <label className="font-semibold text-blue-700">Deskripsi</label>
          <textarea
            value={editingData.description || ""}
            onChange={(e) =>
              setEditingData({ ...editingData, description: e.target.value })
            }
            className="w-full border border-blue-300 p-2 rounded-lg min-h-[100px]"
          />
        </div>

        {/* TANGGAL REALISASI */}
        <div>
          <label className="font-semibold text-blue-700">Realisasi Awal</label>
          <input
  type="date"
  value={editingData.realisasi?.split(" - ")[0] || ""}
  onChange={(e) => {
    const awal = e.target.value;
    const akhir = editingData.realisasi?.split(" - ")[1] || "";

    setEditingData({
      ...editingData,
      realisasi: akhir ? `${awal} - ${akhir}` : awal,
    });
  }}
  className="w-full border border-blue-300 p-2 rounded-lg"
/>

        </div>

        <div>
          <label className="font-semibold text-blue-700">Realisasi Akhir</label>
         <input
  type="date"
  value={editingData.realisasi?.split(" - ")[1] || ""}
  onChange={(e) => {
    const akhir = e.target.value;
    const awal = editingData.realisasi?.split(" - ")[0] || "";

    setEditingData({
      ...editingData,
      realisasi: awal ? `${awal} - ${akhir}` : akhir,
    });
  }}
  className="w-full border border-blue-300 p-2 rounded-lg"
/>

        </div>

        {/* NO LAPORAN */}
        <div>
          <label className="font-semibold text-blue-700">No Laporan</label>
          <input
            type="text"
            value={editingData.no_laporan || ""}
            onChange={(e) =>
              setEditingData({ ...editingData, no_laporan: e.target.value })
            }
            className="w-full border border-blue-300 p-2 rounded-lg"
          />
        </div>

       
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-5 border-t mt-5">
        <button
          className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          onClick={() => setShowEditModal(false)}
        >
          Batal
        </button>

        <button
          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
          onClick={() => {
            handleSaveEditModal(editingData);
            setShowEditModal(false);
          }}
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  </div>
)}


</div>

{/* === Pagination Modern (Update Plan) === */}
<div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 text-sm text-slate-600">
  {/* Info jumlah data */}
  <p className="text-slate-500">
    Menampilkan{" "}
    <span className="font-medium text-slate-700">
      {(currentPageUpdate - 1) * rowsPerPageUpdate + 1}
    </span>{" "}
    -{" "}
    <span className="font-medium text-slate-700">
      {Math.min(currentPageUpdate * rowsPerPageUpdate, filteredAndSortedUpdatePlanData.length)}
    </span>{" "}
    dari{" "}
    <span className="font-medium text-slate-700">
      {filteredAndSortedUpdatePlanData.length}
    </span>{" "}
    data
  </p>

  {/* Tombol navigasi */}
  <div className="flex items-center gap-1">
    {/* Tombol Prev */}
    <button
      onClick={() => setCurrentPageUpdate((prev) => Math.max(prev - 1, 1))}
      disabled={currentPageUpdate === 1}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white 
                 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed 
                 transition text-slate-700 font-medium text-xs"
    >
      <ChevronLeft className="w-4 h-4" />
      Prev
    </button>

    {/* Halaman */}
    {(() => {
      const totalPages = Math.ceil(filteredAndSortedUpdatePlanData.length / rowsPerPageUpdate);
      const pages: (number | string)[] = [];

      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        if (currentPageUpdate > 3) pages.push("...");
        for (
          let i = Math.max(2, currentPageUpdate - 1);
          i <= Math.min(totalPages - 1, currentPageUpdate + 1);
          i++
        ) {
          if (!pages.includes(i)) pages.push(i);
        }
        if (currentPageUpdate < totalPages - 2) pages.push("...");
        if (!pages.includes(totalPages)) pages.push(totalPages);
      }

      return pages.map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-update-${idx}`} className="px-2 text-slate-400 select-none">
            ...
          </span>
        ) : (
          <button
            key={`page-update-${page}-${idx}`}
            onClick={() => setCurrentPageUpdate(page as number)}
            className={`w-8 h-8 flex items-center justify-center rounded-full border text-xs font-medium transition-all 
              ${
                currentPageUpdate === page
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
          >
            {page}
          </button>
        )
      );
    })()}

    {/* Tombol Next */}
    <button
      onClick={() =>
        setCurrentPageUpdate((prev) =>
          Math.min(
            prev + 1,
            Math.ceil(filteredAndSortedUpdatePlanData.length / rowsPerPageUpdate)
          )
        )
      }
      disabled={
        currentPageUpdate ===
        Math.ceil(filteredAndSortedUpdatePlanData.length / rowsPerPageUpdate)
      }
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white 
                 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed 
                 transition text-slate-700 font-medium text-xs"
    >
      Next
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
</div>

        </div>
        </div>
        )}
        </div>

 
{/* === Laporan Cabang Detail === */}
{activePage === "laporanCabangDetail" && (
  <div className="min-h-screen w-full bg-gray-50 flex justify-center p-8 overflow-x-hidden">
    <div className="w-full max-w-[1600px] bg-white border border-slate-200 rounded-2xl shadow-lg px-10 py-8 overflow-x-auto">
      <div className="min-w-[1200px]">
      {/* === Header === */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
          Laporan per Cabang
        </h2>
      </div>

    {/* Filter Bar */}
    <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
      {/* Pilih Cabang */}
      <select
        value={selectedCabang}
        onChange={(e) => {
          setSelectedCabang(e.target.value);
          setSelectedAnakCabang("");
        }}
        className="border border-slate-300 bg-white px-3 py-2.5 rounded-lg text-sm text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
      >
        <option value="">-- Pilih Cabang --</option>
        {cabangOptions
          .filter((c) => !c.parent_id)
          .map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
      </select>

      {/* Pilih Anak Cabang */}
      {selectedCabang && (
        <select
          value={selectedAnakCabang}
          onChange={(e) => setSelectedAnakCabang(e.target.value)}
          className="border border-slate-300 bg-white px-3 py-2.5 rounded-lg text-sm text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
        >
          <option value="">-- Pilih Anak Cabang --</option>
          {cabangOptions
            .filter(
              (c) =>
                c.parent_id &&
                cabangOptions.find((p) => p.id === c.parent_id)?.name ===
                  selectedCabang
            )
            .map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
        </select>
      )}

      {/* Filter Bulan */}
      <select
        value={selectedBulan || ""}
        onChange={(e) => setSelectedBulan(e.target.value)}
        className="border border-slate-300 bg-white px-3 py-2.5 rounded-lg text-sm text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
      >
        <option value="">-- Filter Bulan --</option>
        {[...new Set(dataList.map((d) => d.bulan))].map((bulan, i) => (
          <option key={i} value={bulan}>
            {bulan}
          </option>
        ))}
      </select>

      {/* Filter PIC */}
      <select
        value={selectedPic || ""}
        onChange={(e) => setSelectedPic(e.target.value)}
        className="border border-slate-300 bg-white px-3 py-2.5 rounded-lg text-sm text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
      >
        <option value="">-- Filter PIC --</option>
        {picOptions.map((pic) => (
          <option key={pic} value={pic}>
            {pic}
          </option>
        ))}
      </select>
    </div>

    {/* === Table === */}
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm max-h-[600px]">
      <table className="min-w-full text-sm text-slate-700 text-center border-collapse">
        <thead className="bg-slate-100 sticky top-0 z-20 shadow-sm">
          <tr>
            {["Bulan", "Tanggal", "Minggu", "PIC", "Cabang", "Anak Cabang"].map((header) => (
              <th
                key={header}
                className="px-4 py-3 font-semibold text-slate-800 border-b border-slate-200"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {paginatedCabangData.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="text-center py-6 text-slate-500 italic"
              >
                Tidak ada data.
              </td>
            </tr>
          ) : (
            paginatedCabangData.map((d, i) => (
              <tr
                key={d.id ?? i}
                className={`transition-colors ${
                  i % 2 === 0 ? "bg-white" : "bg-slate-50"
                } hover:bg-blue-50/70`}
              >
                <td className="px-4 py-2">{d.bulan}</td>
                <td className="px-4 py-2">{d.tanggal}</td>
                <td className="px-4 py-2">{d.minggu}</td>
                <td className="px-4 py-2">
                  {Array.isArray(d.pic) ? d.pic.join(", ") : d.pic}
                </td>
                <td className="px-4 py-2">{d.cabang}</td>
                <td className="px-4 py-2">{d.anakCabang || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination bawah */}
    {filteredCabangData.length > rowsPerPageCabang && (
      <div className="mt-6">
        <EllipsisPagination
          currentPage={currentPageCabang}
          totalRows={filteredCabangData.length}
          rowsPerPage={rowsPerPageCabang}
          onPageChange={setCurrentPageCabang}
        />
      </div>
    )}
  </div>
  </div>
  </div>
)}



{/* === STATUS PLAN === */}
{activePage === "statusPlan" && (
  <div className="min-h-screen w-full bg-gray-50 flex justify-center p-8 overflow-x-hidden">
    <div className="w-full max-w-[1600px] bg-white rounded-2xl shadow-lg border border-slate-200 px-10 py-8 transition overflow-x-auto">
      <div className="min-w-[1200px]">
      {/* === Header === */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Status Plan</h2>
        <p className="mt-2 text-slate-600 text-sm italic">
   Detail Data berada di halaman Update Plan SO
  </p>
      </div>

{/* === Tabs dengan Badge Jumlah (fix perhitungan) === */}
<div className="flex justify-center mb-8">
  {(() => {
    const todayNum = new Date().getDate();
    const currentMonthStr = new Date().toLocaleString("id-ID", { month: "long" }).toUpperCase();

    // 🔹 Fungsi bantu: status efektif per data
    const getEffectiveStatus = (d: AuditData) => {
      if (d.status === "Sudah") return "Sudah";
      if (d.status === "On Progress") return "On Progress";
      if (
        d.bulan?.toUpperCase() === currentMonthStr &&
        !!d.tanggal &&
        isTodayInRange(d.tanggal, todayNum)
      ) {
        return "On Progress";
      }
      return "Belum";
    };

    // 🔹 Hitung total per status
    const countSudah = dataList.filter((d) => getEffectiveStatus(d) === "Sudah").length;
    const countOnProgress = dataList.filter((d) => getEffectiveStatus(d) === "On Progress").length;
    const countBelum = dataList.filter((d) => getEffectiveStatus(d) === "Belum").length;

    const tabs = [
      { label: "Belum", color: "bg-yellow-500", count: countBelum},
      { label: "On Progress", color: "bg-blue-600", count: countOnProgress },
      { label: "Sudah", color: "bg-green-600", count: countSudah },
    ];

    return tabs.map((tab) => (
      <button
        key={tab.label}
        onClick={() => setStatusTab(tab.label as "On Progress" | "Belum" | "Sudah")}
        className={`relative flex items-center gap-2 px-6 py-2.5 mx-2 text-sm font-semibold rounded-full transition-all duration-200 shadow-sm
          ${
            statusTab === tab.label
              ? `${tab.color} text-white shadow-md scale-105`
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
      >
        {tab.label}
        <span
          className={`px-2.5 py-0.5 text-xs rounded-full font-bold ${
            statusTab === tab.label ? "bg-white text-slate-800" : "bg-slate-300 text-slate-700"
          }`}
        >
          {tab.count}
        </span>
      </button>
    ));
  })()}
</div>


    {/* === Filter Section === */}
    <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <select
        value={searchPicStatusPlan}
        onChange={(e) => setSearchPicStatusPlan(e.target.value)}
        className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Semua PIC</option>
        {picOptions.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <select
        value={searchBulanStatusPlan}
        onChange={(e) => setSearchBulanStatusPlan(e.target.value)}
        className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Semua Bulan</option>
        {monthOrder.map((bulan) => (
          <option key={bulan} value={bulan}>
            {bulan}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Cari data..."
        value={searchTextStatusPlan}
        onChange={(e) => setSearchTextStatusPlan(e.target.value)}
        className="ml-auto border border-slate-300 rounded-lg px-3 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>

    {/* === TABLE === */}
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm max-h-[750px]">
      <table className="min-w-full text-sm text-slate-700 border-collapse">
        {/* Header */}
        <thead className="bg-slate-100 sticky top-0 z-50 border-b border-slate-300">
          <tr className="text-center font-semibold text-slate-800">
            <th className="px-4 py-3">Bulan</th>
            <th className="px-4 py-3">Minggu</th>
            <th className="px-4 py-3">Tanggal Plan</th>
            <th className="px-4 py-3">Tanggal Realisasi</th>
            <th
              className="px-4 py-3 sticky left-0 bg-yellow-200 z-40 font-bold text-slate-900 rounded-l-lg"
            >
              PIC
            </th>
            <th className="px-4 py-3">Perusahaan</th>
            <th className="px-4 py-3">Jabodetabek</th>
            <th className="px-4 py-3">Luar Jabo</th>
            <th className="px-4 py-3">Cabang</th>
            <th className="px-4 py-3">Warehouse</th>
            <th className="px-4 py-3">Tradisional</th>
            <th className="px-4 py-3">Modern</th>
            <th className="px-4 py-3">WH-Z</th>
            <th className="px-4 py-3">No Laporan</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-slate-200">
          {paginatedStatusPlanData.length === 0 ? (
            <tr>
              <td colSpan={15} className="text-center py-8 text-slate-500 italic">
                Tidak ada data {statusTab}.
              </td>
            </tr>
          ) : (
            paginatedStatusPlanData.map((d, i) => (
              <tr
                key={d.id || i}
                className={`text-center transition-colors ${
                  i % 2 === 0 ? "bg-white" : "bg-slate-50"
                } hover:bg-blue-50`}
              >
                <td className="px-4 py-2">{d.bulan}</td>
                <td className="px-4 py-2">{d.minggu}</td>
<td className="px-4 py-2">{d.tanggal}</td>
<td className="px-4 py-2">{d.realisasi || "-"}</td>

<td className="px-4 py-2 sticky left-0 bg-white z-40 font-semibold text-left">
  {Array.isArray(d.pic) ? d.pic.join(", ") : d.pic}
</td>

                <td className="px-4 py-2">{d.company}</td>
                <td className="px-4 py-2">{d.jabodetabek}</td>
                <td className="px-4 py-2">{d.luarJabodetabek}</td>
                <td className="px-4 py-2">{d.cabang}</td>
                <td className="px-4 py-2">{d.warehouse}</td>
                <td className="px-4 py-2">{d.tradisional}</td>
                <td className="px-4 py-2">{d.modern}</td>
                <td className="px-4 py-2">{d.whz}</td>
                <td className="px-4 py-2">{d.no_laporan || "-"}</td>
                <td className="px-4 py-2 font-semibold text-center">
                  {d.status === "Sudah" ? (
                    <span className="text-green-600">Sudah</span>
                  ) : d.status === "On Progress" ? (
                    <span className="text-blue-600">On Progress</span>
                  ) : (
                    <span className="text-yellow-600">Belum</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    
{/* === Pagination Bawah === */}
{filteredStatusPlanData.length > rowsPerPageStatus && (
  <EllipsisPagination
    currentPage={currentPageStatus}
    totalRows={filteredStatusPlanData.length}
    rowsPerPage={rowsPerPageStatus}
    onPageChange={setCurrentPageStatus}
  />
)}
  </div>
  </div>
  </div>
)}

</div>
)}