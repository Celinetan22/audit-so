"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LabelList,
  Line,
} from "recharts";
import MultiSelectPIC from "@/components/MultiSelectPIC";
import { CircleHelp } from "lucide-react";


type AuditItem = {
  id?: number | string;
  pic: string | string[];
  bulan?: string;
  tahun?: number | string;
  // Estimasi
  tanggal?: string;
  tanggalAwal?: string;
  tanggalAkhir?: string;

  // Realisasi
  realisasi?: string;
  realisasi_tanggal?: string;
  realisasi_bulan?: string;
  tanggalRealisasi?: string;

  cabang?: string;
  status?: string;

  company?: string;
  jabodetabek?: string;
  luar_jabodetabek?: string;
  warehouse?: string;
  tradisional?: string;
  modern?: string;
  wh_z?: string;
  no_laporan?: string | null;
};

const BarWithEndLine = (props: any) => {
  const { x, y, width, height, fill, index, payload, valueKey } = props;

  const currentValue = payload[valueKey];
  if (currentValue == null) return null;

  const next = props.chartData[index + 1];
  const nextValue = next ? next[valueKey] : null;

  const xEnd = x + width;
  const yMid = y + height / 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={6}
        ry={6}
      />

      {nextValue !== null && props.yScale && (
        <line
          x1={xEnd}
          y1={yMid}
          x2={xEnd + 20}
          y2={
            props.yScale(nextValue) + props.barHeight / 2
          }
          stroke="#1e293b"
          strokeWidth={2}
        />
      )}
    </g>
  );
};



/* ============================================
   NORMALISASI BULAN
============================================ */
const normalizeMonth = (bulan: string = "") => {
  let b = bulan.trim().toUpperCase();
  b = b.replace(/\./g, "").replace(/\s+/g, " ");

  const map: Record<string, string> = {
    JAN: "JANUARI",
    JANUARY: "JANUARI",
    JANUARI: "JANUARI",
    FEB: "FEBRUARI",
    FEBRUARY: "FEBRUARI",
    FEBUARI: "FEBRUARI",
    MAR: "MARET",
    MARCH: "MARET",
    MARET: "MARET",
    APR: "APRIL",
    MEI: "MEI",
    MAY: "MEI",
    JUN: "JUNI",
    JUNE: "JUNI",
    JUL: "JULI",
    JULY: "JULI",
    AUG: "AGUSTUS",
    AUGUST: "AGUSTUS",
    SEP: "SEPTEMBER",
    OCT: "OKTOBER",
    OCTOBER: "OKTOBER",
    NOV: "NOVEMBER",
    DEC: "DESEMBER",
  };
  return map[b] || b;
};

const MONTHS = [
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
];

/* ============================================
   AUTO FORMAT TANGGAL (ESTIMASI & REALISASI)
============================================ */
const formatTanggalEstimasi = (row: AuditItem) => {
  // Paket tanggal awal–akhir
  if (row.tanggalAwal || row.tanggalAkhir) {
    if (row.tanggalAwal && row.tanggalAkhir) {
      return `${row.tanggalAwal} - ${row.tanggalAkhir}`;
    }
    return row.tanggalAwal || row.tanggalAkhir;
  }

  // Tanggal tunggal
  if (row.tanggal) return row.tanggal;

  return "-";
};

const formatTanggalRealisasi = (row: AuditItem) => {
  if (row.realisasi) return row.realisasi;

  // kalau cuma bulan realisasi, tetap tampilkan
  if (row.realisasi_bulan && !row.realisasi_tanggal) {
    return row.realisasi_bulan;
  }

  if (row.realisasi_tanggal && row.realisasi_bulan) {
    return `${row.realisasi_tanggal} ${row.realisasi_bulan}`;
  }

  if (row.realisasi_tanggal) return row.realisasi_tanggal;
  if (row.realisasi_bulan) return row.realisasi_bulan;

  if (row.tanggalRealisasi) return row.tanggalRealisasi;

  return "-";
};


/* ============================================ */

