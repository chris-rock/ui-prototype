"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, Button, Input } from "@/components/ui";
import { useScope } from "@/lib/scope";
import {
  Cog6ToothIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const params = useParams();
  const spaceId = params?.spaceId as string;
  const { spaceScope } = useScope();

  const [spaceName, setSpaceName] = useState(spaceScope?.name || "");
  const [description, setDescription] = useState(spaceScope?.description || "");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Space Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your space configuration and preferences
        </p>
      </div>

      {/* General Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Cog6ToothIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              General
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Basic space information
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Space Name
            </label>
            <Input
              type="text"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="mt-1"
              placeholder="My Space"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              placeholder="Optional description"
            />
          </div>

          <div className="flex justify-end">
            <Button size="sm">Save Changes</Button>
          </div>
        </div>
      </Card>

      {/* Feature Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Features
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Enable or disable space features
        </p>

        <div className="mt-6 space-y-4">
          <FeatureToggle
            name="Platform Vulnerabilities"
            description="Scan for vulnerabilities in your infrastructure"
            enabled={true}
          />
          <FeatureToggle
            name="EOL Asset Detection"
            description="Identify end-of-life software and operating systems"
            enabled={true}
          />
          <FeatureToggle
            name="Automated Cases"
            description="Automatically create cases for critical findings"
            enabled={false}
          />
          <FeatureToggle
            name="Asset Garbage Collection"
            description="Automatically remove stale assets"
            enabled={false}
          />
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-error/50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error/10">
            <ExclamationTriangleIcon className="h-5 w-5 text-error" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Danger Zone
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Irreversible actions
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-error/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Delete this space
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Permanently delete this space and all its data
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-error text-error hover:bg-error/10">
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete Space
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface FeatureToggleProps {
  name: string;
  description: string;
  enabled: boolean;
}

function FeatureToggle({ name, description, enabled }: FeatureToggleProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => setIsEnabled(!isEnabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          isEnabled ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isEnabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
