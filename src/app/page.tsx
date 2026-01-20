"use client";

import React, { useState, useEffect, useRef, useCallback} from "react";
import { supabase } from "../lib/supabaseClient"
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { highlightText } from "@/lib/highlightText";
import toast from "react-hot-toast";
import PICTabsPage from "@/components/PICTabsPage";
import MasterLanding from "@/components/MasterLanding";


import Pagination from "@/components/Pagination";
import { Clock, Pencil, Trash2} from "lucide-react";
import { Loader2 } from "lucide-react";
import KelolaPIC from "@/components/KelolaPIC";
import KelolaCabang from "@/components/KelolaCabang";
import EllipsisPagination from "@/components/EllipsisPagination";

import AdminOnly from "@/components/AdminOnly";
import KelolaModern from "@/components/KelolaModern";
import KelolaUser from "@/components/KelolaUser";


import { Check, X,  } from "lucide-react";
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
  MapPin,
  Globe,
  Warehouse,
  Store,
  Boxes,
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

type AuditStatus = "Belum" | "On Progress" | "Sudah" | "Cancel";

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
  notes?: string; // 🆕 frontend-only
  status:  AuditStatus;
  created_at?: string | null;
  edited_at?: string | null;
  file_url?: string | null;
  approvals_status?: ApprovalStep[];
  report_name?: string | null;
  report_description?: string | null;
  uploaded_by?: string | null;
  no_laporan?: string | null;
  jenisData?: "visit" | "non-visit" | "rekon" | "";
  company?: string;
  anakCabang?: string; 
  approved_by?: string[]; // ✅ tambahkan ini
  customPic?: string;
    is_checked?: boolean;
      checklist_1?: boolean;
  checklist_1_by?: string;

  checklist_2?: boolean;
  checklist_2_by?: string;

  checklist_3?: boolean;
  checklist_3_by?: string;
};

type Cabang = {
  id: number;
  name: string;
  parent_id: number | null;
  children?: Cabang[];
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

const monthShortMap: Record<string, string> = {
  JANUARI: "Jan",
  FEBRUARI: "Feb",
  MARET: "Mar",
  APRIL: "Apr",
  MEI: "Mei",
  JUNI: "Jun",
  JULI: "Jul",
  AGUSTUS: "Agu",
  SEPTEMBER: "Sep",
  OKTOBER: "Okt",
  NOVEMBER: "Nov",
  DESEMBER: "Des",
};


const kategoriHeaders = [
  { key: "jabodetabek", label: "Jabodetabek" },
  { key: "luarJabodetabek", label: "Luar Jabo" },
  { key: "cabang", label: "Cabang" },
  { key: "warehouse", label: "Warehouse" },
  { key: "tradisional", label: "Tradisional" },
  { key: "modern", label: "Modern" },
  { key: "whz", label: "WH-Z" },
];

const AREA_CHANNEL_GROUPS = {
  cabang: ["cabang", "anakCabang"],
  modern: ["modern"],
  jabodetabek: ["jabodetabek"],
  luarJabodetabek: ["luarJabodetabek"],
  tradisional: ["tradisional"],
  warehouse: ["warehouse"],
  whz: ["whz"],
};




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

interface UpdatePlanItem {
  id?: number | string;
  no_laporan?: number | string;
  // tambahkan field lain yang dipakai
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

function formatToDDMMYYYY(date: Date | string | null): string {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatToDDMMYYYYDisplay(value?: string | null): string {
  if (!value) return "-";

  // ===== RANGE =====
  if (value.includes(" - ")) {
    const [a, b] = value.split(" - ");
    return `${formatToDDMMYYYYDisplay(a.trim())} - ${formatToDDMMYYYYDisplay(
      b.trim()
    )}`;
  }

  // ===== EXCEL SERIAL NUMBER =====
  if (/^\d{5}$/.test(value)) {
    const serial = Number(value);
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + serial * 86400000);
    return date.toLocaleDateString("id-ID");
  }

  // ===== yyyy-mm-dd =====
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  }

  // ===== dd-mm-yyyy =====
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [d, m, y] = value.split("-");
    return `${d}/${m}/${y}`;
  }

  // ===== dd/mm/yyyy (SUDAH BENAR) =====
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }

  return value;
}




function formatDateDisplay(value: string): string {
  if (!value) return "-";

  const bulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];

  const normalize = (date: string) => {
    // yyyy/mm/dd → yyyy-mm-dd
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
      return date.replaceAll("/", "-");
    }
    return date;
  };

  const formatISO = (iso: string) => {
    iso = normalize(iso);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;

    const [y, m, d] = iso.split("-");
    return `${Number(d)} ${bulan[Number(m) - 1]} ${y}`;
  };

  // RANGE
  if (value.includes(" - ")) {
    const [a, b] = value.split(" - ");
    return `${formatISO(a.trim())} - ${formatISO(b.trim())}`;
  }

  // SINGLE
  return formatISO(value.trim());
}



type SplitRealisasiResult = {
  awal: string;
  akhir: string;
};

const monthMap: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

const toISODate = (str: string) => {
  if (!str) return "";

  // sudah ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // dd/mm/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split("/");
    return `${y}-${m}-${d}`;
  }

  // dd Mon yyyy (01 Jan 2026)
  const match = str.match(/^(\d{2})\s([A-Za-z]{3})\s(\d{4})$/);
  if (match) {
    const [, d, mon, y] = match;
    return `${y}-${monthMap[mon]}-${d}`;
  }

  return "";
};

function splitRealisasi(value?: string) {
  if (!value) return { awal: "", akhir: "" };

  const parts = value.split(" - ");

  if (parts.length === 2) {
    return {
      awal: toISODate(parts[0].trim()),
      akhir: toISODate(parts[1].trim()),
    };
  }

  return {
    awal: toISODate(value.trim()),
    akhir: "",
  };
}



async function generateNoLaporanRekon(
  tahun: string,
  bulan: string
) {
  // ===============================
  //     VALIDASI TAHUN
  // ===============================
  if (!tahun || tahun.length !== 4) {
    throw new Error("Tahun tidak valid");
  }

  const shortYear = tahun.slice(2); // 2025 → 25

  // ===============================
  //     VALIDASI BULAN
  // ===============================
  const monthIndex = monthOrder.findIndex(
    (b) => b.toLowerCase() === bulan.toLowerCase()
  );

  if (monthIndex === -1) {
    throw new Error("Bulan tidak valid");
  }

  const monthNum = String(monthIndex + 1).padStart(2, "0"); // 01–12

  // ===============================
  //     AMBIL DATA EXISTING REKON
  // ===============================
  const { data, error } = await supabase
    .from("audit_full")
    .select("no_laporan")
    // ❗ JANGAN filter jenis_data (kolom tidak ada)
    .ilike("no_laporan", `RN/${shortYear}/${monthNum}/%`);

  if (error) {
    console.error("❌ Fetch Rekon error:", error.message);
    throw error;
  }

  // ===============================
  //     HITUNG NOMOR URUT
  // ===============================
const numbers = (data || [])
  .map(d => {
    const part = d.no_laporan?.split("/")[3] || "";
    const match = part.match(/^(\d+)/); // 🔥 ambil angka depan SAJA
    return match ? Number(match[1]) : null;
  })
  .filter((n): n is number => n !== null);

const nextNumber = String(
  (numbers.length ? Math.max(...numbers) : 0) + 1
).padStart(3, "0");


  // ===============================
  //     HASIL FINAL
  // ===============================
  return `RN/${shortYear}/${monthNum}/${nextNumber}`;
}




export default function AuditApp() {
  const [activePage, setActivePage] = useState("dashboard");
  const [dataList, setDataList] = useState<AuditData[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchBulanStatusPlan, setSearchBulanStatusPlan] = useState<string>("");
  const [selectedBulanUpdatePlan, setSelectedBulanUpdatePlan] = useState(""); // Sekarang digunakan
const [reportStatusFilter, setReportStatusFilter] = useState<"all" | "uploaded" | "notUploaded">("all");


  const [searchTanggal, setSearchTanggal] = useState("");
const [statusTab, setStatusTab] =
  useState<"" | AuditStatus>("");

  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedPICDetail, setSelectedPICDetail] = useState("");
  
  const [searchCabangText, setSearchCabangText] = useState("");
  const [estimasiRange, setEstimasiRange] = useState<[Date | null, Date | null]>([
  null,
  null,
]);
  const [realisasiRange, setRealisasiRange] = useState<[Date | null, Date | null]>([
  null,
  null,
]);
  const [isUploading, setIsUploading] = useState(false);
const [isDeleting, setIsDeleting] = useState<number | null>(null);
// null = tidak ada file yang dihapus, atau fileId yang sedang dihapus

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

const [selectedYearUpdatePlan, setSelectedYearUpdatePlan] =
  useState("");


  

  const [jabodetabekOptions, setJabodetabekOptions] = useState<any[]>([]);
const [luarJaboOptions, setLuarJaboOptions] = useState<any[]>([]);
const [tradisionalOptions, setTradisionalOptions] = useState<any[]>([]);
const [warehouseOptions, setWarehouseOptions] = useState<any[]>([]);
const [serviceCenterOptions, setServiceCenterOptions] = useState<any[]>([]);
const [selectedMonthUpdatePlan, setSelectedMonthUpdatePlan] = useState("");

  
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
  
  // kategori
  const [selectedKategori, setSelectedKategori] = useState<"jabodetabek" | "luarJabodetabek" | "cabang" | "warehouse" | "tradisional" | "modern" | "whz" | "">("");
  const [selectedSubKategori, setSelectedSubKategori] = useState("");
  const [periodeType, setPeriodeType] = useState<"tahun" | "bulan">("tahun");
  const [selectedKategoriMonth, setSelectedKategoriMonth] = useState<string>("JANUARI");
  const [clickedBulan, setClickedBulan] = useState<string | null>(null);
  const [selectedYearStatusPlan, setSelectedYearStatusPlan] = useState("");


const monthOptions = [
  { label: "Januari", value: "01" },
  { label: "Februari", value: "02" },
  { label: "Maret", value: "03" },
  { label: "April", value: "04" },
  { label: "Mei", value: "05" },
  { label: "Juni", value: "06" },
  { label: "Juli", value: "07" },
  { label: "Agustus", value: "08" },
  { label: "September", value: "09" },
  { label: "Oktober", value: "10" },
  { label: "November", value: "11" },
  { label: "Desember", value: "12" },
];



const [filterTanggalRange, setFilterTanggalRange] =
  useState<[Date | null, Date | null]>([null, null]);

const [filterTanggalAwal, setFilterTanggalAwal] = useState<Date | null>(null);
const [filterTanggalAkhir, setFilterTanggalAkhir] = useState<Date | null>(null);

const parseTanggalToDate = (val?: string | null) => {
  if (!val) return null;

  // ambil tanggal pertama kalau range "01-05/02/2026"
  const first = val.split(" - ")[0].trim();

  // dd/mm/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(first)) {
    const [d, m, y] = first.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(first)) {
    return new Date(first);
  }

  return null;
};
const parseTanggalRange = (val?: string | null) => {
  if (!val) return null;

  val = val.trim();

  // 🔥 FORMAT: 18 - 21/02/2025
  if (/^\d{1,2}\s*-\s*\d{1,2}\/\d{2}\/\d{4}$/.test(val)) {
    const [startDay, rest] = val.split("-");
    const [endDay, month, year] = rest.trim().split("/");

    const start = new Date(
      Number(year),
      Number(month) - 1,
      Number(startDay.trim())
    );

    const end = new Date(
      Number(year),
      Number(month) - 1,
      Number(endDay)
    );

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // 🔹 FORMAT: dd/MM/yyyy - dd/MM/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}\s*-\s*\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const [s, e] = val.split(" - ");
    const parse = (x: string) => {
      const [d, m, y] = x.split("/");
      return new Date(Number(y), Number(m) - 1, Number(d));
    };

    const start = parse(s);
    const end = parse(e);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // 🔹 FORMAT: dd/MM/yyyy (single)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const [d, m, y] = val.split("/");
    const date = new Date(Number(y), Number(m) - 1, Number(d));

    date.setHours(0, 0, 0, 0);

    return { start: date, end: date };
  }

  return null;
};



const formatToDDMMYYYY = (date: Date | null) => {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};


  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedDashboardBulan, setSelectedDashboardBulan] = useState<string | null>(null);
  const [selectedDashboardTahun, setSelectedDashboardTahun] = useState<string>(
  new Date().getFullYear().toString()
);
  
  // filter bulan
const [filterBulanUpdatePlan, setFilterBulanUpdatePlan] = useState("");

// filter tanggal (range)
const [filterDateRange, setFilterDateRange] =
  useState<[Date | null, Date | null]>([null, null]);

const [filterStartDate, filterEndDate] = filterDateRange;

  
const parseDDMMYYYYToDate = (val?: string | null) => {
  if (!val) return null;

  const first = val.split(" - ")[0]?.trim();
  if (!first) return null;

  const match = first.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, d, m, y] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
};



  const [modernOptions, setModernOptions] = useState<{ id: number; name: string }[]>([]);
