"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui";
import { DonutChart, ScoreGauge, BarChart } from "@/components/charts";
import { useScope } from "@/lib/scope";
import {
  ShieldExclamationIcon,
  ServerStackIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Severity colors matching Tailwind theme
const SEVERITY_COLORS = {
  critical: "#dc2626", // red-600
  high: "#ea580c",     // orange-600
  medium: "#ca8a04",   // yellow-600
  low: "#2563eb",      // blue-600
  none: "#16a34a",     // green-600
  unknown: "#6b7280",  // gray-500
};

export default function SpaceDashboardPage() {
  const params = useParams();
  const spaceId = params?.spaceId as string;
  const { spaceScope, isLoading } = useScope();

  // Mock data - in production, this would come from GraphQL queries
  const mockData = {
    riskScore: 72,
    assetCount: 156,
    findingsCount: 42,
    criticalFindings: 3,
    vulnerabilities: {
      critical: 3,
      high: 12,
      medium: 18,
      low: 9,
      none: 0,
    },
    advisories: {
      critical: 1,
      high: 5,
      medium: 8,
      low: 4,
      none: 0,
    },
    checks: {
      pass: 234,
      fail: 42,
      error: 3,
      skip: 12,
    },
    recentFindings: [
      { id: "1", title: "CVE-2024-0001", severity: "critical", asset: "web-server-01", time: "2h ago" },
      { id: "2", title: "CVE-2024-0002", severity: "high", asset: "db-server-02", time: "4h ago" },
      { id: "3", title: "CVE-2024-0003", severity: "medium", asset: "api-gateway", time: "6h ago" },
    ],
    topAssets: [
      { name: "web-server-01", score: 45, findings: 12 },
      { name: "db-server-02", score: 62, findings: 8 },
      { name: "api-gateway", score: 78, findings: 5 },
      { name: "cache-server", score: 85, findings: 3 },
    ],
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const vulnTotal = Object.values(mockData.vulnerabilities).reduce((a, b) => a + b, 0);
  const advisoryTotal = Object.values(mockData.advisories).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {spaceScope?.name || "Space Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Security overview and risk assessment
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Security Score"
          value={mockData.riskScore}
          suffix="/100"
          icon={CheckCircleIcon}
          color={mockData.riskScore >= 70 ? "success" : mockData.riskScore >= 40 ? "warning" : "error"}
          description="Overall posture"
        />
        <StatCard
          title="Critical Findings"
          value={mockData.criticalFindings}
          icon={ExclamationTriangleIcon}
          color="error"
          description="Requires attention"
          href={`/space/${spaceId}/findings?severity=critical`}
        />
        <StatCard
          title="Total Assets"
          value={mockData.assetCount}
          icon={ServerStackIcon}
          color="primary"
          description="Monitored resources"
          href={`/space/${spaceId}/inventory`}
        />
        <StatCard
          title="Open Findings"
          value={mockData.findingsCount}
          icon={ShieldExclamationIcon}
          color="warning"
          description="All severities"
          href={`/space/${spaceId}/findings`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score Gauge */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Risk Score
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overall security posture
          </p>
          <div className="mt-6 flex justify-center">
            <ScoreGauge score={mockData.riskScore} size={180} />
          </div>
        </Card>

        {/* Vulnerabilities Donut */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Vulnerabilities
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                CVEs by severity
              </p>
            </div>
            <Link
              href={`/space/${spaceId}/findings?type=cve`}
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              View all
            </Link>
          </div>
          <div className="mt-6">
            <DonutChart
              segments={[
                { label: "Critical", value: mockData.vulnerabilities.critical, color: SEVERITY_COLORS.critical },
                { label: "High", value: mockData.vulnerabilities.high, color: SEVERITY_COLORS.high },
                { label: "Medium", value: mockData.vulnerabilities.medium, color: SEVERITY_COLORS.medium },
                { label: "Low", value: mockData.vulnerabilities.low, color: SEVERITY_COLORS.low },
              ]}
              centerValue={vulnTotal}
              centerLabel="Total"
            />
          </div>
        </Card>

        {/* Advisories Donut */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Advisories
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Security advisories
              </p>
            </div>
            <Link
              href={`/space/${spaceId}/findings?type=advisory`}
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              View all
            </Link>
          </div>
          <div className="mt-6">
            <DonutChart
              segments={[
                { label: "Critical", value: mockData.advisories.critical, color: SEVERITY_COLORS.critical },
                { label: "High", value: mockData.advisories.high, color: SEVERITY_COLORS.high },
                { label: "Medium", value: mockData.advisories.medium, color: SEVERITY_COLORS.medium },
                { label: "Low", value: mockData.advisories.low, color: SEVERITY_COLORS.low },
              ]}
              centerValue={advisoryTotal}
              centerLabel="Total"
            />
          </div>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Critical Findings */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Findings
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Latest security issues
              </p>
            </div>
            <Link
              href={`/space/${spaceId}/findings`}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
            >
              View all
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
            {mockData.recentFindings.map((finding) => (
              <div key={finding.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <SeverityDot severity={finding.severity} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {finding.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {finding.asset}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <ClockIcon className="h-4 w-4" />
                  {finding.time}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Assets by Risk */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assets at Risk
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Lowest scoring assets
              </p>
            </div>
            <Link
              href={`/space/${spaceId}/inventory`}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
            >
              View all
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4">
            <BarChart
              items={mockData.topAssets.map((asset) => ({
                label: asset.name,
                value: asset.score,
                color: asset.score >= 70 ? SEVERITY_COLORS.none : asset.score >= 40 ? SEVERITY_COLORS.medium : SEVERITY_COLORS.critical,
              }))}
              maxValue={100}
              height={16}
            />
          </div>
        </Card>
      </div>

      {/* Policy Checks */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Policy Checks
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Security policy compliance
            </p>
          </div>
          <Link
            href={`/space/${spaceId}/findings?type=check`}
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            View all
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <CheckStatBox label="Passed" value={mockData.checks.pass} color="success" />
          <CheckStatBox label="Failed" value={mockData.checks.fail} color="error" />
          <CheckStatBox label="Errors" value={mockData.checks.error} color="warning" />
          <CheckStatBox label="Skipped" value={mockData.checks.skip} color="gray" />
        </div>
      </Card>
    </div>
  );
}

// Helper Components

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "primary" | "success" | "warning" | "error";
  description: string;
  href?: string;
}

function StatCard({ title, value, suffix, icon: Icon, color, description, href }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
  };

  const content = (
    <Card className="p-6 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {href && <ArrowRightIcon className="h-4 w-4 text-gray-400" />}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
          {value}
          {suffix && <span className="text-lg text-gray-500">{suffix}</span>}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-critical",
    high: "bg-high",
    medium: "bg-medium",
    low: "bg-low",
    none: "bg-none",
  };

  return <span className={`h-2 w-2 rounded-full ${colors[severity] || "bg-gray-400"}`} />;
}

interface CheckStatBoxProps {
  label: string;
  value: number;
  color: "success" | "error" | "warning" | "gray";
}

function CheckStatBox({ label, value, color }: CheckStatBoxProps) {
  const colorClasses = {
    success: "border-success/30 bg-success/5",
    error: "border-error/30 bg-error/5",
    warning: "border-warning/30 bg-warning/5",
    gray: "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50",
  };

  const textClasses = {
    success: "text-success",
    error: "text-error",
    warning: "text-warning",
    gray: "text-gray-600 dark:text-gray-400",
  };

  return (
    <div className={`rounded-lg border p-4 text-center ${colorClasses[color]}`}>
      <p className={`text-2xl font-bold ${textClasses[color]}`}>{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  );
}
