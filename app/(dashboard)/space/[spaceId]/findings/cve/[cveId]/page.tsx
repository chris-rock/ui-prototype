"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, Badge, Button } from "@/components/ui";
import { DataTable } from "@/components/data-display";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  ClockIcon,
  LinkIcon,
  ServerIcon,
  CubeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

// Types
interface AffectedPackage {
  id: string;
  name: string;
  version: string;
  fixedVersion?: string;
  assetCount: number;
}

interface AffectedAsset {
  id: string;
  name: string;
  platform: string;
  packageVersion: string;
  lastScan: string;
}

interface Reference {
  url: string;
  title: string;
}

interface CVEDetail {
  id: string;
  cveId: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "none";
  cvssScore: number;
  cvssVector: string;
  publishedAt: string;
  modifiedAt: string;
  affectedAssets: number;
  fixedBy?: string;
  state: string;
  references: Reference[];
  affectedPackages: AffectedPackage[];
}

// Mock data
const mockCVEDetail: CVEDetail = {
  id: "1",
  cveId: "CVE-2024-1234",
  title: "Remote Code Execution in OpenSSL",
  description: `A critical vulnerability has been discovered in OpenSSL that allows remote attackers to execute arbitrary code via a specially crafted certificate chain. The vulnerability exists in the X.509 certificate verification, where improper validation of certificate data can lead to a buffer overflow.

This vulnerability affects applications that use OpenSSL for TLS connections and process X.509 certificates from untrusted sources. Exploitation requires the attacker to present a malicious certificate to a vulnerable client or server.

The vulnerability has a CVSS score of 9.8, indicating critical severity. Organizations using affected versions should update immediately.`,
  severity: "critical",
  cvssScore: 9.8,
  cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
  publishedAt: "2024-01-15T10:00:00Z",
  modifiedAt: "2024-01-16T14:30:00Z",
  affectedAssets: 12,
  fixedBy: "3.0.10",
  state: "OPEN",
  references: [
    { url: "https://nvd.nist.gov/vuln/detail/CVE-2024-1234", title: "NVD Entry" },
    { url: "https://www.openssl.org/news/secadv/20240115.txt", title: "OpenSSL Security Advisory" },
    { url: "https://github.com/openssl/openssl/commit/abc123", title: "GitHub Commit" },
  ],
  affectedPackages: [
    { id: "1", name: "openssl", version: "3.0.8", fixedVersion: "3.0.10", assetCount: 8 },
    { id: "2", name: "openssl", version: "3.0.9", fixedVersion: "3.0.10", assetCount: 4 },
    { id: "3", name: "libssl3", version: "3.0.8-1ubuntu1", fixedVersion: "3.0.10-1ubuntu1", assetCount: 12 },
  ],
};

const mockAffectedAssets: AffectedAsset[] = [
  { id: "1", name: "prod-web-01", platform: "Ubuntu 22.04", packageVersion: "3.0.8", lastScan: "2024-01-16T10:00:00Z" },
  { id: "2", name: "prod-web-02", platform: "Ubuntu 22.04", packageVersion: "3.0.8", lastScan: "2024-01-16T10:00:00Z" },
  { id: "3", name: "prod-api-01", platform: "Debian 12", packageVersion: "3.0.9", lastScan: "2024-01-16T09:30:00Z" },
  { id: "4", name: "staging-web-01", platform: "Ubuntu 22.04", packageVersion: "3.0.8", lastScan: "2024-01-16T08:00:00Z" },
  { id: "5", name: "dev-server-01", platform: "Ubuntu 20.04", packageVersion: "3.0.8", lastScan: "2024-01-15T22:00:00Z" },
];

// CVSS Vector breakdown
function parseCVSSVector(vector: string): Record<string, { label: string; value: string; color: string }> {
  const metrics: Record<string, { label: string; values: Record<string, { label: string; color: string }> }> = {
    AV: { label: "Attack Vector", values: { N: { label: "Network", color: "critical" }, A: { label: "Adjacent", color: "high" }, L: { label: "Local", color: "medium" }, P: { label: "Physical", color: "low" } } },
    AC: { label: "Attack Complexity", values: { L: { label: "Low", color: "critical" }, H: { label: "High", color: "low" } } },
    PR: { label: "Privileges Required", values: { N: { label: "None", color: "critical" }, L: { label: "Low", color: "medium" }, H: { label: "High", color: "low" } } },
    UI: { label: "User Interaction", values: { N: { label: "None", color: "critical" }, R: { label: "Required", color: "low" } } },
    S: { label: "Scope", values: { U: { label: "Unchanged", color: "low" }, C: { label: "Changed", color: "critical" } } },
    C: { label: "Confidentiality", values: { H: { label: "High", color: "critical" }, L: { label: "Low", color: "medium" }, N: { label: "None", color: "low" } } },
    I: { label: "Integrity", values: { H: { label: "High", color: "critical" }, L: { label: "Low", color: "medium" }, N: { label: "None", color: "low" } } },
    A: { label: "Availability", values: { H: { label: "High", color: "critical" }, L: { label: "Low", color: "medium" }, N: { label: "None", color: "low" } } },
  };

  const result: Record<string, { label: string; value: string; color: string }> = {};
  const parts = vector.split("/").slice(1); // Skip version prefix

  parts.forEach((part) => {
    const [key, val] = part.split(":");
    if (metrics[key] && metrics[key].values[val]) {
      result[key] = {
        label: metrics[key].label,
        value: metrics[key].values[val].label,
        color: metrics[key].values[val].color,
      };
    }
  });

  return result;
}

