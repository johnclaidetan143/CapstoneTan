export type UserProfile = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

export type SavedAddress = {
  name: string;
  phone: string;
  address: string;
  city: string;
};

export function getUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("registeredUser");
  return u ? JSON.parse(u) : null;
}

export function saveUser(user: UserProfile) {
  localStorage.setItem("registeredUser", JSON.stringify(user));
}

export function getSavedAddress(): SavedAddress | null {
  if (typeof window === "undefined") return null;
  const a = localStorage.getItem("savedAddress");
  return a ? JSON.parse(a) : null;
}

export function saveAddress(address: SavedAddress) {
  localStorage.setItem("savedAddress", JSON.stringify(address));
}
