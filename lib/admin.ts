export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("adminLoggedIn") === "true";
}

export function getAdminUser() {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("adminUser");
  return u ? JSON.parse(u) : null;
}

export function adminLogout() {
  localStorage.removeItem("adminLoggedIn");
  localStorage.removeItem("adminUser");
}
