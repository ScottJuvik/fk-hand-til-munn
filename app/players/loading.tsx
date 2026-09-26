import { LoadingSpinner } from "@/components/loading-spinner"

// Shown while this page's code and data load. The page renders this same screen while fetching,
// so the text doesn't change partway through (the generic "Loading" did).
export default function Loading() {
  return <LoadingSpinner label="Loading players" />
}
