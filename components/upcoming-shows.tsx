"use client"

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { Calendar, MapPin, Clock, Info, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface Show {
  id: number
  venue: string
  date: string
  shortDate: string
  time: string
  location: string
  additionalInfo: string
}

interface UpcomingShowsProps {
  shows: Show[]
}

// Accordion: the first show starts expanded and the rest are compact rows.
// Only one show is open at a time, so opening one collapses the others.
// Opening and closing slide via the accordion-down/up animations in tailwind.config.ts.
export default function UpcomingShows({ shows }: UpcomingShowsProps) {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      defaultValue={shows[0] ? String(shows[0].id) : undefined}
      className="space-y-3"
    >
      {shows.map((show) => (
        <AccordionPrimitive.Item
          key={show.id}
          value={String(show.id)}
          className="group bg-white border rounded-lg transition-shadow duration-200 hover:border-gray-300 data-[state=open]:shadow-md"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left rounded-lg group-data-[state=closed]:hover:bg-gray-50 transition-colors">
              <span className="min-w-0 text-base sm:text-lg font-bold truncate group-data-[state=open]:whitespace-normal group-data-[state=open]:break-words">
                {show.venue}
              </span>
              <span className="flex items-center gap-3 text-sm text-gray-500 shrink-0">
                {/* Summary for the compact row; fades out once the details below are showing. */}
                <span className="flex items-center gap-3 transition-opacity duration-200 group-data-[state=open]:opacity-0 max-sm:group-data-[state=open]:hidden">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="sm:hidden">{show.shortDate}</span>
                    <span className="hidden sm:inline">{show.date} · {show.time}</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {show.location}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4 pb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>{show.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock className="h-4 w-4" />
                  <span>{show.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>{show.location}</span>
                </div>
                {show.additionalInfo && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Info className="h-4 w-4" />
                    <span>{show.additionalInfo}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <span className="text-lg font-bold text-green-600">Free Entry</span>
                <Button>RSVP</Button>
              </div>
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  )
}
