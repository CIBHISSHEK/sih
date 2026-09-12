import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "FARMER" | "STAFF" | "ADMIN";

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  village: string;
  district: string;
  state: string;
  primaryCrop: string;
  preferredLanguage: string;
}

interface AuthState {
  token: string | null;
  role: Role | null;
  farmer: Farmer | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, role: Role, farmer: Farmer | null) => void;
  logout: () => void;
  setFarmer: (farmer: Farmer) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Reading localStorage eagerly (during the lazy useState initializer) means
// any bad value here throws before ANYTHING renders — including the landing
// page, which has no auth guard and shouldn't ever depend on this succeeding.
// A stale/malformed "farmer" entry from an older build, or localStorage being
// blocked entirely (private browsing, locked-down browser), must never take
// the whole app down.
function readInitialAuthState(): AuthState {
  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") as Role | null;
    const farmerRaw = localStorage.getItem("farmer");
    let farmer: Farmer | null = null;
    if (farmerRaw) {
      try {
        farmer = JSON.parse(farmerRaw);
      } catch {
        localStorage.removeItem("farmer");
      }
    }
    return { token, role, farmer };
  } catch {
    return { token: null, role: null, farmer: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(readInitialAuthState);

  useEffect(() => {
    try {
      if (state.token) localStorage.setItem("token", state.token);
      else localStorage.removeItem("token");
      if (state.role) localStorage.setItem("role", state.role);
      else localStorage.removeItem("role");
      if (state.farmer) localStorage.setItem("farmer", JSON.stringify(state.farmer));
      else localStorage.removeItem("farmer");
    } catch {
      // localStorage unavailable (e.g. private browsing) — auth still works
      // for the current session, it just won't survive a refresh.
    }
  }, [state]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login: (token, role, farmer) => setState({ token, role, farmer }),
      logout: () => setState({ token: null, role: null, farmer: null }),
      setFarmer: (farmer) => setState((s) => ({ ...s, farmer }))
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
