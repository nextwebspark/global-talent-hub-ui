import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { UserProfile } from "@shared/schema";
import { getAccessToken, setAccessToken, clearAccessToken } from "./token";

export interface AuthOrg {
  id: string;
  name: string;
  slug: string;
}

// Minimal session shape (app-owned auth). Mirrors the fields the UI reads off
// the old Supabase session (user.id, user.email) so consumers don't change.
export interface AuthSession {
  user: { id: string; email: string | null };
}

export interface OrgInput {
  name: string;
  slug?: string;
  teamSize?: string;
  region?: string;
}

interface MeResponse {
  user: { id: string; email: string | null } | null;
  org: AuthOrg | null;
  role: string | null;
  profile: UserProfile | null;
  lastLoginAt: string | null;
}

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  org: AuthOrg | null;
  role: string | null;
  profile: UserProfile | null;
  lastLoginAt: string | null;
  // True once we know whether the signed-in user has an org (post-bootstrap).
  orgChecked: boolean;
  signInPassword: (email: string, password: string) => Promise<void>;
  // Atomic signup: creates the account AND the organization in one call.
  signUpWithOrg: (email: string, password: string, fullName: string, org: OrgInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshOrg: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Fetch the current user's org + profile context using the stored token.
async function fetchMe(token: string): Promise<MeResponse> {
  const empty: MeResponse = { user: null, org: null, role: null, profile: null, lastLoginAt: null };
  const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return empty;
  const data = await res.json();
  return {
    user: data.user ?? null,
    org: data.org ?? null,
    role: data.role ?? null,
    profile: data.profile ?? null,
    lastLoginAt: data.lastLoginAt ?? null,
  };
}

// POST to an auth endpoint; throws the server's message on failure.
async function postAuth(path: string, body: unknown): Promise<any> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<AuthOrg | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lastLoginAt, setLastLoginAt] = useState<string | null>(null);
  const [orgChecked, setOrgChecked] = useState(false);
  // Record a login event at most once per mount, after a real sign-in.
  const loggedRef = useRef(false);

  // Hydrate org/profile from the server. Always resolves orgChecked, even on
  // error — otherwise the Gate is stuck on "Loading…" forever.
  const loadOrg = async (token: string) => {
    try {
      const me = await fetchMe(token);
      if (me.user) setSession({ user: me.user });
      setOrg(me.org);
      setRole(me.role);
      setProfile(me.profile);
      setLastLoginAt(me.lastLoginAt);
    } catch {
      setOrg(null);
      setRole(null);
    } finally {
      setOrgChecked(true);
    }
  };

  // Clear all auth state (sign-out or invalid token on boot).
  const reset = () => {
    clearAccessToken();
    loggedRef.current = false;
    setSession(null);
    setOrg(null);
    setRole(null);
    setProfile(null);
    setLastLoginAt(null);
    setOrgChecked(true);
  };

  // On mount: restore a stored token (if any) and hydrate.
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setOrgChecked(true);
      setLoading(false);
      return;
    }
    (async () => {
      await loadOrg(token);
      setLoading(false);
    })();
  }, []);

  // Record the sign-in event once (best-effort).
  const recordLogin = (token: string) => {
    if (loggedRef.current) return;
    loggedRef.current = true;
    fetch("/api/auth/login-event", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  const signInPassword = async (email: string, password: string) => {
    const data = await postAuth("/api/auth/login", { email, password });
    setAccessToken(data.token);
    setSession({ user: data.user });
    setOrgChecked(false);
    await loadOrg(data.token);
    recordLogin(data.token);
  };

  const signUpWithOrg = async (email: string, password: string, fullName: string, orgInput: OrgInput) => {
    const data = await postAuth("/api/auth/signup", { email, password, name: fullName, org: orgInput });
    setAccessToken(data.token);
    setSession({ user: data.user });
    setOrgChecked(false);
    await loadOrg(data.token);
    recordLogin(data.token);
  };

  const signOut = async () => {
    reset();
  };

  const refreshProfile = async () => {
    const token = getAccessToken();
    if (!token) return;
    const me = await fetchMe(token);
    setProfile(me.profile);
    setOrg(me.org);
    setRole(me.role);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        org,
        role,
        profile,
        lastLoginAt,
        orgChecked,
        signInPassword,
        signUpWithOrg,
        signOut,
        refreshOrg: async () => {
          const token = getAccessToken();
          if (token) await loadOrg(token);
        },
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
