import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, hasSupabaseConfig } from "./supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, LockKeyhole } from "lucide-react";

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(hasSupabaseConfig);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      signOut: async () => {
        if (supabase) await supabase.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (!hasSupabaseConfig) return <ConfigurationScreen />;
  if (loading) return <LoadingScreen />;
  if (!session) return <AuthScreen />;

  return <>{children}</>;
}

function ConfigurationScreen() {
  return (
    <Centered>
      <Card className="surface w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect your private database</CardTitle>
          <CardDescription>
            Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to the deployment environment.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No personal data is stored until the app is connected to the dedicated Supabase project.
        </CardContent>
      </Card>
    </Centered>
  );
}

function LoadingScreen() {
  return (
    <Centered>
      <div className="text-sm text-muted-foreground">Loading your private space…</div>
    </Centered>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage("");

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: name.trim() || email.split("@")[0] } },
          });

    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Account created. Check your email to confirm your address, then sign in.");
    }
  };

  return (
    <Centered>
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3 px-1">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Heart className="h-5 w-5" />
          </span>
          <div>
            <div className="font-display text-lg font-semibold">Work &amp; Wellbeing</div>
            <div className="text-xs text-muted-foreground">Private to you</div>
          </div>
        </div>

        <Card className="surface">
          <CardHeader>
            <CardTitle>{mode === "signin" ? "Welcome back" : "Create your private space"}</CardTitle>
            <CardDescription>
              {mode === "signin"
                ? "Sign in to access your wellbeing data."
                : "Your entries belong to your account and are protected by Supabase Row Level Security."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="h-11 rounded-xl" />
                </div>
              ) : null}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} className="h-11 rounded-xl" />
              </div>

              {message ? (
                <div className="rounded-xl border border-border bg-secondary/60 px-3 py-2.5 text-sm text-muted-foreground">
                  {message}
                </div>
              ) : null}

              <Button type="submit" disabled={busy} className="h-11 w-full rounded-xl">
                <LockKeyhole className="mr-2 h-4 w-4" />
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === "signin" ? "signup" : "signin"));
                setMessage("");
              }}
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
            </button>
          </CardContent>
        </Card>
      </div>
    </Centered>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="warm-glow flex min-h-screen items-center justify-center bg-background px-4 py-10">
      {children}
    </div>
  );
}
