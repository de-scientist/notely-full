// 💜 Define OneNote-inspired color palette variables
// We'll use Tailwind's `fuchsia` or `purple` and adjust the shades for the primary color.
const PRIMARY_COLOR_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";
const ACCENT_BG_CLASS = "bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-600";

// 💡 GRADIENT CLASS: Updated to a professional purple/magenta gradient
const GRADIENT_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.03]";
import { Separator } from "@/components/ui/separator";
import { Github, Mail, Globe, Heart, BookOpen, FilePlus, User, Trash2 } from "lucide-react"; 

// Helper function for dynamic year in copyright
const currentYear = new Date().getFullYear();

export default function AppFooter() {
    // ⚠️ NOTE: The original `pl-4` offset is removed here as it suggests a fixed sidebar, 
    // but a footer should typically span the full width of the main content area.
    
    return (
        <footer className="w-full bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
            <div className="max-w-6xl mx-auto px-6 py-12">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    {/* 1. Brand & Mission (Notely Focused) */}
                    <div className="col-span-2 md:col-span-1">
                        {/* 👇 UPDATED: text-primary replaced with fuchsia shade (using text-fuchsia-700) */}
                        <h2 className={`text-3xl font-extrabold tracking-tight ${PRIMARY_COLOR_CLASS}`}>
                            Notely
                        </h2>
                        <p className="text-sm text-gray-700 dark:text-gray-400 mt-3 leading-relaxed">
                            Capture thoughts, organize ideas, and manage tasks effortlessly. Your knowledge hub, always at your fingertips.
                        </p>
                    </div>

                    {/* 2. Quick Links (Application Navigation) */}
                    <div className="md:col-span-1">
                        {/* 👇 UPDATED: border-primary replaced with fuchsia shade */}
                        <h3 className={`text-lg font-bold mb-4 text-gray-900 dark:text-white border-l-2 ${PRIMARY_COLOR_CLASS.replace('text', 'border')} pl-2`}>
                            App Navigation
                        </h3>
                        <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-base">
                            <li>
                                {/* 👇 UPDATED: hover:text-primary replaced with fuchsia shade */}
                                <a href="/app/notes" className={`hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[0]} dark:hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[1]} transition-colors flex items-center gap-2`}>
                                    <BookOpen className="h-4 w-4" /> My Notes
                                </a>
                            </li>
                            <li>
                                {/* 👇 UPDATED: hover:text-primary replaced with fuchsia shade */}
                                <a
                                    href="/app/notes/new"
                                    className={`hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[0]} dark:hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[1]} transition-colors flex items-center gap-2`}
                                >
                                    <FilePlus className="h-4 w-4" /> New Entry
                                </a>
                            </li>
                            <li>
                                {/* 👇 UPDATED: hover:text-primary replaced with fuchsia shade */}
                                <a
                                    href="/app/profile"
                                    className={`hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[0]} dark:hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[1]} transition-colors flex items-center gap-2`}
                                >
                                    <User className="h-4 w-4" /> Profile
                                </a>
                            </li>
                            <li>
                                {/* 👇 UPDATED: hover:text-primary replaced with fuchsia shade */}
                                <a
                                    href="/app/trash"
                                    className={`hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[0]} dark:hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[1]} transition-colors flex items-center gap-2`}
                                >
                                    <Trash2 className="h-4 w-4" /> Trash
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* 3. Connect/Socials (Retained Developer Links) */}
                    <div className="md:col-span-2">
                        {/* 👇 UPDATED: border-primary replaced with fuchsia shade */}
                        <h3 className={`text-lg font-bold mb-4 text-gray-900 dark:text-white border-l-2 ${PRIMARY_COLOR_CLASS.replace('text', 'border')} pl-2`}>
                            Built by Mark Gitau
                        </h3>
                        <ul className="space-y-3 text-base text-gray-700 dark:text-gray-300">
                            <li className="flex items-center gap-3">
                                {/* 👇 UPDATED: text-primary replaced with fuchsia shade */}
                                <Github className={`h-5 w-5 ${PRIMARY_COLOR_CLASS}`} />
                                <a
                                    href="https://github.com/de-scientist"
                                    target="_blank"
                                    // 👇 UPDATED: hover:text-primary replaced with fuchsia shade
                                    className={`hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[0]} dark:hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[1]} transition-colors font-medium`}
                                    rel="noopener noreferrer"
                                >
                                    GitHub / View Source Code
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                {/* 👇 UPDATED: text-primary replaced with fuchsia shade */}
                                <Mail className={`h-5 w-5 ${PRIMARY_COLOR_CLASS}`} />
                                <a
                                    href="mailto:gitaumark502@gmail.com"
                                    // 👇 UPDATED: hover:text-primary replaced with fuchsia shade
                                    className={`hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[0]} dark:hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[1]} transition-colors font-medium`}
                                >
                                    Support Email
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                {/* 👇 UPDATED: text-primary replaced with fuchsia shade */}
                                <Globe className={`h-5 w-5 ${PRIMARY_COLOR_CLASS}`} />
                                <a
                                    href="https://1descientist.vercel.app/"
                                    target="_blank"
                                    // 👇 UPDATED: hover:text-primary replaced with fuchsia shade
                                    className={`hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[0]} dark:hover:${PRIMARY_COLOR_CLASS.replace('text', 'text').split(' ')[1]} transition-colors font-medium`}
                                    rel="noopener noreferrer"
                                >
                                    Developer Portfolio
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <Separator className="my-10 bg-gray-300 dark:bg-gray-700" />

                {/* Bottom Section (Copyright) */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-500">
                    © {currentYear} **Notely App**. All rights reserved.
                    <span className="flex items-center justify-center mt-1">
                        Crafted with <Heart className="h-4 w-4 mx-1 text-red-500" fill="currentColor" /> for productivity.
                    </span>
                </div>
            </div>
        </footer>
    );
}