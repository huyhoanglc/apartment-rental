"use client";

import { useRouter } from "next/navigation";
import MfaEnrollForm from "@/components/admin/MfaEnrollForm";

export default function MfaSetupClient() {
  const router = useRouter();

  return (
    <MfaEnrollForm
      onSuccess={() => {
        router.replace("/admin");
        router.refresh();
      }}
    />
  );
}
