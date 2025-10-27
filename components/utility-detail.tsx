"use client"

import { MapPin, Clock, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Utility {
  id: string
  name: string
  type: string
  building: string
  floor: string
  status: "working" | "reported" | "maintenance"
  reports: number
  lastChecked: string
}

interface UtilityDetailProps {
  utility: Utility
  onClose: () => void
  onReport: () => void
}

export function UtilityDetail({ utility, onClose, onReport }: UtilityDetailProps) {
  return (
    <Card className="absolute top-20 right-4 w-80 shadow-xl z-30 animate-in slide-in-from-right">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-balance">{utility.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {utility.building} • {utility.floor}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {utility.status === "working" && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
              Working
            </Badge>
          )}
          {utility.status === "reported" && (
            <Badge variant="destructive">
              {utility.reports} Issue{utility.reports > 1 ? "s" : ""} Reported
            </Badge>
          )}
          {utility.status === "maintenance" && (
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
              Under Maintenance
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last checked: {utility.lastChecked}</span>
          </div>
        </div>

        {utility.status === "reported" && (
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-xs text-destructive">
                <p className="font-medium">Recent reports indicate this utility may not be working properly.</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Quick Actions</h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              Get Directions
            </Button>
            <Button variant="outline" size="sm" onClick={onReport}>
              Report Issue
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <h4 className="text-sm font-semibold mb-2">Additional Info</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Accessible 24/7</p>
            <p>• Wheelchair accessible</p>
            <p>• Well-lit area</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
