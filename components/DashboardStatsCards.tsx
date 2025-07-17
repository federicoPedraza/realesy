import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Eye, TrendingUp, DollarSign } from "lucide-react"
import { DashboardStats } from "@/types/property"

interface DashboardStatsCardsProps {
  stats: DashboardStats
}

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({ stats }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
        <Building2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.totalProperties}</div>
        <p className="text-xs text-muted-foreground">{stats.propertiesChange}</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
        <Eye className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{stats.viewsChange}</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.activeListings}</div>
        <p className="text-xs text-muted-foreground">{stats.listingsChange}</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{stats.revenueChange}</p>
      </CardContent>
    </Card>
  </div>
)
