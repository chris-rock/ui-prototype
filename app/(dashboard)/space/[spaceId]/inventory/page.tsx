"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Card, Badge, Button, Input } from "@/components/ui";
import { DataTable, createSelectionColumn } from "@/components/data-display";
import { ScoreGauge } from "@/components/charts";
import { useScope } from "@/lib/scope";
import { type ColumnDef } from "@tanstack/react-table";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ServerStackIcon,
  CubeIcon,
  CloudIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  CircleStackIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

// Types
interface Asset {
  id: string;
  mrn: string;
  name: string;
  platform: string;
  platformIcon: "server" | "cloud" | "desktop" | "mobile" | "database";
  state: "online" | "offline" | "unknown";
  score: number;
  grade: string;
  vulnerabilities: number;
  lastScan: string;
  labels: string[];
}

interface Software {
  id: string;
  name: string;
  version: string;
  vendor?: string;
  installedCount: number;
  vulnerableCount: number;
  lastSeen: string;
}

// Mock data
const mockAssets: Asset[] = [
  { id: "1", mrn: "//mondoo.app/asset/1", name: "prod-web-01", platform: "Ubuntu 22.04 LTS", platformIcon: "server", state: "online", score: 78, grade: "B", vulnerabilities: 5, lastScan: "2024-01-16T10:00:00Z", labels: ["production", "web"] },
  { id: "2", mrn: "//mondoo.app/asset/2", name: "prod-web-02", platform: "Ubuntu 22.04 LTS", platformIcon: "server", state: "online", score: 82, grade: "A", vulnerabilities: 3, lastScan: "2024-01-16T10:00:00Z", labels: ["production", "web"] },
  { id: "3", mrn: "//mondoo.app/asset/3", name: "prod-api-01", platform: "Debian 12", platformIcon: "server", state: "online", score: 65, grade: "C", vulnerabilities: 12, lastScan: "2024-01-16T09:30:00Z", labels: ["production", "api"] },
  { id: "4", mrn: "//mondoo.app/asset/4", name: "staging-web-01", platform: "Ubuntu 22.04 LTS", platformIcon: "server", state: "online", score: 71, grade: "B", vulnerabilities: 8, lastScan: "2024-01-16T08:00:00Z", labels: ["staging"] },
  { id: "5", mrn: "//mondoo.app/asset/5", name: "dev-server-01", platform: "Ubuntu 20.04 LTS", platformIcon: "server", state: "offline", score: 45, grade: "D", vulnerabilities: 24, lastScan: "2024-01-15T22:00:00Z", labels: ["development"] },
  { id: "6", mrn: "//mondoo.app/asset/6", name: "aws-account-prod", platform: "AWS Account", platformIcon: "cloud", state: "online", score: 88, grade: "A", vulnerabilities: 2, lastScan: "2024-01-16T10:30:00Z", labels: ["production", "cloud"] },
  { id: "7", mrn: "//mondoo.app/asset/7", name: "gcp-project-main", platform: "GCP Project", platformIcon: "cloud", state: "online", score: 91, grade: "A", vulnerabilities: 1, lastScan: "2024-01-16T10:15:00Z", labels: ["production", "cloud"] },
  { id: "8", mrn: "//mondoo.app/asset/8", name: "k8s-prod-cluster", platform: "Kubernetes 1.28", platformIcon: "server", state: "online", score: 75, grade: "B", vulnerabilities: 7, lastScan: "2024-01-16T10:00:00Z", labels: ["production", "kubernetes"] },
  { id: "9", mrn: "//mondoo.app/asset/9", name: "prod-db-primary", platform: "PostgreSQL 15", platformIcon: "database", state: "online", score: 83, grade: "A", vulnerabilities: 2, lastScan: "2024-01-16T10:30:00Z", labels: ["production", "database"] },
  { id: "10", mrn: "//mondoo.app/asset/10", name: "office-workstation-01", platform: "macOS 14.2", platformIcon: "desktop", state: "online", score: 69, grade: "C", vulnerabilities: 6, lastScan: "2024-01-16T09:00:00Z", labels: ["corporate", "workstation"] },
];