const [reportFilesMap, setReportFilesMap] =
  useState<Record<number, boolean>>({});

  const [originalNoLaporan, setOriginalNoLaporan] = useState<string | null>(null);
  const [filterNoLaporan, setFilterNoLaporan] = useState<"" | "ada" | "belum">("");
const [filterNoLaporanUpdate, setFilterNoLaporanUpdate] = useState<string>("");
const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
const [approvalMonthFilter, setApprovalMonthFilter] = useState<string>("");
  

const [notes, setNotes] = useState("");


const [isCollapsed, setIsCollapsed] = useState(false);
const router = useRouter();
const [showUserMenu, setShowUserMenu] = useState(false);
const [selectedMonthForNo, setSelectedMonthForNo] = useState<string>(""); 
const [approvalTab, setApprovalTab] = useState<"pending" | "approved">("pending");
const [cabangs, setCabangs] = useState<Cabang[]>([]);
const fetchCabangsTree = async () => {
  
  const { data } = await supabase.from("cabangs").select("*").order("id");
  if (!data) return;

  const map: Record<number, Cabang> = {};
  const root: Cabang[] = [];

  data.forEach((c) => (map[c.id] = { ...c, children: [] }));

  data.forEach((c) => {
    if (c.parent_id) map[c.parent_id]?.children?.push(map[c.id]);
    else root.push(map[c.id]);
  });

  setCabangs(root);
};

// Cabang dan Anak cabang
const [expandedCabang, setExpandedCabang] = useState<number | null>(null);
const [selectedAnakCabangDetail, setSelectedAnakCabangDetail] = useState<any>(null);
const toggleExpandCabang = (id?: number) => {
  setExpandedCabang(expandedCabang === id ? null : id ?? null);
};


const openAnakCabangModal = (anak: any) => {
  setSelectedAnakCabangDetail(anak);
};


const yearOptions = React.useMemo(() => {
  const years = dataList
    .map((d) => {
      if (d.tahun) return d.tahun.toString().trim();

      if (d.tanggal_estimasi_full) {
        const y = d.tanggal_estimasi_full.split("/")?.[2];
        return y?.trim() || null;
      }

      if (d.created_at) {
        return new Date(d.created_at).getFullYear().toString();
      }

      return null;
    })
    .filter((y): y is string => !!y && /^\d{4}$/.test(y));

  return Array.from(new Set(years)).sort(
    (a, b) => Number(b) - Number(a)
  );
}, [dataList]);


const findCabangByName = (name: string): Cabang | null => {
  const search = (list: Cabang[]): Cabang | null => {
    for (const c of list) {
      if (c.name.toLowerCase() === name.toLowerCase()) return c;
      if (c.children) {
        const found = search(c.children);
        if (found) return found;
      }
    }
    return null;
  };
  return search(cabangs); // cabangs = hasil fetch tree dari KelolaCabang
};

const getYearFromTanggal = (val?: string | null) => {
  if (!val) return null;

  // ambil tanggal pertama jika range
  const first = val.split(" - ")[0].trim();

  // dd/mm/yyyy
  const parts = first.split("/");
  if (parts.length !== 3) return null;

  const year = parts[2];
  return /^\d{4}$/.test(year) ? year : null;
};

const years = Array.from(
  { length: 20 },
  (_, i) => new Date().getFullYear() - 10 + i
);

const months = Array.from(Array(12).keys());


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

const handleBarClick = (payload: any) => {
  if (!payload || !payload.bulan) return;

  // 👉 set halaman
  setActivePage("kategoriReport");

  // 👉 set kategori dari dropdown chart
  setSelectedKategori(kategoriChart as any);

  // 👉 auto ke mode 1 bulan
  setPeriodeType("bulan");

  // 👉 set bulan dari bar yang diklik
  setSelectedKategoriMonth(payload.bulan.toUpperCase());

  // 👉 (opsional) reset sub kategori
  setSelectedSubKategori("");
};


const isAreaChannelDisabled = (
  formData: any,
  currentGroup: keyof typeof AREA_CHANNEL_GROUPS
) => {
  // 🔥 Ambil semua value kategori
  const allValues = Object.values(AREA_CHANNEL_GROUPS)
    .flat()
    .map((key) => formData[key])
    .filter((val) => {
      if (Array.isArray(val)) return val.length > 0;
      return val != null && String(val).trim() !== "";
    });

  // ✅ JIKA BELUM ADA SATUPUN YANG DIPILIH → SEMUA UNLOCK
  if (allValues.length === 0) return false;

  // 🔒 Jika SUDAH ADA pilihan, cek apakah dari group lain
  return Object.entries(AREA_CHANNEL_GROUPS).some(
    ([group, fields]) =>
      group !== currentGroup &&
      fields.some((f) => {
        const v = formData[f];
        if (Array.isArray(v)) return v.length > 0;
        return v != null && String(v).trim() !== "";
      })
  );
};






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

    // ===============================
    // 🔥 FILTER TAHUN
    // ===============================
    const tahunData =
      d.tahun || new Date().getFullYear().toString();

    if (selectedYear && tahunData !== selectedYear) {
      return acc; // ⛔ skip data beda tahun
    }

    // ===============================
    // NORMALISASI BULAN
    // ===============================
    const bulanFull = d.bulan.trim().toUpperCase();

    const bulanShort =
      monthShortMap[bulanFull] ??
      bulanFull.substring(0, 3).charAt(0).toUpperCase() +
        bulanFull.substring(1, 3).toLowerCase();

    if (!acc[bulanFull]) {
      acc[bulanFull] = {
        bulanFull,        // untuk sorting
        bulan: bulanShort, // untuk tampilan
        total: 0,
      };
    }

    // ===============================
    // 🔥 FILTER KATEGORI
    // ===============================
    if (d[kategoriChart]) {
      acc[bulanFull].total++;
    }

    return acc;
  }, {})
).sort(
  (a: any, b: any) =>
    monthOrder.findIndex((m) => m.toUpperCase() === a.bulanFull) -
    monthOrder.findIndex((m) => m.toUpperCase() === b.bulanFull)
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
  // ===============================
  // 🔥 FILTER TAHUN
  // ===============================
  const tahunData =
    d.tahun || new Date().getFullYear().toString();

  if (selectedYear && tahunData !== selectedYear) {
    return acc;
  }

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
  // ===============================
  // 🔥 FILTER TAHUN
  // ===============================
  const tahunData =
    d.tahun || new Date().getFullYear().toString();

  if (selectedYear && tahunData !== selectedYear) {
    return acc;
  }

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

useEffect(() => {
  const fetchOptions = async () => {
    const [
      jabodetabek,
      luarJabo,
      tradisional,
      warehouse,
      serviceCenter,
    ] = await Promise.all([
      supabase.from("jabodetabek").select("*").order("name"),
      supabase.from("luar_jabodetabek").select("*").order("name"),
      supabase.from("tradisional").select("*").order("name"),
      supabase.from("warehouse").select("*").order("name"),
      supabase.from("service_center").select("*").order("name"),
    ]);

    setJabodetabekOptions(jabodetabek.data || []);
    setLuarJaboOptions(luarJabo.data || []);
    setTradisionalOptions(tradisional.data || []);
    setWarehouseOptions(warehouse.data || []);
    setServiceCenterOptions(serviceCenter.data || []);
  };

  fetchOptions();
}, []);

const fetchReportFilesMap = async () => {
  const { data, error } = await supabase
    .from("report_files")
    .select("report_id");

  if (error) {
    console.error("❌ fetchReportFilesMap error:", error.message);
    return;
  }

  const map: Record<number, boolean> = {};

  data?.forEach((row) => {
    if (typeof row.report_id === "number") {
      map[row.report_id] = true;
    }
  });

  setReportFilesMap(map);
};


useEffect(() => {
  fetchReportFilesMap();
}, []);

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

    if (!error && data) {
      setCabangOptions(data as Cabang[]);
      buildCabangTree(data);
    }
  };

  const buildCabangTree = (data: Cabang[]) => {
    const map: Record<number, Cabang> = {};
    const root: Cabang[] = [];

    data.forEach((c) => (map[c.id] = { ...c, children: [] }));
    data.forEach((c) => {
      if (c.parent_id) map[c.parent_id]?.children?.push(map[c.id]);
      else root.push(map[c.id]);
    });

    setCabangs(root);
  };

  fetchCabang();

  // 🔥 REALTIME LISTENER
  const channel = supabase
    .channel("cabangs-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "cabangs" },
      () => {
        fetchCabang(); // ⬅️ AUTO REFRESH STATE
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);


useEffect(() => {
  const fetchModernOptions = async () => {
    const { data, error } = await supabase
      .from("modern")
      .select("id, name")
      .order("name");

    if (!error && data) setModernOptions(data);
  };

  fetchModernOptions();
}, []);

useEffect(() => {
  // ===== ESTIMASI =====
  if (editingData?.tanggal_estimasi_full) {
    const val = editingData.tanggal_estimasi_full;

    if (val.includes(" - ")) {
      const [a, b] = val.split(" - ");
      setEstimasiRange([
        parseDDMMYYYYToDate(a),
        parseDDMMYYYYToDate(b),
      ]);
    } else {
      setEstimasiRange([parseDDMMYYYYToDate(val), null]);
    }
  } else {
    setEstimasiRange([null, null]);
  }

  // ===== REALISASI =====
  if (editingData?.realisasi) {
    const val = editingData.realisasi;

    if (val.includes(" - ")) {
      const [a, b] = val.split(" - ");
      setRealisasiRange([
        parseDDMMYYYYToDate(a),
        parseDDMMYYYYToDate(b),
      ]);
    } else {
      setRealisasiRange([parseDDMMYYYYToDate(val), null]);
    }
  } else {
    setRealisasiRange([null, null]);
  }
}, [
  editingData?.tanggal_estimasi_full,
  editingData?.realisasi,
]);



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

    // ❌ Jangan mapping camelCase
    // Biarkan data tetap snake_case semua
    setDataList(data || []);

    toast.success("Data Update Plan SO berhasil dimuat!");
  } catch (err) {
    console.error("❌ Gagal fetch audit_full:", err);
    toast.error("Gagal memuat data Update Plan SO!");
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
const tahunTarget = selectedDashboardTahun;


const bulanTargetData = dataList.filter((d) => {
  const matchBulan =
    d.bulan?.toUpperCase() === bulanTarget.toUpperCase();

  const matchTahun =
    !tahunTarget || d.tahun === tahunTarget;

  return matchBulan && matchTahun;
});


const totalBulanTarget = bulanTargetData.length;
const sudahBulanTarget = bulanTargetData.filter((d) => d.status === "Sudah").length;
const belumBulanTarget = bulanTargetData.filter((d) => d.status === "Belum").length;


const onProgressBulanTarget = bulanTargetData.filter(
  (d) => d.status === "On Progress"
).length;

const cancelBulanTarget = bulanTargetData.filter(
  (d) => d.status === "Cancel"
).length;











// Statistik ringkas
const total = dataList.length;
const selesai = dataList.filter(d => d.status === "Sudah").length;
const belum = total - selesai;
const progress = total > 0 ? Math.round((selesai / total) * 100) : 0;

// Ranking PIC
const picCount: Record<string, number> = {};
dataList.forEach(d => (d.team || []).forEach(p => {
  picCount[p] = (picCount[p] || 0) + 1;
}));

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


const fetchData = async () => {
  const { data, error } = await supabase
    .from("audit_full")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("❌ Gagal fetch data:", error.message);
    return;
  }

  if (!data) return;

  // 🔹 Normalisasi nama kolom
  const normalized = data.map((item: any) => ({
    ...item,

    luarJabodetabek: item.luar_jabodetabek ?? "",
    anakCabang: item.anak_cabang ?? "",
    noLaporan: item.no_laporan ?? "",
    jenisData: item.jenis_data ?? "",

    tanggal_realisasi_full:
      item.tanggal_realisasi_full ??
      item.tanggal_realisasi ??
      null,
  }));

  setDataList(normalized);

  // ===============================
  // 🔥 AUTO SYNC STATUS
  // ===============================
  const todayNum = new Date().getDate();
  const currentMonthStr = new Date()
    .toLocaleString("id-ID", { month: "long" })
    .toUpperCase();

  const needUpdate = normalized.filter(
    (d) =>
      getEffectiveStatus(d, todayNum, currentMonthStr) === "On Progress" &&
      d.status !== "On Progress"
  );

  if (needUpdate.length > 0) {
    const idsToUpdate = needUpdate.map((d) => d.id);

    const { error: updateError } = await supabase
      .from("audit_full")
      .update({ status: "On Progress" })
      .in("id", idsToUpdate);

    if (!updateError) {
      setDataList((prev) =>
        prev.map((row) =>
          idsToUpdate.includes(row.id)
            ? { ...row, status: "On Progress" }
            : row
        )
      );
    }
  }
};

