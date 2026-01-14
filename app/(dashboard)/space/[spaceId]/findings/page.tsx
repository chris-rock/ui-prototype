"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Card, Badge, Button, Input } from "@/components/ui";
import { DataTable, createSelectionColumn, TriageToolbar, ExceptionsList, type ExceptionFormData } from "@/components/data-display";
import { type RowSelectionState } from "@tanstack/react-table";
import { useScope } from "@/lib/scope";
import { type ColumnDef } from "@tanstack/react-table";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

// Types for findings
interface Vulnerability {
  id: string;
  mrn: string;
  cveId: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "none";
  cvssScore: number;
  affectedAssets: number;
  fixedBy?: string;
  state: string;
  publishedAt: string;
}

interface Advisory {
  id: string;
  mrn: string;
  advisoryId: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "none";
  affectedAssets: number;
  publishedAt: string;
  cves: { id: string; cveId: string }[];
}

interface Check {
  id: string;
  mrn: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "none";
  impact: number;
  state: string;
  affectedAssets: number;
  passingAssets: number;
  policy?: { name: string; mrn: string };
}

// Mock data for demonstration
const mockVulnerabilities: Vulnerability[] = [
  { id: "1", mrn: "//mondoo.app/vuln/CVE-2024-1234", cveId: "CVE-2024-1234", title: "Remote Code Execution in OpenSSL", severity: "critical", cvssScore: 9.8, affectedAssets: 12, fixedBy: "3.0.10", state: "OPEN", publishedAt: "2024-01-15" },
  { id: "2", mrn: "//mondoo.app/vuln/CVE-2024-2345", cveId: "CVE-2024-2345", title: "Privilege Escalation in Linux Kernel", severity: "high", cvssScore: 7.8, affectedAssets: 8, fixedBy: "5.15.0-91", state: "OPEN", publishedAt: "2024-01-10" },
  { id: "3", mrn: "//mondoo.app/vuln/CVE-2024-3456", cveId: "CVE-2024-3456", title: "SQL Injection in PostgreSQL", severity: "high", cvssScore: 8.1, affectedAssets: 3, state: "OPEN", publishedAt: "2024-01-08" },
  { id: "4", mrn: "//mondoo.app/vuln/CVE-2024-4567", cveId: "CVE-2024-4567", title: "Cross-Site Scripting in React", severity: "medium", cvssScore: 5.4, affectedAssets: 15, fixedBy: "18.2.1", state: "OPEN", publishedAt: "2024-01-05" },
  { id: "5", mrn: "//mondoo.app/vuln/CVE-2024-5678", cveId: "CVE-2024-5678", title: "Information Disclosure in nginx", severity: "low", cvssScore: 3.7, affectedAssets: 5, state: "OPEN", publishedAt: "2024-01-03" },
];

const mockAdvisories: Advisory[] = [
  { id: "1", mrn: "//mondoo.app/advisory/RHSA-2024-0001", advisoryId: "RHSA-2024-0001", title: "Important: kernel security update", severity: "high", affectedAssets: 8, publishedAt: "2024-01-12", cves: [{ id: "1", cveId: "CVE-2024-2345" }] },
  { id: "2", mrn: "//mondoo.app/advisory/USN-6580-1", advisoryId: "USN-6580-1", title: "OpenSSL vulnerabilities", severity: "critical", affectedAssets: 12, publishedAt: "2024-01-11", cves: [{ id: "1", cveId: "CVE-2024-1234" }] },
  { id: "3", mrn: "//mondoo.app/advisory/DSA-5601-1", advisoryId: "DSA-5601-1", title: "postgresql-15 security update", severity: "high", affectedAssets: 3, publishedAt: "2024-01-09", cves: [{ id: "1", cveId: "CVE-2024-3456" }] },
];

const mockChecks: Check[] = [
  { id: "1", mrn: "//mondoo.app/check/1", title: "Ensure SSH root login is disabled", severity: "high", impact: 80, state: "FAIL", affectedAssets: 5, passingAssets: 18, policy: { name: "CIS Linux Benchmark", mrn: "//mondoo.app/policy/cis" } },
  { id: "2", mrn: "//mondoo.app/check/2", title: "Ensure password expiration is 365 days or less", severity: "medium", impact: 60, state: "FAIL", affectedAssets: 12, passingAssets: 11, policy: { name: "CIS Linux Benchmark", mrn: "//mondoo.app/policy/cis" } },
  { id: "3", mrn: "//mondoo.app/check/3", title: "Ensure audit log storage size is configured", severity: "medium", impact: 50, state: "FAIL", affectedAssets: 3, passingAssets: 20, policy: { name: "CIS Linux Benchmark", mrn: "//mondoo.app/policy/cis" } },
  { id: "4", mrn: "//mondoo.app/check/4", title: "Ensure permissions on /etc/shadow are configured", severity: "critical", impact: 90, state: "FAIL", affectedAssets: 2, passingAssets: 21, policy: { name: "CIS Linux Benchmark", mrn: "//mondoo.app/policy/cis" } },
];

