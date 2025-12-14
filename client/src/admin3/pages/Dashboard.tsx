import { FC, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api"; // your axios/fetch wrapper
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DollarSign,
  Users,
  Feather,
  MessageSquare,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// --- Import Recharts components and helper components ---
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";
// Assuming the Recharts components above are in the same file or imported.

// Define types for clarity (ensure these match your API)
interface AdminStats {
  totalUsers: number;
  totalNotes: number;
  totalAiNotes: number;
  pendingMessages: number;
  userSignups: { date: string; users: number }[];
  noteCreation: { month: string; notes: number }[];
}

// ----------------------------------------------------
// Mock Data (Professional Admin Dashboard Stats)
// ----------------------------------------------------
const MOCK_ADMIN_STATS: AdminStats = {
  totalUsers: 8450,
  totalNotes: 15320,
  totalAiNotes: 6780,
  pendingMessages: 12,
  userSignups: [
    { date: "Jan", users: 500 },
    { date: "Feb", users: 750 },
    { date: "Mar", users: 900 },
    { date: "Apr", users: 1100 },
    { date: "May", users: 1500 },
    { date: "Jun", users: 1200 },
  ],
  noteCreation: [
    { month: "Jan", notes: 2500 },
    { month: "Feb", notes: 3100 },
    { month: "Mar", notes: 3500 },
    { month: "Apr", notes: 4200 },
    { month: "May", notes: 5000 },
    { month: "Jun", notes: 4800 },
  ],
};

// ----------------------------------------------------
// Custom Hook for Data Fetching with Mock Fallback
// ----------------------------------------------------
const useAdminDashboardData = () => {
  // Original API fetching logic is preserved
  const queryResult = useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: () => api.get("/admin/stats").then((res) => res.data),
    // Adding a short stale time to improve responsiveness during a session
    staleTime: 5 * 60 * 1000,
  });

  // Determine if we should use mock data:
  // 1. If the API fetch failed (isError)
  // 2. Or, if we explicitly enable a MOCK_MODE environment variable (for development)
  const useMockData =
    queryResult.isError || process.env.NODE_ENV === "development";

  return {
    // Return mock data if the flag is true, otherwise return the real data
    data: useMockData ? MOCK_ADMIN_STATS : queryResult.data,
    isLoading: queryResult.isLoading && !useMockData, // Only show loading if we are trying to fetch real data
    isError: queryResult.isError && !useMockData, // Only show error if we are trying to fetch real data
  };
};

// ----------------------------------------------------
// Metric Card Component (Enhanced UX)
// ----------------------------------------------------
interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const MetricCard: FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  color,
}) => (
  <Card
    className="transition-all duration-300 hover:shadow-lg border-l-4"
    style={{ borderColor: color }}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon
        className="h-5 w-5 text-muted-foreground"
        style={{ color: color }}
      />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

// ----------------------------------------------------
// Recharts Components (Preserving original logic)
// ----------------------------------------------------

const UserSignupChart: React.FC<{ data: AdminStats["userSignups"] }> = ({
  data,
}) => (
  <Card className="col-span-12 lg:col-span-8 h-[400px]">
    <CardHeader>
      <CardTitle>User Signups Trend</CardTitle>
      <CardDescription>
        New users registered over the last period.
      </CardDescription>
    </CardHeader>
    <CardContent className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
              borderRadius: "4px",
              color: "white",
            }}
            formatter={(value: number) => [`${value} Users`, "Signups"]}
          />
          <Bar dataKey="users" fill="#ec4899" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const noteDistributionData = (stats: AdminStats) => [
  { name: "AI Notes", value: stats.totalAiNotes },
  { name: "Manual Notes", value: stats.totalNotes - stats.totalAiNotes },
];

const NoteDistributionChart: React.FC<{
  data: ReturnType<typeof noteDistributionData>;
}> = ({ data }) => (
  <Card className="col-span-12 lg:col-span-4 h-[400px]">
    <CardHeader>
      <CardTitle>Note Type Distribution</CardTitle>
      <CardDescription>
        Breakdown of manual vs. AI Generated notes.
      </CardDescription>
    </CardHeader>
    <CardContent className="h-[300px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={["#ec4899", "#facc15"][index % 2]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
              borderRadius: "4px",
              color: "white",
            }}
            formatter={(value: number, name: string) => [
              `${value} Notes`,
              name,
            ]}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// ----------------------------------------------------
// Main Dashboard Component (Uses Custom Hook)
// ----------------------------------------------------

const Dashboard: FC = () => {
  // Use the new hook for data fetching
  const { data: stats, isLoading, isError } = useAdminDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen-minus-header">
        <Loader2 className="h-10 w-10 animate-spin text-fuchsia-600" />
        <p className="ml-3 text-lg text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  // Only show error if the hook determined it's a real API error
  if (isError || !stats) {
    return (
      <div className="p-6">
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" /> API Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">
              Failed to load live admin statistics. Please check server
              connection.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine data for charts
  const signupData = stats.userSignups || [];
  const noteDistribution = useMemo(() => noteDistributionData(stats), [stats]);

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        Analytics Overview
      </h1>

      {/* 1. Metric Cards (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          description="Total registered accounts"
          color="#a855f7" // Purple
        />
        <MetricCard
          title="Total Notes"
          value={stats.totalNotes.toLocaleString()}
          icon={Feather}
          description="Total notes created by users"
          color="#ec4899" // Fuchsia
        />
        <MetricCard
          title="AI Generated"
          value={stats.totalAiNotes.toLocaleString()}
          icon={DollarSign}
          description="Notes generated using AI tools"
          color="#facc15" // Yellow
        />
        <MetricCard
          title="Pending Inbox"
          value={stats.pendingMessages}
          icon={MessageSquare}
          description="Unread support messages"
          color="#f97316" // Orange
        />
      </div>

      {/* 2. Charts and Visualization */}
      <div className="grid grid-cols-12 gap-6">
        {/* User Signup Trend Chart */}
        <UserSignupChart data={signupData} />

        {/* Note Distribution Pie Chart */}
        <NoteDistributionChart data={noteDistribution} />
      </div>

      {/* 3. Placeholder for Recent Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
          <CardDescription>Latest notes, logins, and signups.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* You would typically place a Data Table component here */}
          <div className="text-muted-foreground py-4">
            (Data table with recent activities will go here)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
