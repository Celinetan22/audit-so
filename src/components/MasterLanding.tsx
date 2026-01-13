"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Warehouse,
  ArrowLeft,
  UserCircle,
  GitBranch,
  ArrowRight,
  Store,
  Wrench,
  MapPin,
  MapPinOff,
} from "lucide-react";

/* =========================
   PROPS
========================= */
type MasterLandingProps = {
  setActivePage?: (page: "dashboard" | "kelolaMaster" | "input") => void;
};

/* =========================
   MENU DATA
========================= */
const MASTER_MENU = [
  {
    label: "PIC",
    desc: "Kelola data PIC",
    href: "/master/pic",
    icon: UserCircle,
  },
  {
    label: "Warehouse",
    desc: "Kelola data warehouse",
    href: "/master/warehouse",
    icon: Warehouse,
  },
  {
    label: "Modern",
    desc: "Kelola data modern",
    href: "/master/modern",
    icon: Store,
  },
  {
    label: "Users",
    desc: "Kelola data user & role",
    href: "/master/kelola-user",
    icon: Users,
  },
  {
    label: "Tradisional",
    desc: "Kelola data outlet tradisional",
    href: "/master/tradisional",
    icon: Store,
  },
  {
    label: "WH - Z",
    desc: "Kelola data WH - Z",
    href: "/master/service-center",
    icon: Wrench,
  },
  {
    label: "Jabodetabek",
    desc: "Kelola area dalam Jabodetabek",
    href: "/master/jabodetabek",
    icon: MapPin,
  },
  {
    label: "Luar Jabodetabek",
    desc: "Kelola area di luar Jabodetabek",
    href: "/master/luar-jabodetabek",
    icon: MapPinOff,
  },
  {
    label: "Cabang",
    desc: "Kelola struktur & hirarki cabang",
    href: "/master/cabang",
    icon: GitBranch,
  },
];

/* =========================
   COMPONENT
========================= */
export default function MasterLanding({
  setActivePage,
}: MasterLandingProps) {
  const router = useRouter();

  const handleBack = () => {
    if (setActivePage) {
      // SPA MODE
      setActivePage("dashboard");
    } else {
      // ROUTE MODE
      router.push("/"); // ← sesuaikan kalau dashboard kamu bukan "/"
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="w-full px-6 py-10">

        {/* ===== HEADER ===== */}
        <div className="mb-10 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl
              border border-slate-200 text-slate-600
              hover:bg-slate-100 hover:text-slate-800
              transition active:scale-95"
            title="Kembali"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Master Data
            </h1>
            <p className="text-slate-500 mt-1">
              Pusat pengelolaan data utama sistem
            </p>
          </div>
        </div>

        {/* ===== CARDS ===== */}
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {MASTER_MENU.map((m) => {
            const Icon = m.icon;

            return (
              <Link
                key={m.href}
                href={m.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl
                  bg-slate-100 text-slate-600"
                >
                  <Icon size={22} />
                </div>

                <h3 className="text-lg font-semibold text-slate-800">
                  {m.label}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {m.desc}
                </p>

                <div className="mt-6 flex items-center text-sm font-medium text-blue-600 opacity-0 transition group-hover:opacity-100">
                  Buka
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>

                <span className="absolute bottom-0 left-0 h-1 w-full bg-slate-200 group-hover:bg-slate-300" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
