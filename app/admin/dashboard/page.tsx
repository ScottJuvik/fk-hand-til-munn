"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users, UserPlus, ListChecks, Newspaper, BarChart3, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Loading from "./loading"
import { useAuth } from "@/components/auth-provider"

export default function AdminDashboard() {
  const router = useRouter()
  const { userRole } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is admin
    if (userRole !== "admin") {
      router.push("/login")
    } else {
      setIsAuthorized(true)
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthorized) {
    return null // Router will redirect
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Welcome, Admin</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Manage Players</CardTitle>
              <CardDescription>Create, edit, and delete players</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Users className="h-8 w-8 text-gray-500" />
                <Button asChild>
                  <Link href="/admin/players">Manage Players</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Create Player</CardTitle>
              <CardDescription>Add a new player to the team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <UserPlus className="h-8 w-8 text-gray-500" />
                <Button asChild>
                  <Link href="/admin/players/create?from=dashboard">Create Player</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Manage Lineups</CardTitle>
              <CardDescription>Create and edit team lineups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <ListChecks className="h-8 w-8 text-gray-500" />
                <Button asChild>
                  <Link href="/admin/lineups">Manage Lineups</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Manage News</CardTitle>
              <CardDescription>Write, edit, and delete articles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Newspaper className="h-8 w-8 text-gray-500" />
                <Button asChild>
                  <Link href="/admin/news">Manage News</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Manage Season Stats</CardTitle>
              <CardDescription>Update goals, assists, and cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <BarChart3 className="h-8 w-8 text-gray-500" />
                <Button asChild>
                  <Link href="/admin/statistics">Manage Stats</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Manage Matches</CardTitle>
              <CardDescription>Reschedule and record results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <CalendarClock className="h-8 w-8 text-gray-500" />
                <Button asChild>
                  <Link href="/admin/matches">Manage Matches</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