export default function PICTabsPage({
  dataList,
  picOptions,
}: {
  dataList: AuditItem[];
  picOptions: string[];
}) {
  const [selectedPIC, setSelectedPIC] = useState<string[]>([]);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("");
  const [showLines, setShowLines] = useState(true);

const [selectedYear, setSelectedYear] = useState<string>("");

  const [selectedTablePIC, setSelectedTablePIC] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"single" | "group">("single");
  const [chartMode, setChartMode] = useState<"single" | "group" | "both">(
    "single"
  );
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedMonthFromChart, setSelectedMonthFromChart] =
    useState<string | null>(null);

  const toPicArray = (value: string | string[]) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string")
      return value.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  };

  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#64748b",
    "#06b6d4",
    "#f97316",
  ];

  /* ============================================
     CHART DATA
  ============================================ */
const chartData = useMemo(() => {
  if (!selectedPIC || selectedPIC.length === 0) return [];

  return MONTHS.map((month) => {
    const row: Record<string, number | string> = { bulan: month.slice(0, 3) };

    selectedPIC.forEach((picName) => {
      const picsInMonth = dataList.filter((item) => {
  const sameMonth = normalizeMonth(item.bulan) === month;

  if (!sameMonth) return false;

  if (selectedYear) {
    const itemYear =
      item.realisasi_bulan?.match(/\d{4}/)?.[0] ||
      item.bulan?.match(/\d{4}/)?.[0];

    if (itemYear !== selectedYear) return false;
  }

  return true;
});


      const singleCount = picsInMonth.filter((i) => {
        const p = toPicArray(i.pic);
        return p.includes(picName) && p.length === 1;
      }).length;

      const groupCount = picsInMonth.filter((i) => {
        const p = toPicArray(i.pic);
        return p.includes(picName) && p.length > 1;
      }).length;

      // === MODE CHART ===
      if (chartMode === "single") {
        row[picName + "_single"] = singleCount;
      } else if (chartMode === "group") {
        row[picName + "_group"] = groupCount;
      } else {
        // BOTH → pisah jadi 2 batang
        row[picName + "_single"] = singleCount;
        row[picName + "_group"] = groupCount;
      }
    });

    return row;
  });
}, [selectedPIC, dataList, chartMode]);

const yearOptions = useMemo(() => {
  const years = dataList
    .map((d) => d.tahun)
    .filter(Boolean)
    .map(String);

  return Array.from(new Set(years)).sort(
    (a, b) => Number(b) - Number(a)
  );
}, [dataList]);


const getRealisasiRangeDays = (realisasi?: string) => {
  if (!realisasi) return null;

  // Jika berupa angka tunggal, berarti 1 hari
  if (/^\d+$/.test(realisasi.trim())) return 1;

  const match = realisasi.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return null;

  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);

  if (isNaN(start) || isNaN(end)) return null;

  return end - start + 1;
};



  /* ============================================
     TABLE FILTER
  ============================================ */
 const filteredTable = useMemo(() => {
  if (!selectedPIC || selectedPIC.length === 0) return [];

  return dataList.filter((item) => {
    const pics = toPicArray(item.pic);

    // ===== FILTER PIC =====
    if (selectedTablePIC && !pics.includes(selectedTablePIC)) return false;

    const matchPIC = pics.some((p) => selectedPIC.includes(p));
    if (!matchPIC) return false;

    // ===== SINGLE / GROUP =====
    if (activeTab === "single" && pics.length !== 1) return false;
    if (activeTab === "group" && pics.length <= 1) return false;

    // ===== FILTER BULAN DARI CHART =====
    if (selectedMonthFromChart) {
      const fullMonth = MONTHS.find((m) =>
        m.startsWith(selectedMonthFromChart.toUpperCase())
      );
      if (fullMonth && normalizeMonth(item.bulan) !== fullMonth) return false;
    }

    // ===== FILTER STATUS =====
    if (selectedStatus && item.status !== selectedStatus) return false;

    // ===== FILTER BULAN DROPDOWN =====
    if (
      selectedMonthFilter &&
      normalizeMonth(item.bulan) !== selectedMonthFilter
    )
      return false;

    // ===== 🔥 FILTER TAHUN =====
    if (selectedYear) {
      const itemYear =
        item.realisasi_bulan?.match(/\d{4}/)?.[0] ||
        item.bulan?.match(/\d{4}/)?.[0];

      if (itemYear !== selectedYear) return false;
    }

    // ===== SEARCH =====
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();

      const combined = Object.values(item)
        .map((v) => (v ?? "").toString().toLowerCase())
        .join(" ");

      if (!combined.includes(q)) return false;
    }

    return true;
  });
}, [
  selectedPIC,
  selectedTablePIC,
  activeTab,
  selectedMonthFromChart,
  selectedStatus,
  selectedMonthFilter,
  selectedYear, // 🔥 WAJIB
  searchQuery,
  dataList,
]);


