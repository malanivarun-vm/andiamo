"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { TopAppBar } from "@/components/layout/TopAppBar";

function LoginContent() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");
  const supabase = createClient();

  async function handleGoogleSignIn() {
    if (inviteCode) {
      document.cookie = `andiamo_invite=${inviteCode}; path=/; max-age=600; SameSite=Lax`;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopAppBar showProfile={false} />
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-24">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-headline text-5xl italic text-primary mb-3">Andiamo.</h1>
          <p className="text-on-surface-variant mb-12 text-lg">
            {inviteCode ? "Sign in to join this trip." : "Group travel, decided."}
          </p>

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-4 py-4 rounded-full font-semibold text-base transition-all active:scale-95"
            style={{
              background: "#fff",
              border: "1.5px solid rgba(193,199,211,0.4)",
              color: "#1b1c1a",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {!inviteCode && (
            <p className="text-xs text-on-surface-variant mt-8">
              Have an invite code?{" "}
              <a href="/join" className="text-primary font-semibold">Join a trip →</a>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