function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, "critical" | "high" | "medium" | "low" | "success"> = {
    critical: "critical",
    high: "high",
    medium: "medium",
    low: "low",
    none: "success",
  };
  return (
    <Badge variant={variants[severity] || "secondary"} size="lg" className="capitalize">
      {severity}
    </Badge>
  );
}

export default function CVEDetailPage() {
  const params = useParams();
  const spaceId = params?.spaceId as string;
  const cveId = params?.cveId as string;
  const [showExceptionModal, setShowExceptionModal] = useState(false);

  const cve = mockCVEDetail; // In production, fetch from GraphQL
  const cvssBreakdown = parseCVSSVector(cve.cvssVector);

  // Asset columns
  const assetColumns: ColumnDef<AffectedAsset>[] = [
    {
      accessorKey: "name",
      header: "Asset",
      cell: ({ row }) => (
        <Link
          href={`/space/${spaceId}/inventory/asset/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "platform",
      header: "Platform",
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-gray-400">{row.original.platform}</span>
      ),
    },
    {
      accessorKey: "packageVersion",
      header: "Version",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.packageVersion}</span>
      ),
    },
    {
      accessorKey: "lastScan",
      header: "Last Scan",
      cell: ({ row }) => (
        <span className="text-gray-500 dark:text-gray-400">
          {new Date(row.original.lastScan).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link
        href={`/space/${spaceId}/findings`}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Findings
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <SeverityBadge severity={cve.severity} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {cve.cveId}
            </h1>
          </div>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{cve.title}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowExceptionModal(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Exception
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Description
            </h2>
            <div className="mt-4 space-y-3 text-gray-600 dark:text-gray-400">
              {cve.description.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </Card>

          {/* CVSS Breakdown */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                CVSS Vector
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {cve.cvssScore.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">/10</span>
              </div>
            </div>
            <p className="mt-2 font-mono text-sm text-gray-500">{cve.cvssVector}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(cvssBreakdown).map(([key, { label, value, color }]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                  <Badge
                    variant={color as "critical" | "high" | "medium" | "low"}
                    size="sm"
                  >
                    {value}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Affected Packages */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Affected Packages
            </h2>
            <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
              {cve.affectedPackages.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <CubeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {pkg.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Version {pkg.version}
                        {pkg.fixedVersion && (
                          <span>
                            {" "}
                            → <span className="text-green-600">Fixed in {pkg.fixedVersion}</span>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{pkg.assetCount} assets</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Affected Assets */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Affected Assets
              </h2>
              <Link
                href={`/space/${spaceId}/inventory?cve=${cve.cveId}`}
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                View all
              </Link>
            </div>
            <div className="mt-4">
              <DataTable columns={assetColumns} data={mockAffectedAssets} pageSize={5} />
            </div>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Summary
            </h3>
            <dl className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <ShieldExclamationIcon className="h-4 w-4" />
                  Severity
                </dt>
                <dd>
                  <SeverityBadge severity={cve.severity} />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  CVSS Score
                </dt>
                <dd className="font-semibold text-gray-900 dark:text-white">
                  {cve.cvssScore.toFixed(1)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <ServerIcon className="h-4 w-4" />
                  Affected Assets
                </dt>
                <dd className="font-semibold text-gray-900 dark:text-white">
                  {cve.affectedAssets}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <ClockIcon className="h-4 w-4" />
                  Published
                </dt>
                <dd className="text-gray-900 dark:text-white">
                  {new Date(cve.publishedAt).toLocaleDateString()}
                </dd>
              </div>
              {cve.fixedBy && (
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Fixed By</dt>
                  <dd className="font-mono text-sm text-green-600">{cve.fixedBy}</dd>
                </div>
              )}
            </dl>
          </Card>

          {/* References */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              References
            </h3>
            <ul className="mt-4 space-y-3">
              {cve.references.map((ref, i) => (
                <li key={i}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <LinkIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{ref.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Card>

          {/* State */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Status
            </h3>
            <div className="mt-4">
              <Badge
                variant={cve.state === "OPEN" ? "critical" : "success"}
                size="lg"
                className="w-full justify-center"
              >
                {cve.state}
              </Badge>
              <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                Last modified: {new Date(cve.modifiedAt).toLocaleDateString()}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