const mockSoftware: Software[] = [
  { id: "1", name: "openssl", version: "3.0.8", vendor: "OpenSSL Foundation", installedCount: 12, vulnerableCount: 8, lastSeen: "2024-01-16T10:00:00Z" },
  { id: "2", name: "nginx", version: "1.24.0", vendor: "Nginx Inc", installedCount: 8, vulnerableCount: 2, lastSeen: "2024-01-16T10:00:00Z" },
  { id: "3", name: "postgresql", version: "15.4", vendor: "PostgreSQL Global Development Group", installedCount: 5, vulnerableCount: 1, lastSeen: "2024-01-16T10:30:00Z" },
  { id: "4", name: "nodejs", version: "18.19.0", vendor: "Node.js Foundation", installedCount: 15, vulnerableCount: 0, lastSeen: "2024-01-16T10:00:00Z" },
  { id: "5", name: "python", version: "3.11.6", vendor: "Python Software Foundation", installedCount: 20, vulnerableCount: 3, lastSeen: "2024-01-16T10:00:00Z" },
  { id: "6", name: "redis", version: "7.2.3", vendor: "Redis Ltd", installedCount: 6, vulnerableCount: 0, lastSeen: "2024-01-16T10:00:00Z" },
  { id: "7", name: "docker", version: "24.0.7", vendor: "Docker Inc", installedCount: 18, vulnerableCount: 1, lastSeen: "2024-01-16T10:00:00Z" },
  { id: "8", name: "linux-kernel", version: "5.15.0-91", vendor: "Linux Foundation", installedCount: 10, vulnerableCount: 4, lastSeen: "2024-01-16T10:00:00Z" },
];

// Platform icon component
function PlatformIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    server: ServerStackIcon,
    cloud: CloudIcon,
    desktop: ComputerDesktopIcon,
    mobile: DevicePhoneMobileIcon,
    database: CircleStackIcon,
  };
  const Icon = iconMap[type] || ServerStackIcon;
  return <Icon className="h-5 w-5 text-gray-400" />;
}

// Score badge component
function ScoreBadge({ score, grade }: { score: number; grade: string }) {
  const getColor = () => {
    if (score >= 80) return "success";
    if (score >= 60) return "low";
    if (score >= 40) return "medium";
    return "critical";
  };
  return (
    <Badge variant={getColor() as "success" | "low" | "medium" | "critical"}>
      {grade} ({score})
    </Badge>
  );
}

// State badge component
function StateBadge({ state }: { state: string }) {
  const variants: Record<string, "success" | "secondary" | "medium"> = {
    online: "success",
    offline: "secondary",
    unknown: "medium",
  };
  return (
    <Badge variant={variants[state] || "secondary"} size="sm" className="capitalize">
      {state}
    </Badge>
  );
}

