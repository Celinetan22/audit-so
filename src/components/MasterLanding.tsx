"use client";

import Link from "next/link";
import {
  Users,
  Warehouse,
  UserCircle,
  GitBranch,
  ArrowRight,
  Store,
} from "lucide-react";

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
    href: "/master/modern", // ⬅️ PENTING
    icon: Store,
  },
  {
    label: "Users",
    desc: "Kelola data user & role",
    href: "/master/users",
    icon: Users,
  },
  {
    label: "Cabang",
    desc: "Kelola struktur & hirarki cabang",
    href: "/master/cabang",
    icon: GitBranch,
    highlight: true,
  },
];

export default function MasterLanding() {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="w-full px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">
            Master Data
          </h1>
          <p className="text-slate-500 mt-1">
            Pusat pengelolaan data utama sistem
          </p>
        </div>

        {/* Cards */}
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {MASTER_MENU.map((m) => {
            const Icon = m.icon;

            return (
              <Link
                key={m.href}
                href={m.href}
                className={`group relative overflow-hidden rounded-2xl border bg-white p-6
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-xl
                  ${
                    m.highlight
                      ? "border-blue-500 ring-1 ring-blue-100"
                      : "border-slate-200"
                  }`}
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl
                    ${
                      m.highlight
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
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

                <span
                  className={`absolute bottom-0 left-0 h-1 w-full
                    ${
                      m.highlight
                        ? "bg-gradient-to-r from-blue-500 to-blue-400"
                        : "bg-slate-200 group-hover:bg-slate-300"
                    }`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
