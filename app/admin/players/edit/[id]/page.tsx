"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PlayerFormTabsList } from "@/components/admin/player-form-tabs-list"
import { StarRating } from "@/components/star-rating"
import { adminGetPlayer } from "@/actions/admin-data"
import type { PlayerWithStats } from "@/types/supabase"
import Loading from "./loading"
import { useAuth } from "@/components/auth-provider"
import { StatInput } from "@/components/admin/stat-input"
import { DetailedStatInputs } from "@/components/admin/detailed-stat-inputs"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { useToast } from "@/hooks/use-toast"

export default function EditPlayer({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { userRole } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [player, setPlayer] = useState<PlayerWithStats | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    rating: 75,
    nationality: "",
    club: "FK Hånd til Munn",
    shirt_number: 1,
    weak_foot: 3,
    skill_moves: 3,
    attacking_work_rate: "Medium",
    defensive_work_rate: "Medium",
    nickname: "",
    alternate_positions: "",
    specialties: "",
    is_icon: false,
    stats: {
      pace: 75,
      shooting: 75,
      passing: 75,
      dribbling: 75,
      defending: 75,
      physical: 75,
      acceleration: 75,
      sprint_speed: 75,
      positioning: 75,
      finishing: 75,
      shot_power: 75,
      long_shots: 75,
      vision: 75,
      crossing: 75,
      free_kick: 75,
      short_passing: 75,
      long_passing: 75,
      curve: 75,
      agility: 75,
      balance: 75,
      reactions: 75,
      ball_control: 75,
      composure: 75,
      interceptions: 75,
      heading_accuracy: 75,
      marking: 75,
      standing_tackle: 75,
      sliding_tackle: 75,
      jumping: 75,
      stamina: 75,
      strength: 75,
      aggression: 75,
    },
  })

  useEffect(() => {
    // Check if user is admin
    if (userRole !== "admin") {
      router.push("/login")
      return
    }

    // Fetch player data
    async function fetchPlayer() {
      setIsLoading(true)
      try {
        const { player: playerData, stats: statsData, error: playerError } = await adminGetPlayer(params.id)

        if (playerError || !playerData) {
          console.error("Error fetching player:", playerError)
          return
        }

        // New players may not have a player_stats row
        // yet, so fall back to a neutral default rather than failing to
        // load the page.
        const DEFAULT_STAT = 50
        const playerWithStats = {
          ...playerData,
          stats: statsData
            ? {
                pace: statsData.pace,
                shooting: statsData.shooting,
                passing: statsData.passing,
                dribbling: statsData.dribbling,
                defending: statsData.defending,
                physical: statsData.physical,
                acceleration: statsData.acceleration,
                sprint_speed: statsData.sprint_speed,
                positioning: statsData.positioning,
                finishing: statsData.finishing,
                shot_power: statsData.shot_power,
                long_shots: statsData.long_shots,
                vision: statsData.vision,
                crossing: statsData.crossing,
                free_kick: statsData.free_kick,
                short_passing: statsData.short_passing,
                long_passing: statsData.long_passing,
                curve: statsData.curve,
                agility: statsData.agility,
                balance: statsData.balance,
                reactions: statsData.reactions,
                ball_control: statsData.ball_control,
                composure: statsData.composure,
                interceptions: statsData.interceptions,
                heading_accuracy: statsData.heading_accuracy,
                marking: statsData.marking,
                standing_tackle: statsData.standing_tackle,
                sliding_tackle: statsData.sliding_tackle,
                jumping: statsData.jumping,
                stamina: statsData.stamina,
                strength: statsData.strength,
                aggression: statsData.aggression,
              }
            : {
                pace: DEFAULT_STAT,
                shooting: DEFAULT_STAT,
                passing: DEFAULT_STAT,
                dribbling: DEFAULT_STAT,
                defending: DEFAULT_STAT,
                physical: DEFAULT_STAT,
                acceleration: DEFAULT_STAT,
                sprint_speed: DEFAULT_STAT,
                positioning: DEFAULT_STAT,
                finishing: DEFAULT_STAT,
                shot_power: DEFAULT_STAT,
                long_shots: DEFAULT_STAT,
                vision: DEFAULT_STAT,
                crossing: DEFAULT_STAT,
                free_kick: DEFAULT_STAT,
                short_passing: DEFAULT_STAT,
                long_passing: DEFAULT_STAT,
                curve: DEFAULT_STAT,
                agility: DEFAULT_STAT,
                balance: DEFAULT_STAT,
                reactions: DEFAULT_STAT,
                ball_control: DEFAULT_STAT,
                composure: DEFAULT_STAT,
                interceptions: DEFAULT_STAT,
                heading_accuracy: DEFAULT_STAT,
                marking: DEFAULT_STAT,
                standing_tackle: DEFAULT_STAT,
                sliding_tackle: DEFAULT_STAT,
                jumping: DEFAULT_STAT,
                stamina: DEFAULT_STAT,
                strength: DEFAULT_STAT,
                aggression: DEFAULT_STAT,
              },
        }

        setPlayer(playerWithStats)
        setFormData({
          name: playerWithStats.name,
          position: playerWithStats.position,
          rating: playerWithStats.rating,
          nationality: playerWithStats.nationality || "",
          club: playerWithStats.club,
          shirt_number: playerWithStats.shirt_number ?? 1,
          weak_foot: playerWithStats.weak_foot || 3,
          skill_moves: playerWithStats.skill_moves || 3,
          attacking_work_rate: playerWithStats.attacking_work_rate || "Medium",
          defensive_work_rate: playerWithStats.defensive_work_rate || "Medium",
          nickname: playerWithStats.nickname || "",
          alternate_positions: playerWithStats.alternate_positions || "",
          specialties: playerWithStats.specialties || "",
          is_icon: playerWithStats.is_icon || false,
          stats: playerWithStats.stats,
        })
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayer()
  }, [params.id, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === "number" ? Number.parseInt(value) || 0 : value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStarRatingChange = (name: string, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [name]: Number.parseInt(value),
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/players/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update player")
      }

      toast({ title: "Player updated", description: `${formData.name} was saved.` })
      router.push("/admin/players")
    } catch (error) {
      console.error("Error updating player:", error)
      toast({
        title: "Failed to update player",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <Loading />
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Player not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <main className="container mx-auto py-8 px-4">
        <AdminPageHeader title={`Edit Player: ${player.name}`} backHref="/admin/players" backLabel="Players" />

        <form onSubmit={handleSubmit}>
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Player Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <PlayerFormTabsList />

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Player Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter player name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Nickname</Label>
                      <Input
                        id="nickname"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleInputChange}
                        placeholder="Enter player nickname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Primary Position</Label>
                      <Select
                        value={formData.position}
                        onValueChange={(value) => handleSelectChange("position", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GK">Goalkeeper (GK)</SelectItem>
                          <SelectItem value="CB">Center Back (CB)</SelectItem>
                          <SelectItem value="LB">Left Back (LB)</SelectItem>
                          <SelectItem value="RB">Right Back (RB)</SelectItem>
                          <SelectItem value="CDM">Defensive Midfielder (CDM)</SelectItem>
                          <SelectItem value="CM">Central Midfielder (CM)</SelectItem>
                          <SelectItem value="CAM">Attacking Midfielder (CAM)</SelectItem>
                          <SelectItem value="LM">Left Midfielder (LM)</SelectItem>
                          <SelectItem value="RM">Right Midfielder (RM)</SelectItem>
                          <SelectItem value="LW">Left Winger (LW)</SelectItem>
                          <SelectItem value="RW">Right Winger (RW)</SelectItem>
                          <SelectItem value="ST">Striker (ST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alternate_positions">Alternate Positions</Label>
                      <Input
                        id="alternate_positions"
                        name="alternate_positions"
                        value={formData.alternate_positions}
                        onChange={handleInputChange}
                        placeholder="e.g. CM,CAM,CDM (comma separated)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rating">Overall Rating</Label>
                      <Input
                        id="rating"
                        name="rating"
                        type="number"
                        min="1"
                        max="99"
                        value={formData.rating}
                        onChange={handleInputChange}
                        placeholder="1-99"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shirt_number">Shirt Number</Label>
                      <Input
                        id="shirt_number"
                        name="shirt_number"
                        type="number"
                        min="0"
                        max="199"
                        value={formData.shirt_number}
                        onChange={handleInputChange}
                        placeholder="0-199"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        placeholder="Enter nationality"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="club">Club</Label>
                      <Input
                        id="club"
                        name="club"
                        value={formData.club}
                        onChange={handleInputChange}
                        placeholder="Enter club"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialties">Specialties</Label>
                      <Textarea
                        id="specialties"
                        name="specialties"
                        value={formData.specialties}
                        onChange={handleInputChange}
                        placeholder="e.g. Speed Dribbler,Clinical Finisher (comma separated)"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Checkbox
                        id="is_icon"
                        checked={formData.is_icon}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, is_icon: checked === true }))
                        }
                      />
                      <Label htmlFor="is_icon" className="font-normal cursor-pointer">
                        Icon (former player) hidden from the Current Squad view
                      </Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fifa" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Skill Moves</Label>
                      <div className="flex items-center gap-2">
                        <StarRating rating={formData.skill_moves} maxRating={5} size="lg" />
                        <Select
                          value={formData.skill_moves.toString()}
                          onValueChange={(value) => handleStarRatingChange("skill_moves", Number.parseInt(value))}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="★" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 ★</SelectItem>
                            <SelectItem value="2">2 ★</SelectItem>
                            <SelectItem value="3">3 ★</SelectItem>
                            <SelectItem value="4">4 ★</SelectItem>
                            <SelectItem value="5">5 ★</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Weak Foot</Label>
                      <div className="flex items-center gap-2">
                        <StarRating rating={formData.weak_foot} maxRating={5} size="lg" />
                        <Select
                          value={formData.weak_foot.toString()}
                          onValueChange={(value) => handleStarRatingChange("weak_foot", Number.parseInt(value))}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="★" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 ★</SelectItem>
                            <SelectItem value="2">2 ★</SelectItem>
                            <SelectItem value="3">3 ★</SelectItem>
                            <SelectItem value="4">4 ★</SelectItem>
                            <SelectItem value="5">5 ★</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Attacking Work Rate</Label>
                      <Select
                        value={formData.attacking_work_rate}
                        onValueChange={(value) => handleSelectChange("attacking_work_rate", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select work rate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Defensive Work Rate</Label>
                      <Select
                        value={formData.defensive_work_rate}
                        onValueChange={(value) => handleSelectChange("defensive_work_rate", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select work rate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatInput statKey="pace" label="Pace (PAC)" value={formData.stats.pace} onChange={handleStatChange} required />
                    <StatInput statKey="shooting" label="Shooting (SHO)" value={formData.stats.shooting} onChange={handleStatChange} required />
                    <StatInput statKey="passing" label="Passing (PAS)" value={formData.stats.passing} onChange={handleStatChange} required />
                    <StatInput statKey="dribbling" label="Dribbling (DRI)" value={formData.stats.dribbling} onChange={handleStatChange} required />
                    <StatInput statKey="defending" label="Defending (DEF)" value={formData.stats.defending} onChange={handleStatChange} required />
                    <StatInput statKey="physical" label="Physical (PHY)" value={formData.stats.physical} onChange={handleStatChange} required />
                  </div>
                </TabsContent>

                <TabsContent value="detailed" className="space-y-4">
                  <DetailedStatInputs stats={formData.stats} onChange={handleStatChange} />
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex justify-center">
                <Button type="submit" className="bg-black" disabled={isSaving}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  {isSaving ? "Updating..." : "Update Player Info"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}
