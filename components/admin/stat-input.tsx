import type { ChangeEvent } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StatInputProps {
  statKey: string
  label: string
  value: number
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}

/** A labelled 1–99 number field for one player stat, as used on the admin player forms. */
export function StatInput({ statKey, label, value, onChange, required }: StatInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={statKey}>{label}</Label>
      <Input
        id={statKey}
        name={statKey}
        type="number"
        min="1"
        max="99"
        value={value}
        onChange={onChange}
        placeholder="1-99"
        required={required}
      />
    </div>
  )
}
