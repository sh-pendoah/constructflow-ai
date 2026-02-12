"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/Redux/Apis/api";

type Profile = {
  name?: string;
  email?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const resp = await getProfile(token);
        const user = resp?.data?.user || resp?.data?.data || {};
        setProfile({ name: user.name, email: user.email });
      } catch {
        localStorage.removeItem("token");
        document.cookie = "auth_token=; Path=/; Max-Age=0";
        router.push("/login");
        return;
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    document.cookie = "auth_token=; Path=/; Max-Age=0";
    router.push("/login");
  };

  if (loading) {
    return <div className="py-10 text-sm text-gray-600">Loading...</div>;
  }

  return (
    <div className="py-10">
      <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
      <p className="text-lg mb-1">Welcome, {profile?.name || "User"}!</p>
      <p className="text-gray-700 mb-6">{profile?.email || ""}</p>

      <button
        type="button"
        onClick={handleSignOut}
        className="px-4 py-2 rounded-md bg-gray-900 text-white"
      >
        Sign Out
      </button>
    </div>
  );
}

