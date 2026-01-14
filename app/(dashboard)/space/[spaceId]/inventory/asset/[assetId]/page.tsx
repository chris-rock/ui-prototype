"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Card, Badge, Button } from "@/components/ui";
import { DataTable } from "@/components/data-display";
import { ScoreGauge, DonutChart } from "@/components/charts";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeftIcon,
  ServerStackIcon,
  CloudIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CubeIcon,
  ClockIcon,
  TagIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

// Types
interface AssetDetail {
  id: string;
  mrn: string;
  name: string;
  platform: string;
  platformVersion: string;
  hostname: string;
  ipAddress?: string;
  state: "online" | "offline" | "unknown";
  score: number;
  grade: string;
  lastScan: string;
  firstScan: string;
  labels: Record<string, string>;
  scanStats: {
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    passingChecks: number;
    failingChecks: number;
    installedPackages: number;
  };
}

interface AssetVulnerability {
  id: string;
  cveId: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "none";
  cvssScore: number;
  package: string;
  installedVersion: string;
  fixedVersion?: string;
}

interface AssetPackage {
  id: string;
  name: string;
  version: string;
  type: string;
  vulnerabilities: number;
}

interface AssetCheck {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "none";
  state: "PASS" | "FAIL" | "SKIP" | "ERROR";
  policy: string;
  impact: number;
}

// Mock data
const mockAsset: AssetDetail = {
  id: "1",
  mrn: "//mondoo.app/asset/1",
  name: "prod-web-01",
  platform: "Ubuntu",
  platformVersion: "22.04 LTS",
  hostname: "prod-web-01.example.com",
  ipAddress: "10.0.1.15",
  state: "online",
  score: 78,
  grade: "B",
  lastScan: "2024-01-16T10:00:00Z",
  firstScan: "2023-06-15T08:00:00Z",
  labels: {
    environment: "production",
    team: "platform",
    service: "web",
    "cost-center": "engineering",
  },
  scanStats: {
    totalVulnerabilities: 18,
    criticalVulnerabilities: 1,
    highVulnerabilities: 3,
    mediumVulnerabilities: 8,
    lowVulnerabilities: 6,
    passingChecks: 145,
    failingChecks: 12,
    installedPackages: 234,
  },
};

const mockVulnerabilities: AssetVulnerability[] = [
  { id: "1", cveId: "CVE-2024-1234", title: "Remote Code Execution in OpenSSL", severity: "critical", cvssScore: 9.8, package: "openssl", installedVersion: "3.0.8", fixedVersion: "3.0.10" },
  { id: "2", cveId: "CVE-2024-2345", title: "Privilege Escalation in Linux Kernel", severity: "high", cvssScore: 7.8, package: "linux-kernel", installedVersion: "5.15.0-91", fixedVersion: "5.15.0-94" },
  { id: "3", cveId: "CVE-2024-3456", title: "Denial of Service in nginx", severity: "high", cvssScore: 7.5, package: "nginx", installedVersion: "1.24.0", fixedVersion: "1.24.1" },
  { id: "4", cveId: "CVE-2024-4567", title: "Information Disclosure in curl", severity: "medium", cvssScore: 5.3, package: "curl", installedVersion: "7.88.1" },
  { id: "5", cveId: "CVE-2024-5678", title: "Buffer Overflow in zlib", severity: "medium", cvssScore: 5.0, package: "zlib", installedVersion: "1.2.11", fixedVersion: "1.2.13" },
];

const mockPackages: AssetPackage[] = [
  { id: "1", name: "openssl", version: "3.0.8", type: "deb", vulnerabilities: 1 },
  { id: "2", name: "nginx", version: "1.24.0", type: "deb", vulnerabilities: 1 },
  { id: "3", name: "curl", version: "7.88.1", type: "deb", vulnerabilities: 1 },
  { id: "4", name: "linux-kernel", version: "5.15.0-91", type: "deb", vulnerabilities: 1 },
  { id: "5", name: "python3", version: "3.11.6", type: "deb", vulnerabilities: 0 },
  { id: "6", name: "nodejs", version: "18.19.0", type: "deb", vulnerabilities: 0 },
  { id: "7", name: "postgresql-client", version: "15.4", type: "deb", vulnerabilities: 0 },
  { id: "8", name: "docker-ce", version: "24.0.7", type: "deb", vulnerabilities: 0 },
];

