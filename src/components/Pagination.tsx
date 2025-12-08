import React from "react";

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalItems,
  rowsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  return (
    <div className="flex justify-end items-center gap-6 mt-6">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`px-6 py-3 rounded-xl text-base font-medium flex items-center gap-2 transition-colors duration-200
          ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md"
          }`}
      >
        ⬅️ <span>Prev</span>
      </button>

      <span className="text-base font-semibold text-gray-700">
        Halaman {currentPage} dari {totalPages || 1}
      </span>

      <button
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => onPageChange(currentPage + 1)}
        className={`px-6 py-3 rounded-xl text-base font-medium flex items-center gap-2 transition-colors duration-200
          ${
            currentPage === totalPages || totalPages === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow-md"
          }`}
      >
        <span>Next</span> ➡️
      </button>
    </div>
  );
}
