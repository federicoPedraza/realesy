import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus } from "lucide-react"
import { Property, DashboardStats, PerformanceMetric } from "@/types/property"
import { DashboardStatsCards } from "./DashboardStatsCards"

interface DashboardViewProps {
  stats: DashboardStats
  recentProperties: Property[]
  performance: PerformanceMetric[]
  onAddProperty?: () => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, recentProperties, performance, onAddProperty }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <Button onClick={onAddProperty}>
        <Plus className="h-4 w-4 mr-2" />
        Add Property
      </Button>
    </div>
    <DashboardStatsCards stats={stats} />
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProperties.map((property) => (
              <div key={property.id} className="flex items-center space-x-4">
                <Image
                  src={property.images[0] || "/placeholder.svg"}
                  alt={property.title}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded object-cover"
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{property.title}</p>
                  <p className="text-xs text-muted-foreground">{property.location}</p>
                </div>
                <Badge variant={property.status === "For Sale" ? "default" : "secondary"}>{property.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performance.map((metric) => (
              <div className="space-y-2" key={metric.label}>
                <div className="flex items-center justify-between text-sm">
                  <span>{metric.label}</span>
                  <span>{metric.value.toLocaleString()}</span>
                </div>
                <Progress value={metric.percentage} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)
