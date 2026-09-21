import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../config/supabase";
import type { Contact, ContactFilters, ContactInput } from "./contactTypes";

const demoNames = [
  "Maya Chen",
  "Jon Bell",
  "Amina Okafor",
  "Leo Martins",
  "Priya Shah",
  "Daniel Cruz",
  "Harper Lee",
  "Omar Hassan",
  "Sofia Nguyen",
  "Nolan Brooks",
  "Elena Petrova",
  "Marcus Hill",
  "Grace Kim",
  "Samir Patel",
  "Rebecca Stone",
  "Noah Garcia",
  "Lena Fischer",
  "Imran Ali",
  "Chloe Adams",
  "Victor Silva",
  "Tara Wilson",
  "Ethan Ross",
  "Rina Das",
  "Thomas Moore",
  "Aisha Rahman",
  "Parker Cole",
  "Iris Novak",
  "Michael Turner",
  "Diana Scott",
  "Julian Park",
  "Nadia Wolf",
  "Brandon Lee",
  "Mila Foster",
  "Andre Green",
  "Leah Murphy",
  "Carter Hall",
  "Sana Ali",
  "Mateo Rossi",
  "Zoe Bennett",
  "Isaac Walker",
  "Hannah Reed",
  "Adrian Price",
  "Mina Patel",
  "Theo Lambert",
  "Ruby James",
  "David Ortiz",
  "Genevieve Clark",
  "Arjun Singh",
  "Emily King",
  "Christian Young",
  "Lila Cooper",
  "Evan Hughes",
  "Nina Flores",
  "Owen Foster",
  "Serena Cole",
  "Joseph Hall",
  "Amelia Ward",
  "Rahul Nair",
  "Kayla Powell",
  "Lucas Reed",
  "Ivy Brooks",
  "Rafael Costa",
  "Maya Patel",
  "Adam Collins",
  "Tessa Moore",
  "Hazel Ramirez",
  "Graham West",
  "Claire Johnson",
  "Nikhil Sen",
  "Uma Verma",
  "Liam Bennett",
  "Alina Petrova",
  "Jason Lee",
  "Ariana Gomez",
  "Henry Clark",
  "Sophia Nguyen",
  "Gabriel Ross",
  "Kira Stone",
  "Felix Dawson",
  "Olivia Brown",
  "Eli Turner",
  "Jasmine Wu",
  "Jude Miller",
  "Natalie Price",
  "Ryan Ward",
  "Leonie Martin",
  "Aiden Davis",
  "Carla Costa",
  "Benjamin Fox",
  "Anya Brooks",
  "Oliver Scott",
  "Mila Johnson",
  "Theo Cook",
  "Samantha Bell",
  "Kian Shah",
  "Aria Cooper",
  "Sebastian King",
  "Priya Nair",
  "Hudson Park",
  "Sabrina Diaz",
  "Leo White",
  "Faith Green",
  "Daniela Ruiz",
  "Victor Price",
  "Cora Foster",
  "Marcus Bell",
  "Ruby Nguyen",
  "Kai Parker",
  "Nora Collins",
  "Noah Stone",
  "Mila Ross",
  "Erica Hall",
  "Luca Young",
  "Alicia Holmes",
  "Darius Reed",
  "Elise Morgan",
  "Gavin Moore",
];

const demoCompanies = [
  "Northstar Studio",
  "Fieldnote",
  "Common Thread",
  "Aperture",
  "Juniper Labs",
  "Summit Works",
  "Harbor & Co",
  "Velora Systems",
  "Brightlane",
  "Orchid Group",
  "Pioneer Media",
  "Atlas Advisory",
  "Northwind Labs",
  "Kite & Key",
  "Signal Works",
  "Travelour",
  "Helio Labs",
  "Evermark",
  "Oak & Pine",
  "Cinder Studio",
  "Morrow Health",
  "Vantage One",
  "Crestline",
  "Lattice Works",
  "Monarch AI",
  "Lumen Energy",
  "Maple Forge",
  "Stone Peak",
  "Vera Labs",
  "Blue Harbor",
  "Summerset",
  "Silverline",
  "Nexa Cloud",
  "Edgewave",
  "Horizon One",
  "Juniper & Co",
  "Oakspire",
  "Rivepoint",
  "Facet Studio",
  "Pine Valley",
];

const demoSources = ["Inbound", "Referral", "Partner", "Event"] as const;
const demoStatuses = ["lead", "active", "inactive"] as const;
const DEMO_CONTACTS_KEY = "northstar-demo-contacts";

