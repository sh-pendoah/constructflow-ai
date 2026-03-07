"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect /login → /auth (magic link login)
export default function LoginRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth");
  }, [router]);
  return null;
}