useEffect(() => {
  setPage(1);
}, [
  selectedPIC,
  selectedTablePIC,
  activeTab,
  selectedMonthFromChart,
  selectedMonthFilter,
  selectedStatus,
  searchQuery,
  rowsPerPage,
  selectedYear, // 🔥 tambah
]);




  const totalPages = Math.max(1, Math.ceil(filteredTable.length / rowsPerPage));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredTable.slice(start, start + rowsPerPage);
  }, [filteredTable, page, rowsPerPage]);

  const getPageNumbers = (cur: number, total: number) => {
    const delta = 2;
    const range: number[] = [];

    for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++)
      range.push(i);

    if (range[0] !== 1) {
      if (range[0] > 2) range.unshift(-1);
      range.unshift(1);
    }
    if (range[range.length - 1] !== total) {
      if (range[range.length - 1] < total - 1) range.push(-1);
      range.push(total);
    }
    return range;
  };

  /* ============================================ */

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        PIC Performance Report
      </h1>

      {/* ================= CHART CARD ================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md hover:shadow-lg transition-all duration-300 mb-10">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex-1">
            <label className="text-slate-700 font-medium">Select PIC (Chart)</label>
            <MultiSelectPIC options={picOptions} value={selectedPIC} onChange={setSelectedPIC} />
          </div>

<div className="flex items-start gap-10 mt-2">

  {/* TOGGLE GARIS PENGHUBUNG */}
  <div className="flex items-center gap-3 relative group">
    
    {/* Label + Tooltip */}
    <div className="flex items-center gap-1">
      <span className="text-slate-700 font-medium">Garis Penghubung</span>

      {/* ICON Tooltip */}
      <CircleHelp
        size={16}
        className="text-slate-400 cursor-pointer hover:text-slate-600 transition"
      />

      {/* TOOLTIP */}
      <div className="absolute left-0 top-6 z-20 hidden group-hover:block
                      bg-black text-white text-xs px-3 py-2 rounded-lg w-56 shadow-lg">
        Menampilkan garis tren yang menghubungkan nilai antar bulan.
      </div>
    </div>

    {/* Toggle Switch */}
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={showLines}
        onChange={(e) => setShowLines(e.target.checked)}
        className="sr-only peer"
      />

      <div className="w-11 h-6 bg-gray-300 rounded-full
                      peer-checked:bg-blue-500 transition-all duration-300"></div>

      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full 
                      transition-all duration-300
                      peer-checked:translate-x-5 shadow"></div>
    </label>
  </div>

  {/* CHART MODE */}
  <div className="flex flex-col">
    <label className="text-slate-700 font-medium">Chart Mode</label>
    <select
      value={chartMode}
      onChange={(e) => setChartMode(e.target.value as any)}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
    >
      <option value="single">Single PIC</option>
      <option value="group">Group PIC</option>
      <option value="both">Both</option>
    </select>
  </div>

