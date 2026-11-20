import type { TodoItem } from "./types";

/**
 * Follow-up tokens on a new todo's title (trade edition): `@name` for the customer and their
 * country, `#days` for the follow-up cadence. Tokens may appear anywhere in the line and are
 * stripped from the stored title. `@Acme @US #7 send samples quote` is a todo for Acme (US)
 * with a 7-day cadence. Pure: unit-tested, no React or storage.
 */

const CUSTOMER_OR_COUNTRY = /(^|\s)@([^\s@#]+)/gu;
const CADENCE = /(^|\s)#([1-9][0-9]{0,2})(?=\s|$)/;
const MAX_CADENCE_DAYS = 365;

export type FollowUpFields = Pick<TodoItem, "customer" | "country" | "followUpDays">;

export function parseFollowUpPrefix(title: string): { title: string } & Partial<FollowUpFields> {
  const names: string[] = [];
  for (const match of title.matchAll(CUSTOMER_OR_COUNTRY)) names.push(match[2]);
  const daysMatch = title.match(CADENCE);
  const days = daysMatch ? Number(daysMatch[2]) : NaN;
  const cleaned = title
    .replace(CUSTOMER_OR_COUNTRY, " ")
    .replace(CADENCE, " ")
    .replace(/\s{2,}/gu, " ")
    .trim();
  const fields: { title: string } & Partial<FollowUpFields> = { title: cleaned };
  if (names.length >= 1) fields.customer = names[0];
  if (names.length >= 2) fields.country = names[1];
  if (Number.isFinite(days) && days >= 1 && days <= MAX_CADENCE_DAYS) fields.followUpDays = days;
  return fields;
}

/**
 * `title` with the follow-up tags appended back, for editing an existing follow-up todo:
 * the tags read and write the same way.
 */
export function formatFollowUpSuffix(todo: Pick<TodoItem, "title"> & Partial<FollowUpFields>): string {
  const tags: string[] = [];
  if (todo.customer) tags.push(`@${todo.customer}`);
  if (todo.country) tags.push(`@${todo.country}`);
  if (todo.followUpDays) tags.push(`#${todo.followUpDays}`);
  return tags.length ? `${todo.title} ${tags.join(" ")}` : todo.title;
}
