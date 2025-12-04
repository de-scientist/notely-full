import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, User, AlertTriangle, Gavel } from "lucide-react";

const PRIMARY_COLOR_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";

export function TermsOfService() {
  return (
    <div className="mx-auto max-w-4xl py-12 px-4">
      <h1 className={`text-4xl font-extrabold mb-6 flex items-center gap-3 ${PRIMARY_COLOR_CLASS}`}>
        <FileText className="h-8 w-8" /> Terms of Service
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
        These Terms govern your access to and use of the Notely App.
      </p>

      <Card className="dark:bg-gray-900/70 shadow-lg space-y-8">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-gray-50">1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300">
            By accessing and using the **Notely App**, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, you must discontinue use immediately.
          </p>
        </CardContent>
        
        <Separator className="dark:bg-gray-700" />

        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <User className="h-5 w-5" /> 2. User Accounts
          </h2>
          <ul className="list-disc ml-6 space-y-3 text-gray-700 dark:text-gray-300">
            <li>
              <span className="font-semibold">Eligibility:</span> You must be at least **13 years old** to use the Service.
            </li>
            <li>
              <span className="font-semibold">Responsibility:</span> You are responsible for protecting your password and account activity.
            </li>
            <li>
              <span className="font-semibold">Accuracy:</span> You must provide accurate and complete registration information.
            </li>
          </ul>
        </CardContent>

        <Separator className="dark:bg-gray-700" />

        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> 3. User Content & Prohibitions
          </h2>
          <ul className="list-disc ml-6 space-y-3 text-gray-700 dark:text-gray-300">
            <li>
              <span className="font-semibold">Ownership:</span> You retain all ownership rights to your content (notes, categories).
            </li>
            <li>
              <span className="font-semibold">Prohibited Content:</span> You must not post or transmit any content that is illegal, harmful, abusive, or infringes on others' rights.
            </li>
          </ul>
        </CardContent>

        <Separator className="dark:bg-gray-700" />

        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <Gavel className="h-5 w-5" /> 5. Disclaimers
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            The Notely App is provided on an **"as is"** basis. We make no warranties regarding the Service and disclaim all implied warranties, including merchantability and fitness for a particular purpose. We do not guarantee the service will be uninterrupted or error-free.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}