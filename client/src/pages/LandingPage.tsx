import { Link } from 'react-router-dom';
// Assuming Button and Card are correctly imported from your shadcn-based components
import { Button, Card } from '../components/ui';

export function LandingPage() {
  return (
    // Updated container: min-h-screen for full height, flex-grow, better alignment
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      
      {/* Increased gap, added max-w-3xl for better content grouping */}
      <div className="max-w-3xl space-y-8 text-center">
        
        {/* Headline section: bolder, darker text, and improved spacing */}
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 sm:text-6xl">
            Capture Your Ideas with <span className="text-primary">Notely</span>
          </h1>
          <p className="max-w-xl mx-auto text-lg text-gray-500 dark:text-gray-400">
            A simple, friendly notes app for your personal thoughts, ideas, and plans. Sign up to start
            creating notes in seconds.
          </p>
        </div>

        {/* Action Buttons: Highlight "Sign up" */}
        <div className="flex justify-center gap-4">
          <Link to="/register">
            {/* Primary button style (assuming 'primary' class is defined in shadcn) */}
            <Button size="lg" className="shadow-lg hover:shadow-xl">
              Start Free Trial
            </Button>
          </Link>
          <Link to="/login">
            {/* Secondary button style */}
            <Button variant="outline" size="lg" className="hover:bg-gray-50 dark:hover:bg-gray-800">
              Log in
            </Button>
          </Link>
        </div>

        {/* Features Card: Use Card for better visual separation and shadow */}
        <Card className="mt-12 p-6 text-left shadow-lg border-l-4 border-primary">
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            What you can do with Notely:
          </p>
          {/* Enhanced list styling */}
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              <span className="mr-2 text-primary">📝</span> Create, edit, and organize **markdown notes**.
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-primary">🗑️</span> Soft-delete notes and **restore** them from the Trash.
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-primary">👤</span> Update your **profile details** and avatar.
            </li>
          </ul>
        </Card>
        
      </div>
      
    </div>
  );
}