export type AdminSession = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
};

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  const session = getAdminSession();
  return session?.role === "admin";
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  const s = localStorage.getItem("session");
  return s ? JSON.parse(s) : null;
}

export function setAdminSession(user: AdminSession) {
  localStorage.setItem("session", JSON.stringify(user));
}

export function adminLogout() {
  localStorage.removeItem("session");
}
