import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Mail,
  ListChecks,
  Upload,
  Loader2,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import React from "react"; // Import React for React.ElementType

// --- Placeholder Hooks (Replace with actual TanStack Query hooks) ---

// Mock data structure for key metrics
interface Metrics {
  totalQueries: number;
  unreadMessages: number;
  ragDocsCount: number;
  queriesLast7Days: number;
}

// Mock data structure for recent activity
interface Activity {
  id: number;
  type: "query" | "message" | "rag_update";
  title: string;
  timeAgo: string;
  link: string;
}

// Mock function to simulate fetching dashboard data
const useDashboardMetrics = (): { data: Metrics; isLoading: boolean } => ({
  data: {
    totalQueries: 1245,
    unreadMessages: 15,
    ragDocsCount: 42,
    queriesLast7Days: 120,
  },
  isLoading: false,
});

// Mock function to simulate fetching recent activity
const useRecentActivity = (): { data: Activity[] } => ({
  data: [
    {
      id: 101,
      type: "message",
      title: "New user feedback received",
      timeAgo: "15 min ago",
      link: "/admin/messages",
    },
    {
      id: 102,
      type: "query",
      title: "Query about pricing feature failure",
      timeAgo: "1 hour ago",
      link: "/admin/queries",
    },
    {
      id: 103,
      type: "rag_update",
      title: "Pricing doc uploaded",
      timeAgo: "3 hours ago",
      link: "/admin/rag",
    },
  ],
});

// --- Dashboard Component ---

export const AdminDashboard = () => {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  // ✅ FIX: Use data destructuring for recentActivity to avoid potential undefined issues
  const { data: recentActivity = [] } = useRecentActivity();

  // ✅ FIX: Changed 'icon' to 'Icon' in the parameter list. (L.52)
  // This allows it to be used directly as a React Component <Icon /> (L.58).
  const renderMetricCard = (
    title: string,
    value: number | string,
    Icon: React.ElementType,
    link: string,
    colorClass: string,
  ) => (
    <Card className="hover:shadow-lg transition-shadow duration-300 dark:hover:border-fuchsia-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${colorClass}`} />{" "}
        {/* Now correctly references 'Icon' */}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">
          {metricsLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          ) : (
            value
          )}
        </div>
        <Link to={link}>
          <Button variant="link" className={`p-0 h-auto ${colorClass}`}>
            View Details →
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
        Admin Overview
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        A summary of system health and recent user interactions.
      </p>

      <Separator />

      {/* 1. Key Metrics Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {renderMetricCard(
          "Unread Messages",
          metrics?.unreadMessages ?? 0,
          Mail,
          "/admin/messages",
          "text-red-500",
        )}
        {renderMetricCard(
          "Total Queries Handled",
          metrics?.totalQueries.toLocaleString() ?? 0,
          ListChecks,
          "/admin/queries",
          "text-indigo-600",
        )}
        {renderMetricCard(
          "Queries (Last 7 Days)",
          metrics?.queriesLast7Days ?? 0,
          TrendingUp,
          "/admin/queries",
          "text-emerald-500",
        )}
        {renderMetricCard(
          "RAG Docs Indexed",
          metrics?.ragDocsCount ?? 0,
          Upload,
          "/admin/rag",
          "text-fuchsia-500",
        )}
      </div>

      {/* 2. Recent Activity Panel */}
      <Card className="lg:col-span-2 shadow-xl dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-6 w-6 text-gray-500" /> Recent Activity
          </CardTitle>
          <CardDescription>
            Latest user interactions and system updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <Link
                key={activity.id}
                to={activity.link}
                className="block group"
              >
                <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l-4 border-transparent group-hover:border-fuchsia-500">
                  <div className="flex items-center space-x-3">
                    {activity.type === "message" && (
                      <Mail className="h-5 w-5 text-red-500" />
                    )}
                    {activity.type === "query" && (
                      <ListChecks className="h-5 w-5 text-indigo-500" />
                    )}
                    {activity.type === "rag_update" && (
                      <Upload className="h-5 w-5 text-fuchsia-500" />
                    )}
                    <p className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-fuchsia-600">
                      {activity.title}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.timeAgo}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
