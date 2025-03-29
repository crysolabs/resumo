import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy")
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function getInitials(name: string) {
  if (!name) return "U"

  const parts = name.split(" ")
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function calculateCompletionPercentage(data: any, requiredFields: string[]) {
  if (!data) return 0

  const filledFields = requiredFields.filter((field) => {
    const value = field.split(".").reduce((obj, key) => obj?.[key], data)
    return value !== undefined && value !== null && value !== ""
  })

  return Math.round((filledFields.length / requiredFields.length) * 100)
}

export function isUserPro(subscription: any) {
  if (!subscription) return false

  return (
    subscription.plan === "PRO" &&
    subscription.status === "ACTIVE" &&
    subscription.stripeCurrentPeriodEnd &&
    new Date(subscription.stripeCurrentPeriodEnd) > new Date()
  )
}

