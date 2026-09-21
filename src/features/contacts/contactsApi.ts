import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../config/supabase";
import type { Contact, ContactFilters, ContactInput } from "./contactTypes";
let demoContacts: Contact[] = [
  {
    id: "demo-1",
    owner_id: "demo-user",
    full_name: "Maya Chen",
    email: "maya@northstar.studio",
    company: "Northstar Studio",
    status: "active",
    source: "Referral",
    phone: "+1 415 555 0182",
    notes: "Expanding into the west coast market.",
    created_at: "2026-09-18T09:00:00Z",
    updated_at: "2026-09-18T09:00:00Z",
  },
  {
    id: "demo-2",
    owner_id: "demo-user",
    full_name: "Jon Bell",
    email: "jon@fieldnote.co",
    company: "Fieldnote",
    status: "lead",
    source: "Event",
    phone: "+1 212 555 0134",
    notes: "Met at Product Assembly.",
    created_at: "2026-09-12T09:00:00Z",
    updated_at: "2026-09-12T09:00:00Z",
  },
  {
    id: "demo-3",
    owner_id: "demo-user",
    full_name: "Amina Okafor",
    email: "amina@commonthread.org",
    company: "Common Thread",
    status: "active",
    source: "Partner",
    phone: "+44 20 7946 0958",
    notes: "Quarterly partnership review due.",
    created_at: "2026-08-29T09:00:00Z",
    updated_at: "2026-08-29T09:00:00Z",
  },
  {
    id: "demo-4",
    owner_id: "demo-user",
    full_name: "Leo Martins",
    email: "leo@aperture.io",
    company: "Aperture",
    status: "inactive",
    source: "Inbound",
    phone: null,
    notes: "Revisit in Q4.",
    created_at: "2026-08-17T09:00:00Z",
    updated_at: "2026-08-17T09:00:00Z",
  },
];
export const contactsApi = createApi({
  reducerPath: "contactsApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Contact"],
  endpoints: (builder) => ({
    getContacts: builder.query<Contact[], ContactFilters & { demo?: boolean }>({
      queryFn: async (filters) => {
        if (filters.demo) return { data: filterDemo(filters) };
        let query = supabase.from("contacts").select("*");
        if (filters.search)
          query = query.or(
            `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`,
          );
        if (filters.status !== "all")
          query = query.eq("status", filters.status);
        if (filters.source !== "all")
          query = query.eq("source", filters.source);
        query = query.order("created_at", {
          ascending: filters.sort === "oldest",
        });
        const { data, error } = await query;
        return error
          ? { error: { status: "CUSTOM_ERROR", error: error.message } }
          : { data: (data ?? []) as Contact[] };
      },
      providesTags: ["Contact"],
    }),
    createContact: builder.mutation<
      Contact,
      { input: ContactInput; demo?: boolean }
    >({
      queryFn: async ({ input, demo }) => {
        if (demo) {
          const contact = {
            ...input,
            id: `demo-${Date.now()}`,
            owner_id: "demo-user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Contact;
          demoContacts = [contact, ...demoContacts];
          return { data: contact };
        }
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData.user)
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                userError?.message ??
                "You must be signed in to create a contact.",
            },
          };
        const { data, error } = await supabase
          .from("contacts")
          .insert({ ...input, owner_id: userData.user.id })
          .select()
          .single();
        return error
          ? {
              error: {
                status: "CUSTOM_ERROR",
                error: error.message,
                data: {
                  code: error.code,
                  details: error.details,
                  hint: error.hint,
                },
              },
            }
          : { data: data as Contact };
      },
      invalidatesTags: ["Contact"],
    }),
    updateContact: builder.mutation<
      Contact,
      { id: string; input: ContactInput; demo?: boolean }
    >({
      queryFn: async ({ id, input, demo }) => {
        if (demo) {
          const contact = {
            ...input,
            id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Contact;
          demoContacts = demoContacts.map((item) =>
            item.id === id ? contact : item,
          );
          return { data: contact };
        }
        const { data, error } = await supabase
          .from("contacts")
          .update(input)
          .eq("id", id)
          .select()
          .single();
        return error
          ? { error: { status: "CUSTOM_ERROR", error: error.message } }
          : { data: data as Contact };
      },
      invalidatesTags: ["Contact"],
    }),
    deleteContact: builder.mutation<void, { id: string; demo?: boolean }>({
      queryFn: async ({ id, demo }) => {
        if (demo) {
          demoContacts = demoContacts.filter((item) => item.id !== id);
          return { data: undefined };
        }
        const { error } = await supabase.from("contacts").delete().eq("id", id);
        return error
          ? { error: { status: "CUSTOM_ERROR", error: error.message } }
          : { data: undefined };
      },
      invalidatesTags: ["Contact"],
    }),
  }),
});
function filterDemo(filters: ContactFilters & { demo?: boolean }) {
  return demoContacts
    .filter(
      (contact) =>
        (!filters.search ||
          `${contact.full_name} ${contact.email} ${contact.company}`
            .toLowerCase()
            .includes(filters.search.toLowerCase())) &&
        (filters.status === "all" || contact.status === filters.status) &&
        (filters.source === "all" || contact.source === filters.source),
    )
    .sort((a, b) =>
      filters.sort === "oldest"
        ? a.created_at.localeCompare(b.created_at)
        : b.created_at.localeCompare(a.created_at),
    );
}
export const {
  useGetContactsQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactsApi;
