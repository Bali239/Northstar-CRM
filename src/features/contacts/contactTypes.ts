export type ContactStatus = "lead" | "active" | "inactive";
export type ContactSource = "Referral" | "Inbound" | "Partner" | "Event";
export type Contact = { id: string; owner_id: string; full_name: string; email: string; company: string; status: ContactStatus; source: ContactSource; phone: string | null; notes: string | null; created_at: string; updated_at: string };
export type ContactInput = Omit<Contact, "id" | "owner_id" | "created_at" | "updated_at">;
export type ContactFilters = { search: string; status: ContactStatus | "all"; source: ContactSource | "all"; sort: "newest" | "oldest" };