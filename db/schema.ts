import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const userStates = sqliteTable("crous_user_states", {
  userId: text("user_id").primaryKey(),
  state: text("state").notNull(),
  revision: integer("revision").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
});
