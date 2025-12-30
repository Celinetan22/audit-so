"use client";

import {
  UserCircle,
  Warehouse,
  Store,
  Wrench,
  MapPin,
  MapPinOff,
  GitBranch,
  ArrowLeft,
} from "lucide-react";

type Props = {
  activePage: string;
  setActivePage: (v: string) => void;
};

const MASTER_MENU = [
  { label: "PIC", key: "master-pic", icon: UserCircle },
  { label: "Warehouse", key: "master-warehouse", icon: Warehouse },
  { label: "Modern", key: "master-modern", icon: Store },
  { label: "Tradisional", key: "master-tradisional", icon: Store },
  { label: "Service Center", key: "master-service", icon: Wrench },
  { label: "Jabodetabek", key: "master-jabodetabek", icon: MapPin },
  { label: "Luar Jabodetabek", key: "master-luar-jabo", icon: MapPinOff },
  { label: "Cabang", key: "master-cabang", icon: GitBranch },
];

export default function MasterSidebar({
  activePage,
  setActivePage,
}: Props) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold text-slate-800">
          Master Data
        </h2>

        {/* ⬅️ BALIK KE DASHBOARD */}
        <button
          onClick={() => setActivePage("dashboard")}
          className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {MASTER_MENU.map((m) => {
          const Icon = m.icon;
          const active = activePage === m.key;

          return (
            <button
              key={m.key}
              onClick={() => setActivePage(m.key)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition
                ${
                  active
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              <Icon size={18} />
              {m.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
