"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { authActions } from "@/Redux/actions/auth";

function VerifyContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { magicLinkVerifying, magicLinkVerifyError, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const dispatched = useRef(false);

  useEffect(() => {
    // Only dispatch once; guard against React Strict Mode double-invocation
    // and against re-dispatching if already verifying or authenticated
    if (token && !dispatched.current && !magicLinkVerifying && !isAuthenticated && !magicLinkVerifyError) {
      dispatched.current = true;
      dispatch(authActions.verifyMagicTokenRequest(token));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div className="w-full max-w-[400px] flex flex-col items-center gap-6 px-8 py-10 rounded-2xl border border-custom bg-white-custom shadow-md-custom text-center">
        <XCircle className="w-12 h-12 text-red-400" />
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-primary font-poppins">
            Invalid Link
          </h1>
          <p className="text-sm text-gray-500">
            This magic link is missing or malformed.
          </p>
        </div>
        <Link
          href="/auth"
          className="w-full flex items-center justify-center h-10 rounded-lg bg-primary hover:bg-primary-hover text-primary-button text-sm font-semibold transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  if (magicLinkVerifyError) {
    return (
      <div className="w-full max-w-[400px] flex flex-col items-center gap-6 px-8 py-10 rounded-2xl border border-custom bg-white-custom shadow-md-custom text-center">
        <XCircle className="w-12 h-12 text-red-400" />
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-primary font-poppins">
            Link Expired or Invalid
          </h1>
          <p className="text-sm text-gray-500">{magicLinkVerifyError}</p>
        </div>
        <Link
          href="/auth"
          className="w-full flex items-center justify-center h-10 rounded-lg bg-primary hover:bg-primary-hover text-primary-button text-sm font-semibold transition-colors"
        >
          Request a New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] flex flex-col items-center gap-6 px-8 py-10 rounded-2xl border border-custom bg-white-custom shadow-md-custom text-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-primary font-poppins">
          {magicLinkVerifying ? "Signing you in…" : "Verifying your link…"}
        </h1>
        <p className="text-sm text-gray-500">Just a moment, please.</p>
      </div>
    </div>
  );
}

export default function VerifyMagicLinkPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Suspense
        fallback={
          <div className="w-full max-w-[400px] flex flex-col items-center gap-6 px-8 py-10 rounded-2xl border border-custom bg-white-custom shadow-md-custom text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-gray-500">Loading…</p>
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
