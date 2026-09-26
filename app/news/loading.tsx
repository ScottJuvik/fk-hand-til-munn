import { LoadingSpinner } from "@/components/loading-spinner"

// Shown while this page's code and data load. Replaces the generic "Loading" from app/loading.tsx.
export default function Loading() {
  return <LoadingSpinner label="Loading news" />
}
