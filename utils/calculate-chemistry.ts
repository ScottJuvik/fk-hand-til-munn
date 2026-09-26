export function calculatePositionChemistry(
  currentPosition: string,
  primaryPosition: string,
  alternatePositions: string | null,
): { chemistry: number; label: string } {
  // If playing in primary position, full chemistry
  if (currentPosition === primaryPosition) {
    return { chemistry: 10, label: "Perfect" }
  }

  // An alternate position is one they can play, so nearly full chemistry
  if (alternatePositions) {
    const positions = alternatePositions.split(",").map((p) => p.trim())
    if (positions.includes(currentPosition)) {
      return { chemistry: 9, label: "Strong" }
    }
  }

  // Check for similar positions (e.g., CAM and CM are similar)
  const similarPositions: Record<string, string[]> = {
    ST: ["CF", "CAM"],
    CF: ["ST", "CAM"],
    CAM: ["CF", "CM", "LW", "RW"],
    CM: ["CAM", "CDM"],
    CDM: ["CM", "CB"],
    LW: ["LM", "CAM"],
    RW: ["RM", "CAM"],
    LM: ["LW", "LB"],
    RM: ["RW", "RB"],
    LB: ["LM", "CB"],
    RB: ["RM", "CB"],
    CB: ["CDM", "LB", "RB"],
    GK: [],
  }

  // Off position, but in a related spot they link to (e.g. a CB at RB)
  if (similarPositions[primaryPosition]?.includes(currentPosition)) {
    return { chemistry: 3, label: "Weak" }
  }

  // Completely off position
  return { chemistry: 1, label: "Poor" }
}
