import Image from "next/image";

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  /** Class Tailwind cho kích thước + cỡ chữ, vd "h-8 w-8 text-sm". */
  className?: string;
  /** Hiện chấm xanh "đang online" ở góc dưới phải. */
  online?: boolean;
}

/** Ảnh đại diện thật (avatar Google) nếu có, không thì hiện chữ cái đầu tên trên nền màu — dùng chung cho account button và Presence. */
export default function Avatar({ name, avatarUrl, className = "h-8 w-8 text-sm", online = false }: AvatarProps) {
  return (
    <span className={`relative block shrink-0 ${className}`}>
      <span className="block h-full w-full overflow-hidden rounded-full ring-2 ring-card">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            fill
            sizes="32px"
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 font-semibold text-white">
            {(name[0] || "?").toUpperCase()}
          </span>
        )}
      </span>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-status-available ring-2 ring-card" />
      )}
    </span>
  );
}
