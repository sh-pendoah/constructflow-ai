"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface DashboardStats {
  expiring: {
    total: number;
    within30Days: number;
    within15Days: number;
    within7Days: number;
    expired: number;
  };
  reviewQueue: {
    pending: number;
    inReview: number;
    needsCorrection: number;
    urgent: number;
  };
  invoices: {
    overThreshold: number;
    pendingApproval: number;
  };
  dailyLogs: {
    pendingWCConfirmation: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch multiple endpoints in parallel
        const [expiringRes, queueRes, invoicesRes] = await Promise.all([
          axios.get(`${API_BASE}/api/coi-vendors/expiring`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE}/api/review-queue/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE}/api/invoices?status=pending`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const expiringDocs = expiringRes.data || [];
        const queueStats = queueRes.data || {};
        const invoices = invoicesRes.data.invoices || [];

        // Calculate expiring compliance items
        const now = new Date();
        const within30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const within15 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
        const within7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const expiring = {
          total: expiringDocs.length,
          within30Days: expiringDocs.filter((d: any) => 
            new Date(d.expirationDate) <= within30 && new Date(d.expirationDate) > within15
          ).length,
          within15Days: expiringDocs.filter((d: any) => 
            new Date(d.expirationDate) <= within15 && new Date(d.expirationDate) > within7
          ).length,
          within7Days: expiringDocs.filter((d: any) => 
            new Date(d.expirationDate) <= within7 && new Date(d.expirationDate) > now
          ).length,
          expired: expiringDocs.filter((d: any) => 
            new Date(d.expirationDate) <= now
          ).length
        };

        // Parse review queue stats
        const reviewQueue = {
          pending: queueStats.byStatus?.find((s: any) => s._id === 'pending')?.count || 0,
          inReview: queueStats.byStatus?.find((s: any) => s._id === 'in-review')?.count || 0,
          needsCorrection: queueStats.byStatus?.find((s: any) => s._id === 'needs-correction')?.count || 0,
          urgent: queueStats.byPriority?.find((p: any) => p._id === 'urgent')?.count || 0
        };

        // Calculate invoices over threshold (assuming $10,000 PM threshold)
        const invoicesData = {
          overThreshold: invoices.filter((inv: any) => inv.amount > 10000).length,
          pendingApproval: invoices.length
        };

        setStats({
          expiring,
          reviewQueue,
          invoices: invoicesData,
          dailyLogs: {
            pendingWCConfirmation: 0 // TODO: Add endpoint for this
          }
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_BASE]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-gray-500">Failed to load dashboard</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">System overview and operational metrics</p>

        {/* Compliance Expiring Summary */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Compliance Documents Expiring</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Expiring"
              value={stats.expiring.total}
              icon={<Clock className="w-6 h-6 text-blue-600" />}
              color="blue"
            />
            <StatCard
              title="Within 30 Days"
              value={stats.expiring.within30Days}
              icon={<AlertCircle className="w-6 h-6 text-yellow-600" />}
              color="yellow"
            />
            <StatCard
              title="Within 15 Days"
              value={stats.expiring.within15Days}
              icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
              color="orange"
            />
            <StatCard
              title="Within 7 Days"
              value={stats.expiring.within7Days}
              icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
              color="red"
            />
            <StatCard
              title="Expired"
              value={stats.expiring.expired}
              icon={<XCircle className="w-6 h-6 text-red-700" />}
              color="red"
              urgent
            />
          </div>
        </section>

        {/* Review Queue Summary */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Queue Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Pending Review"
              value={stats.reviewQueue.pending}
              icon={<Clock className="w-6 h-6 text-gray-600" />}
              color="gray"
            />
            <StatCard
              title="In Review"
              value={stats.reviewQueue.inReview}
              icon={<AlertCircle className="w-6 h-6 text-blue-600" />}
              color="blue"
            />
            <StatCard
              title="Needs Correction"
              value={stats.reviewQueue.needsCorrection}
              icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
              color="orange"
            />
            <StatCard
              title="Urgent"
              value={stats.reviewQueue.urgent}
              icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
              color="red"
              urgent
            />
          </div>
        </section>

        {/* Invoices Summary */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Over Threshold"
              value={stats.invoices.overThreshold}
              icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
              color="orange"
              subtitle="Requires owner approval"
            />
            <StatCard
              title="Pending Approval"
              value={stats.invoices.pendingApproval}
              icon={<Clock className="w-6 h-6 text-gray-600" />}
              color="gray"
            />
          </div>
        </section>

        {/* Daily Logs Summary */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Logs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Pending WC Confirmation"
              value={stats.dailyLogs.pendingWCConfirmation}
              icon={<AlertCircle className="w-6 h-6 text-blue-600" />}
              color="blue"
              subtitle="Workers Comp codes need review"
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              title="Review Queue"
              description="Review pending documents"
              href="/review-queue"
              color="blue"
            />
            <ActionCard
              title="Manage Compliance"
              description="View and update compliance documents"
              href="/company/coi-alerts"
              color="green"
            />
            <ActionCard
              title="Approval Rules"
              description="Configure approval thresholds"
              href="/company/approval-rules"
              color="purple"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'gray' | 'blue' | 'yellow' | 'orange' | 'red' | 'green' | 'purple';
  urgent?: boolean;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, urgent, subtitle }: StatCardProps) {
  const colorClasses = {
    gray: 'bg-gray-50 border-gray-200',
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div
      className={`${colorClasses[color]} border rounded-lg p-6 ${
        urgent ? 'ring-2 ring-red-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  color: 'blue' | 'green' | 'purple';
}

function ActionCard({ title, description, href, color }: ActionCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
  };

  return (
    <a
      href={href}
      className={`${colorClasses[color]} text-white rounded-lg p-6 transition-colors block`}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-white/90">{description}</p>
    </a>
  );
}
