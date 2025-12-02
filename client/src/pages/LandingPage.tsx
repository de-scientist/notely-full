import { Link } from 'react-router-dom';
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    CardFooter
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Check, Trash2, User, Users, Feather, Clock, Search, Folder, Zap } from 'lucide-react';
import { Separator } from '../components/ui/separator';

// Define a custom color palette for a professional look (Evernote style)
// NOTE: You must update your Tailwind CSS config to include 'evernote' in your colors.
// For demonstration, I will use Tailwind's green-600/700 as a stand-in for 'primary'
// and adjust the background and text colors for contrast.
const PRIMARY_COLOR_CLASS = "text-green-700 dark:text-green-500";
const ACCENT_COLOR_CLASS = "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600";


// =========================================================================
// 💡 CONCEPTUAL COMPONENT: StatCard
// =========================================================================
interface StatCardProps {
    value: string;
    label: string;
    icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon: Icon }) => (
    <div className="text-center p-4 transition duration-300 ease-in-out transform hover:scale-[1.02] bg-white dark:bg-gray-800/50 shadow-md hover:shadow-lg rounded-xl border dark:border-gray-700">
        <Icon className={`h-8 w-8 ${PRIMARY_COLOR_CLASS} mx-auto mb-1`} />
        <p className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 animate-in fade-in duration-1000">
            {value}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
    </div>
);
// =========================================================================


export function LandingPage() {
    return (
        // Added padding to account for header/footer, ensured max width for better flow
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center py-20 px-4 sm:px-6 lg:px-8">
            
            <div className="max-w-5xl space-y-16 text-center">
                
                {/* 1. HERO SECTION (UVP) - Refined Look */}
                <div className="space-y-6">
                    <h1 className="text-6xl font-extrabold tracking-tighter text-gray-900 dark:text-gray-50 md:text-7xl lg:text-8xl">
                        <Feather className={`inline-block h-12 w-12 ${PRIMARY_COLOR_CLASS} mr-4`} />
                        Your Memory, <span className={PRIMARY_COLOR_CLASS}>Perfectly Organized.</span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400 font-medium">
                        **Notely** is the professional workspace designed for effortless capture and immediate retrieval. Stop searching, start finding.
                    </p>
                </div>

                {/* 2. CALL TO ACTION - Professional Button Styling */}
                <div className="flex justify-center gap-6">
                    <Link to="/register">
                        <Button 
                            size="lg" 
                            className={`h-12 px-8 text-lg font-semibold ${ACCENT_COLOR_CLASS} shadow-lg shadow-green-500/30 dark:shadow-green-700/50 transition-all duration-300`}
                        >
                            Start Taking Notes (It's Free)
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button variant="outline" size="lg" className="h-12 px-8 text-lg font-medium border-gray-300 dark:border-gray-600 hover:bg-muted/50">
                            Log in
                        </Button>
                    </Link>
                </div>

                <Separator className="mt-16 bg-gray-300 dark:bg-gray-700" />


                {/* 3. DYNAMIC STATS SECTION - Visually richer cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-6">
                    <StatCard value="15,487" label="Active Users" icon={Users} />
                    <StatCard value="99.9%" label="Reliable Uptime" icon={Check} />
                    <StatCard value="< 2.0s" label="Avg. Load Time" icon={Clock} />
                </div>
                
                {/* 4. KEY FEATURES - Enhanced Card and Layout */}
                <Card className="mt-16 w-full text-left shadow-2xl shadow-gray-400/20 dark:shadow-gray-900/50 border-t-4 border-t-green-600 dark:border-t-green-500">
                    
                    <CardHeader className="pt-6 pb-4">
                        <CardTitle className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Core Features</CardTitle>
                        <CardDescription className="text-md text-gray-600 dark:text-gray-400">The tools you need to streamline your productivity, inspired by the best.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-0">
                        
                        {/* Feature 1: Markdown Support (Writing Focus) */}
                        <div className={`flex flex-col p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2`}>
                            <Feather className={`h-8 w-8 ${PRIMARY_COLOR_CLASS}`} />
                            <p className="font-bold text-lg text-gray-900 dark:text-gray-50">Frictionless Writing</p>
                            <p className="text-sm text-muted-foreground">Utilize powerful **Markdown** for formatting, tables, and code blocks without leaving the keyboard.</p>
                        </div>

                        {/* Feature 2: Search & Retrieval (Evernote Style) */}
                        <div className={`flex flex-col p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2`}>
                            <Search className={`h-8 w-8 ${PRIMARY_COLOR_CLASS}`} />
                            <p className="font-bold text-lg text-gray-900 dark:text-gray-50">Instant Search</p>
                            <p className="text-sm text-muted-foreground">Find any note in seconds with fast, full-text indexing across all your content.</p>
                        </div>
                        
                        {/* Feature 3: Organization (Folders/Tags) */}
                        <div className={`flex flex-col p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2`}>
                            <Folder className={`h-8 w-8 ${PRIMARY_COLOR_CLASS}`} />
                            <p className="font-bold text-lg text-gray-900 dark:text-gray-50">Notebooks & Tags</p>
                            <p className="text-sm text-muted-foreground">Organize complex projects using dedicated **Notebooks** (Folders) and flexible **Tags**.</p>
                        </div>

                        {/* Feature 4: Trash/Restore */}
                        <div className={`flex flex-col p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2`}>
                            <Trash2 className={`h-8 w-8 ${PRIMARY_COLOR_CLASS}`} />
                            <p className="font-bold text-lg text-gray-900 dark:text-gray-50">Safe Deletion</p>
                            <p className="text-sm text-muted-foreground">Never lose an idea. Soft-delete notes and instantly restore them from the dedicated Trash bin.</p>
                        </div>
                        
                        {/* Feature 5: Profile/Security */}
                        <div className={`flex flex-col p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2`}>
                            <User className={`h-8 w-8 ${PRIMARY_COLOR_CLASS}`} />
                            <p className="font-bold text-lg text-gray-900 dark:text-gray-50">Security & Profile</p>
                            <p className="text-sm text-muted-foreground">Secure your account with profile management and password updates.</p>
                        </div>
                        
                        {/* Feature 6: Sync/Performance */}
                        <div className={`flex flex-col p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2`}>
                            <Zap className={`h-8 w-8 ${PRIMARY_COLOR_CLASS}`} />
                            <p className="font-bold text-lg text-gray-900 dark:text-gray-50">Blazing Fast Sync</p>
                            <p className="text-sm text-muted-foreground">Low latency ensures your notes are instantly available across all your devices.</p>
                        </div>

                    </CardContent>
                    
                    <CardFooter className="justify-center text-md text-gray-700 dark:text-gray-300 pt-6 border-t dark:border-gray-700">
                        The simple power you need, built with modern standards.
                    </CardFooter>
                    
                </Card>
                
            </div>
            
        </div>
    );
}