export default function InventoryPage() {
  const params = useParams();
  const spaceId = params?.spaceId as string;
  const { spaceScope } = useScope();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);

  const counts = {
    assets: mockAssets.length,
    software: mockSoftware.length,
  };

  const tabs = [
    { name: "Assets", icon: ServerStackIcon, count: counts.assets },
    { name: "Software", icon: CubeIcon, count: counts.software },
  ];

  // Asset columns
  const assetColumns: ColumnDef<Asset>[] = useMemo(
    () => [
      createSelectionColumn<Asset>(),
      {
        accessorKey: "name",
        header: "Asset",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <PlatformIcon type={row.original.platformIcon} />
            <div>
              <Link
                href={`/space/${spaceId}/inventory/asset/${row.original.id}`}
                className="font-medium text-gray-900 hover:text-primary dark:text-white"
              >
                {row.original.name}
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {row.original.platform}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "state",
        header: "State",
        cell: ({ row }) => <StateBadge state={row.original.state} />,
      },
      {
        accessorKey: "score",
        header: "Score",
        cell: ({ row }) => (
          <ScoreBadge score={row.original.score} grade={row.original.grade} />
        ),
      },
      {
        accessorKey: "vulnerabilities",
        header: "Vulnerabilities",
        cell: ({ row }) => (
          <span
            className={cn(
              "font-medium",
              row.original.vulnerabilities > 10
                ? "text-red-600 dark:text-red-400"
                : row.original.vulnerabilities > 5
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-400"
            )}
          >
            {row.original.vulnerabilities}
          </span>
        ),
      },
      {
        accessorKey: "labels",
        header: "Labels",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.labels.slice(0, 2).map((label) => (
              <Badge key={label} variant="secondary" size="sm">
                {label}
              </Badge>
            ))}
            {row.original.labels.length > 2 && (
              <Badge variant="secondary" size="sm">
                +{row.original.labels.length - 2}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "lastScan",
        header: "Last Scan",
        cell: ({ row }) => (
          <span className="text-gray-500 dark:text-gray-400">
            {new Date(row.original.lastScan).toLocaleString()}
          </span>
        ),
      },
    ],
    [spaceId]
  );

  // Software columns
  const softwareColumns: ColumnDef<Software>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Package",
        cell: ({ row }) => (
          <div>
            <Link
              href={`/space/${spaceId}/inventory/software/${row.original.id}`}
              className="font-medium text-gray-900 hover:text-primary dark:text-white"
            >
              {row.original.name}
            </Link>
            {row.original.vendor && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {row.original.vendor}
              </p>
            )}
          </div>
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
        accessorKey: "installedCount",
        header: "Installed On",
        cell: ({ row }) => (
          <span className="text-gray-600 dark:text-gray-400">
            {row.original.installedCount} assets
          </span>
        ),
      },
      {
        accessorKey: "vulnerableCount",
        header: "Vulnerable",
        cell: ({ row }) => (
          <span
            className={cn(
              "font-medium",
              row.original.vulnerableCount > 0
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            )}
          >
            {row.original.vulnerableCount > 0
              ? `${row.original.vulnerableCount} assets`
              : "None"}
          </span>
        ),
      },
      {
        accessorKey: "lastSeen",
        header: "Last Seen",
        cell: ({ row }) => (
          <span className="text-gray-500 dark:text-gray-400">
            {new Date(row.original.lastSeen).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [spaceId]
  );

  // Filter data based on search
  const filteredAssets = mockAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.labels.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSoftware = mockSoftware.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const avgScore = Math.round(
    mockAssets.reduce((acc, a) => acc + a.score, 0) / mockAssets.length
  );
  const onlineAssets = mockAssets.filter((a) => a.state === "online").length;
  const totalVulnerabilities = mockAssets.reduce((acc, a) => acc + a.vulnerabilities, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Assets and software tracked in this space
          </p>
        </div>
        <Button variant="outline" size="sm">
          <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center">
              <ScoreGauge score={avgScore} size={48} showLabel={false} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgScore}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
              <ServerStackIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {onlineAssets}/{mockAssets.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
              <CubeIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Vulnerabilities</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalVulnerabilities}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
              <CubeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Packages</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockSoftware.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <FunnelIcon className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
        <TabList className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                cn(
                  "relative -mb-px flex items-center whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium transition-colors focus:outline-none",
                  selected
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                )
              }
            >
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.name}
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                {tab.count}
              </span>
            </Tab>
          ))}
        </TabList>

        <TabPanels className="mt-6">
          {/* Assets Tab */}
          <TabPanel>
            {filteredAssets.length > 0 ? (
              <DataTable
                columns={assetColumns}
                data={filteredAssets}
                enableRowSelection
                pageSize={10}
              />
            ) : (
              <EmptyState type="assets" spaceId={spaceId} />
            )}
          </TabPanel>

          {/* Software Tab */}
          <TabPanel>
            {filteredSoftware.length > 0 ? (
              <DataTable
                columns={softwareColumns}
                data={filteredSoftware}
                pageSize={10}
              />
            ) : (
              <EmptyState type="software" spaceId={spaceId} />
            )}
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

function EmptyState({ type, spaceId }: { type: string; spaceId: string }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
          {type === "assets" ? (
            <ServerStackIcon className="h-6 w-6 text-gray-400" />
          ) : (
            <CubeIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
          No {type} found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {type === "assets"
            ? "Connect your infrastructure to start tracking assets."
            : "Software inventory will be populated after scanning your assets."}
        </p>
        <Link
          href={`/space/${spaceId}/integrations`}
          className="mt-4 text-sm font-medium text-primary hover:text-primary-dark"
        >
          Add an integration to get started
        </Link>
      </div>
    </Card>
  );
}
