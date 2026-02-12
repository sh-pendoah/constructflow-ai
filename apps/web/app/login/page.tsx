"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/Redux/Apis/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const resp = await login(email, password);
      const token = resp?.data?.token;

      if (!token) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("token", token);
      document.cookie = `auth_token=${token}; Path=/; Max-Age=${60 * 60 * 24 * 30}`;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-6">Sign In</h1>

        <label className="block mb-3">
          <span className="text-sm text-gray-700">Email</span>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-gray-700">Password</span>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Don&apos;t have an account? <a className="text-blue-600" href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
}

