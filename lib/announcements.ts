export type Announcement = {
  id: number;
  message: string;
  type: "sale" | "info" | "warning";
  active: boolean;
};

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, message: "🌸 Grand Sale! Use code CHENNI10 for 10% off your order!", type: "sale", active: true },
  { id: 2, message: "🎁 Free shipping on all orders this week!", type: "info", active: true },
];

export function getAnnouncements(): Announcement[] {
  if (typeof window === "undefined") return DEFAULT_ANNOUNCEMENTS;
  const stored = localStorage.getItem("announcements");
  if (!stored) {
    localStorage.setItem("announcements", JSON.stringify(DEFAULT_ANNOUNCEMENTS));
    return DEFAULT_ANNOUNCEMENTS;
  }
  return JSON.parse(stored);
}

export function getActiveAnnouncements(): Announcement[] {
  return getAnnouncements().filter((a) => a.active);
}

export function saveAnnouncements(list: Announcement[]) {
  localStorage.setItem("announcements", JSON.stringify(list));
}
