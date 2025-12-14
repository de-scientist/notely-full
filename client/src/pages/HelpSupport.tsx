import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LifeBuoy, BookOpen, Search, Trash2, User, Send } from "lucide-react";

const PRIMARY_COLOR_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";
const ICON_CLASS = "h-5 w-5 text-gray-600 dark:text-gray-400";

export function HelpSupport() {
  return (
    <div className="mx-auto max-w-4xl py-12 px-4">
      <h1
        className={`text-4xl font-extrabold mb-6 flex items-center gap-3 ${PRIMARY_COLOR_CLASS}`}
      >
        <LifeBuoy className="h-8 w-8" /> Help & Support
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
        Your guide to effortless note-taking in Notely.
      </p>

      <Card className="dark:bg-gray-900/70 shadow-lg space-y-8">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-gray-50">
            1. Getting Started & Core Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption className="text-left pt-4">
              Key features to streamline your productivity.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Feature</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quick Tip</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <BookOpen className={ICON_CLASS} /> New Entry
                </TableCell>
                <TableCell>Create, edit, and organize notes.</TableCell>
                <TableCell>
                  Notes support **Markdown** formatting for structure.
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <Search className={ICON_CLASS} /> Instant Search
                </TableCell>
                <TableCell>Full-text searching across all content.</TableCell>
                <TableCell>
                  Use specific keywords to narrow results quickly.
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <Trash2 className={ICON_CLASS} /> Trash
                </TableCell>
                <TableCell>
                  Deleted notes are stored here before permanent removal.
                </TableCell>
                <TableCell>
                  Notes can be **restored** within 30 days of deletion.
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium flex items-center gap-2">
                  <User className={ICON_CLASS} /> Profile
                </TableCell>
                <TableCell>Manage account settings and security.</TableCell>
                <TableCell>
                  Keep your email updated for password recovery.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>

        <Separator className="dark:bg-gray-700" />

        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
            2. Troubleshooting & Support
          </h2>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Issue: Cannot Log In
            </h3>
            <p className="text-gray-700 dark:text-gray-300 ml-4">
              **Resolution:** Ensure your email and password are correct. Use
              the "Forgot Password" link on the login page to reset your
              credentials.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Issue: Sync Delays
            </h3>
            <p className="text-gray-700 dark:text-gray-300 ml-4">
              **Resolution:** Notely automatically saves. If you see unexpected
              delays, refresh the page and ensure your internet connection is
              stable.
            </p>
          </div>
        </CardContent>

        <Separator className="dark:bg-gray-700" />

        <CardContent className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <Send className="h-5 w-5" /> 3. Contact Developer
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            For technical issues or feature requests, contact the developer:
          </p>
          <p className="text-base">
            <span className="font-semibold">Email Support:</span>
            <a
              href="mailto:gitaumark502@gmail.com"
              className={`ml-2 font-medium ${PRIMARY_COLOR_CLASS} hover:underline`}
            >
              gitaumark502@gmail.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
