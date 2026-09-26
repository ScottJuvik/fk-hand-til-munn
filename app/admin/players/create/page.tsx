"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PlayerFormTabsList } from "@/components/admin/player-form-tabs-list"
import { Checkbox } from "@/components/ui/checkbox"
import { StarRating } from "@/components/star-rating"
import Loading from "./loading"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { StatInput } from "@/components/admin/stat-input"
import { DetailedStatInputs } from "@/components/admin/detailed-stat-inputs"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

const DEFAULT_STAT = 75

export default function CreatePlayer() {
  const router = useRouter()
  // Back goes wherever the page was opened from: the dashboard shortcut adds
  // ?from=dashboard, otherwise it's the Manage Players list.
  const fromDashboard = useSearchParams().get("from") === "dashboard"
  const { userRole } = useAuth()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    position: "ST",
    rating: 75,
    nationality: "Norway",
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
  })

  useEffect(() => {
    if (userRole !== "admin") {
      router.push("/login")
    } else {
      setIsAuthorized(true)
    }
    setIsLoading(false)
  }, [router])

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
        [name]: Number.parseInt(value) || 0,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to create player")
      }

      toast({ title: "Player created" })
      router.push("/admin/players")
    } catch (error) {
      console.error("Error creating player:", error)
      toast({
        title: "Failed to create player",
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

  if (!isAuthorized) {
    return null // Router will redirect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto py-8 px-4">
        <AdminPageHeader
          title="Create New Player"
          backHref={fromDashboard ? "/admin/dashboard" : "/admin/players"}
          backLabel={fromDashboard ? "Dashboard" : "Players"}
        />

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
                      <Label htmlFor="position">Position</Label>
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
                      <Input id="club" name="club" value={formData.club} disabled />
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
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isSaving ? "Creating..." : "Create Player"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}
