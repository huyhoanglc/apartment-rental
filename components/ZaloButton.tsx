"use client";

import { useState } from "react";

interface ZaloButtonProps {
  code: string;
  title?: string;
  className?: string;
}

const ZALO_CONTACT = process.env.NEXT_PUBLIC_ZALO_CONTACT || "0901234567";

export default function ZaloButton({ code, title, className = "" }: ZaloButtonProps) {
  const [copied, setCopied] = useState(false);

  const message = `Chào bạn, mình quan tâm ${title ? `tin "${title}" ` : ""}mã căn ${code}, còn phòng không ạ?`;

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard không khả dụng (vd: http không an toàn) — vẫn mở Zalo bình thường
    }
  }

  return (
    <a
      href={`https://zalo.me/${ZALO_CONTACT}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-zalo px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 ${className}`}
    >
      Nhắn Zalo về mã {code}
      {copied && <span className="text-xs font-normal opacity-90">(đã copy tin nhắn)</span>}
    </a>
  );
}
