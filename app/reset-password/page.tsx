"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

function ResetPasswordErrorContent() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error === "access_denied" && errorDescription) {
      setMessage(decodeURIComponent(errorDescription.replace(/\+/g, " ")));
    } else {
      setMessage("Invalid or expired password reset link.");
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50 px-4 text-center">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-800">
            Password Reset Error
          </h1>
          <p className="text-red-600 mb-6">{message}</p>
          <a
            href="https://gas-frontend-v2.vercel.app/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordErrorContent />
    </Suspense>
  );
}
