import { Loader2, LucideProps } from "lucide-react";

export const Icons = {
  spinner: Loader2,
} as const;

export type Icon = keyof typeof Icons;
