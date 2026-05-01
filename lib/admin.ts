const ADMIN_EMAIL = "admin@chenni.com";
const ADMIN_PASSWORD = "admin123";

export function adminLogin(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("adminLoggedIn") === "true";
}

export function adminLogout() {
  localStorage.removeItem("adminLoggedIn");
}
