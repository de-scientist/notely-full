import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Check, Trash2, User, Users, Feather, Clock } from 'lucide-react'; // Added new icons

export function LandingPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-4xl space-y-12 text-center">
        
        {/*
          =================================================
          🎯 UNIQUE VALUE PROPOSITION (UVP)
          =================================================
          The headline is now sharp, clear, and highlights the core benefit (UVP).
        */}
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 sm:text-6xl">
            <Feather className="inline-block h-10 w-10 text-primary mr-3" />
            The Frictionless Notes App. <span className="text-primary">Write Faster, Think Deeper.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Stop fighting with complex tools. Notely is the minimal, powerful platform designed for **instant capture** and **effortless organization**.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link to="/register">
            <Button size="xl" className="shadow-lg hover:shadow-xl font-semibold">
              Start Taking Notes (Free)
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="xl">
              Log in
            </Button>
          </Link>
        </div>

        {/*
          =================================================
          📊 SOCIAL PROOF / STATS SECTION
          =================================================
          A new section added below the CTA to build trust immediately.
        */}
        <div className="grid grid-cols-3 gap-8 pt-6">
          <div className="text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-1" />
            <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">15K+</p>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </div>
          <div className="text-center">
            <Check className="h-8 w-8 text-primary mx-auto mb-1" />
            <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">99.9%</p>
            <p className="text-sm text-muted-foreground">Uptime Guarantee</p>
          </div>
          <div className="text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-1" />
            <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">2 Sec</p>
            <p className="text-sm text-muted-foreground">Avg. Load Time</p>
          </div>
        </div>
        
        {/* Features Card */}
        <Card className="mt-16 w-full text-left shadow-2xl transition-all hover:shadow-primary/30">
          
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">Features Built for Focus</CardTitle>
            <CardDescription>Everything you need to capture, organize, and manage your knowledge efficiently.</CardDescription>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="flex flex-col items-center text-center p-4 border rounded-lg bg-accent/10">
              <Check className="h-6 w-6 text-primary mb-2" />
              <p className="font-semibold">Markdown Support</p>
              <p className="text-sm text-muted-foreground">Create, edit, and organize notes using powerful Markdown syntax.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 border rounded-lg bg-accent/10">
              <Trash2 className="h-6 w-6 text-primary mb-2" />
              <p className="font-semibold">Safe Deletion</p>
              <p className="text-sm text-muted-foreground">Soft-delete notes and instantly restore them from the dedicated Trash bin.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 border rounded-lg bg-accent/10">
              <User className="h-6 w-6 text-primary mb-2" />
              <p className="font-semibold">Profile Management</p>
              <p className="text-sm text-muted-foreground">Update your personal details, password, and custom avatar URL.</p>
            </div>

          </CardContent>
          
          <CardFooter className="justify-center text-sm text-muted-foreground pt-4">
            No limits. Just notes.
          </CardFooter>
          
        </Card>
        
      </div>
      
    </div>
  );
}