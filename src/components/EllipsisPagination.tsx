"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PaginationProps = {
  currentPage: number;
  totalRows: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
};

export default function EllipsisPagination({
  currentPage,
  totalRows,
  rowsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  if (totalPages <= 1) return null;

  const pageNumbers: (number | string)[] = [];

  // First page logic
  if (currentPage > 2) {
    pageNumbers.push(1, "dots-left");
  }

  // Only show current -1, current, current +1
  for (
    let i = Math.max(1, currentPage - 1);
    i <= Math.min(totalPages, currentPage + 1);
    i++
  ) {
    pageNumbers.push(i);
  }

  // Last page logic
  if (currentPage < totalPages - 1) {
    pageNumbers.push("dots-right", totalPages);
  }

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Prev */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="
          w-10 h-10 rounded-full border border-slate-200
          flex items-center justify-center
          bg-white text-slate-600
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-blue-50 hover:border-blue-200
          transition-all duration-200
        "
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((p, i) =>
        typeof p === "number" ? (
          <button
            key={i}
            onClick={() => onPageChange(p)}
            className={`
              w-10 h-10 rounded-full
              flex items-center justify-center
              text-sm font-bold transition-all duration-200
              ${
                p === currentPage
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-blue-50"
              }
            `}
          >
            {p}
          </button>
        ) : (
         <span
  key={i}
  className="
    px-2
    text-slate-400
    text-sm
    font-bold
    select-none
  "
>
  …
</span>

        )
      )}

      {/* Next */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="
          w-10 h-10 rounded-full border border-slate-200
          flex items-center justify-center
          bg-white text-slate-600
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-blue-50 hover:border-blue-200
          transition-all duration-200
        "
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
