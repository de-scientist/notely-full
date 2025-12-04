import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, Mail, Server } from "lucide-react";

const PRIMARY_COLOR_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";

export function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl py-12 px-4">
      <h1 className={`text-4xl font-extrabold mb-6 flex items-center gap-3 ${PRIMARY_COLOR_CLASS}`}>
        <Shield className="h-8 w-8" /> Privacy Policy
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
        We are committed to protecting your personal data and your right to privacy.
      </p>

      <Card className="dark:bg-gray-900/70 shadow-lg space-y-8">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-gray-50">1. Introduction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300">
            Welcome to **Notely App**. This Privacy Policy governs the use of your data when you use the Notely application ("App" or "Service"). We only collect the information necessary to provide and improve our service.
          </p>
        </CardContent>
        
        <Separator className="dark:bg-gray-700" />

        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <Eye className="h-5 w-5" /> 2. Information We Collect
          </h2>
          <ul className="list-disc ml-6 space-y-3 text-gray-700 dark:text-gray-300">
            <li>
              <span className="font-semibold">Account Data:</span> When you register, we collect your **email address** and **password hash**. This is required for authentication and security.
            </li>
            <li>
              <span className="font-semibold">User Content Data:</span> We store the data you actively enter, including your **notes (title, synopsis, content)** and **categories (notebooks)**. This content is secure and private.
            </li>
            <li>
              <span className="font-semibold">Usage Data:</span> We automatically collect standard information like your IP address, browser type, and pages viewed, to monitor service performance.
            </li>
          </ul>
        </CardContent>

        <Separator className="dark:bg-gray-700" />

        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <Lock className="h-5 w-5" /> 4. Data Storage and Security
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            We prioritize the security of your data.
          </p>
          <ul className="list-disc ml-6 space-y-3 text-gray-700 dark:text-gray-300">
            <li>
              <span className="font-semibold">Security Measures:</span> We use industry-standard security practices, including data **encryption (SSL/TLS)** for data in transit and **secure hashing** for passwords.
            </li>
            <li>
              <span className="font-semibold">Data Retention:</span> We retain your data as long as your account is active. If you delete your account, all data will be permanently deleted within approximately **30 days**.
            </li>
          </ul>
        </CardContent>

        <Separator className="dark:bg-gray-700" />

        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <Server className="h-5 w-5" /> 5. Sharing Your Information
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            We **do not** sell, trade, or rent your personal identification information or user content to third parties. We only disclose data if required by law.
          </p>
        </CardContent>

        <Separator className="dark:bg-gray-700" />

        <CardContent className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <Mail className="h-5 w-5" /> Contact
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            If you have any questions about this Privacy Policy, please contact us:
            <br />
            <a href="mailto:gitaumark502@gmail.com" className={`font-medium ${PRIMARY_COLOR_CLASS} hover:underline`}>
              gitaumark502@gmail.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}