function buildDemoContacts(): Contact[] {
  return Array.from({ length: 100 }, (_, index) => {
    const name = demoNames[index % demoNames.length];
    const company = demoCompanies[index % demoCompanies.length];
    const status = demoStatuses[(index + (index % 3)) % demoStatuses.length];
    const source = demoSources[index % demoSources.length];
    const createdAt = new Date(
      Date.UTC(2026, 8, 3 + (index % 18), 9, 30 + (index % 7)),
    );
    const slug = company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 12);
    const first = name.split(" ")[0].toLowerCase();
    const phone = `+1 ${String(200 + (index % 700)).padStart(3, "0")} ${String(300 + (index % 500)).padStart(3, "0")} ${String(1000 + index).slice(-4)}`;

    return {
      id: `demo-${index + 1}`,
      owner_id: "demo-user",
      full_name: name,
      email: `${first}.${slug}@${slug}.com`,
      company,
      status,
      source,
      phone: index % 3 === 0 ? null : phone,
      notes:
        status === "active"
          ? "Strong relationship and warm follow-up opportunity."
          : status === "lead"
            ? "New contact entering the pipeline."
            : "Dormant contact, worth revisiting in the next quarter.",
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    };
  });
}

function readDemoContacts(): Contact[] {
  if (typeof window === "undefined") return buildDemoContacts();

  try {
    const saved = window.localStorage.getItem(DEMO_CONTACTS_KEY);
    if (!saved) return buildDemoContacts();

    const parsed = JSON.parse(saved) as Contact[] | null;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = buildDemoContacts();
      window.localStorage.setItem(DEMO_CONTACTS_KEY, JSON.stringify(initial));
      return initial;
    }

    return parsed;
  } catch {
    const fallback = buildDemoContacts();
    window.localStorage.setItem(DEMO_CONTACTS_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

function writeDemoContacts(next: Contact[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_CONTACTS_KEY, JSON.stringify(next));
}

let demoContacts: Contact[] = readDemoContacts();
const contactListTag = { type: "Contact" as const, id: "LIST" };

export const contactsApi = createApi({
  reducerPath: "contactsApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Contact"],
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
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
        if (filters.createdFrom)
          query = query.gte("created_at", `${filters.createdFrom}T00:00:00.000Z`);
        if (filters.createdTo)
          query = query.lte("created_at", `${filters.createdTo}T23:59:59.999Z`);
        query = query.order("created_at", {
          ascending: filters.sort === "oldest",
        });
        const { data, error } = await query;
        return error
          ? { error: { status: "CUSTOM_ERROR", error: error.message } }
          : { data: (data ?? []) as Contact[] };
      },
      providesTags: (result) =>
        result
          ? [
              contactListTag,
              ...result.map((contact) => ({
                type: "Contact" as const,
                id: contact.id,
              })),
            ]
          : [contactListTag],
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
          writeDemoContacts(demoContacts);
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
      invalidatesTags: [contactListTag],
    }),
    updateContact: builder.mutation<
      Contact,
      { id: string; input: ContactInput; demo?: boolean }
    >({
      queryFn: async ({ id, input, demo }) => {
        if (demo) {
          const existing = demoContacts.find(
            (item) => item.id === id && item.owner_id === "demo-user",
          );
          if (!existing)
            return {
              error: { status: "CUSTOM_ERROR", error: "Contact not found." },
            };
          const contact = {
            ...existing,
            ...input,
            updated_at: new Date().toISOString(),
          };
          demoContacts = demoContacts.map((item) =>
            item.id === id && item.owner_id === "demo-user" ? contact : item,
          );
          writeDemoContacts(demoContacts);
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
      invalidatesTags: (_result, error, argument) =>
        error
          ? []
          : [
              contactListTag,
              { type: "Contact" as const, id: argument.id },
            ],
    }),
    deleteContact: builder.mutation<void, { id: string; demo?: boolean }>({
      queryFn: async ({ id, demo }) => {
        if (demo) {
          demoContacts = demoContacts.filter(
            (item) => !(item.id === id && item.owner_id === "demo-user"),
          );
          writeDemoContacts(demoContacts);
          return { data: undefined };
        }
        const { error } = await supabase.from("contacts").delete().eq("id", id);
        return error
          ? { error: { status: "CUSTOM_ERROR", error: error.message } }
          : { data: undefined };
      },
      invalidatesTags: (_result, error, argument) =>
        error
          ? []
          : [
              contactListTag,
              { type: "Contact" as const, id: argument.id },
            ],
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
        (filters.source === "all" || contact.source === filters.source) &&
        contact.owner_id === "demo-user" &&
        (!filters.createdFrom || contact.created_at >= `${filters.createdFrom}T00:00:00.000Z`) &&
        (!filters.createdTo || contact.created_at <= `${filters.createdTo}T23:59:59.999Z`),
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
