"use client";

import Link from "next/link";
import { X, UserCircle } from "lucide-react";
import { useState } from "react";

export default function GuestBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-amber-800">
        <UserCircle className="w-4 h-4 shrink-0" />
        <span className="font-medium">Guest Mode Active</span>
        <span className="hidden sm:inline text-amber-700">
          — Your work will not be saved. AI personalization and saved data require login.
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/auth"
          className="text-amber-900 font-semibold underline underline-offset-2 hover:text-amber-700 transition-colors"
        >
          Sign in
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-900 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
