
import { useEffect, useState } from "react";
import {
  Plane,
  User,
  ChevronDown,
  LogOut,
  History,
  UserRound,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import { KSH } from "@/lib/shabikia";
import { AuthModal } from "@/components/AuthModal";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type Profile = {
  id: string;
  balance: number | null;
};

type AuthMode = "login" | "register";

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);

  // Fetch only columns permitted by the database.
  const fetchProfile = async (userId: string) => {
    setBalanceLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, balance")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Could not fetch user balance:", error.message);
      setProfile(null);
      setBalanceLoading(false);
      return;
    }

    setProfile(data as Profile);
    setBalanceLoading(false);
  };

  // Load authenticated user and listen for auth changes.
  useEffect(() => {
    let mounted = true;

    const loadUser = async (userId: string | null) => {
      if (!mounted) return;

      if (!userId) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user || data.user.id !== userId) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(data.user);
      await fetchProfile(data.user.id);

      if (mounted) {
        setLoading(false);
        setAuthMode(null);
      }
    };

    // Check existing session.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      loadUser(data.session?.user.id ?? null);
    });

    // Listen for login and logout.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user.id ?? null;

      Promise.resolve().then(() => loadUser(userId));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Logout.
  const handleLogout = async () => {
    setOpen(false);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }

    setUser(null);
    setProfile(null);
  };

  const displayName =
    user?.user_metadata?.username ||
    user?.phone ||
    "My Account";

  // Balance display.
  const balanceDisplay = balanceLoading
    ? "Loading..."
    : profile
      ? profile.balance === null
        ? "No balance"
        : KSH(profile.balance)
      : "Unavailable";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">

          {/* Brand */}
          <a href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-red)] red-glow">
              <Plane className="size-5 -rotate-45 text-primary-foreground" />
            </span>

            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold tracking-wide">
                SHABIKIA{" "}
                <span className="text-primary text-glow">BET</span>
              </p>
            </div>
          </a>

          {/* Authentication loading */}
          {loading ? (
            <div className="h-9 w-28 animate-pulse rounded-xl bg-secondary" />
          ) : !user ? (

            /* Logged-out navigation */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="rounded-xl border border-border bg-card/70 px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Create Account
              </button>
            </div>
          ) : (

            /* Authenticated user navigation */
            <div className="relative flex items-center gap-2">

              {/* Virtual balance */}
              <div className="hidden rounded-xl border border-border bg-card/70 px-3 py-1.5 text-right sm:block">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Balance
                </p>

                <p className="font-display text-sm font-bold text-success">
                  {balanceDisplay}
                </p>
              </div>

              {/* User dropdown trigger */}
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label="Open account menu"
                aria-expanded={open}
                className="flex items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-2 transition-colors hover:bg-secondary"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-secondary">
                  <User className="size-4" />
                </span>

                <span className="hidden max-w-28 truncate text-sm font-semibold sm:block">
                  {displayName}
                </span>

                <ChevronDown className="size-4 text-muted-foreground" />
              </button>

              {/* Dropdown menu */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
                  >
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-bold">
                        {displayName}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {user.phone}
                      </p>

                      <div className="mt-3 flex items-center justify-between sm:hidden">
                        <span className="text-xs text-muted-foreground">
                          Balance
                        </span>

                        <span className="font-display text-sm font-bold text-success">
                          {balanceDisplay}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 p-2">
                      <a
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
                      >
                        <UserRound className="size-4 text-muted-foreground" />
                        My Profile
                      </a>

                      <a
                        href="/demo-history"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
                      >
                        <History className="size-4 text-muted-foreground" />
                        History
                      </a>

                      <div className="my-1 border-t border-border" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="size-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Close dropdown when clicking outside */}
        {open && (
          <button
            type="button"
            aria-label="Close account menu"
            className="fixed inset-0 z-[-1] cursor-default"
            onClick={() => setOpen(false)}
          />
        )}
      </header>

      {/* Authentication modal */}
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onModeChange={setAuthMode}
        />
      )}
    </>
  );
}
