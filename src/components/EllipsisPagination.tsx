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

  // Selalu tampilkan halaman pertama
  if (currentPage > 3) {
    pageNumbers.push(1, "…");
  }

  // Halaman sekitar current
  for (
    let i = Math.max(1, currentPage - 2);
    i <= Math.min(totalPages, currentPage + 2);
    i++
  ) {
    pageNumbers.push(i);
  }

  // Selalu tampilkan halaman terakhir
  if (currentPage < totalPages - 2) {
    pageNumbers.push("…", totalPages);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-6 select-none">
      {/* Prev */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center gap-1 px-3 py-1.5 border rounded-full text-sm transition 
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-gray-100"
      >
        <ChevronLeft size={16} /> Prev
      </button>

      {/* Page numbers */}
      {pageNumbers.map((p, i) =>
        typeof p === "number" ? (
          <button
            key={i}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 min-w-[36px] rounded-full border text-sm transition 
              ${
                p === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-100 border-gray-300"
              }`}
          >
            {p}
          </button>
        ) : (
          <span
            key={i}
            className="px-2 py-1 text-gray-500"
          >
            {p}
          </span>
        )
      )}

      {/* Next */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center gap-1 px-3 py-1.5 border rounded-full text-sm transition 
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-gray-100"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}
