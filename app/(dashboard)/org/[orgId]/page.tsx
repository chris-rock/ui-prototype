"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Badge, Button } from "@/components/ui";
import { DonutChart, BarChart } from "@/components/charts";
import { useViewer } from "@/lib/viewer";
import {
  BuildingOfficeIcon,
  FolderIcon,
  UserGroupIcon,
  CreditCardIcon,
  PlusIcon,
  ArrowRightIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// Severity colors
const SEVERITY_COLORS = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#2563eb",
  none: "#16a34a",
};

export default function OrganizationDashboardPage() {
  const params = useParams();
  const orgId = params?.orgId as string;
  const { viewer, findOrg } = useViewer();

  const organization = findOrg(orgId);

  // Mock data - in production, this would come from GraphQL
  const mockData = {
    totalAssets: 523,
    totalFindings: 89,
    avgScore: 74,
    spaces: [
      { id: "space-1", name: "Production", score: 82, assets: 156, findings: 23 },
      { id: "space-2", name: "Staging", score: 75, assets: 89, findings: 31 },
      { id: "space-3", name: "Development", score: 68, assets: 234, findings: 28 },
      { id: "space-4", name: "CI/CD", score: 91, assets: 44, findings: 7 },
    ],
    findingsBySeverity: {
      critical: 5,
      high: 18,
      medium: 34,
      low: 32,
    },
  };

  if (!organization) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Organization not found</p>
      </div>
    );
  }

  const totalFindings = Object.values(mockData.findingsBySeverity).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <BuildingOfficeIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {organization.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {organization.description || "Organization overview"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <UserGroupIcon className="mr-2 h-4 w-4" />
            Members
          </Button>
          <Button size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Space
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Spaces"
          value={organization.spacesCount || mockData.spaces.length}
          icon={FolderIcon}
          description="Active spaces"
        />
        <StatCard
          title="Total Assets"
          value={mockData.totalAssets}
          icon={ChartBarIcon}
          description="Across all spaces"
        />
        <StatCard
          title="Open Findings"
          value={mockData.totalFindings}
          icon={ChartBarIcon}
          description="Security issues"
        />
        <StatCard
          title="Avg Score"
          value={mockData.avgScore}
          suffix="/100"
          icon={ChartBarIcon}
          description="Organization average"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Spaces List */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Spaces
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Security status by space
                </p>
              </div>
              <Link
                href={`/org/${orgId}/spaces`}
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                View all
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {mockData.spaces.map((space) => (
                <Link
                  key={space.id}
                  href={`/space/${space.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-primary hover:shadow-sm dark:border-gray-700 dark:hover:border-primary"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <FolderIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {space.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {space.assets} assets • {space.findings} findings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ScoreBadge score={space.score} />
                    <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Findings by Severity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Findings by Severity
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Across all spaces
          </p>
          <div className="mt-6">
            <DonutChart
              segments={[
                { label: "Critical", value: mockData.findingsBySeverity.critical, color: SEVERITY_COLORS.critical },
                { label: "High", value: mockData.findingsBySeverity.high, color: SEVERITY_COLORS.high },
                { label: "Medium", value: mockData.findingsBySeverity.medium, color: SEVERITY_COLORS.medium },
                { label: "Low", value: mockData.findingsBySeverity.low, color: SEVERITY_COLORS.low },
              ]}
              centerValue={totalFindings}
              centerLabel="Total"
            />
          </div>
        </Card>
      </div>

      {/* Space Scores Bar Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Space Security Scores
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Compare security posture across spaces
        </p>
        <div className="mt-6">
          <BarChart
            items={mockData.spaces.map((space) => ({
              label: space.name,
              value: space.score,
              color: space.score >= 80 ? SEVERITY_COLORS.none : space.score >= 60 ? SEVERITY_COLORS.low : space.score >= 40 ? SEVERITY_COLORS.medium : SEVERITY_COLORS.critical,
            }))}
            maxValue={100}
            height={20}
          />
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 sm:grid-cols-3">
        <QuickActionCard
          title="Manage Members"
          description="Invite users and manage permissions"
          icon={UserGroupIcon}
          href={`/org/${orgId}/members`}
        />
        <QuickActionCard
          title="Billing"
          description="View subscription and usage"
          icon={CreditCardIcon}
          href={`/org/${orgId}/settings`}
        />
        <QuickActionCard
          title="Create Space"
          description="Add a new project space"
          icon={PlusIcon}
          href={`/org/${orgId}/spaces/new`}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

function StatCard({ title, value, suffix, icon: Icon, description }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
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
}

function ScoreBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return "success";
    if (score >= 60) return "low";
    if (score >= 40) return "medium";
    return "critical";
  };

  const getGrade = () => {
    if (score >= 80) return "A";
    if (score >= 60) return "B";
    if (score >= 40) return "C";
    if (score >= 20) return "D";
    return "F";
  };

  return (
    <Badge variant={getColor() as "success" | "low" | "medium" | "critical"}>
      {getGrade()} ({score})
    </Badge>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

function QuickActionCard({ title, description, icon: Icon, href }: QuickActionCardProps) {
  return (
    <Link href={href}>
      <Card className="p-6 transition-all hover:border-primary hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