const mockChecks: AssetCheck[] = [
  { id: "1", title: "Ensure SSH root login is disabled", severity: "high", state: "FAIL", policy: "CIS Ubuntu 22.04 LTS", impact: 80 },
  { id: "2", title: "Ensure password expiration is 365 days or less", severity: "medium", state: "FAIL", policy: "CIS Ubuntu 22.04 LTS", impact: 60 },
  { id: "3", title: "Ensure permissions on /etc/passwd are configured", severity: "critical", state: "PASS", policy: "CIS Ubuntu 22.04 LTS", impact: 90 },
  { id: "4", title: "Ensure audit log storage size is configured", severity: "medium", state: "FAIL", policy: "CIS Ubuntu 22.04 LTS", impact: 50 },
  { id: "5", title: "Ensure SSH Protocol is set to 2", severity: "high", state: "PASS", policy: "CIS Ubuntu 22.04 LTS", impact: 70 },
  { id: "6", title: "Ensure firewall is active", severity: "critical", state: "PASS", policy: "CIS Ubuntu 22.04 LTS", impact: 95 },
];

// Severity colors
const SEVERITY_COLORS = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#2563eb",
  none: "#16a34a",
};

function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, "critical" | "high" | "medium" | "low" | "success"> = {
    critical: "critical",
    high: "high",
    medium: "medium",
    low: "low",
    none: "success",
  };
  return (
    <Badge variant={variants[severity] || "secondary"} className="capitalize">
      {severity}
    </Badge>
  );
}

function CheckStateBadge({ state }: { state: string }) {
  const config: Record<string, { variant: "success" | "critical" | "medium" | "secondary"; icon: React.ComponentType<{ className?: string }> }> = {
    PASS: { variant: "success", icon: CheckCircleIcon },
    FAIL: { variant: "critical", icon: XCircleIcon },
    SKIP: { variant: "secondary", icon: ExclamationTriangleIcon },
    ERROR: { variant: "medium", icon: ExclamationTriangleIcon },
  };
  const { variant, icon: Icon } = config[state] || config.ERROR;
  return (
    <Badge variant={variant} className="inline-flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {state}
    </Badge>
  );
}

