"use client";

import { useRouter } from "next/navigation";
import MfaChallengeForm from "@/components/admin/MfaChallengeForm";

export default function MfaChallengeClient({ factorId }: { factorId: string }) {
  const router = useRouter();

  return (
    <MfaChallengeForm
      factorId={factorId}
      onSuccess={() => {
        router.replace("/admin");
        router.refresh();
      }}
    />
  );
}
