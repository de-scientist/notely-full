import { Link } from 'react-router-dom';
// New shadcn/ui specific imports
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Check, Trash2, User } from 'lucide-react'; // Importing icons for a modern look

export function LandingPage() {
  return (
    // Updated container: min-h-screen for full height, flex-grow, better alignment
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      
      {/* Increased gap, added max-w-3xl for better content grouping */}
      <div className="max-w-4xl space-y-12 text-center">
        
        {/* Headline section: bolder, darker text, and improved spacing */}
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 sm:text-6xl">
            Focus Better. Write Smarter.
            <br />
            Meet <span className="text-primary">Notely</span>.
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            The minimal, powerful notes app designed for developers and deep thinkers. Your ideas, instantly accessible.
          </p>
        </div>

        {/* Action Buttons: Highlight "Sign up" */}
        <div className="flex justify-center gap-4">
          <Link to="/register">
            {/* Primary button: large, prominent CTA */}
            <Button size="xl" className="shadow-lg hover:shadow-xl font-semibold">
              Start Taking Notes (Free)
            </Button>
          </Link>
          <Link to="/login">
            {/* Secondary button: outline for less visual weight */}
            <Button variant="outline" size="xl">
              Log in
            </Button>
          </Link>
        </div>

        {/* Features Card: Now using Shadcn Card structure for a professional look */}
        <Card className="mt-16 w-full text-left shadow-2xl transition-all hover:shadow-primary/30">
          
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">Features Built for Focus</CardTitle>
            <CardDescription>Everything you need to capture, organize, and manage your knowledge efficiently.</CardDescription>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Feature 1: Markdown Notes */}
            <div className="flex flex-col items-center text-center p-4 border rounded-lg bg-accent/10">
              <Check className="h-6 w-6 text-primary mb-2" />
              <p className="font-semibold">Markdown Support</p>
              <p className="text-sm text-muted-foreground">Create, edit, and organize notes using powerful Markdown syntax.</p>
            </div>

            {/* Feature 2: Trash/Restore */}
            <div className="flex flex-col items-center text-center p-4 border rounded-lg bg-accent/10">
              <Trash2 className="h-6 w-6 text-primary mb-2" />
              <p className="font-semibold">Safe Deletion</p>
              <p className="text-sm text-muted-foreground">Soft-delete notes and instantly restore them from the dedicated Trash bin.</p>
            </div>

            {/* Feature 3: Profile Management */}
            <div className="flex flex-col items-center text-center p-4 border rounded-lg bg-accent/10">
              <User className="h-6 w-6 text-primary mb-2" />
              <p className="font-semibold">Profile Management</p>
              <p className="text-sm text-muted-foreground">Update your personal details, password, and custom avatar URL.</p>
            </div>

          </CardContent>
          
          {/* CardFooter could be used for a small final CTA or status */}
          <CardFooter className="justify-center text-sm text-muted-foreground pt-4">
            No limits. Just notes.
          </CardFooter>
          
        </Card>
        
      </div>
      
    </div>
  );
}