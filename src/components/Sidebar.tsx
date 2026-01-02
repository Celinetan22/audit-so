"use client";

import {
  Menu,
  LayoutDashboard,
  FilePlus2,
  FileText,
  Database,
  Users,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}) {
  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-gray-50 text-gray-800 flex flex-col border-r border-gray-200 shadow-md transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white font-bold cursor-pointer"
        >
          SO
        </div>

        {!isCollapsed && (
          <button onClick={() => setIsCollapsed(true)}>
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem href="/input" icon={FilePlus2} label="Input Data" />
        <NavItem href="/laporan" icon={FileText} label="Update Plan SO" />
        <NavItem href="/status" icon={Database} label="Status Plan" />
        <NavItem href="/master" icon={Settings} label="Kelola Master" />
        <NavItem href="/master/pic" icon={Users} label="PIC SO" />
      </nav>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}
