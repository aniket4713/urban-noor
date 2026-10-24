"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-5xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-ivory/55">We hit a snag loading this page. Please try again.</p>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-6 max-w-3xl overflow-auto whitespace-pre-wrap rounded-xl bg-red-50 p-4 text-left text-xs text-red-600">
          {error.message}
          {"\n\n"}
          {error.stack}
        </pre>
      )}
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn-gold">Try again</button>
        <Link href="/" className="btn-outline">Go home</Link>
      </div>
    </div>
  );
}