useEffect(() => {
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
    notes: "",
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


const handleDeleteFile = async (
  fileId: number,
  fileUrl: string,
  reportId: number
) => {
  try {
    setIsDeleting(fileId);

    // ===============================
    // 🔹 Ambil path dari URL
    // ===============================
    const path = new URL(fileUrl)
      .pathname.split("/storage/v1/object/public/report-plan/")[1];

    if (!path) return;

    // ===============================
    // 🔹 Hapus file di storage
    // ===============================
    const { error: storageError } = await supabase.storage
      .from("report-plan")
      .remove([path]);

    if (storageError) {
      toast.error("❌ Gagal hapus file di storage");
      return;
    }

    // ===============================
    // 🔹 Hapus record DB
    // ===============================
    const { error: dbError } = await supabase
      .from("report_files")
      .delete()
      .eq("id", fileId);

    if (dbError) {
      toast.error("❌ Gagal hapus record di database");
      return;
    }

    // ===============================
    // 🔹 Update state fileHistory
    // ===============================
    setFileHistory((prev) => prev.filter((f) => f.id !== fileId));

    // ===============================
    // 🔹 Update reportFilesMap (PAKAI report_id)
    // ===============================
    setReportFilesMap((prev) => {
      const stillHasFile = fileHistory.some(
        (f) => f.report_id === reportId && f.id !== fileId
      );

      return {
        ...prev,
        [reportId]: stillHasFile,
      };
    });

    toast.success("✅ File berhasil dihapus");
  } catch (err) {
    console.error(err);
    toast.error("❌ Terjadi kesalahan saat hapus file");
  } finally {
    setIsDeleting(null);
  }
};







  // Edit mode
  const [editIndex, setEditIndex] = useState<number | null>(null); // Perbaikan tipe
  const [editData, setEditData] = useState<AuditData | null>(null); // Perbaikan tipe


const [fileHistory, setFileHistory] = useState<any[]>([]);



const fetchFiles = async (reportId: number) => {
  const { data, error } = await supabase
    .from("report_files")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Fetch files error:", error.message);
    return;
  }

  setFileHistory(data || []);
};





useEffect(() => {
  if (!selectedApproval?.id) return;
  fetchFiles(selectedApproval.id);
}, [selectedApproval?.id]);



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
 
// 🔥 Counter lokal supaya multi submit aman
const noCounterMap: Record<string, number> = {};



const validateForm = (form: any) => {
  const errors: string[] = [];

  if (form.pic.length === 0 && !form.customPic)
    errors.push("PIC");

  if (!form.tahun || form.tahun.length !== 4)
    errors.push("Tahun");

  if (!form.bulan)
    errors.push("Bulan");

  if (!form.tanggalAwal && !form.tanggalAkhir)
    errors.push("Periode Tanggal");

  // wajib pilih SALAH SATU kategori
  const hasKategori = [
    form.cabang,
    form.jabodetabek,
    form.luarJabodetabek,
    form.modern,
    form.tradisional,
    form.warehouse,
    form.whz,
  ].some((v) => v && String(v).trim() !== "");

  if (!hasKategori)
    errors.push("Kategori Area / Channel");

  if (!form.jenisData)
    errors.push("Jenis Data");

  return errors;
};

const hasAtLeastOneKategori = (form: any) => {
  const kategoriFields = [
    form.cabang,
    form.anakCabang,
    form.jabodetabek,
    form.luarJabodetabek,
    form.modern,
    form.tradisional,
    form.warehouse,
    form.whz,
  ];

  return kategoriFields.some(
    (v) => v != null && String(v).trim() !== ""
  );
};

const handleSubmitAll = async (e: React.FormEvent) => {
  e.preventDefault();

  // ===============================
  // 🔍 VALIDASI 1 FORM
  // ===============================
  const validateForm = (form: any) => {
    const errors: string[] = [];

    if (form.pic.length === 0 && !form.customPic && form.team.length === 0)
      errors.push("PIC");

    if (!form.tahun || form.tahun.length !== 4)
      errors.push("Tahun");

    if (!form.bulan)
      errors.push("Bulan");

    if (!form.tanggalAwal && !form.tanggalAkhir)
      errors.push("Periode Tanggal");

    // 🔥 Wajib salah satu kategori
    if (!hasAtLeastOneKategori(form))
      errors.push("Kategori Area / Channel");

    if (!form.jenisData)
      errors.push("Jenis Data");

    return errors;
  };

  // ===============================
  // 🚫 VALIDASI SEMUA FORM (STOP TOTAL)
  // ===============================
  for (let i = 0; i < formList.length; i++) {
    const errors = validateForm(formList[i]);

    if (errors.length > 0) {
      toast.error(
        `Form #${i + 1} belum lengkap: ${errors.join(", ")}`
      );

      setTimeout(() => {
        const el = document.querySelectorAll("details")[i];
        el?.setAttribute("open", "true");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

      return; // ⛔ STOP TOTAL
    }
  }

  const loadingToast = toast.loading("⏳ Menyimpan semua data...");

  try {
    for (const form of formList) {
  const tahun = form.tahun ?? "";

  if (tahun.length !== 4) {
    toast.error("Tahun tidak valid!");
    return;
  }

  const yearShort = tahun.slice(2);

      const monthIndex = monthOrder.findIndex(
        (b) => b.toLowerCase() === form.bulan.toLowerCase()
      );

      if (monthIndex === -1) {
        toast.error("Bulan tidak valid!");
        return;
      }

      const monthNum = String(monthIndex + 1).padStart(2, "0");

      // ===============================
      // 🔢 GENERATE NO LAPORAN
      // ===============================
      const prefix =
        form.jenisData === "rekon"
          ? "RN"
          : form.jenisData === "visit"
          ? "SOV"
          : "SONV";

      const counterKey = `${prefix}-${yearShort}-${monthNum}`;

      if (!noCounterMap[counterKey]) {
        const { data, error } = await supabase
          .from("audit_full")
          .select("id", { count: "exact" })
          .ilike("no_laporan", `${prefix}/${yearShort}/${monthNum}/%`);

        if (error) {
          toast.error("Gagal generate nomor laporan");
          return;
        }

        noCounterMap[counterKey] = data?.length ?? 0;
      }

      noCounterMap[counterKey] += 1;
      const next = String(noCounterMap[counterKey]).padStart(3, "0");
      const noLaporan = `${prefix}/${yearShort}/${monthNum}/${next}`;

      // ===============================
      // 📅 FORMAT TANGGAL ESTIMASI
      // ===============================
      let tanggalEstimasiFull: string | null = null;

      if (form.tanggalAwal || form.tanggalAkhir) {
        const dayStart = form.tanggalAwal
          ? String(form.tanggalAwal).padStart(2, "0")
          : "";
        const dayEnd = form.tanggalAkhir
          ? String(form.tanggalAkhir).padStart(2, "0")
          : "";

        if (dayStart && dayEnd)
          tanggalEstimasiFull = `${dayStart} - ${dayEnd}/${monthNum}/${form.tahun}`;
        else if (dayStart)
          tanggalEstimasiFull = `${dayStart}/${monthNum}/${form.tahun}`;
        else if (dayEnd)
          tanggalEstimasiFull = `${dayEnd}/${monthNum}/${form.tahun}`;
      }

      // ===============================
      // 👤 FINAL PIC (ANTI DUPLIKAT)
      // ===============================
const finalPIC = Array.from(
  new Set([
    ...form.pic,
    ...(form.customPic
      ? form.customPic.split(",").map(x => x.trim()).filter(Boolean)
      : []),
  ])
);

const finalTeam = Array.from(
  new Set(form.team)
);

      // ===============================
      // 📦 PAYLOAD
      // ===============================
      const payload = {
        no_laporan: noLaporan,
        pic: finalPIC,
        team: finalTeam,

        bulan: form.bulan.toUpperCase(),
        minggu: form.minggu,
        tanggal_estimasi_full: tanggalEstimasiFull,
        tahun: form.tahun,

        jabodetabek: form.jabodetabek,
        luar_jabodetabek: form.luarJabodetabek,

        cabang: form.cabang,
        anak_cabang: form.anakCabang?.trim() || null,

        warehouse: form.warehouse,
        tradisional: form.tradisional,
        modern: form.modern,
        whz: form.whz,

        description: form.notes,
        status: "Belum",
        company: form.company,
        jenisData: form.jenisData,
        created_at: new Date().toISOString(),
      };

      // ===============================
      // 🧾 INSERT DB
      // ===============================
      const { data, error } = await supabase
        .from("audit_full")
        .insert([payload])
        .select();

      if (error) {
        console.error("❌ Insert error:", error.message);
        toast.error("Gagal menyimpan salah satu data!");
        return;
      }

      const raw = data?.[0];
      if (!raw) continue;

      // ===============================
      // 🧠 NORMALISASI UI
      // ===============================
      setDataList((prev) => [
        {
          ...raw,
          luarJabodetabek: raw.luar_jabodetabek ?? "",
          anakCabang: raw.anak_cabang ?? "",
          jenisData: raw.jenis_data ?? raw.jenisData ?? "",
        },
        ...prev,
      ]);
    }

    toast.success("✅ Semua data berhasil disimpan!", { id: loadingToast });

    // ===============================
    // 🔄 RESET FORM
    // ===============================
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
        anakCabang: "",
        warehouse: "",
        tradisional: "",
        modern: "",
        whz: "",
        company: "",
        jenisData: "",
        status: "Belum",
        notes: "",
      },
    ]);
  } catch (err) {
    console.error("❌ Fatal submit error:", err);
    toast.error("Gagal menyimpan data!", { id: loadingToast });
  } finally {
    toast.dismiss(loadingToast);
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

function getEffectiveStatus(
  d: AuditData,
  todayNum: number,
  currentMonthStr: string
): AuditStatus {
  if (d.status === "Cancel") return "Cancel";
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
}

const parseDate = (str: string): Date | null => {
  const parts = str.split("/");

  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(n => parseInt(n, 10));

  if (!day || !month || !year) return null;

  return new Date(year, month - 1, day);
};

// hitung hari dari estimasi → realisasi
const getDurasiEstimasiKeRealisasi = (
  estimasi?: string | null,
  realisasi?: string | null
) => {
  if (!estimasi || !realisasi) return null;

  // ===== ESTIMASI: ambil tanggal AWAL =====
  const estimasiAwal = estimasi.includes(" - ")
    ? estimasi.split(" - ")[0].trim()
    : estimasi.trim();

  // ===== REALISASI: ambil tanggal AKHIR =====
  const realisasiAkhir = realisasi.includes(" - ")
    ? realisasi.split(" - ")[1].trim()
    : realisasi.trim();

  const startDate = parseDDMMYYYYToDate(estimasiAwal);
  const endDate = parseDDMMYYYYToDate(realisasiAkhir);

  if (!startDate || !endDate) return null;

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays + 1; // inklusif
};

const parseDDMMYYYY = (val?: string | null): Date | null => {
  if (!val) return null;

  const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, d, m, y] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
};



const getRealisasiRangeDays = (fullDate?: string | null) => {
  if (!fullDate) return null;

  const clean = fullDate.trim();

  // ===== SINGLE DATE =====
  if (!clean.includes(" - ")) {
    const d = parseDDMMYYYY(clean);
    return d ? 1 : null;
  }

  // ===== RANGE DATE =====
  const [startStr, endStr] = clean.split(" - ").map(s => s.trim());

  const startDate = parseDDMMYYYY(startStr);
  const endDate = parseDDMMYYYY(endStr);

  if (!startDate || !endDate) return null;

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

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

  // ===============================
  // 🔹 STATUS LOGIC (TETAP)
  // ===============================
// ===============================
// 🔹 STATUS LOGIC (SUPPORT CANCEL)
// ===============================
if (statusTab === "Cancel") {
  // ⛔ Cancel = FINAL (DB only)
  matchStatus = d.status === "Cancel";

} else if (statusTab === "On Progress") {
  matchStatus =
    d.status === "On Progress" ||
    (
      d.status !== "Cancel" && // ⛔ jangan auto untuk Cancel
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

} else {
  // Semua
  matchStatus = true;
}

  // ===============================
  // 🔹 FILTER TAHUN (BARU)
  // ===============================
  const tahunData =
    d.tahun ||
    d.tanggal?.split("/")?.[2] ||
    (d.created_at
      ? new Date(d.created_at).getFullYear().toString()
      : "");

  const matchYear =
    !selectedYearStatusPlan || tahunData === selectedYearStatusPlan;

  // ===============================
  // 🔹 FILTER PIC
  // ===============================
  const matchPic =
    !searchPicStatusPlan ||
    (Array.isArray(d.pic)
      ? (d.pic as string[]).some((p) =>
          p.toLowerCase().includes(searchPicStatusPlan.toLowerCase())
        )
      : (d.pic as string | undefined)?.toLowerCase().includes(
          searchPicStatusPlan.toLowerCase()
        ));

  // ===============================
  // 🔹 FILTER BULAN
  // ===============================
  const matchBulan =
    !searchBulanStatusPlan ||
    d.bulan?.toLowerCase() === searchBulanStatusPlan.toLowerCase();

  // ===============================
  // 🔹 FILTER SEARCH TEXT
  // ===============================
  const searchText = searchTextStatusPlan.toLowerCase();
  const matchText =
    !searchText ||
    Object.values(d).some((val) =>
      String(val ?? "").toLowerCase().includes(searchText)
    );

  // ===============================
  // 🔹 FINAL
  // ===============================
  return matchStatus && matchYear && matchPic && matchBulan && matchText;
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

  if (statusEfektif === "Sudah") {
    totalSudah++;
  } else if (statusEfektif === "On Progress") {
    totalOnProgress++;
  } else if (statusEfektif === "Cancel") {
    // ⛔ Cancel tidak dihitung ke progress
    // bisa kosong, atau increment counter khusus
  } else {
    totalBelum++;
  }
});


// 🔹 Persentase (biar 100%)
const percentSudah = totalData ? Math.round((totalSudah / totalData) * 100) : 0;
const percentOnProgress = totalData ? Math.round((totalOnProgress / totalData) * 100) : 0;
const percentBelum = totalData
  ? Math.max(0, 100 - (percentSudah + percentOnProgress))
: 0;


const groupedByBulanKategori = dataList.reduce((acc: any, d: AuditData) => {
  if (!d.bulan) return acc;

  // 🔑 ambil tahun valid
  const tahun =
    d.tahun ||
    d.tanggal_estimasi_full?.split("/")?.[2] ||
    (d.created_at
      ? new Date(d.created_at).getFullYear().toString()
      : "");

  if (!tahun) return acc;

  const bulanKey = d.bulan.toUpperCase();
  const key = `${tahun}-${bulanKey}`; // 🔥 KOMBINASI

  if (!acc[key]) {
    acc[key] = {
      tahun,
      bulan: bulanKey,
      jabodetabek: 0,
      luarJabodetabek: 0,
      cabang: 0,
      warehouse: 0,
      modern: 0,
      tradisional: 0,
    };
  }

  if (d.jabodetabek) acc[key].jabodetabek++;
  if (d.luarJabodetabek) acc[key].luarJabodetabek++;
  if (d.cabang) acc[key].cabang++;
  if (d.warehouse) acc[key].warehouse++;
  if (d.modern) acc[key].modern++;
  if (d.tradisional) acc[key].tradisional++;

  return acc;
}, {});


const barChartData = Object.values(groupedByBulanKategori)
  .filter((d: any) =>
    selectedYear ? d.tahun === selectedYear : true
  )
  .sort(
    (a: any, b: any) =>
      monthOrder.indexOf(a.bulan) -
      monthOrder.indexOf(b.bulan)
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


async function renumberNoLaporan(
  prefix: "RN" | "SOV" | "SONV",
  yearShort: string,
  monthNum: string
) {
  const { data, error } = await supabase
    .from("audit_full")
    .select("id, no_laporan")
    .ilike("no_laporan", `${prefix}/${yearShort}/${monthNum}/%`)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Renumber error:", error.message);
    return;
  }

  if (!data || data.length === 0) return;

  for (let i = 0; i < data.length; i++) {
    const oldNo = data[i].no_laporan!;
    const newNo = `${prefix}/${yearShort}/${monthNum}/${String(i + 1).padStart(3, "0")}`;

    // 🔹 Update audit_full
    await supabase
      .from("audit_full")
      .update({ no_laporan: newNo })
      .eq("id", data[i].id);

    // 🔹 Update report_files agar file tetap terhubung
    await supabase
      .from("report_files")
      .update({ no_laporan: newNo })
      .eq("no_laporan", oldNo);
  }
}






const selectedMonth = selectedDashboardBulan || currentMonth;





const handleSaveEditModal = useCallback(async (data: any) => {
  if (!data) return;

  const loading = toast.loading("⏳ Menyimpan perubahan...");

  const oldData = dataList.find((d) => d.id === data.id);
  if (!oldData) {
    toast.dismiss(loading);
    return;
  }

  // ============================
  // Helper Format Tanggal
  // ============================

const { awal: parsedAwal, akhir: parsedAkhir } =
  splitRealisasi(data.realisasi);




  // ============================
  // Format Estimasi
  // ============================
const finalEstimasiDB =
  data.tanggalAwal && data.tanggalAkhir
    ? `${data.tanggalAwal} - ${data.tanggalAkhir}`
    : data.tanggalAwal || oldData.tanggal_estimasi_full || "";

const finalEstimasiUI = finalEstimasiDB;


  // ============================
  // Format Realisasi
  // ============================
const finalRealisasiDB =
  parsedAwal && parsedAkhir
    ? `${parsedAwal} - ${parsedAkhir}`
    : parsedAwal || oldData.tanggal_realisasi_full || "";

const finalRealisasiUI = finalRealisasiDB;



  // ============================
  // PIC & TEAM
  // ============================
  // PIC
const finalPic = [
  ...(Array.isArray(data.pic) ? data.pic : oldData.pic || []),
  ...(data.customPic
    ? data.customPic.split(",").map((x: string) => x.trim())
    : []),
].filter(Boolean);

// TEAM (AMBIL DARI MODAL)
const finalTeam = Array.isArray(data.team)
  ? data.team
  : oldData.team || [];


// ============================
// NO LAPORAN (ANGKA TETAP, HURUF BOLEH)
// ============================
const newNoLaporan = (data.no_laporan || "").trim();

if (newNoLaporan) {
  const duplicate = dataList.find(
    (d) =>
      d.id !== data.id &&
      d.no_laporan?.toUpperCase() === newNoLaporan.toUpperCase()
  );

  if (duplicate) {
    toast.error("❌ No Laporan sudah digunakan!");
    toast.dismiss(loading);
    return;
  }
}


  // ============================
  // Build Data untuk DB
  // ============================
  const updatedDataForDB = {
    minggu: data.minggu ?? oldData.minggu,

    tanggal_estimasi: finalEstimasiDB,
    tanggal_estimasi_full: finalEstimasiDB,

    tanggal_realisasi: finalRealisasiDB,
    tanggal_realisasi_full: finalRealisasiDB,

    pic: finalPic,
  team: finalTeam,

    jabodetabek: data.jabodetabek ?? oldData.jabodetabek,
    luar_jabodetabek: data.luarJabodetabek ?? oldData.luarJabodetabek,
    cabang: data.cabang ?? oldData.cabang,
  anak_cabang: data.anakCabang ?? oldData.anakCabang ?? "",

    warehouse: data.warehouse ?? oldData.warehouse,
    tradisional: data.tradisional ?? oldData.tradisional,
    modern: data.modern ?? oldData.modern,
    whz: data.whz ?? oldData.whz,
    description: data.description ?? oldData.description,
    status: data.status ?? oldData.status,
    company: data.company ?? oldData.company,
   no_laporan: data.no_laporan ?? oldData.no_laporan,
    edited_at: new Date().toISOString(),
  };

  // ============================
  // SIMPAN DATABASE
  // ============================
  try {
    await supabase.from("audit_full").update(updatedDataForDB).eq("id", data.id);

    // Update UI
setDataList((prev) =>
  prev.map((d) =>
    d.id === data.id
      ? {
          ...d,
          ...updatedDataForDB,
          no_laporan: updatedDataForDB.no_laporan,
          tanggal: finalEstimasiUI || d.tanggal || "",
          realisasi: finalRealisasiUI || d.realisasi || "",

          anakCabang: data.anakCabang ?? d.anakCabang ?? "",
        }
      : d
  )
);


    toast.success("Perubahan berhasil disimpan!", {
      id: loading,
      duration: 2000,
    });
  } catch (err) {
    console.error(err);
    toast.error("Gagal menyimpan perubahan!", {
      id: loading,
      duration: 2000,
    });
  }
}, [dataList]);





// Toggle Status langsung
const handleToggleStatus = async (
  id: number,
  newStatus: AuditStatus
) => {
  const { error } = await supabase
    .from("audit_full")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    console.error("Gagal update:", error.message);
    toast.error("Update status gagal!");
  } else {
    setDataList((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: newStatus } : d
      )
    );
    toast.success(`Status berhasil diubah menjadi ${newStatus}`);
  }
};





