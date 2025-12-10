import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api"; // your axios/fetch wrapper
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Users, Feather, MessageSquare, Loader2, AlertTriangle } from "lucide-react";

// --- Import Recharts components and helper components ---
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
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
// Metric Card Component (Enhanced UX)
// ----------------------------------------------------
interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const MetricCard: FC<MetricCardProps> = ({ title, value, icon: Icon, description, color }) => (
  <Card className="transition-all duration-300 hover:shadow-lg border-l-4" style={{ borderColor: color }}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" style={{ color: color }} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

// ----------------------------------------------------
// Recharts Components (Defined above, included here for completeness)
// ----------------------------------------------------

const UserSignupChart: React.FC<{ data: AdminStats['userSignups'] }> = ({ data }) => (
    <Card className="col-span-12 lg:col-span-8 h-[400px]">
      <CardHeader>
        <CardTitle>User Signups Trend</CardTitle>
        <CardDescription>New users registered over the last period.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px', color: 'white' }} 
              formatter={(value: number) => [`${value} Users`, 'Signups']}
            />
            <Bar dataKey="users" fill="#ec4899" radius={[4, 4, 0, 0]} /> 
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
);

const noteDistributionData = (stats: AdminStats) => [
    { name: 'AI Notes', value: stats.totalAiNotes },
    { name: 'Manual Notes', value: stats.totalNotes - stats.totalAiNotes },
];

const NoteDistributionChart: React.FC<{ data: ReturnType<typeof noteDistributionData> }> = ({ data }) => (
    <Card className="col-span-12 lg:col-span-4 h-[400px]">
      <CardHeader>
        <CardTitle>Note Type Distribution</CardTitle>
        <CardDescription>Breakdown of manual vs. AI Generated notes.</CardDescription>
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
                <Cell key={`cell-${index}`} fill={['#ec4899', '#facc15'][index % 2]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px', color: 'white' }} 
              formatter={(value: number, name: string) => [`${value} Notes`, name]}
            />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

// ----------------------------------------------------
// Main Dashboard Component
// ----------------------------------------------------

const Dashboard: FC = () => {
  // Add generic typing for better safety
  const { data: stats, isLoading, isError } = useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: () => api.get("/admin/stats").then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen-minus-header">
        <Loader2 className="h-10 w-10 animate-spin text-fuchsia-600" />
        <p className="ml-3 text-lg text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-6">
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center"><AlertTriangle className="mr-2 h-5 w-5" /> Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Failed to load admin statistics. Check the API server status.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine data for charts (handle potential data shape issues)
  const signupData = stats.userSignups || [];
  const noteDistribution = noteDistributionData(stats);

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Analytics Overview</h1>

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
          icon={DollarSign} // Using DollarSign as a placeholder for a specific AI metric
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