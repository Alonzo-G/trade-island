import { Globe } from "lucide-react";
import { useTranslation } from "../../i18n";
import type { TodoItem } from "./types";
import "./TodoFollowUpTag.css";

/**
 * The customer follow-up tag on a todo row (trade edition): customer name, country and the
 * cadence. Nothing renders for a plain todo, so the row looks exactly as before.
 */
export function TodoFollowUpTag({ todo }: { todo: TodoItem }) {
  const t = useTranslation();
  if (!todo.customer && !todo.country && !todo.followUpDays) return null;
  const parts = [todo.customer, todo.country].filter(Boolean).join(" · ");
  const label = [parts, todo.followUpDays ? t.todo.followUpEvery(todo.followUpDays) : ""].filter(Boolean).join(" · ");
  return (
    <span className="todo-followup-tag" title={label}>
      <Globe size={11} strokeWidth={1.8} aria-hidden="true" />
      {label}
    </span>
  );
}
