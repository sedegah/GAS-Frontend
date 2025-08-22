"use client";

import { Card, CardContent } from "@/components/ui/card";
import SignInForm from "@/components/auth/sign-in-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
}
