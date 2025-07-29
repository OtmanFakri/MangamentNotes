import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod"

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  Globe,
  HelpCircle,
  Timer,
  Lock,
  Users,
} from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



// Visibility statuses
export const visibilityStatuses = [
  {
    value: "private",
    label: "Privé",
    icon: Lock,
  },
  {
    value: "shared",
    label: "Partagé",
    icon: Users,
  },
  {
    value: "public",
    label: "Public",
    icon: Globe,
  },
]

// Sample tags (you can customize these)
export const tags = [
  {
    value: "work",
    label: "Travail",
  },
  {
    value: "personal",
    label: "Personnel",
  },
  {
    value: "project",
    label: "Projet",
  },
  {
    value: "idea",
    label: "Idée",
  },
  {
    value: "todo",
    label: "À faire",
  },
  {
    value: "meeting",
    label: "Réunion",
  },
]

export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.date(),
  modifiedAt: z.date(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["private", "shared", "public"]),
})

export type Note = z.infer<typeof noteSchema>




export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
]

export const statuses = [
  {
    value: "backlog",
    label: "Backlog",
    icon: HelpCircle,
  },
  {
    value: "todo",
    label: "Todo",
    icon: Circle,
  },
  {
    value: "in progress",
    label: "In Progress",
    icon: Timer,
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircle,
  },
  {
    value: "canceled",
    label: "Canceled",
    icon: CircleOff,
  },
]

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDown,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRight,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUp,
  },
]
