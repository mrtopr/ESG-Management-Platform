import { clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const customTwMerge = extendTailwindMerge({})

export function cn(...inputs) {
  return customTwMerge(clsx(inputs))
}
