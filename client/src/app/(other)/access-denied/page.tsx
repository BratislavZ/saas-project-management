import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { SignedIn, SignOutButton } from "@clerk/nextjs";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
      <Card className="mx-auto max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <CardTitle className="text-xl font-semibold">
              Access Restricted
            </CardTitle>
          </div>
          <CardDescription>
            Your account or organization has been suspended.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
            <p>
              We've detected an issue with your account that requires attention.
              This may be due to a violation of our terms of service or a
              security concern.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p>To resolve this issue, please:</p>
            <ul className="list-inside list-disc space-y-1 pl-2">
              <li>Contact our support team</li>
              <li>Provide your account details</li>
              <li>
                Explain any relevant information about your recent activity
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0">
          <Link href="/support" className="w-full sm:w-auto">
            <Button variant="default" className="w-full">
              Contact Support
            </Button>
          </Link>
          <SignedIn>
            <SignOutButton>
              <Button variant="outline" className="w-full sm:w-auto">
                Sign Out
              </Button>
            </SignOutButton>
          </SignedIn>
        </CardFooter>
      </Card>
    </div>
  );
}
