export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("adminLoggedIn") === "true";
}

export function adminLogout() {
  localStorage.removeItem("adminLoggedIn");
}