</div>
        </div>

        <div className="w-full h-[400px] mt-4">
          {selectedPIC.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
<BarChart data={chartData} barSize={26}>
  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
  <XAxis dataKey="bulan" />
  <YAxis allowDecimals={false} />
  <Tooltip />
  <Legend />

{selectedPIC.map((pic, index) => {
  if (chartMode === "single") {
    return (
      <Bar
        key={`${pic}_single`}
        dataKey={`${pic}_single`}
        name={`${pic} (single)`}
        fill={COLORS[index % COLORS.length]}
        radius={[8, 8, 0, 0]}
      >
        <LabelList
          dataKey={`${pic}_single`}
          position="top"
          style={{ fontSize: 11, fontWeight: 600 }}
          formatter={(v) => (typeof v === "number" && v > 0 ? v : "")}
        />
      </Bar>
    );
  }

  if (chartMode === "group") {
    return (
      <Bar
        key={`${pic}_group`}
        dataKey={`${pic}_group`}
        name={`${pic} (group)`}
        fill={COLORS[index % COLORS.length]}
        radius={[8, 8, 0, 0]}
      >
        <LabelList
          dataKey={`${pic}_group`}
          position="top"
          style={{ fontSize: 11, fontWeight: 600 }}
          formatter={(v) => (typeof v === "number" && v > 0 ? v : "")}
        />
      </Bar>
    );
  }

  // BOTH → 2 batang per PIC
  return (
    <React.Fragment key={pic}>
      <Bar
        dataKey={`${pic}_single`}
        name={`${pic} (single)`}
        fill={COLORS[index % COLORS.length]}
        radius={[8, 8, 0, 0]}
      >
        <LabelList
          dataKey={`${pic}_single`}
          position="top"
          style={{ fontSize: 11, fontWeight: 600 }}
          formatter={(v) => (typeof v === "number" && v > 0 ? v : "")}
        />
      </Bar>

      <Bar
        dataKey={`${pic}_group`}
        name={`${pic} (group)`}
        fill={COLORS[(index + 5) % COLORS.length]}
        radius={[8, 8, 0, 0]}
      >
        <LabelList
          dataKey={`${pic}_group`}
          position="top"
          style={{ fontSize: 11, fontWeight: 600 }}
          formatter={(v) => (typeof v === "number" && v > 0 ? v : "")}
        />
      </Bar>
    </React.Fragment>
  );
})}


{showLines &&
  selectedPIC.map((pic, index) => {
    const keyBase =
      chartMode === "single"
        ? pic + "_single"
        : chartMode === "group"
        ? pic + "_group"
        : pic + "_total";

    return (
      <Line
        key={keyBase + "_line"}
        type="monotone"
        dataKey={keyBase}
        stroke={COLORS[index % COLORS.length]}
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 5 }}
        legendType="none"
        name=""
      />
    );
  })}


  
