import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Send, Github } from "lucide-react";

// Use the existing color class for consistency
const PRIMARY_COLOR_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";
const GRADIENT_CLASS =
  "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.03]";

export function ContactPage() {
  // In a real application, you would handle form submission here,
  // potentially using a state management hook or an API call (e.g., fetch, axios).
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to send email/form data goes here.
    // For now, we'll just log it.
    console.log("Contact form submitted!");
    alert("Thank you for your message! We will get back to you shortly.");
  };

  return (
    <div className="mx-auto max-w-4xl py-12 px-4">
      <h1
        className={`text-4xl font-extrabold mb-4 flex items-center gap-3 ${PRIMARY_COLOR_CLASS}`}
      >
        <Mail className="h-8 w-8" /> Get In Touch
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
        We'd love to hear from you! Please reach out using the form or connect
        through the details below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Form Card (Takes 2/3 space on medium screens) */}
        <Card className="md:col-span-2 dark:bg-gray-900/70 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Send Us a Message</CardTitle>
            <CardDescription>
              We aim to respond to all inquiries within 24-48 hours.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Question about notes feature"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Type your detailed message here..."
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className={`w-full ${GRADIENT_CLASS}`}>
                <Send className="w-5 h-5 mr-2" /> Send Message
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Contact Details Card (Takes 1/3 space on medium screens) */}
        <Card className="md:col-span-1 dark:bg-gray-900/70 shadow-lg h-full">
          <CardHeader>
            <CardTitle className="text-xl">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <Mail
                className={`h-5 w-5 flex-shrink-0 mt-1 ${PRIMARY_COLOR_CLASS}`}
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Support Email
                </p>
                <a
                  href="mailto:gitaumark502@gmail.com"
                  className={`text-sm hover:underline ${PRIMARY_COLOR_CLASS}`}
                >
                  gitaumark502@gmail.com
                </a>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            <div className="flex items-start gap-3">
              <Github
                className={`h-5 w-5 flex-shrink-0 mt-1 ${PRIMARY_COLOR_CLASS}`}
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  GitHub
                </p>
                <a
                  href="https://github.com/de-scientist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm hover:underline ${PRIMARY_COLOR_CLASS}`}
                >
                  View Source Code
                </a>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            {/* Optional: Placeholder for general location/business info */}
            <div className="flex items-start gap-3">
              <MapPin
                className={`h-5 w-5 flex-shrink-0 mt-1 ${PRIMARY_COLOR_CLASS}`}
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Location (Virtual)
                </p>
                <p className="text-sm">Operating globally, 24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
