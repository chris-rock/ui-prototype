"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, Button, Input } from "@/components/ui";
import { useScope } from "@/lib/scope";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function CompliancePage() {
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
            Compliance
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track compliance against security frameworks
          </p>
        </div>
        <Button size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Framework
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search frameworks..."
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

      {/* Empty State */}
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
            <ClipboardDocumentCheckIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
            No compliance frameworks enabled
          </h3>
          <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
            Enable compliance frameworks like CIS, SOC 2, PCI DSS, or HIPAA to track your security posture against industry standards.
          </p>
          <Button className="mt-4" size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            Browse Frameworks
          </Button>
        </div>
      </Card>
    </div>
  );
}
