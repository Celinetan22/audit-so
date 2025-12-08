"use client";

import React, { useState, useRef, useEffect } from "react";

export default function MultiSelectPIC({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const ref = useRef<HTMLDivElement>(null);

  // tutup dropdown kalau klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (pic: string) => {
    if (value.includes(pic)) {
      onChange(value.filter((v) => v !== pic));
    } else {
      onChange([...value, pic]);
    }
  };

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-80" ref={ref}>
      {/* main box */}
      <div
        className="border rounded-lg p-2 bg-white flex flex-wrap gap-2 min-h-[42px] cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {value.length === 0 && (
          <span className="text-gray-400">Select PIC</span>
        )}

        {value.map((v) => (
          <span
            key={v}
            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs flex items-center gap-1"
          >
            {v}
            <button
              className="text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onChange(value.filter((x) => x !== v));
              }}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {/* dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-12 bg-white border rounded-lg shadow-md z-20 max-h-64 overflow-auto p-2">
          {/* search */}
          <input
            type="text"
            placeholder="Search PIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border px-2 py-1 rounded mb-2"
          />

          {filtered.map((pic) => (
            <label
              key={pic}
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(pic)}
                onChange={() => toggle(pic)}
              />
              {pic}
            </label>
          ))}

          {filtered.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-2">
              No PIC found
            </p>
          )}
        </div>
      )}
    </div>
  );
}
