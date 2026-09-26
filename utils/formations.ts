// Single source of truth for formation position slots. The order here IS
// the stored `position_order` (index + 1) for lineup_players, and must stay
// in sync with the coordinate arrays in components/formation-view.tsx.
export const FORMATIONS: Record<string, string[]> = {
  "4-3-3": ["GK", "RB", "CB", "CB", "LB", "CDM", "CM", "CM", "ST", "RW", "LW"],
  "4-4-2": ["GK", "RB", "CB", "CB", "LB", "RM", "CM", "CM", "LM", "ST", "ST"],
  "3-5-2": ["GK", "CB", "CB", "CB", "RM", "CM", "CM", "CAM", "LM", "ST", "ST"],
}

// Coarse position groups used to rank candidates for a slot: exact position
// matches first, then the rest of the same group, then adjacent groups.
const POSITION_GROUP: Record<string, number> = {
  GK: 0,
  RB: 1,
  CB: 1,
  LB: 1,
  CDM: 2,
  CM: 2,
  CAM: 2,
  RM: 2,
  LM: 2,
  RW: 3,
  ST: 3,
  LW: 3,
}

export function sortPlayersByPosition<T extends { position: string; name: string }>(
  players: T[],
  targetPosition: string,
): T[] {
  const targetGroup = POSITION_GROUP[targetPosition] ?? 2

  return [...players].sort((a, b) => {
    const aExact = a.position === targetPosition ? 0 : 1
    const bExact = b.position === targetPosition ? 0 : 1
    if (aExact !== bExact) return aExact - bExact

    const aGroup = POSITION_GROUP[a.position] ?? 2
    const bGroup = POSITION_GROUP[b.position] ?? 2
    const aDist = Math.abs(aGroup - targetGroup)
    const bDist = Math.abs(bGroup - targetGroup)
    if (aDist !== bDist) return aDist - bDist

    return a.name.localeCompare(b.name)
  })
}

// Which side of the pitch a position plays on, for keeping players on their
// side when they move to a different position.
const POSITION_SIDE: Record<string, "L" | "R" | "C"> = {
  RB: "R",
  RM: "R",
  RW: "R",
  LB: "L",
  LM: "L",
  LW: "L",
}

// How much of a stretch it is to move a player from one position to another:
// 0 for the same position, then cheapest within the same group and side.
function moveCost(from: string, to: string): number {
  if (from === to) return 0
  const groupGap = Math.abs((POSITION_GROUP[from] ?? 2) - (POSITION_GROUP[to] ?? 2))
  const sideSwap = (POSITION_SIDE[from] ?? "C") !== (POSITION_SIDE[to] ?? "C") ? 1 : 0
  return 1 + groupGap * 10 + sideSwap * 3
}

/**
 * Carries a starting XI over to another formation instead of clearing it:
 * players keep their position where the new formation has it, and everyone
 * else moves to the closest fitting slot (same group and side preferred).
 * Finds the cheapest overall assignment, so nobody is dropped while there
 * is a slot for them. Slots nobody fits are left empty (null).
 *
 * `positionOf` gives a player's own position. A player moves by whichever
 * fits better, their own position or the slot they're in, so switching
 * formations back and forth doesn't drift players away from their roles.
 */
export function remapStarters(
  fromFormation: string,
  toFormation: string,
  starters: (number | null)[],
  positionOf?: (playerId: number) => string | undefined,
): (number | null)[] {
  const fromSlots = FORMATIONS[fromFormation] || []
  const toSlots = FORMATIONS[toFormation] || []
  const placed = starters
    .map((playerId, index) => ({ playerId, slot: fromSlots[index], own: playerId != null ? positionOf?.(playerId) : undefined }))
    .filter((p): p is { playerId: number; slot: string; own: string | undefined } => p.playerId != null && !!p.slot)
  const costFor = (p: (typeof placed)[number], to: string) =>
    Math.min(moveCost(p.slot, to), p.own ? moveCost(p.own, to) : Infinity)

  // Leaving a slot empty costs more than any move, so every player who can
  // be placed is placed.
  const EMPTY = 1000
  const states = 1 << placed.length
  // best[i][mask]: cheapest way to fill new slots i.. with the players not in mask.
  const best: number[][] = Array.from({ length: toSlots.length + 1 }, () => Array(states).fill(Infinity))
  const choice: number[][] = Array.from({ length: toSlots.length + 1 }, () => Array(states).fill(-1))
  for (let mask = 0; mask < states; mask++) best[toSlots.length][mask] = 0
  for (let i = toSlots.length - 1; i >= 0; i--) {
    for (let mask = 0; mask < states; mask++) {
      let cost = EMPTY + best[i + 1][mask]
      let pick = -1
      for (let j = 0; j < placed.length; j++) {
        if (mask & (1 << j)) continue
        const c = costFor(placed[j], toSlots[i]) + best[i + 1][mask | (1 << j)]
        if (c < cost) {
          cost = c
          pick = j
        }
      }
      best[i][mask] = cost
      choice[i][mask] = pick
    }
  }

  const next: (number | null)[] = Array(toSlots.length).fill(null)
  let mask = 0
  for (let i = 0; i < toSlots.length; i++) {
    const j = choice[i][mask]
    if (j >= 0) {
      next[i] = placed[j].playerId
      mask |= 1 << j
    }
  }
  return next
}
