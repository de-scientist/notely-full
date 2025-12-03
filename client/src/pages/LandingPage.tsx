import { Link } from 'react-router-dom';
import { useEffect } from "react";
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    CardFooter
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Check, Trash2, User, Users, Feather, Clock, Search, Folder, Zap, PencilLine, LogIn } from 'lucide-react';
import { Separator } from '../components/ui/separator';

// 💜 Define Primary Color (Fuchsia/OneNote)
const PRIMARY_COLOR_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";
const ACCENT_BG_CLASS = "bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-600";
const GRADIENT_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.03]";


// 🟢 Define Complementary Color (Lime/Emerald)
// Using a slightly muted Emerald/Green for a more professional, less jarring complement.
const COMPLEMENTARY_COLOR_CLASS = "text-emerald-500 dark:text-emerald-400";
const COMPLEMENTARY_OUTLINE_CLASS = "border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-gray-700";


// =========================================================================
// 💡 CONCEPTUAL COMPONENT: StatCard (No change needed, uses PRIMARY)
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

// Smooth Reveal Observer
function useRevealAnimations() {
    useEffect(() => {
        const elements = document.querySelectorAll(".reveal");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("reveal-visible");
                    }
                });
            },
            { threshold: 0.1 }
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
}

// Parallax Hero Effect
function useParallax() {
    useEffect(() => {
        const hero = document.querySelector(".hero-parallax");
        if (!hero) return;

        const handler = (e: MouseEvent) => {
            const x = (e.clientX - window.innerWidth / 2) * 0.0025;
            const y = (e.clientY - window.innerHeight / 2) * 0.0025;
            hero.setAttribute(
                "style",
                `transform: translate(${x}px, ${y}px); transition: transform 0.05s linear;`
            );
        };

        window.addEventListener("mousemove", handler);
        return () => window.removeEventListener("mousemove", handler);
    }, []);
}

export function LandingPage() {
    useRevealAnimations();
    useParallax();

    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center py-20 px-4 sm:px-6 lg:px-8 reveal pulse-on-load">

            <div className="max-w-5xl space-y-16 text-center">

                {/* HERO */}
                <div className="space-y-6 hero-parallax reveal">
                    <h1 className="text-6xl font-extrabold tracking-tighter text-gray-900 dark:text-gray-50 md:text-7xl lg:text-8xl hover-lift">
                        <Feather className={`inline-block h-12 w-12 ${PRIMARY_COLOR_CLASS} mr-4`} />
                        Your Memory, <span className={PRIMARY_COLOR_CLASS}>Perfectly Organized.</span>
                    </h1>

                    <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400 font-medium reveal">
                        <span className="">{`Notely is the professional workspace designed for effortless capture and immediate retrieval.`}</span>
                        Stop <span className={COMPLEMENTARY_COLOR_CLASS.replace('text', 'font-bold text')}>searching</span>, 
                        start <span className={COMPLEMENTARY_COLOR_CLASS.replace('text', 'font-bold text')}>finding</span>.
                    </p>
                </div>

                {/* CTA */}
                <div className="flex justify-center gap-6 reveal hover-lift">
                    <Link to="/register">
                        <Button size="lg" className={`h-12 px-8 text-lg font-semibold ${GRADIENT_CLASS}`}>
                            Start Taking Notes (It's Free)
                        </Button>
                    </Link>

                    <Link to="/login">
                        <Button 
                            variant="outline"
                            size="lg"
                            className="border-2 border-fuchsia-600 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white transition-all font-semibold rounded-full px-12 py-7 text-lg dark:border-fuchsia-400 dark:hover:bg-emerald-800"
                        >
                            Log in for full experience
                        </Button>
                    </Link>
                </div>

                <Separator className="mt-16 bg-gray-300 dark:bg-gray-700 reveal" />

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-6 reveal">
                    <div className="hover-lift"><StatCard value="15,487" label="Active Users" icon={Users} /></div>
                    <div className="hover-lift"><StatCard value="99.9%" label="Reliable Uptime" icon={Check} /></div>
                    <div className="hover-lift"><StatCard value="< 2.0s" label="Avg. Load Time" icon={Clock} /></div>
                </div>

                {/* FEATURES CARD */}
                <Card className={`mt-16 w-full text-left shadow-2xl shadow-gray-400/20 dark:shadow-gray-900/50 border-t-4 border-t-fuchsia-600 dark:border-t-fuchsia-500 reveal hover-lift`}>

                    <CardHeader className="pt-8 pb-4">
                        <CardTitle className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                            Core Features
                        </CardTitle>
                        <CardDescription className="text-md text-gray-600 dark:text-gray-400">
                            The tools you need to streamline your productivity, inspired by the best.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-0">

                        {/* No styling changes. Just motion. */}
                        {[
                            { icon: Feather, title: "Frictionless Writing", desc: "Utilize powerful Markdown for formatting, tables, and code blocks..." },
                            { icon: Search, title: "Instant Search", desc: "Find any note in seconds with fast, full-text indexing..." },
                            { icon: Folder, title: "Notebooks & Tags", desc: "Organize complex projects using dedicated Notebooks and Tags." },
                            { icon: Trash2, title: "Safe Deletion", desc: "Soft-delete notes and instantly restore them." },
                            { icon: User, title: "Security & Profile", desc: "Secure your account with profile management." },
                            { icon: Zap, title: "Blazing Fast Sync", desc: "Low latency ensures your notes sync instantly." },
                        ].map((f, i) => (
                            <div
                                key={i}
                                className={`flex flex-col p-6 rounded-xl border shadow-sm hover:shadow-lg dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2 reveal hover-lift`}
                            >
                                <f.icon className={`h-8 w-8 ${PRIMARY_COLOR_CLASS}`} />
                                <p className="font-bold text-lg text-gray-900 dark:text-gray-50">{f.title}</p>
                                <p className="text-sm text-muted-foreground">{f.desc}</p>
                            </div>
                        ))}

                    </CardContent>

                    <CardFooter className="justify-center text-md text-gray-700 dark:text-gray-300 pt-6 border-t dark:border-gray-700">
                        The simple power you need, built with modern standards.
                    </CardFooter>

                </Card>

            </div>

        </div>
    );
}
