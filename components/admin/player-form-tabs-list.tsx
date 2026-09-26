import { TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABS = [
  { value: "basic", label: "Basic Info", short: "Basic" },
  { value: "fifa", label: "FIFA Attributes", short: "FIFA" },
  { value: "stats", label: "Main Stats", short: "Main" },
  { value: "detailed", label: "Detailed Stats", short: "Detailed" },
]

// Tab row for the create/edit player forms; shorter labels on phones so the
// four tabs fit side by side without overlapping.
export function PlayerFormTabsList() {
  return (
    <TabsList className="grid w-full grid-cols-4 mb-6">
      {TABS.map((tab) => (
        <TabsTrigger key={tab.value} value={tab.value} className="px-1 sm:px-3">
          <span className="sm:hidden">{tab.short}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  )
}
