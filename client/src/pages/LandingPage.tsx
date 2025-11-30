import { Link } from 'react-router-dom';
import { Button, Card } from '../components/ui';

export function LandingPage() {
  return (
    <div className="mt-16 flex flex-col items-center gap-8 text-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Capture your ideas with Notely
        </h1>
        <p className="max-w-xl text-sm text-gray-600">
          A simple, friendly notes app for your personal thoughts, ideas, and plans. Sign up to start
          creating notes in seconds.
        </p>
      </div>
      <div className="flex gap-4">
        <Link to="/login">
          <Button>Log in</Button>
        </Link>
        <Link to="/register">
          <Button className="bg-gray-900 hover:bg-black">Sign up</Button>
        </Link>
      </div>
      <Card className="mt-8 max-w-xl text-left text-sm text-gray-700">
        <p className="font-medium">What you can do with Notely:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-600">
          <li>Create, edit, and organize markdown notes.</li>
          <li>Soft-delete notes and restore them from the Trash.</li>
          <li>Update your profile details and avatar.</li>
        </ul>
      </Card>
    </div>
  );
}
