import { LoadingSpinner } from "@/components/loading-spinner"

// Shown while this page loads; the page reuses it while fetching, so the text
// doesn't change partway through.
export default function Loading() {
  return <LoadingSpinner label="Loading lineups" />
}
