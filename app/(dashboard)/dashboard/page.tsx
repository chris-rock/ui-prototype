"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useViewer } from "@/lib/viewer";
import { Card, Button, Badge } from "@/components/ui";
import { ScoreGauge } from "@/components/charts";
import {
  BuildingOfficeIcon,
  FolderIcon,
  ArrowRightIcon,
  PlusIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

/**
 * Dashboard home page - shows spaces/organizations and guides user to select one.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const { viewer, isLoading } = useViewer();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const hasFirstSpace = viewer?.firstSpace;
  const organizations = viewer?.organizations || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {viewer?.name || user?.displayName || "User"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your security dashboard overview
          </p>
        </div>
        {hasFirstSpace && (
          <Link href={`/space/${viewer.firstSpace?.id}`}>
            <Button>
              <RocketLaunchIcon className="mr-2 h-4 w-4" />
              Go to Space
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Access Card */}
      {hasFirstSpace && (
        <Card className="overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {/* Space Info */}
            <div className="flex-1 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FolderIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {viewer.firstSpace?.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {viewer.firstSpace?.organization?.name || "Your primary space"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <QuickStat label="Priority Findings" value={viewer.firstSpace?.priorityFindings || 0} />
                <QuickStat label="Assets" value="--" />
                <QuickStat label="Score" value="--" />
              </div>

              <div className="mt-6 flex gap-3">
                <Link href={`/space/${viewer.firstSpace?.id}`}>
                  <Button size="sm">
                    View Dashboard
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/space/${viewer.firstSpace?.id}/findings`}>
                  <Button variant="outline" size="sm">
                    View Findings
                  </Button>
                </Link>
              </div>
            </div>

            {/* Score Preview */}
            <div className="flex items-center justify-center border-t border-gray-200 bg-gray-50 p-6 sm:border-l sm:border-t-0 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="text-center">
                <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Security Score
                </p>
                <ScoreGauge score={72} size={120} showLabel={false} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Organizations Section */}
      {organizations.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Organizations
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <Link key={org.id} href={`/org/${org.id}`}>
                <Card className="p-5 transition-all hover:border-primary hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {org.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {org.spacesCount} {org.spacesCount === 1 ? "space" : "spaces"}
                        </p>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  {org.subscriptionInfo?.basePlan && (
                    <div className="mt-3">
                      <Badge variant="primary" size="sm">
                        {org.subscriptionInfo.basePlan.name}
                      </Badge>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasFirstSpace && organizations.length === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheckIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
            Welcome to Mondoo
          </h2>
          <p className="mx-auto mt-2 max-w-md text-gray-500 dark:text-gray-400">
            Get started by creating your first space to begin scanning your infrastructure for security vulnerabilities.
          </p>
          <div className="mt-6">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Your First Space
            </Button>
          </div>
        </Card>
      )}

      {/* Getting Started */}
      {hasFirstSpace && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Getting Started
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <GettingStartedCard
              step={1}
              title="Add an Integration"
              description="Connect your cloud providers, infrastructure, or CI/CD pipelines"
              href={`/space/${viewer.firstSpace?.id}/integrations`}
              completed={false}
            />
            <GettingStartedCard
              step={2}
              title="Review Findings"
              description="Triage security issues and create exceptions where needed"
              href={`/space/${viewer.firstSpace?.id}/findings`}
              completed={false}
            />
            <GettingStartedCard
              step={3}
              title="Enable Compliance"
              description="Track against security frameworks like CIS, SOC2, or PCI"
              href={`/space/${viewer.firstSpace?.id}/compliance`}
              completed={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

interface GettingStartedCardProps {
  step: number;
  title: string;
  description: string;
  href: string;
  completed: boolean;
}

function GettingStartedCard({ step, title, description, href, completed }: GettingStartedCardProps) {
  return (
    <Link href={href}>
      <Card className={`p-5 transition-all hover:border-primary hover:shadow-md ${completed ? "opacity-60" : ""}`}>
        <div className="flex items-start gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
            completed
              ? "bg-success/10 text-success"
              : "bg-primary/10 text-primary"
          }`}>
            {step}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">{title}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  );
}
