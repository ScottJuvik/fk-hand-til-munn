"use client"

import { useMemo, useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FORMATIONS, sortPlayersByPosition } from "@/utils/formations"
import type { Player } from "@/types/supabase"

interface LineupPlayersFormProps {
  players: Player[]
  formation: string
  onFormationChange: (formation: string) => void
  starters: (number | null)[]
  onStarterChange: (slotIndex: number, playerId: number) => void
  substituteIds: number[]
  onToggleSubstitute: (playerId: number, checked: boolean) => void
}

export function LineupPlayersForm({
  players,
  formation,
  onFormationChange,
  starters,
  onStarterChange,
  substituteIds,
  onToggleSubstitute,
}: LineupPlayersFormProps) {
  const positions = FORMATIONS[formation] || []
  // Icons (former players) are hidden by default so the current squad is
  // easy to pick from. Icons already in this lineup always stay visible.
  const [showIcons, setShowIcons] = useState(false)

  const chosenIds = useMemo(
    () => new Set([...starters.filter((id): id is number => id !== null), ...substituteIds]),
    [starters, substituteIds],
  )

  const selectablePlayers = useMemo(
    () => (showIcons ? players : players.filter((p) => !p.is_icon || chosenIds.has(p.id))),
    [players, showIcons, chosenIds],
  )

  const showIconsToggle = (
    <label className="flex items-center gap-2 text-sm font-normal text-gray-600 cursor-pointer">
      <Checkbox checked={showIcons} onCheckedChange={(checked) => setShowIcons(checked === true)} />
      Show icons
    </label>
  )

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Formation</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={formation} onValueChange={onFormationChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(FORMATIONS).map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle>Starting XI</CardTitle>
              <CardDescription>Assign a player to each position in the {formation}.</CardDescription>
            </div>
            {showIconsToggle}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {positions.map((position, index) => {
              const available = selectablePlayers.filter((p) => !chosenIds.has(p.id) || starters[index] === p.id)
              const sorted = sortPlayersByPosition(available, position)

              return (
                <div key={index} className="space-y-2">
                  <Label>
                    {position} <span className="text-gray-400 font-normal">#{index + 1}</span>
                  </Label>
                  <Select
                    value={starters[index]?.toString() || ""}
                    onValueChange={(value) => onStarterChange(index, Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {sorted.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name} ({p.position})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle>Substitutes</CardTitle>
              <CardDescription>Optional. Pick from the remaining squad.</CardDescription>
            </div>
            {showIconsToggle}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {selectablePlayers
              .filter((p) => !starters.includes(p.id))
              .map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={substituteIds.includes(p.id)}
                    onCheckedChange={(checked) => onToggleSubstitute(p.id, checked === true)}
                  />
                  {p.name} ({p.position})
                </label>
              ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
