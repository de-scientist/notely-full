// 💜 Define OneNote-inspired color palette variables
// We'll use Tailwind's `fuchsia` or `purple` and adjust the shades for the primary color.
const PRIMARY_COLOR_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";
const ACCENT_BG_CLASS =
  "bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-600";

// 💡 GRADIENT CLASS: Updated to a professional purple/magenta gradient
const GRADIENT_CLASS =
  "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.03]";
import { Separator } from "@/components/ui/separator";
// NEW Icon: MessageSquare for Contact
import {
  Github,
  Mail,
  Globe,
  Heart,
  BookOpen,
  FilePlus,
  User,
  Trash2,
  Shield,
  FileText,
  LifeBuoy,
  MessageSquare,
} from "lucide-react";

// Helper function for dynamic year in copyright
const currentYear = new Date().getFullYear();

export default function AppFooter() {
  // Helper function to safely extract base classes for hover states
  const getHoverClass = () => {
    const parts = PRIMARY_COLOR_CLASS.replace("text", "text").split(" ");
    return `hover:${parts[0]} dark:hover:${parts[1]}`;
  };

  return (
    <footer className="w-full bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Updated Grid: 2 columns on small, 4 columns on medium */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* 1. Brand & Mission (Notely Focused) */}
          <div className="col-span-2 md:col-span-1">
            <h2
              className={`text-3xl font-extrabold tracking-tight ${PRIMARY_COLOR_CLASS}`}
            >
              Notely
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-400 mt-3 leading-relaxed">
              Capture thoughts, organize ideas, and manage tasks effortlessly.
              Your knowledge hub, always at your fingertips.
            </p>
          </div>

          {/* 2. Quick Links (Application Navigation) */}
          <div className="md:col-span-1">
            <h3
              className={`text-lg font-bold mb-4 text-gray-900 dark:text-white border-l-2 ${PRIMARY_COLOR_CLASS.replace("text", "border")} pl-2`}
            >
              App Navigation
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-base">
              <li>
                <a
                  href="/app/notes"
                  className={`${getHoverClass()} transition-colors flex items-center gap-2`}
                  aria-label="Go to My Notes page"
                >
                  <BookOpen className="h-4 w-4" /> My Notes
                </a>
              </li>
              <li>
                <a
                  href="/app/notes/new"
                  className={`${getHoverClass()} transition-colors flex items-center gap-2`}
                  aria-label="Create a new note entry"
                >
                  <FilePlus className="h-4 w-4" /> New Entry
                </a>
              </li>
              <li>
                <a
                  href="/app/profile"
                  className={`${getHoverClass()} transition-colors flex items-center gap-2`}
                  aria-label="Go to Profile settings"
                >
                  <User className="h-4 w-4" /> Profile
                </a>
              </li>
              <li>
                <a
                  href="/app/trash"
                  className={`${getHoverClass()} transition-colors flex items-center gap-2`}
                  aria-label="Go to Trash/Recycle Bin"
                >
                  <Trash2 className="h-4 w-4" /> Trash
                </a>
              </li>
            </ul>
          </div>

          {/* 3. Legal & Support (UX Improvement: Essential Links) */}
          <div className="md:col-span-1">
            <h3
              className={`text-lg font-bold mb-4 text-gray-900 dark:text-white border-l-2 ${PRIMARY_COLOR_CLASS.replace("text", "border")} pl-2`}
            >
              Legal & Support
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-base">
              <li>
                <a
                  href="/privacy"
                  className={`${getHoverClass()} transition-colors flex items-center gap-2`}
                  aria-label="Read our Privacy Policy"
                >
                  <Shield className="h-4 w-4" /> Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className={`${getHoverClass()} transition-colors flex items-center gap-2`}
                  aria-label="Read our Terms of Service"
                >
                  <FileText className="h-4 w-4" /> Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/help"
                  className={`${getHoverClass()} transition-colors flex items-center gap-2`}
                  aria-label="Go to Help Center"
                >
                  <LifeBuoy className="h-4 w-4" /> Help Center
                </a>
              </li>
              {/* 🎯 NEW LINK: Contact Page */}
              <li>
                <a
                  href="/contact"
                  className={`${getHoverClass()} transition-colors flex items-center gap-2`}
                  aria-label="Contact Us"
                >
                  <MessageSquare className="h-4 w-4" /> Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* 4. Connect/Socials (Developer Links) */}
          <div className="md:col-span-1">
            <h3
              className={`text-lg font-bold mb-4 text-gray-900 dark:text-white border-l-2 ${PRIMARY_COLOR_CLASS.replace("text", "border")} pl-2`}
            >
              Built by Mark Gitau
            </h3>
            <ul className="space-y-3 text-base text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-3">
                <Github className={`h-5 w-5 ${PRIMARY_COLOR_CLASS}`} />
                <a
                  href="https://github.com/de-scientist"
                  target="_blank"
                  className={`${getHoverClass()} transition-colors font-medium`}
                  rel="noopener noreferrer"
                  aria-label="View source code on GitHub"
                >
                  GitHub / View Source
                </a>
              </li>
              <Separator className="bg-gray-200 dark:bg-gray-700 my-2" />
              <li className="flex items-center gap-3">
                <Mail className={`h-5 w-5 ${PRIMARY_COLOR_CLASS}`} />
                <a
                  href="mailto:gitaumark502@gmail.com"
                  className={`${getHoverClass()} transition-colors font-medium`}
                  aria-label="Send support email"
                >
                  Support Email
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Globe className={`h-5 w-5 ${PRIMARY_COLOR_CLASS}`} />
                <a
                  href="https://1descientist.vercel.app/"
                  target="_blank"
                  className={`${getHoverClass()} transition-colors font-medium`}
                  rel="noopener noreferrer"
                  aria-label="Visit the developer's portfolio"
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
            Crafted with{" "}
            <Heart className="h-4 w-4 mx-1 text-red-500" fill="currentColor" />{" "}
            for productivity.
          </span>
        </div>
      </div>
    </footer>
  );
}
