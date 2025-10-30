import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const contact = pgTable(
  "Contact",
  {
    id: serial("id").primaryKey(),
    phoneNumber: varchar("phoneNumber"),
    email: varchar("email"),
    linkedId: integer("linkedId"),
    linkPrecedence: varchar("linkPrecedence").default("primary"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
    deletedAt: timestamp("deletedAt"),
  },
  (table) => ({
    emailIndex: index("contact_email_idx").on(table.email),
    phoneIndex: index("contact_phone_idx").on(table.phoneNumber),
    linkedIdIndex: index("contact_linked_id_idx").on(table.linkedId),
    emailPhoneIndex: index("contact_email_phone_idx").on(
      table.email,
      table.phoneNumber
    ),
    linkedPrecedenceIndex: index("contact_linked_precedence_idx").on(
      table.linkedId,
      table.linkPrecedence
    ),
    createdAtIndex: index("contact_created_at_idx").on(table.createdAt),
  })
);

export type Contact = typeof contact.$inferSelect;
export type NewContact = typeof contact.$inferInsert;
