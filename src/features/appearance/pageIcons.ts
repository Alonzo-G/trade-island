import { Clipboard, FolderInput, Languages, ListChecks, Globe, LayoutGrid, type LucideIcon } from "lucide-react";
import type { PageDot } from "./types";

export const PAGE_ICONS: Record<PageDot, LucideIcon> = {
  todo: ListChecks,
  clipboard: Clipboard,
  shelf: FolderInput,
  translation: Languages,
  trade: Globe,
  apps: LayoutGrid,
};
