"use client";

import { Mascot } from "page-mascot";

export default function LoginMascot() {
  return (
    <Mascot
      directions="/mascots/fox-directions.webp"
      reactions="/mascots/fox-reactions.webp"
      size={80}
      className="mb-2"
    />
  );
}
