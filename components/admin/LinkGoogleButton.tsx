"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LinkGoogleButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/admin/security` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Thành công thì trình duyệt tự chuyển sang Google, không cần setLoading(false).
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted disabled:opacity-60"
      >
        {loading ? "Đang chuyển hướng..." : "+ Liên kết Google"}
      </button>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
