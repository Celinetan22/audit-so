import React from "react";

export const highlightText = (text: string, search: string) => {
  if (!search) return text;

  const regex = new RegExp(`(${search})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="bg-yellow-300 font-bold">{part}</span>
    ) : (
      part
    )
  );
};
