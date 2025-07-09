import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Dashboard } from "./Dashboard";
import { Toaster } from "sonner";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">Chef</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        <Dashboard />
      </Authenticated>
      
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-full">
          <div className="w-full max-w-md mx-auto">
            <div className="flex flex-col gap-section">
              <div className="text-center">
                <h1 className="text-5xl font-bold text-primary mb-4">Device Activation Server</h1>
                <p className="text-xl text-secondary">Sign in to access the dashboard</p>
              </div>
              <SignInForm />
            </div>
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}
