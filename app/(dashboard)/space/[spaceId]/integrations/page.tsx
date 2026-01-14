"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, Button, Input } from "@/components/ui";
import { useScope } from "@/lib/scope";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  CloudIcon,
  ServerIcon,
  CodeBracketIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";

const integrationCategories = [
  {
    name: "Cloud Providers",
    icon: CloudIcon,
    integrations: [
      { name: "AWS", description: "Amazon Web Services" },
      { name: "Azure", description: "Microsoft Azure" },
      { name: "GCP", description: "Google Cloud Platform" },
    ],
  },
  {
    name: "Infrastructure",
    icon: ServerIcon,
    integrations: [
      { name: "Kubernetes", description: "Container orchestration" },
      { name: "VMware", description: "Virtual machines" },
      { name: "SSH", description: "Remote servers" },
    ],
  },
  {
    name: "CI/CD",
    icon: CodeBracketIcon,
    integrations: [
      { name: "GitHub Actions", description: "GitHub workflow integration" },
      { name: "GitLab CI", description: "GitLab pipeline integration" },
      { name: "Jenkins", description: "Jenkins pipeline integration" },
    ],
  },
  {
    name: "SaaS",
    icon: CircleStackIcon,
    integrations: [
      { name: "Okta", description: "Identity management" },
      { name: "Slack", description: "Team communication" },
      { name: "GitHub", description: "Code repositories" },
    ],
  },
];

export default function IntegrationsPage() {
  const params = useParams();
  const spaceId = params?.spaceId as string;
  const { spaceScope } = useScope();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Integrations
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Connect your infrastructure and services
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Active Integrations */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Active Integrations
        </h2>
        <Card className="mt-4 p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No integrations configured yet
            </p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              Add an integration below to start scanning your infrastructure
            </p>
          </div>
        </Card>
      </div>

      {/* Available Integrations */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Available Integrations
        </h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {integrationCategories.map((category) => (
            <Card key={category.name} className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h3>
              </div>
              <div className="mt-4 space-y-3">
                {category.integrations.map((integration) => (
                  <button
                    key={integration.name}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:hover:border-primary"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {integration.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {integration.description}
                      </p>
                    </div>
                    <PlusIcon className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