export default function AssetDetailPage() {
  const params = useParams();
  const spaceId = params?.spaceId as string;
  const assetId = params?.assetId as string;
  const [selectedTab, setSelectedTab] = useState(0);

  const asset = mockAsset; // In production, fetch from GraphQL

  // Vulnerability columns
  const vulnColumns: ColumnDef<AssetVulnerability>[] = [
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
    },
    {
      accessorKey: "cveId",
      header: "CVE ID",
      cell: ({ row }) => (
        <Link
          href={`/space/${spaceId}/findings/cve/${row.original.cveId}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.cveId}
        </Link>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-xs" title={row.original.title}>
          {row.original.title}
        </span>
      ),
    },
    {
      accessorKey: "package",
      header: "Package",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.package}</span>
      ),
    },
    {
      accessorKey: "installedVersion",
      header: "Installed",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.installedVersion}</span>
      ),
    },
    {
      accessorKey: "fixedVersion",
      header: "Fixed In",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-green-600">
          {row.original.fixedVersion || "—"}
        </span>
      ),
    },
  ];

  // Package columns
  const packageColumns: ColumnDef<AssetPackage>[] = [
    {
      accessorKey: "name",
      header: "Package",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.version}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary" size="sm">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "vulnerabilities",
      header: "Vulnerabilities",
      cell: ({ row }) => (
        <span
          className={cn(
            "font-medium",
            row.original.vulnerabilities > 0
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          )}
        >
          {row.original.vulnerabilities}
        </span>
      ),
    },
  ];

  // Check columns
  const checkColumns: ColumnDef<AssetCheck>[] = [
    {
      accessorKey: "state",
      header: "Status",
      cell: ({ row }) => <CheckStateBadge state={row.original.state} />,
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
    },
    {
      accessorKey: "title",
      header: "Check",
      cell: ({ row }) => (
        <div className="max-w-md">
          <span className="line-clamp-1 font-medium text-gray-900 dark:text-white">
            {row.original.title}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.policy}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "impact",
      header: "Impact",
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.original.impact}
        </span>
      ),
    },
  ];

  const tabs = [
    { name: "Vulnerabilities", count: asset.scanStats.totalVulnerabilities },
    { name: "Packages", count: asset.scanStats.installedPackages },
    { name: "Checks", count: asset.scanStats.passingChecks + asset.scanStats.failingChecks },
  ];

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link
        href={`/space/${spaceId}/inventory`}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Inventory
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
            <ServerStackIcon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {asset.name}
              </h1>
              <Badge
                variant={asset.state === "online" ? "success" : "secondary"}
                className="capitalize"
              >
                {asset.state}
              </Badge>
            </div>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {asset.platform} {asset.platformVersion} • {asset.hostname}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <ArrowPathIcon className="mr-2 h-4 w-4" />
            Rescan
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Score Card */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <ScoreGauge score={asset.score} size={120} />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Security Score
            </p>
          </div>
        </Card>

        {/* Vulnerability Stats */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Vulnerabilities
          </h3>
          <div className="mt-4 flex items-center justify-center">
            <DonutChart
              segments={[
                { label: "Critical", value: asset.scanStats.criticalVulnerabilities, color: SEVERITY_COLORS.critical },
                { label: "High", value: asset.scanStats.highVulnerabilities, color: SEVERITY_COLORS.high },
                { label: "Medium", value: asset.scanStats.mediumVulnerabilities, color: SEVERITY_COLORS.medium },
                { label: "Low", value: asset.scanStats.lowVulnerabilities, color: SEVERITY_COLORS.low },
              ]}
              centerValue={asset.scanStats.totalVulnerabilities}
              centerLabel="Total"
              size={100}
            />
          </div>
        </Card>

        {/* Check Stats */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Policy Checks
          </h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Passing</span>
              </div>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {asset.scanStats.passingChecks}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircleIcon className="h-5 w-5 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">Failing</span>
              </div>
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                {asset.scanStats.failingChecks}
              </span>
            </div>
          </div>
        </Card>

        {/* Scan Info */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Scan Info
          </h3>
          <dl className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <ClockIcon className="h-4 w-4" />
                Last Scan
              </dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {new Date(asset.lastScan).toLocaleDateString()}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <ClockIcon className="h-4 w-4" />
                First Scan
              </dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {new Date(asset.firstScan).toLocaleDateString()}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <CubeIcon className="h-4 w-4" />
                Packages
              </dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {asset.scanStats.installedPackages}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Labels */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <TagIcon className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Labels</h3>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(asset.labels).map(([key, value]) => (
            <Badge key={key} variant="secondary">
              {key}: {value}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
        <TabList className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                cn(
                  "relative -mb-px whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium transition-colors focus:outline-none",
                  selected
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                )
              }
            >
              {tab.name}
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                {tab.count}
              </span>
            </Tab>
          ))}
        </TabList>

        <TabPanels className="mt-6">
          {/* Vulnerabilities Tab */}
          <TabPanel>
            <DataTable columns={vulnColumns} data={mockVulnerabilities} pageSize={10} />
          </TabPanel>

          {/* Packages Tab */}
          <TabPanel>
            <DataTable columns={packageColumns} data={mockPackages} pageSize={10} />
          </TabPanel>

          {/* Checks Tab */}
          <TabPanel>
            <DataTable columns={checkColumns} data={mockChecks} pageSize={10} />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
