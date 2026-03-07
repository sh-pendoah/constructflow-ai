"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { authActions } from "@/Redux/actions/auth";
import { resetMagicLink } from "@/Redux/reducers/auth";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { isLoading, magicLinkSent, magicLinkError } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
    return "";
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError("");
    dispatch(authActions.requestMagicLinkRequest({ email: email.trim().toLowerCase() }));
  };

  const handleResend = () => {
    dispatch(resetMagicLink());
    dispatch(authActions.requestMagicLinkRequest({ email: email.trim().toLowerCase() }));
  };

  const handleTryAgain = () => {
    dispatch(resetMagicLink());
    setEmail("");
    setEmailError("");
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-[480px] flex flex-col items-center gap-8 px-8 pt-10 pb-8 rounded-2xl border border-custom bg-white-custom shadow-md-custom text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-primary font-poppins">
              Check your email
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              We sent a secure sign-in link to{" "}
              <span className="font-medium text-gray-700">{email}</span>.
              Click the link to sign in — no password needed.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              The link expires in 15 minutes.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Resend link"
              )}
            </button>
            <button
              onClick={handleTryAgain}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-[480px] flex flex-col items-center gap-10 px-8 pt-11 pb-8 rounded-2xl border border-custom bg-white-custom shadow-md-custom">
        {/* Logo */}
        <div className="w-[220px] h-[78px] relative">
          <Image
            src="/images/docflow-360-logo.png"
            alt="docflow-360 Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-[26px] leading-tight font-semibold text-primary font-poppins">
              Sign in to your account
            </h1>
            <p className="text-sm text-gray-500">
              Enter your email and we&apos;ll send you a secure sign-in link.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(validateEmail(e.target.value));
                }}
                className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${
                  emailError
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-200"
                }`}
              />
            </div>
            {emailError && (
              <p className="text-xs text-red-500 mt-0.5">{emailError}</p>
            )}
            {magicLinkError && (
              <p className="text-xs text-red-500 mt-0.5">{magicLinkError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex items-center h-11 justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover transition-colors font-poppins text-base font-semibold text-primary-button cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Send Login Link"
            )}
          </button>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            We&apos;ll email you a magic link — no password required.
          </p>
        </form>

        <div className="w-full border-t border-gray-100 pt-4 flex items-center justify-center gap-1 text-sm">
          <span className="text-gray-500">Want to explore first?</span>
          <Link href="/dashboard" className="text-primary font-medium hover:opacity-80 transition-opacity">
            Continue as guest
          </Link>
        </div>
      </div>
    </div>
  );
}