</BarChart>

            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 pt-20">
              Pilih minimal satu PIC untuk menampilkan chart.
            </div>
          )}
        </div>
      </div>

      {/* =============== TABS =============== */}
      <div className="w-full flex justify-start mb-6">
        <div className="flex bg-slate-100 p-1 rounded-full shadow-inner border">
          <button
            onClick={() => setActiveTab("single")}
            className={`px-6 py-2 rounded-full text-sm font-medium ${
              activeTab === "single"
                ? "bg-white shadow text-blue-600"
                : "text-slate-600"
            }`}
          >
            Single PIC
          </button>

          <button
            onClick={() => setActiveTab("group")}
            className={`px-6 py-2 rounded-full text-sm font-medium ${
              activeTab === "group"
                ? "bg-white shadow text-blue-600"
                : "text-slate-600"
            }`}
          >
            Group PIC
          </button>
        </div>
      </div>

      {/* =============== TABLE CARD =============== */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">

        {/* FILTER MONTH from Chart */}
        {selectedMonthFromChart && (
          <p className="text-sm text-blue-600 mb-3">
            Filter bulan:{" "}
            <strong>
              {MONTHS.find((m) =>
                m.startsWith(selectedMonthFromChart.toUpperCase())
              )}
            </strong>

            <button onClick={() => setSelectedMonthFromChart(null)} className="text-red-500 ml-4">
              (Clear)
            </button>
          </p>
        )}

        {/* ===== FILTER BAR ===== */}
        <div className="flex flex-wrap items-center gap-4 mb-4">

          {/* PIC */}
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Filter PIC:</label>
            <select
              value={selectedTablePIC}
              onChange={(e) => setSelectedTablePIC(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Semua PIC</option>
              {picOptions.map((pic) => (
                <option key={pic} value={pic}>{pic}</option>
              ))}
            </select>
          </div>

{/* Tahun */}
<div>
  <label className="text-sm font-medium text-gray-700 mr-2">
    Tahun:
  </label>
  <select
    value={selectedYear}
    onChange={(e) => setSelectedYear(e.target.value)}
    className="border rounded-lg px-3 py-2 text-sm"
  >
    <option value="">Semua</option>
    {yearOptions.map((y) => (
      <option key={y} value={y}>
        {y}
      </option>
    ))}
  </select>
</div>



          {/* Month */}
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Bulan:</label>
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Semua</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Semua</option>
              <option value="Belum">Belum</option>
              <option value="On Progress">On Progress</option>
              <option value="Sudah">Sudah</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PIC / Bulan / Cabang / Company / Status..."
              className="w-full border rounded-lg px-4 py-2 text-sm"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-600">
              <tr className="[&>*]:p-3 [&>*]:text-left [&>*]:font-semibold">
                <th>No</th>
                <th>PIC</th>
                <th>Month</th>
                <th>Estimasi</th>
                <th>Realisasi</th>
                <th>Range Hari</th>

                <th>Company</th>
                <th>Jabodetabek</th>
                <th>Luar Jabodetabek</th>
                <th>Cabang</th>
                <th>Warehouse</th>
                <th>Traditional</th>
                <th>Modern</th>
                <th>WH-Z</th>
                <th>No Laporan</th>

                <th>Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {paginatedData.map((row, idx) => {
                const globalIndex = (page - 1) * rowsPerPage + idx + 1;

                return (
                  <tr key={row.id || globalIndex} className="hover:bg-blue-50/40">
                    <td className="p-3">{globalIndex}</td>

                    <td className="p-3">{toPicArray(row.pic).join(", ")}</td>

                    <td className="p-3">{row.bulan}</td>

                    {/* Estimasi */}
                    <td className="p-3">{formatTanggalEstimasi(row)}</td>

                    {/* Realisasi */}
                    <td className="p-3">{formatTanggalRealisasi(row)}</td>
                    <td className="p-3 text-center">
  {getRealisasiRangeDays(formatTanggalRealisasi(row)) 
    ? `${getRealisasiRangeDays(formatTanggalRealisasi(row))} hari`
    : "-"}
</td>


                    <td className="p-3">{row.company ?? "-"}</td>
                    <td className="p-3">{row.jabodetabek ?? "-"}</td>
                    <td className="p-3">{row.luar_jabodetabek ?? "-"}</td>
                    <td className="p-3">{row.cabang ?? "-"}</td>
                    <td className="p-3">{row.warehouse ?? "-"}</td>
                    <td className="p-3">{row.tradisional ?? "-"}</td>
                    <td className="p-3">{row.modern ?? "-"}</td>
                    <td className="p-3">{row.wh_z ?? "-"}</td>
                    <td className="p-3">{row.no_laporan ?? "-"}</td>
                    <td className="p-3">
                      <span
                        className={`
                          px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            row.status === "Sudah"
                              ? "bg-green-100 text-green-700"
                              : row.status === "On Progress"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-200 text-slate-700"
                          }
                        `}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTable.length === 0 && (
            <div className="text-center text-gray-500 py-6">
              No data available.
            </div>
          )}
        </div>


<div className="mt-3 px-2 text-sm text-slate-600">
  Total Data: <strong>{filteredTable.length}</strong>
</div>


        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-4 px-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Rows per page:</span>

            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="border rounded-lg px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-1 rounded-lg border ${
                page === 1 ? "opacity-40" : "hover:bg-slate-100"
              }`}
            >
              Prev
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers(page, totalPages).map((pnum, i) =>
                pnum === -1 ? (
                  <span key={i} className="px-2">
                    …
                  </span>
                ) : (
                  <button
                    key={i}
                    onClick={() => setPage(pnum)}
                    className={`px-3 py-1 rounded-lg border ${
                      pnum === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    {pnum}
                  </button>
                )
              )}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`px-3 py-1 rounded-lg border ${
                page === totalPages ? "opacity-40" : "hover:bg-slate-100"
              }`}
            >
              Next
            </button>

            <span className="text-slate-600 ml-3">
              Page {page} of {totalPages}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
