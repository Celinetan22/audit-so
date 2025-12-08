"use client";

import React from "react";

interface PageWrapperProps {
  title: string;
  children: React.ReactNode;
  rightContent?: React.ReactNode; // opsional untuk tombol, filter, dll
}

export default function PageWrapper({
  title,
  children,
  rightContent,
}: PageWrapperProps) {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex justify-center p-8">
      <div className="w-full max-w-[1600px] bg-white rounded-2xl shadow-lg border border-slate-200 px-10 py-8 transition">
        {/* === Header === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            {title}
          </h2>
          {rightContent && <div className="mt-4 md:mt-0">{rightContent}</div>}
        </div>

        {/* === Content === */}
        <div>{children}</div>
      </div>
    </div>
  );
}
