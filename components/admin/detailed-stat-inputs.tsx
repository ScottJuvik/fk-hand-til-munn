import type { ChangeEvent } from "react"
import { StatInput } from "@/components/admin/stat-input"

// Every detailed stat, in card order (pace, shooting, passing, dribbling,
// defending, physical groups).
const DETAILED_STATS: [key: string, label: string][] = [
  ["acceleration", "Acceleration"],
  ["sprint_speed", "Sprint Speed"],
  ["positioning", "Positioning"],
  ["finishing", "Finishing"],
  ["shot_power", "Shot Power"],
  ["long_shots", "Long Shots"],
  ["vision", "Vision"],
  ["crossing", "Crossing"],
  ["free_kick", "Free Kick"],
  ["short_passing", "Short Passing"],
  ["long_passing", "Long Passing"],
  ["curve", "Curve"],
  ["agility", "Agility"],
  ["balance", "Balance"],
  ["reactions", "Reactions"],
  ["ball_control", "Ball Control"],
  ["composure", "Composure"],
  ["interceptions", "Interceptions"],
  ["heading_accuracy", "Heading Accuracy"],
  ["marking", "Marking"],
  ["standing_tackle", "Standing Tackle"],
  ["sliding_tackle", "Sliding Tackle"],
  ["jumping", "Jumping"],
  ["stamina", "Stamina"],
  ["strength", "Strength"],
  ["aggression", "Aggression"],
]

/** The "Detailed Stats" fields shared by the create and edit player forms. */
export function DetailedStatInputs({
  stats,
  onChange,
}: {
  stats: Record<string, number>
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {DETAILED_STATS.map(([key, label]) => (
        <StatInput key={key} statKey={key} label={label} value={stats[key]} onChange={onChange} />
      ))}
    </div>
  )
}