// Severity badge component
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

export default function FindingsPage() {
  const params = useParams();
  const spaceId = params?.spaceId as string;
  const { spaceScope } = useScope();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [cveSelection, setCveSelection] = useState<RowSelectionState>({});
  const [advisorySelection, setAdvisorySelection] = useState<RowSelectionState>({});
  const [checkSelection, setCheckSelection] = useState<RowSelectionState>({});

  // Calculate total selected items
  const totalSelected =
    Object.keys(cveSelection).length +
    Object.keys(advisorySelection).length +
    Object.keys(checkSelection).length;

  // Handlers
  const handleClearSelection = () => {
    setCveSelection({});
    setAdvisorySelection({});
    setCheckSelection({});
  };

  const handleCreateException = (data: ExceptionFormData) => {
    console.log("Creating exception:", data);
    // In production, call GraphQL mutation
    alert(`Exception created for ${totalSelected} items`);
  };

  const handleExport = () => {
    console.log("Exporting selected items");
    // In production, generate and download export
    alert(`Exporting ${totalSelected} items`);
  };

  // Calculate counts
  const counts = {
    all: mockVulnerabilities.length + mockAdvisories.length + mockChecks.length,
    cves: mockVulnerabilities.length,
    advisories: mockAdvisories.length,
    checks: mockChecks.length,
    exceptions: 0,
  };

  const tabs = [
    { name: "All", count: counts.all },
    { name: "CVEs", count: counts.cves },
    { name: "Advisories", count: counts.advisories },
    { name: "Checks", count: counts.checks },
    { name: "Exceptions", count: counts.exceptions },
  ];

  // CVE columns
  const cveColumns: ColumnDef<Vulnerability>[] = useMemo(
    () => [
      createSelectionColumn<Vulnerability>(),
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
          <span className="line-clamp-1 max-w-md" title={row.original.title}>
            {row.original.title}
          </span>
        ),
      },
      {
        accessorKey: "cvssScore",
        header: "CVSS",
        cell: ({ row }) => (
          <span className="font-mono">{row.original.cvssScore.toFixed(1)}</span>
        ),
      },
      {
        accessorKey: "affectedAssets",
        header: "Affected",
        cell: ({ row }) => (
          <span className="text-gray-600 dark:text-gray-400">
            {row.original.affectedAssets} assets
          </span>
        ),
      },
      {
        accessorKey: "fixedBy",
        header: "Fixed By",
        cell: ({ row }) => (
          <span className="font-mono text-sm text-gray-500">
            {row.original.fixedBy || "—"}
          </span>
        ),
      },
    ],
    [spaceId]
  );

  // Advisory columns
  const advisoryColumns: ColumnDef<Advisory>[] = useMemo(
    () => [
      createSelectionColumn<Advisory>(),
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
      },
      {
        accessorKey: "advisoryId",
        header: "Advisory ID",
        cell: ({ row }) => (
          <Link
            href={`/space/${spaceId}/findings/advisory/${row.original.advisoryId}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.advisoryId}
          </Link>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-md" title={row.original.title}>
            {row.original.title}
          </span>
        ),
      },
      {
        accessorKey: "cves",
        header: "CVEs",
        cell: ({ row }) => (
          <span className="text-gray-600 dark:text-gray-400">
            {row.original.cves.length} CVE{row.original.cves.length !== 1 ? "s" : ""}
          </span>
        ),
      },
      {
        accessorKey: "affectedAssets",
        header: "Affected",
        cell: ({ row }) => (
          <span className="text-gray-600 dark:text-gray-400">
            {row.original.affectedAssets} assets
          </span>
        ),
      },
    ],
    [spaceId]
  );

  // Check columns
  const checkColumns: ColumnDef<Check>[] = useMemo(
    () => [
      createSelectionColumn<Check>(),
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
            <Link
              href={`/space/${spaceId}/findings/check/${row.original.id}`}
              className="font-medium text-gray-900 hover:text-primary dark:text-white"
            >
              <span className="line-clamp-1">{row.original.title}</span>
            </Link>
            {row.original.policy && (
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                {row.original.policy.name}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "impact",
        header: "Impact",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={cn(
                  "h-2 rounded-full",
                  row.original.impact >= 80
                    ? "bg-red-500"
                    : row.original.impact >= 60
                      ? "bg-orange-500"
                      : row.original.impact >= 40
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                )}
                style={{ width: `${row.original.impact}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {row.original.impact}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "affectedAssets",
        header: "Failing",
        cell: ({ row }) => (
          <span className="text-red-600 dark:text-red-400">
            {row.original.affectedAssets}
          </span>
        ),
      },
      {
        accessorKey: "passingAssets",
        header: "Passing",
        cell: ({ row }) => (
          <span className="text-green-600 dark:text-green-400">
            {row.original.passingAssets}
          </span>
        ),
      },
    ],
    [spaceId]
  );

  // Filter data based on search
  const filteredVulnerabilities = mockVulnerabilities.filter(
    (v) =>
      v.cveId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdvisories = mockAdvisories.filter(
    (a) =>
      a.advisoryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChecks = mockChecks.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Findings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Security vulnerabilities, advisories, and policy checks
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard
          icon={ShieldExclamationIcon}
          label="Critical"
          value={mockVulnerabilities.filter((v) => v.severity === "critical").length + mockAdvisories.filter((a) => a.severity === "critical").length}
          color="critical"
        />
        <StatCard
          icon={ExclamationTriangleIcon}
          label="High"
          value={mockVulnerabilities.filter((v) => v.severity === "high").length + mockAdvisories.filter((a) => a.severity === "high").length}
          color="high"
        />
        <StatCard
          icon={ExclamationTriangleIcon}
          label="Medium"
          value={mockVulnerabilities.filter((v) => v.severity === "medium").length + mockChecks.filter((c) => c.severity === "medium").length}
          color="medium"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Failing Checks"
          value={mockChecks.filter((c) => c.state === "FAIL").length}
          color="low"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search findings..."
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
          {/* All Tab */}
          <TabPanel>
            <div className="space-y-6">
              {filteredVulnerabilities.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    CVEs ({filteredVulnerabilities.length})
                  </h3>
                  <DataTable
                    columns={cveColumns}
                    data={filteredVulnerabilities}
                    enableRowSelection
                    onRowSelectionChange={setCveSelection}
                    pageSize={5}
                  />
                </div>
              )}
              {filteredAdvisories.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Advisories ({filteredAdvisories.length})
                  </h3>
                  <DataTable
                    columns={advisoryColumns}
                    data={filteredAdvisories}
                    enableRowSelection
                    onRowSelectionChange={setAdvisorySelection}
                    pageSize={5}
                  />
                </div>
              )}
              {filteredChecks.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Checks ({filteredChecks.length})
                  </h3>
                  <DataTable
                    columns={checkColumns}
                    data={filteredChecks}
                    enableRowSelection
                    onRowSelectionChange={setCheckSelection}
                    pageSize={5}
                  />
                </div>
              )}
            </div>
          </TabPanel>

          {/* CVEs Tab */}
          <TabPanel>
            {filteredVulnerabilities.length > 0 ? (
              <DataTable
                columns={cveColumns}
                data={filteredVulnerabilities}
                enableRowSelection
                onRowSelectionChange={setCveSelection}
                pageSize={10}
              />
            ) : (
              <EmptyState type="cves" spaceId={spaceId} />
            )}
          </TabPanel>

          {/* Advisories Tab */}
          <TabPanel>
            {filteredAdvisories.length > 0 ? (
              <DataTable
                columns={advisoryColumns}
                data={filteredAdvisories}
                enableRowSelection
                onRowSelectionChange={setAdvisorySelection}
                pageSize={10}
              />
            ) : (
              <EmptyState type="advisories" spaceId={spaceId} />
            )}
          </TabPanel>

          {/* Checks Tab */}
          <TabPanel>
            {filteredChecks.length > 0 ? (
              <DataTable
                columns={checkColumns}
                data={filteredChecks}
                enableRowSelection
                onRowSelectionChange={setCheckSelection}
                pageSize={10}
              />
            ) : (
              <EmptyState type="checks" spaceId={spaceId} />
            )}
          </TabPanel>

          {/* Exceptions Tab */}
          <TabPanel>
            <ExceptionsList
              spaceId={spaceId}
              onDelete={(id) => {
                console.log("Deleting exception:", id);
                // In production, call GraphQL mutation
              }}
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Triage Toolbar */}
      <TriageToolbar
        selectedCount={totalSelected}
        onClearSelection={handleClearSelection}
        onCreateException={handleCreateException}
        onExport={handleExport}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "critical" | "high" | "medium" | "low";
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    critical: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    high: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    medium: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    low: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("rounded-lg p-2", colorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ type, spaceId }: { type: string; spaceId: string }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
          <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
          No {type === "all" ? "findings" : type} found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {type === "all"
            ? "Run a scan to discover security findings in your assets."
            : type === "exceptions"
              ? "No exceptions have been created in this space."
              : `No ${type} have been detected in this space.`}
        </p>
        {type !== "exceptions" && (
          <Link
            href={`/space/${spaceId}/integrations`}
            className="mt-4 text-sm font-medium text-primary hover:text-primary-dark"
          >
            Add an integration to get started
          </Link>
        )}
      </div>
    </Card>
  );
}