const exportToExcel = () => {
  const filteredData = filteredAndSortedUpdatePlanData;

  if (filteredData.length === 0) {
    toast.error("Tidak ada data untuk diexport!");
    return;
  }

  const exportData = filteredData.map((d) => ({
    "No Laporan": d.no_laporan || "",
    "Tanggal Estimasi": d.tanggal_estimasi_full || "",
    "Realisasi": d.tanggal_realisasi_full || "",
    "Minggu": d.minggu || "",
    "PIC": Array.isArray(d.pic) ? d.pic.join(", ") : d.pic || "",
    "Team": Array.isArray(d.team) ? d.team.join(", ") : d.team || "",
    "Perusahaan": d.company || "",
    "Jabodetabek": d.jabodetabek || "",
    "Luar Jabodetabek": d.luarJabodetabek || "",
    "Cabang": d.cabang || "",
    "Anak Cabang": Array.isArray(d.anakCabang)
      ? d.anakCabang.join(", ")
      : d.anakCabang || "",
    "Warehouse": d.warehouse || "",
    "Traditional": d.tradisional || "",
    "Modern": d.modern || "",
    "WH-Z": d.whz || "",
    "Status": d.status || "Belum",
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









const filteredAndSortedUpdatePlanData = dataList
  .filter((d) => {
    try {
      const todayNum = new Date().getDate();
      const currentMonth = new Date()
        .toLocaleString("id-ID", { month: "long" })
        .toUpperCase();

      // ===============================
      // ➕ FILTER TAHUN (FIX 2026)
      // ===============================
    const dataYear =
  getYearFromTanggal(d.tanggal_estimasi_full) ||
  getYearFromTanggal(d.tanggal_realisasi_full) ||
  d.tahun?.toString() ||
  null;


const matchTahun =
  !selectedYearUpdatePlan ||
  dataYear === selectedYearUpdatePlan;


      // ===============================
      // 📅 AMBIL BULAN
      // ===============================
      let monthFromEstimasiFull = getMonthFromTanggalEstimasi(
        d.tanggal_estimasi_full
      );

      if (!monthFromEstimasiFull) {
        monthFromEstimasiFull = normalizeMonthInput(
          (d as any).estimasi || d.bulan || ""
        );
      }

      // ===============================
      // 🔄 AUTO ON PROGRESS
      // ===============================
      const isAutoOnProgress =
        monthFromEstimasiFull === currentMonth &&
        !!d.tanggal &&
        isTodayInRange(d.tanggal, todayNum);

      // ===============================
      // 🚦 STATUS TAB
      // ===============================
const matchStatus =
  !statusTab
    ? true
    : statusTab === "Cancel"
    ? d.status === "Cancel"
    : statusTab === "Belum"
    ? d.status === "Belum"
    : statusTab === "On Progress"
    ? d.status === "On Progress" || isAutoOnProgress
    : statusTab === "Sudah"
    ? d.status === "Sudah"
    : true;


      // ===============================
      // 📆 FILTER BULAN
      // ===============================
      const normSelectedBulan = normalizeMonthInput(
        selectedMonthUpdatePlan

      );
      const matchBulan = normSelectedBulan
        ? monthFromEstimasiFull === normSelectedBulan
        : true;

      // ===============================
      // 👤 PIC
      // ===============================
      const matchPic = searchPicUpdatePlan
        ? Array.isArray(d.pic)
          ? d.pic.some((p: string) =>
              p
                .toLowerCase()
                .includes(searchPicUpdatePlan.toLowerCase())
            )
          : String(d.pic ?? "")
              .toLowerCase()
              .includes(searchPicUpdatePlan.toLowerCase())
        : true;

      // ===============================
      // 🗓️ TANGGAL
      // ===============================
      const matchTanggal = searchTanggal
        ? (d.tanggal ?? "")
            .toLowerCase()
            .includes(searchTanggal.toLowerCase())
        : true;


const matchReportStatus = (() => {
  if (d.id == null) return false; // ⛔ tidak valid

  const hasFile = reportFilesMap[d.id] === true;

  if (reportStatusFilter === "uploaded") return hasFile;
  if (reportStatusFilter === "notUploaded") return !hasFile;
  return true;
})();



        // ===============================
// 🗓️ FILTER TANGGAL (DATE PICKER)
// ===============================
const tanggalData =
  parseTanggalToDate(d.tanggal_estimasi_full) ||
  parseTanggalToDate(d.tanggal_realisasi_full) ||
  parseTanggalToDate(d.tanggal);

const matchTanggalRange =
  filterTanggalAwal || filterTanggalAkhir
    ? (() => {
        if (!tanggalData) return false;
        if (filterTanggalAwal && tanggalData < filterTanggalAwal)
          return false;
        if (filterTanggalAkhir && tanggalData > filterTanggalAkhir)
          return false;
        return true;
      })()
    : true;

      // ===============================
      // 🔎 TEXT SEARCH
      // ===============================
      const matchText = searchText
        ? Object.values(d).some((val) =>
            String(val ?? "")
              .toLowerCase()
              .includes(searchText.toLowerCase())
          )
        : true;

      // ===============================
      // 🗂️ KATEGORI + SUB
      // ===============================
      const matchKategori = selectedKategoriUpdatePlan
        ? (() => {
            const value = String(
              (d as any)[selectedKategoriUpdatePlan] ?? ""
            )
              .toLowerCase()
              .trim();

            if (!selectedSubKategori) return value !== "";
            return (
              value ===
              selectedSubKategori.toLowerCase().trim()
            );
          })()
        : true;

      // ===============================
      // 🧾 NO LAPORAN
      // ===============================
      const matchNoLaporanUpdate =
        !filterNoLaporanUpdate ||
        (d.no_laporan ?? "")
          .toLowerCase()
          .includes(filterNoLaporanUpdate.toLowerCase());

      return (
        matchTahun && // 🔥 FIX UTAMA 2026
        matchStatus &&
        matchBulan &&
         matchTanggalRange && // 
        matchPic &&
        matchTanggal &&
        matchText &&
        matchKategori &&
        matchNoLaporanUpdate &&
        matchReportStatus
      );
    } catch (err) {
      console.error("❌ Filter error:", d, err);
      return false;
    }
  })
  .sort((a, b) => {
    const parseDateSafe = (val?: string | null) => {
      if (!val) return null;
      const parts = val.split("/");
      if (parts.length < 3) return null;

      const dayPart = parts[0].includes("-")
        ? parts[0].split("-")[0]
        : parts[0];

      const d = Number(dayPart);
      const m = Number(parts[1]) - 1;
      const y = Number(parts[2]);

      if (!y || isNaN(m) || isNaN(d)) return null;
      return new Date(y, m, d);
    };

    const da =
      parseDateSafe(a.tanggal_estimasi_full) ||
      parseDateSafe(a.tanggal) ||
      new Date(0);

    const db =
      parseDateSafe(b.tanggal_estimasi_full) ||
      parseDateSafe(b.tanggal) ||
      new Date(0);

    return da.getTime() - db.getTime();
  });




// ION (tetap sama)
const paginatedUpdatePlanData = filteredAndSortedUpdatePlanData.slice(
  (currentPageUpdate - 1) * rowsPerPageUpdate,
  currentPageUpdate * rowsPerPageUpdate
);

const groupedByCabang = dataList
  .filter(d => d.tahun === selectedYearUpdatePlan) // ➕ WAJIB
  .reduce((acc, d) => {
    if (!d.cabang || d.cabang.trim() === "") return acc;

    const bulanKey = d.bulan ? d.bulan.toUpperCase() : "";
    acc[bulanKey] ??= {};
    acc[bulanKey][d.cabang] ??= {};

    if (Array.isArray(d.pic)) {
      d.pic.forEach((pic) => {
        if (!pic) return;
        acc[bulanKey][d.cabang][pic] ??= [];
        if (d.tanggal) acc[bulanKey][d.cabang][pic].push(d.tanggal);
      });
    }
    return acc;
  }, {} as Record<string, Record<string, Record<string, string[]>>>);


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


 const groupedByPic = dataList
  .filter(d => d.tahun === selectedYearUpdatePlan) // ➕ WAJIB
  .reduce((acc, d) => {
    if (!d.cabang || !Array.isArray(d.pic)) return acc;

    const bulanKey = d.bulan ? d.bulan.toUpperCase() : "";
    d.pic.forEach((pic) => {
      if (!pic) return;
      acc[pic] ??= {};
      acc[pic][bulanKey] ??= [];
      acc[pic][bulanKey].push({
        cabang: d.cabang,
        tanggal: d.tanggal,
      });
    });
    return acc;
  }, {} as Record<string, Record<string, { cabang: string; tanggal: string }[]>>);


const filteredFullData = dataList
  .filter((d) => {
    const matchTahun =
      !selectedYearUpdatePlan || d.tahun === selectedYearUpdatePlan;

    const noLaporan = (d.no_laporan ?? "").trim();
    const bulan = (d.bulan ?? "").toLowerCase();

    const matchSearch =
      !searchFull ||
      Object.values(d).some((val) =>
        String(val ?? "").toLowerCase().includes(searchFull.toLowerCase())
      );

    const matchBulan =
      !selectedBulanFull || bulan === selectedBulanFull.toLowerCase();

    const matchKategori =
      !selectedKategori ||
      (!!d[selectedKategori] && String(d[selectedKategori]).trim() !== "");

    const matchNoLaporan =
      filterNoLaporan === ""
        ? true
        : filterNoLaporan === "ada"
        ? !!noLaporan
        : !noLaporan;

    return (
      matchTahun &&      // ✅ PENTING
      matchSearch &&
      matchBulan &&
      matchKategori &&
      matchNoLaporan
    );
  })
  .sort((a, b) => {
    const monthA = getMonthNumber(a.bulan || "");
    const monthB = getMonthNumber(b.bulan || "");
    return monthA === monthB
      ? (b.id ?? 0) - (a.id ?? 0)
      : monthA - monthB;
  });




const handleDeleteUpdatePlan = async (plan: AuditData) => {
  const yakin = window.confirm(
    `⚠️ Yakin ingin menghapus data Update Plan: ${plan.no_laporan || "-"} ?`
  );
  if (!yakin) return;

  const toastId = toast.loading("⏳ Menghapus data...");

  try {
    
    const reportId = plan.id;

    // ===============================
    // 🔹 Ambil semua file BERDASARKAN report_id
    // ===============================
    const { data: files, error: fetchFilesError } = await supabase
      .from("report_files")
      .select("id, file_url")
      .eq("report_id", reportId);

    if (fetchFilesError) {
      toast.error("❌ Gagal ambil file terkait!", { id: toastId });
      return;
    }

    // ===============================
    // 🔹 Hapus file dari storage & DB
    // ===============================
    for (const f of files || []) {
      if (!f.file_url) continue;

      try {
        const path = new URL(f.file_url)
          .pathname.split("/storage/v1/object/public/report-plan/")[1];

        if (path) {
          await supabase.storage.from("report-plan").remove([path]);
        }

        await supabase.from("report_files").delete().eq("id", f.id);
      } catch (err) {
        console.warn("⚠️ Gagal hapus file:", f.file_url);
      }
    }

    // ===============================
    // 🗑️ DELETE approvals_status
    // ===============================
    await supabase
      .from("approvals_status")
      .delete()
      .eq("report_id", reportId);

    // ===============================
    // 🗑️ DELETE audit_full (PAKAI ID)
    // ===============================
    const { error } = await supabase
      .from("audit_full")
      .delete()
      .eq("id", reportId);

    if (error) {
      toast.error("❌ Gagal hapus data!", { id: toastId });
      return;
    }

    // ===============================
    // 🔢 RENUMBER no_laporan
    // ===============================
    if (plan.no_laporan) {
      const [prefix, yearShort, monthNum] = plan.no_laporan.split("/");
      await renumberNoLaporan(
        prefix as "RN" | "SOV" | "SONV",
        yearShort,
        monthNum
      );
    }

    await fetchData();

    toast.success("✅ Data & file berhasil dihapus!", { id: toastId });
  } catch (err) {
    console.error(err);
    toast.error("❌ Terjadi kesalahan!", { id: toastId });
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




const [userRole, setUserRole] = useState<string | null>(null);

useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUsername(
      data.user?.user_metadata?.username ||
      data.user?.email ||
      null
    );
  };

  getUser();
}, []);


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
// --- useEffect untuk fetch map file per report (PAKAI report_id) ---
useEffect(() => {
  const fetchReportFilesMap = async () => {
    const { data, error } = await supabase
      .from("report_files")
      .select("report_id");

    if (error) {
      console.error("❌ fetchReportFilesMap error:", error.message);
      return;
    }

    const map: Record<number, boolean> = {};

    (data || []).forEach((f) => {
      if (f.report_id != null) {
        map[f.report_id] = true; // ✅ laporan ini punya file
      }
    });

    setReportFilesMap(map);
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
      
     
  { key: "picSO", label: "PIC SO", icon: Users },
        
  {
    key: "kelolaMaster",
    label: "Kelola Master",
    icon: Settings,
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

    // ✅ NAVIGASI KE HALAMAN
    if (item.key === "picSO") {
      router.push("/pic-so");
    }
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

{activePage === "kelolaMaster" && (
  <AdminOnly>
     <MasterLanding setActivePage={setActivePage} />
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
  {(selectedDashboardBulan || currentMonth)}{" "}
  {selectedDashboardTahun || new Date().getFullYear()}
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
    setSelectedBulanPIC(bulanUpper);

    // 🔥 INI KUNCI SINKRON TAHUN
    setSelectedDashboardTahun(
      selectedYear || new Date().getFullYear().toString()
    );

    toast.success(
      `Menampilkan data ${clickedBulan} ${
        selectedYear || new Date().getFullYear()
      }`
    );
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
  setIsUploading(true);

  try {
    // ===============================
    // 🔹 VALIDASI REPORT ID
    // ===============================
    const reportId = selectedApproval?.id;

    if (!reportId) {
      toast.error("❌ Report ID tidak ditemukan");
      setIsUploading(false);
      return;
    }

    let fileUrl: string | null = null;

    // ===============================
    // 🔹 UPLOAD FILE (PAKAI report_id)
    // ===============================
    if (selectedFile) {
      const filePath = `${reportId}/${crypto.randomUUID()}-${selectedFile.name}`;

      const { data, error } = await supabase.storage
        .from("report-plan")
        .upload(filePath, selectedFile);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from("report-plan")
        .getPublicUrl(data.path);

      fileUrl = publicUrl.publicUrl;
    }

    // ===============================
    // 🔹 INSERT report_files
    // ===============================
    const { data: insertedFile, error: fileError } = await supabase
      .from("report_files")
      .insert({
        report_id: reportId,
        report_description: description,
        file_url: fileUrl,
        original_name: selectedFile?.name,
      })
      .select()
      .single();

    if (fileError) throw fileError;

    // ===============================
    // 🔹 UPDATE STATE
    // ===============================
    setReportFilesMap((prev) => ({
      ...prev,
      [reportId]: true,
    }));

    setFileHistory((prev) => [insertedFile, ...prev]);

    // ===============================
    // 🔹 UPDATE audit_full
    // ===============================
    const { error: auditError } = await supabase
      .from("audit_full")
      .update({
        description,
        file_url: fileUrl,
      })
      .eq("id", reportId);

    if (auditError) throw auditError;

    toast.success("✅ Report berhasil disimpan");
    setDescription("");
    setSelectedFile(null);
  } catch (err) {
    console.error(err);
    toast.error("❌ Gagal simpan report");
  } finally {
    setIsUploading(false);
  }
}}
      
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




       

        {/* Tombol Navigasi */}
        <div className="flex justify-between mt-6">
       
        {/* Tombol Kembali */}
    <button
      type="button"
      onClick={() => setActivePage("updatePlanSO")}
      className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200 text-gray-700"
    >
      ← Kembali ke Update Plan
    </button>
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
  className={`px-4 py-2 rounded text-white ${isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
  disabled={isUploading}
>
  {isUploading ? "Menyimpan..." : "Simpan"}
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

                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">File</th>
                <th className="px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fileHistory.map((f) => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
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
  onClick={() => handleDeleteFile(f.id, f.file_url, f.report_id)}
  className={`ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm ${
    isDeleting === f.id ? "bg-gray-400 cursor-not-allowed" : ""
  }`}
  disabled={isDeleting === f.id}
>
  {isDeleting === f.id ? "Menghapus..." : "Hapus"}
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

{/* === PILIH TEAM === */}
<div className="mb-4">
  <label className="block text-sm font-semibold text-slate-800 mb-2">
    PIC<span className="text-red-500 ml-1">*</span>
  </label>

  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200">
    {teamOptions.map((t) => (
      <label
        key={t}
        className="flex items-center gap-2 text-sm text-slate-700"
      >
        <input
          type="checkbox"
          value={t}
          checked={formData.team.includes(t)}
          onChange={(e) => {
            const updated = [...formList];
            const { value, checked } = e.target;

            let newTeams = [...formData.team];
            if (checked) {
              if (!newTeams.includes(value)) newTeams.push(value);
            } else {
              newTeams = newTeams.filter((v) => v !== value);
            }

            updated[index].team = newTeams;
            setFormList(updated);
          }}
          className="accent-blue-600 w-4 h-4"
        />
        {t}
      </label>
    ))}
  </div>
</div>


{/* === PILIH PIC === */}
<div className="mb-4">
  <label className="block text-sm font-semibold text-slate-800 mb-2">
    Team<span className="text-red-500 ml-1">*</span>
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



{/* === AREA / CHANNEL === */}
<div className="mt-6">
  <h3 className="text-sm font-semibold text-slate-800 mb-3">
    Area & Channel
  </h3>



<div className="grid grid-cols-1 md:grid-cols-3 gap-6">


{/* === Cabang & Anak Cabang === */}
<div className="md:col-span-1">
  <label className="block text-sm font-medium text-slate-700 mb-2">
    Cabang
  </label>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {/* Cabang */}
    <select
      value={formData.cabang}
      disabled={isAreaChannelDisabled(formData, "cabang")}
      onChange={(e) => {
        const updated = [...formList];
        updated[index].cabang = e.target.value;
        updated[index].anakCabang = "";
        setFormList(updated);
      }}
      className="w-full border rounded-lg px-3 py-2 disabled:bg-slate-100 disabled:cursor-not-allowed"
    >
      <option value="">Cabang</option>
      {cabangOptions
        .filter((c) => !c.parent_id)
        .map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
    </select>

    {/* Anak Cabang */}
    <select
      value={formData.anakCabang || ""}
      disabled={isAreaChannelDisabled(formData, "cabang") || !formData.cabang}
      onChange={(e) => {
        const updated = [...formList];
        updated[index].anakCabang = e.target.value;
        setFormList(updated);
      }}
      className="w-full border rounded-lg px-3 py-2 disabled:bg-slate-100 disabled:cursor-not-allowed"
    >
      <option value="">Anak Cabang</option>
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


  {/* === Modern === */}
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      Modern
    </label>
    <select
      value={formData.modern || ""}
      disabled={isAreaChannelDisabled(formData, "modern")}
      onChange={(e) => {
        const updated = [...formList];
        updated[index].modern = e.target.value;
        setFormList(updated);
      }}
      className="w-full border rounded-lg p-2 disabled:bg-slate-100"
    >
      <option value="">-- Pilih Modern --</option>
      {modernOptions.map((m) => (
        <option key={m.id} value={m.name}>
          {m.name}
        </option>
      ))}
    </select>
  </div>

  {/* === Jabodetabek === */}
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      Jabodetabek
    </label>
    <select
      value={formData.jabodetabek}
      disabled={isAreaChannelDisabled(formData, "jabodetabek")}
      onChange={(e) => {
        const updated = [...formList];
        updated[index].jabodetabek = e.target.value;
        setFormList(updated);
      }}
      className="w-full border rounded-lg p-2 disabled:bg-slate-100"
    >
      <option value="">-- Pilih Jabodetabek --</option>
      {jabodetabekOptions.map((j) => (
        <option key={j.id} value={j.name}>
          {j.name}
        </option>
      ))}
    </select>
  </div>
</div>


<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

  {/* Luar Jabodetabek */}
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      Luar Jabodetabek
    </label>
    <select
      value={formData.luarJabodetabek}
      disabled={isAreaChannelDisabled(formData, "luarJabodetabek")}
      onChange={(e) => {
        const updated = [...formList];
        updated[index].luarJabodetabek = e.target.value;
        setFormList(updated);
      }}
      className="w-full border rounded-lg p-2 disabled:bg-slate-100"
    >
      <option value="">-- Pilih Luar Jabodetabek --</option>
      {luarJaboOptions.map((l) => (
        <option key={l.id} value={l.name}>
          {l.name}
        </option>
      ))}
    </select>
  </div>

  {/* Tradisional */}
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      Tradisional
    </label>
    <select
      value={formData.tradisional}
      disabled={isAreaChannelDisabled(formData, "tradisional")}
      onChange={(e) => {
        const updated = [...formList];
        updated[index].tradisional = e.target.value;
        setFormList(updated);
      }}
      className="w-full border rounded-lg p-2 disabled:bg-slate-100"
    >
      <option value="">-- Pilih Tradisional --</option>
      {tradisionalOptions.map((t) => (
        <option key={t.id} value={t.name}>
          {t.name}
        </option>
      ))}
    </select>
  </div>

  {/* Warehouse */}
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      Warehouse
    </label>
    <select
      value={formData.warehouse}
      disabled={isAreaChannelDisabled(formData, "warehouse")}
      onChange={(e) => {
        const updated = [...formList];
        updated[index].warehouse = e.target.value;
        setFormList(updated);
      }}
      className="w-full border rounded-lg p-2 disabled:bg-slate-100"
    >
      <option value="">-- Pilih Warehouse --</option>
      {warehouseOptions.map((w) => (
        <option key={w.id} value={w.name}>
          {w.name}
        </option>
      ))}
    </select>
  </div>


<div className="mt-6 max-w-md">
  <label className="block text-sm font-medium text-slate-700 mb-1">
    WH - Z
  </label>
  <select
    value={formData.whz}
    disabled={isAreaChannelDisabled(formData, "whz")}
    onChange={(e) => {
      const updated = [...formList];
      updated[index].whz = e.target.value;
      setFormList(updated);
    }}
    className="w-full border rounded-lg p-2 disabled:bg-slate-100"
  >
    <option value="">-- Pilih WH - Z --</option>
    {serviceCenterOptions.map((s) => (
      <option key={s.id} value={s.name}>
        {s.name}
      </option>
    ))}
  </select>
</div>

  </div>
</div>


    <div className="space-y-1">
  <label className="text-sm font-medium text-gray-700">
    Notes
  </label>

  <textarea
  placeholder="Tulis catatan"
  value={formData.notes || ""}
  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updated = [...formList];
    updated[index].notes = e.target.value;
    setFormList(updated);
  }}
  className="w-full min-h-[80px] rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

</div>
     



          {/* Jenis Data */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Jenis Data<span className="text-red-500">*</span>
            </label>
           <select
  name="jenisData"
  value={formData.jenisData}
  onChange={(e) => handleChange(e, index)}
  className="border rounded p-2 w-full"
>
  <option value="">-- Pilih Jenis Data --</option>
  <option value="visit">Visit</option>
  <option value="non-visit">Non Visit</option>
  <option value="rekon">Rekon Data</option>
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
  idsToUpdate.includes(d.id!)
    ? { ...d, status: "Sudah" as AuditStatus }
    : d
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

{/* Hapus Batch */}
<button
  onClick={async () => {
    if (selectedIndices.length === 0) return;

    const yakin = window.confirm(
      `⚠️ Hapus ${selectedIndices.length} data terpilih beserta file terkait?`
    );
    if (!yakin) return;

    const toastId = toast.loading("⏳ Menghapus data...");

    try {
      // ===============================
      // 🔹 Ambil report_id yang akan dihapus
      // ===============================
      const idsToDelete = selectedIndices
        .map((idx) => filteredAndSortedUpdatePlanData[idx]?.id)
        .filter((id): id is number => typeof id === "number");

      if (idsToDelete.length === 0) {
        toast.error("❌ Tidak ada data valid untuk dihapus", { id: toastId });
        return;
      }

      // ===============================
      // 🔹 Ambil SEMUA file terkait (1 query)
      // ===============================
      const { data: files, error: fileError } = await supabase
        .from("report_files")
        .select("id, file_url, report_id")
        .in("report_id", idsToDelete);

      if (fileError) {
        console.error("Fetch report_files error:", fileError.message);
      }

      // ===============================
      // 🔹 Hapus file di STORAGE
      // ===============================
      for (const f of files || []) {
        if (!f.file_url) continue;

        try {
          const path = new URL(f.file_url)
            .pathname.split("/storage/v1/object/public/report-plan/")[1];

          if (path) {
            await supabase.storage
              .from("report-plan")
              .remove([path]);
          }
        } catch (err) {
          console.error("Error delete storage file:", err);
        }
      }

      // ===============================
      // 🔹 Hapus report_files (DB)
      // ===============================
      await supabase
        .from("report_files")
        .delete()
        .in("report_id", idsToDelete);

      // ===============================
      // 🔹 Hapus approvals_status
      // ===============================
      await supabase
        .from("approvals_status")
        .delete()
        .in("report_id", idsToDelete);

      // ===============================
      // 🔹 Hapus audit_full
      // ===============================
      const { error: auditError } = await supabase
        .from("audit_full")
        .delete()
        .in("id", idsToDelete);

      if (auditError) throw new Error(auditError.message);

      // ===============================
      // 🔹 Update frontend state
      // ===============================
      setDataList((prev) =>
        prev.filter((d) => !idsToDelete.includes(d.id!))
      );
      setSelectedIndices([]);

      toast.success("✅ Semua data & file berhasil dihapus!", { id: toastId });
    } catch (err) {
      console.error("Batch delete error:", err);
      toast.error("❌ Gagal hapus data!", { id: toastId });
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
      <option key={pic} value={pic}>{pic}</option>
    ))}
  </select>

  {/* Filter Tahun */}
  <select
    value={selectedYearUpdatePlan}
    onChange={(e) => setSelectedYearUpdatePlan(e.target.value)}
    className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm
               focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
  >
    <option value="">Semua Tahun</option>
    {yearOptions.map((year) => (
      <option key={year} value={year}>{year}</option>
    ))}
  </select>

{/* Filter Bulan */}
<select
  value={selectedMonthUpdatePlan}
  onChange={(e) => setSelectedMonthUpdatePlan(e.target.value)}
  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm
             focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
>
  <option value="">Semua Bulan</option>
  {monthOptions.map((m) => (
    <option key={m.value} value={m.value}>
      {m.label}
    </option>
  ))}
</select>


  {/* Filter Tanggal (Range) */}
 <DatePicker
  selectsRange
  startDate={filterTanggalAwal}
  endDate={filterTanggalAkhir}
  onChange={(dates) => {
    const [start, end] = dates as [Date | null, Date | null];
    setFilterTanggalAwal(start);
    setFilterTanggalAkhir(end);
  }}
  isClearable
  placeholderText="Filter rentang tanggal"
  dateFormat="dd/MM/yyyy"
  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm w-[180px]
             focus:ring-2 focus:ring-blue-400 focus:outline-none transition"


    renderCustomHeader={({
      date,
      changeYear,
      changeMonth,
      decreaseMonth,
      increaseMonth,
      prevMonthButtonDisabled,
      nextMonthButtonDisabled,
    }) => (
      <div className="flex justify-between items-center px-2 py-1">
        <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>{"<"}</button>

        {/* Dropdown Bulan */}
        <select
          value={date.getMonth()}
          onChange={(e) => changeMonth(Number(e.target.value))}
          className="mx-1 text-sm"
        >
          {Array.from(Array(12).keys()).map((m) => (
            <option key={m} value={m}>
              {new Date(0, m).toLocaleString("id-ID", { month: "long" })}
            </option>
          ))}
        </select>

        {/* Dropdown Tahun */}
        <select
          value={date.getFullYear()}
          onChange={(e) => changeYear(Number(e.target.value))}
          className="mx-1 text-sm"
        >
          {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i).map(
            (y) => (
              <option key={y} value={y}>{y}</option>
            )
          )}
        </select>

        <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>{">"}</button>
      </div>
    )}

    popperPlacement="bottom-start"
    popperClassName="z-[9999]"
    popperContainer={({ children }) => <div className="z-[9999]">{children}</div>}
  />

  {/* Filter Status Upload Report */}
  <div>
    <label className="sr-only">Status Upload Report</label>
    <select
      value={reportStatusFilter}
      onChange={(e) =>
        setReportStatusFilter(e.target.value as "all" | "uploaded" | "notUploaded")
      }
      className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm
                 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
    >
      <option value="all">Status Upload Laporan</option>
      <option value="uploaded">Sudah Upload</option>
      <option value="notUploaded">Belum Upload</option>
    </select>
  </div>

  {/* Filter Kategori */}
  <div>
    <label className="sr-only">Jenis Kategori</label>
    <select
      value={selectedKategoriUpdatePlan}
      onChange={(e) => setSelectedKategoriUpdatePlan(e.target.value)}
      className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm
                 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
    >
      <option value="">Semua Kategori</option>
      <option value="jabodetabek">Jabodetabek</option>
      <option value="luarJabodetabek">Luar Jabodetabek</option>
      <option value="cabang">Cabang</option>
      <option value="warehouse">Warehouse</option>
      <option value="modern">Modern</option>
      <option value="tradisional">Tradisional</option>
      <option value="whz">WH-Z</option>
    </select>
  </div>

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
  { key: "Cancel", label: "Cancel" },
].map(({ key, label }) => {

    const isActive = statusTab === key;
    return (
      <button
        key={key || "Semua"}
       onClick={() => setStatusTab(key as "" | AuditStatus)}

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
        <th className="border border-gray-200 p-2 text-center">
  Checklist
</th>


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
          {formatToDDMMYYYYDisplay(d.tanggal_estimasi_full)}

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
{formatToDDMMYYYYDisplay(d.tanggal_realisasi_full)}
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









{/* TEAM */}
<td className="p-2 border border-gray-300">
  {Array.isArray(d.team) ? d.team.join(", ") : d.team || "-"}
</td>

        {/* PIC */}
        <td className="p-2 border border-gray-300">
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

    {/* Parent Cabang */}
    <div
      className="cursor-pointer font-semibold"
      onClick={() => toggleExpandCabang(d.id)}
    >
      {expandedCabang === d.id ? "▼ " : "► "}
      {highlightText(d.cabang || "", searchText)}
    </div>
{expandedCabang === d.id && (
  <div className="mt-2 pl-4 border-l-2 border-gray-300">
    {(() => {
      // 🔹 1. Jika tidak ada anakCabang → tampilkan info saja
      if (!d.anakCabang) {
        return (
          <div className="text-xs text-gray-400 italic">
            Tidak ada anak cabang
          </div>
        );
      }

      // 🔹 2. Cari anak cabang di master cabang (aman dari undefined)
      const child = cabangOptions.find(
        (c) => c.name.toLowerCase() === (d.anakCabang || "").toLowerCase()
      );

      if (!child) {
        return (
          <div className="text-xs text-gray-400 italic">
            Anak cabang tidak ditemukan di master
          </div>
        );
      }

      // 🔹 3. Tampilkan hanya anak cabang yang dipilih user
      return (
        <div
          key={child.id}
          className="text-sm py-1 px-2 rounded hover:bg-gray-100 cursor-pointer"
          onClick={() => openAnakCabangModal(child)}
        >
          └─ {child.name}
        </div>
      );
    })()}
  </div>
)}



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
    onChange={(e) =>
      handleToggleStatus(d.id!, e.target.value as AuditStatus)
    }
    className={`px-3 py-1.5 rounded-full text-sm font-medium border
      ${
        d.status === "Sudah"
          ? "border-green-500 text-green-600 bg-green-50"
          : d.status === "On Progress"
          ? "border-blue-500 text-blue-600 bg-blue-50"
          : d.status === "Cancel"
          ? "border-red-500 text-red-600 bg-red-50"
          : "border-yellow-500 text-yellow-600 bg-yellow-50"
      }`}
  >
    <option value="Belum">⏳ Belum</option>
    <option value="On Progress">🔄 On Progress</option>
    <option value="Sudah">✅ Sudah</option>
    <option value="Cancel">❌ Cancel</option>
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
className={`px-3 py-1.5 rounded-lg text-sm text-white shadow ${
  d.id != null && reportFilesMap[d.id]
    ? "bg-green-600 hover:bg-green-700"
    : "bg-blue-600 hover:bg-blue-700"
}`}

  >
    Report
  </button>
</td>




<td className="p-2 border border-gray-300 text-center">
  <input
    type="checkbox"
    checked={!!d.is_checked} // boolean dari database / state
    onChange={async (e) => {
      const checked = e.target.checked;

      // update local state
      setDataList((prev) =>
        prev.map((item) =>
          item.id === d.id ? { ...item, is_checked: checked } : item
        )
      );

      // update database
      await supabase
        .from("audit_full")
        .update({ is_checked: checked })
        .eq("id", d.id);
    }}
    className="w-4 h-4 accent-blue-600 cursor-pointer"
  />
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
  const toISO = (str: string) => {
    if (!str || !str.includes("/")) return "";
    const [d, m, y] = str.split("/");
    return `${y}-${m}-${d}`;
  };

  const parseRange = (str: string) => {
    if (!str) return "";

    const parts = str.split(" - ");

    if (parts.length === 2) {
      return `${toISO(parts[0])} - ${toISO(parts[1])}`;
    }

    return toISO(str);
  };

  const rawRealisasi =
    d.tanggal_realisasi_full ||
    d.realisasi ||
    "";

  setEditingData({
    ...(d as any),

    // 🔥 SATU SUMBER KEBENARAN
    realisasi: parseRange(rawRealisasi),
  } as any);

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
          Edit Data Update Plan SO
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

       
{/* ====================== */}
{/*        TANGGAL         */}
{/* ====================== */}
<div className="col-span-2">
  <div className="border rounded-xl p-4 bg-slate-50">
    <h3 className="text-sm font-bold text-slate-700 mb-4">
      Tanggal
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Tanggal Estimasi */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Tanggal Estimasi
        </label>
<DatePicker
  selectsRange
  startDate={estimasiRange[0]}
  endDate={estimasiRange[1]}
  onChange={(update) => {
    const [start, end] = update as [Date | null, Date | null];
    setEstimasiRange([start, end]);

    setEditingData({
      ...editingData,
      tanggal_estimasi_full:
        start && end
          ? `${formatToDDMMYYYY(start)} - ${formatToDDMMYYYY(end)}`
          : start
          ? formatToDDMMYYYY(start)
          : "",
    });
  }}
  isClearable
  placeholderText="Pilih rentang tanggal"
  dateFormat="dd/MM/yyyy"
  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm
             focus:ring-2 focus:ring-blue-400 focus:outline-none transition"

  renderCustomHeader={({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
    <div className="flex justify-between items-center px-2 py-1">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="px-2"
      >
        {"<"}
      </button>

      {/* Bulan */}
      <select
        value={date.getMonth()}
        onChange={(e) => changeMonth(Number(e.target.value))}
        className="mx-1 text-sm border rounded px-1"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {new Date(0, m).toLocaleString("id-ID", { month: "long" })}
          </option>
        ))}
      </select>

      {/* Tahun */}
      <select
        value={date.getFullYear()}
        onChange={(e) => changeYear(Number(e.target.value))}
        className="mx-1 text-sm border rounded px-1"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="px-2"
      >
        {">"}
      </button>
    </div>
  )}

  popperPlacement="bottom-start"
  popperClassName="z-[9999]"
  popperContainer={({ children }) => (
    <div className="z-[9999]">{children}</div>
  )}
/>

      </div>

      {/* Minggu */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Minggu (otomatis)
        </label>
        <input
          type="text"
          value={editingData.minggu || ""}
          disabled
          className="w-full border border-slate-300 p-2 rounded-lg bg-slate-100 text-slate-600"
        />
      </div>

      {/* Tanggal Realisasi */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Tanggal Realisasi
        </label>
       <DatePicker
  selectsRange
  startDate={realisasiRange[0]}
  endDate={realisasiRange[1]}
  onChange={(update) => {
    const [start, end] = update as [Date | null, Date | null];
    setRealisasiRange([start, end]);

    setEditingData({
      ...editingData,
      realisasi:
        start && end
          ? `${formatToDDMMYYYY(start)} - ${formatToDDMMYYYY(end)}`
          : start
          ? formatToDDMMYYYY(start)
          : "",
    });
  }}
  isClearable
  placeholderText="Pilih rentang tanggal"
  dateFormat="dd/MM/yyyy"
  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm
             focus:ring-2 focus:ring-blue-400 focus:outline-none transition"

  renderCustomHeader={({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
    <div className="flex justify-between items-center px-2 py-1">
      <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
        {"<"}
      </button>

      <select
        value={date.getMonth()}
        onChange={(e) => changeMonth(Number(e.target.value))}
        className="mx-1 text-sm border rounded px-1"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {new Date(0, m).toLocaleString("id-ID", { month: "long" })}
          </option>
        ))}
      </select>

      <select
        value={date.getFullYear()}
        onChange={(e) => changeYear(Number(e.target.value))}
        className="mx-1 text-sm border rounded px-1"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
        {">"}
      </button>
    </div>
  )}

  popperPlacement="bottom-start"
  popperClassName="z-[9999]"
  popperContainer={({ children }) => (
    <div className="z-[9999]">{children}</div>
  )}
/>

      </div>
    </div>
  </div>
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

{/* ========================== */}
{/*          AREA             */}
{/* ========================== */}
<div className="col-span-2 mt-4">
  <div className="border rounded-xl p-4 bg-slate-50">
    <h3 className="text-sm font-bold text-slate-700 mb-4">
      Area
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Jabodetabek */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Jabodetabek
        </label>
        <select
          value={editingData.jabodetabek || ""}
          onChange={(e) =>
            setEditingData({ ...editingData, jabodetabek: e.target.value })
          }
          className="w-full border border-slate-300 p-2 rounded-lg"
        >
          <option value="">-- Pilih Jabodetabek --</option>
          {jabodetabekOptions.map((j) => (
            <option key={j.id} value={j.name}>
              {j.name}
            </option>
          ))}
        </select>
      </div>

      {/* Luar Jabodetabek */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Luar Jabodetabek
        </label>
        <select
          value={editingData.luarJabodetabek || ""}
          onChange={(e) =>
            setEditingData({
              ...editingData,
              luarJabodetabek: e.target.value,
            })
          }
          className="w-full border border-slate-300 p-2 rounded-lg"
        >
          <option value="">-- Pilih Luar Jabodetabek --</option>
          {luarJaboOptions.map((l) => (
            <option key={l.id} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Cabang */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Cabang
        </label>
        <select
          value={editingData.cabang || ""}
          onChange={(e) =>
            setEditingData({
              ...editingData,
              cabang: e.target.value,
              anakCabang: "",
            })
          }
          className="w-full border border-slate-300 p-2 rounded-lg"
        >
          <option value="">-- Pilih Cabang --</option>
          {cabangOptions
            .filter((c) => c.parent_id === null)
            .map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
        </select>
      </div>

      {/* Anak Cabang */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Anak Cabang
        </label>
        <select
          value={editingData.anakCabang || ""}
          disabled={!editingData.cabang}
          onChange={(e) =>
            setEditingData({
              ...editingData,
              anakCabang: e.target.value,
            })
          }
          className="w-full border border-slate-300 p-2 rounded-lg disabled:bg-slate-100"
        >
          <option value="">-- Pilih Anak Cabang --</option>
          {cabangOptions
            .filter(
              (c) =>
                c.parent_id ===
                cabangOptions.find(
                  (p) => p.name === editingData.cabang
                )?.id
            )
            .map((anak) => (
              <option key={anak.id} value={anak.name}>
                {anak.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  </div>
</div>


{/* ========================== */}
{/*        CHANNEL             */}
{/* ========================== */}
<div className="col-span-2 mt-4">
  <div className="border rounded-xl p-4 bg-slate-50">
    <h3 className="text-sm font-bold text-slate-700 mb-4">
      Channel
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Warehouse */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Warehouse
        </label>
        <select
          value={editingData.warehouse || ""}
          onChange={(e) =>
            setEditingData({ ...editingData, warehouse: e.target.value })
          }
          className="w-full border border-slate-300 p-2 rounded-lg"
        >
          <option value="">-- Pilih Warehouse --</option>
          {warehouseOptions.map((w) => (
            <option key={w.id} value={w.name}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tradisional */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Tradisional
        </label>
        <select
          value={editingData.tradisional || ""}
          onChange={(e) =>
            setEditingData({
              ...editingData,
              tradisional: e.target.value,
            })
          }
          className="w-full border border-slate-300 p-2 rounded-lg"
        >
          <option value="">-- Pilih Tradisional --</option>
          {tradisionalOptions.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Modern */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Modern
        </label>
        <select
          value={editingData.modern || ""}
          onChange={(e) =>
            setEditingData({ ...editingData, modern: e.target.value })
          }
          className="w-full border border-slate-300 p-2 rounded-lg"
        >
          <option value="">-- Pilih Modern --</option>
          {modernOptions.map((m) => (
            <option key={m.id} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* WHZ */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          WH - Z
        </label>
        <select
          value={editingData.whz || ""}
          onChange={(e) =>
            setEditingData({ ...editingData, whz: e.target.value })
          }
          className="w-full border border-slate-300 p-2 rounded-lg"
        >
          <option value="">-- Pilih WH - Z --</option>
          {serviceCenterOptions.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
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

{selectedAnakCabangDetail && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-96">
      <h2 className="text-lg font-bold mb-4">Detail Anak Cabang</h2>

      <p><strong>Nama:</strong> {selectedAnakCabangDetail.name}</p>
      <p><strong>ID:</strong> {selectedAnakCabangDetail.id}</p>
      <p><strong>Parent ID:</strong> {selectedAnakCabangDetail.parent_id}</p>

      <button
        onClick={() => setSelectedAnakCabangDetail(null)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
      >
        Tutup
      </button>
    </div>
  </div>
)}


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

 {/* === Laporan kategori Report === */}
{activePage === "kategoriReport" && (
  <PageWrapper title="Kategori Performance Report">
    <div className="space-y-6">

      {/* ================= FILTER SECTION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow">

        {/* KATEGORI */}
        <div>
          <label className="text-sm font-semibold">Kategori</label>
          <select
            className="w-full border rounded p-2"
            value={selectedKategori}
            onChange={(e) => {
              setSelectedKategori(e.target.value as any);
              setSelectedSubKategori("");
            }}
          >
            {kategoriOptions.map((k) => (
              <option key={k.key} value={k.key}>
                {k.label}
              </option>
            ))}
          </select>
        </div>

{/* SUB KATEGORI */}
<div>
  <label className="text-sm font-semibold">Detail</label>
  <select
    className="w-full border rounded p-2"
    value={selectedSubKategori}
    onChange={(e) => setSelectedSubKategori(e.target.value)}
  >
    <option value="">ALL</option>

    {/* 🔹 KHUSUS MODERN */}
    {selectedKategori === "modern"
      ? modernOptions.map((m) => (
          <option key={m.id} value={m.name}>
            {m.name}
          </option>
        ))
      : Array.from(
          new Set(
            dataList
              .map((d) => d[selectedKategori as keyof AuditData])
              .filter(Boolean)
          )
        ).map((v: any, i) => (
          <option key={i} value={v}>
            {v}
          </option>
        ))}
  </select>
</div>

        {/* PERIODE */}
        <div>
          <label className="text-sm font-semibold">Periode</label>
          <select
            className="w-full border rounded p-2"
            value={periodeType}
            onChange={(e) => setPeriodeType(e.target.value as any)}
          >
            <option value="tahun">1 Tahun</option>
            <option value="bulan">1 Bulan</option>
          </select>
        </div>

        {/* BULAN / TAHUN */}
        <div>
          <label className="text-sm font-semibold">
            {periodeType === "tahun" ? "Tahun" : "Bulan"}
          </label>

          {periodeType === "tahun" ? (
            <select
              className="w-full border rounded p-2"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {[...new Set(dataList.map(d => d.tahun))].map((y, i) => (
                <option key={i} value={y}>{y}</option>
              ))}
            </select>
          ) : (
<select
  value={selectedKategoriMonth}
  onChange={(e) => setSelectedKategoriMonth(e.target.value)}
>
              {monthOrder.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ================= DATA PROCESS ================= */}
      {(() => {
        const filteredData = dataList.filter((d) => {
          if (!d[selectedKategori as keyof AuditData]) return false;

          if (
            selectedSubKategori &&
            d[selectedKategori as keyof AuditData] !== selectedSubKategori
          ) return false;

          if (periodeType === "tahun") {
            return d.tahun === selectedYear;
          }

          return (
            d.tahun === selectedYear &&
            d.bulan?.toUpperCase() === selectedMonth
          );
        });

        const pieData = [
          { name: "Sudah", value: filteredData.filter(d => d.status === "Sudah").length },
          { name: "Belum", value: filteredData.filter(d => d.status === "Belum").length },
          { name: "On Progress", value: filteredData.filter(d => d.status === "On Progress").length },
        ];

        const barData = Object.values(
          filteredData.reduce((acc: any, d: any) => {
            const bulan = d.bulan;
            if (!bulan) return acc;
            if (!acc[bulan]) acc[bulan] = { bulan, total: 0 };
            acc[bulan].total++;
            return acc;
          }, {})
        ).sort(
          (a: any, b: any) =>
            monthOrder.indexOf(a.bulan) - monthOrder.indexOf(b.bulan)
        );
        
        const detailKey = selectedKategori as keyof AuditData;

// ambil semua detail unik
const detailList = Array.from(
  new Set(filteredData.map(d => d[detailKey]).filter(Boolean))
);

// bentuk data per bulan
const detailPerBulanData = Object.values(
  filteredData.reduce((acc: any, d: any) => {
    const bulan = d.bulan;
    const detail = d[detailKey];
    if (!bulan || !detail) return acc;

    if (!acc[bulan]) acc[bulan] = { bulan };
    acc[bulan][detail] = (acc[bulan][detail] || 0) + 1;

    return acc;
  }, {})
).sort(
  (a: any, b: any) =>
    monthOrder.indexOf(a.bulan) - monthOrder.indexOf(b.bulan)
);

        return (
          <>
            {/* ================= PIE CHART ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl shadow">
                <h3 className="font-semibold mb-4">Status Overview</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={["#22c55e", "#facc15", "#3b82f6"][i]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* ================= SUMMARY ================= */}
              <div className="bg-white p-4 rounded-xl shadow flex flex-col justify-center gap-3">
                <div className="text-lg font-bold">
                  Total Data: {filteredData.length}
                </div>
                <div className="text-green-600">Sudah: {pieData[0].value}</div>
                <div className="text-yellow-600">Belum: {pieData[1].value}</div>
                <div className="text-blue-600">On Progress: {pieData[2].value}</div>
              </div>
            </div>

            {/* ================= BAR CHART ================= */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="font-semibold mb-4">Trend per Bulan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="total" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      })()}
    </div>
  </PageWrapper>
)}




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
    
    {/* 🔍 Search */}
<input
  type="text"
  value={searchCabangText}
  onChange={(e) => setSearchCabangText(e.target.value)}
  placeholder="Cari laporan / cabang / PIC..."
  className="border border-slate-300 bg-white px-3 py-2.5 rounded-lg text-sm text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition w-[260px]"
/>
    </div>



    {/* === Table === */}
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm max-h-[600px]">
      <table className="min-w-full text-sm text-slate-700 text-center border-collapse">
        <thead className="bg-slate-100 sticky top-0 z-20 shadow-sm">
          <tr>
{[
  "No Laporan",
  "Bulan",
  "Tanggal Estimasi",
  "Minggu",
  "PIC",
  "Cabang",
  "Anak Cabang",
].map((header) => (

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
                <td className="px-4 py-2 font-medium text-slate-800">
  {d.no_laporan || "-"}
</td>
                <td className="px-4 py-2">{d.bulan}</td>
                <td className="px-4 py-2">{d.tanggal_estimasi_full}</td>
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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-8">
  <div>
    <h2 className="text-3xl font-bold tracking-tight text-slate-800">
      Status Plan
    </h2>
    <p className="text-sm text-slate-500 mt-1 italic">
      Detail data tersedia di halaman Update Plan SO
    </p>
  </div>
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

const getTahunData = (d: AuditData) =>
  d.tahun ||
  d.tanggal?.split("/")?.[2] ||
  (d.created_at
    ? new Date(d.created_at).getFullYear().toString()
    : "");

const countSudah = dataList.filter((d) => {
  if (
    selectedYearStatusPlan &&
    getTahunData(d) !== selectedYearStatusPlan
  )
    return false;

  return getEffectiveStatus(d) === "Sudah";
}).length;

const countOnProgress = dataList.filter((d) => {
  if (
    selectedYearStatusPlan &&
    getTahunData(d) !== selectedYearStatusPlan
  )
    return false;

  return getEffectiveStatus(d) === "On Progress";
}).length;

const countBelum = dataList.filter((d) => {
  if (
    selectedYearStatusPlan &&
    getTahunData(d) !== selectedYearStatusPlan
  )
    return false;

  return getEffectiveStatus(d) === "Belum";
}).length;


const countCancel = dataList.filter((d) => {
  if (
    selectedYearStatusPlan &&
    getTahunData(d) !== selectedYearStatusPlan
  )
    return false;

  return d.status === "Cancel";
}).length;


const tabs = [
  { label: "Belum", color: "bg-yellow-500", count: countBelum },
  { label: "On Progress", color: "bg-blue-600", count: countOnProgress },
  { label: "Sudah", color: "bg-green-600", count: countSudah },
  { label: "Cancel", color: "bg-red-600", count: countCancel },
];


    return tabs.map((tab) => (
     <button
  key={tab.label}
onClick={() => setStatusTab(tab.label as AuditStatus)}

  className={`relative flex items-center gap-2 px-6 py-2.5 mx-2 text-sm font-semibold rounded-full transition-all duration-300
    ${
      statusTab === tab.label
        ? `${tab.color} text-white shadow-lg scale-105`
        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
    }`}
>
  {tab.label}
  <span
    className={`px-2.5 py-0.5 text-xs rounded-full font-bold ${
      statusTab === tab.label
        ? "bg-white text-slate-800"
        : "bg-slate-200 text-slate-700"
    }`}
  >
    {tab.count}
  </span>
</button>

    ));
  })()}
</div>


    {/* === Filter Section === */}
   <div className="flex flex-wrap items-center gap-3 mb-6 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm">

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

<select
  value={selectedYearStatusPlan}
  onChange={(e) => setSelectedYearStatusPlan(e.target.value)}
  className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
>
  <option value="">Semua Tahun</option>
  {[...new Set(
    dataList.map(
      (d) =>
        d.tahun ||
        d.tanggal?.split("/")?.[2] ||
        (d.created_at
          ? new Date(d.created_at).getFullYear().toString()
          : "")
    )
  )]
    .filter(Boolean)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
</select>


      <input
        type="text"
        placeholder="Cari data..."
        value={searchTextStatusPlan}
        onChange={(e) => setSearchTextStatusPlan(e.target.value)}
       className="border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"

      />
    </div>

    {/* === TABLE === */}
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm max-h-[750px]">
     <table className="w-full text-sm text-slate-700 border-collapse">

        {/* Header */}
<thead className="sticky top-0 z-50 bg-slate-100/95 backdrop-blur border-b-2 border-slate-300 shadow-sm">
  <tr className="text-center">
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">Bulan</th>
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">Minggu</th>
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">Tanggal Plan</th>
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">Tanggal Realisasi</th>

{/* Sticky PIC */}
<th className="px-4 py-3 sticky left-0 bg-yellow-200 text-slate-900 z-50 font-bold 
  shadow-[4px_0_10px_-4px_rgba(0,0,0,0.35)] border-r border-yellow-300">
  TEAM
</th>

{/* Sticky TEAM */}
<th className="px-4 py-3 sticky left-[140px] bg-blue-100 text-slate-900 z-40 font-bold
  shadow-[4px_0_10px_-4px_rgba(0,0,0,0.25)] border-r border-blue-200">
  PIC 
</th>



    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">Perusahaan</th>
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">Jabodetabek</th>
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">Luar Jabo</th>
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">Cabang</th>
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">Warehouse</th>
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">Tradisional</th>
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">Modern</th>
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">WH-Z</th>
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">No Laporan</th>
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">Status</th>
  </tr>
</thead>


<tbody className="divide-y divide-slate-200">
  {paginatedStatusPlanData.length === 0 ? (
    <tr>
      <td colSpan={15} className="text-center py-12 text-slate-400 italic">
        Tidak ada data {statusTab}.
      </td>
    </tr>
  ) : (
    paginatedStatusPlanData.map((d, i) => (
      <tr
        key={d.id || i}
        className={`text-center transition-all duration-200 ${
          i % 2 === 0 ? "bg-white" : "bg-slate-50"
        } hover:bg-blue-50/50`}
      >
        <td className="px-4 py-2 whitespace-nowrap text-slate-700">{d.bulan}</td>
        <td className="px-4 py-2 whitespace-nowrap text-slate-700">{d.minggu}</td>
<td className="px-4 py-2 whitespace-nowrap text-slate-700">
  {d.tanggal_estimasi_full || "-"}
</td>

        <td className="px-4 py-2 whitespace-nowrap text-slate-700">
          {d.tanggal_realisasi_full || "-"}
        </td>

<td className="px-4 py-2 sticky left-0 bg-yellow-50/95 backdrop-blur z-40 font-semibold
  text-left shadow-[4px_0_6px_-4px_rgba(0,0,0,0.1)]">
  {Array.isArray(d.pic) ? d.pic.join(", ") : d.pic || "-"}
</td>

<td className="px-4 py-2 sticky left-[140px] bg-blue-50/95 backdrop-blur z-40 font-semibold
  text-left shadow-[4px_0_10px_-4px_rgba(0,0,0,0.15)]">
  {Array.isArray(d.team) ? d.team.join(", ") : d.team || "-"}
</td>


        <td className="px-4 py-2 whitespace-nowrap text-slate-700">{d.company}</td>
        <td className="px-4 py-2 whitespace-nowrap text-slate-700">{d.jabodetabek}</td>
        <td className="px-4 py-2 whitespace-nowrap text-slate-700">{d.luarJabodetabek}</td>
        <td className="px-4 py-2 whitespace-nowrap text-slate-700">{d.cabang}</td>
        <td className="px-4 py-2 whitespace-nowrap text-slate-700">{d.warehouse}</td>
        <td className="px-4 py-2 whitespace-nowrap text-slate-700">{d.tradisional}</td>
        <td className="px-4 py-2 whitespace-nowrap text-slate-700">{d.modern}</td>
        <td className="px-4 py-2 whitespace-nowrap text-slate-700">{d.whz}</td>
        <td className="px-4 py-2 whitespace-nowrap text-slate-700 font-medium">
          {d.no_laporan || "-"}
        </td>

        <td className="px-4 py-2 text-center">
<span
  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold
    ${
      d.status === "Sudah"
        ? "bg-green-100 text-green-700"
        : d.status === "On Progress"
        ? "bg-blue-100 text-blue-700"
        : d.status === "Cancel"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
>
  {d.status}
</span>

        </td>
      </tr>
    ))
  )}
</tbody>

      </table>
    </div>
    
{/* === Pagination + Info Bawah === */}
{filteredStatusPlanData.length > rowsPerPageStatus && (
  <div className="mt-4 flex justify-between items-center">
    {/* Kiri: Info jumlah tampil */}
    <div className="text-sm text-slate-500">
      Menampilkan{" "}
      <span className="font-semibold text-slate-700">
        {(currentPageStatus - 1) * rowsPerPageStatus + 1}
      </span>
      {" - "}
      <span className="font-semibold text-slate-700">
        {Math.min(
          currentPageStatus * rowsPerPageStatus,
          filteredStatusPlanData.length
        )}
      </span>{" "}
      dari{" "}
      <span className="font-semibold text-slate-700">
        {filteredStatusPlanData.length}
      </span>{" "}
      data
    </div>

    {/* Kanan: Pagination */}
    <EllipsisPagination
      currentPage={currentPageStatus}
      totalRows={filteredStatusPlanData.length}
      rowsPerPage={rowsPerPageStatus}
      onPageChange={setCurrentPageStatus}
    />
  </div>
)}

  </div>
  </div>
  </div>
)}

</div>
)}