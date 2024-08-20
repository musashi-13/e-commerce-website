  import { relations, sql } from "drizzle-orm";
  import {
    index,
    integer,
    jsonb,
    pgTableCreator,
    primaryKey,
    serial,
    text,
    timestamp,
    varchar,
  } from "drizzle-orm/pg-core";
  import { type AdapterAccount } from "next-auth/adapters";

  /**
   * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
   * database instance for multiple projects.
   *
   * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
   */
  export const createTable = pgTableCreator((name) => `e-comm-site_${name}`);

  export const users = createTable("user", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    image: varchar("image", { length: 255 }),
    cart: jsonb("cart"),
    favorites: jsonb("favorites"),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  });

  export const accounts = createTable("account", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    accessToken: varchar("access_token", { length: 255 }),
    refreshToken: varchar("refresh_token", { length: 255 }),
    expiresAt: timestamp("expires_at"),
  });

  export const sessions = createTable("session", {
    id: serial("id").primaryKey(),
    sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
    userId: integer("user_id").notNull().references(() => users.id),
    expires: timestamp("expires").notNull(),
  });

  export const verificationTokens = createTable(
    "verification_token",
    {
      identifier: varchar("identifier", { length: 255 }).notNull(),
      token: varchar("token", { length: 255 }).notNull(),
      expires: timestamp("expires", {
        mode: "date",
        withTimezone: true,
      }).notNull(),
    },
    (vt) => ({
      compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
  );

  export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
  }));