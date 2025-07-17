import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, Heart, MessageSquare, TrendingUp } from "lucide-react"
import { Property, SocialMediaStats } from "@/types/property"

interface AnalyticsViewProps {
  totalViews: number
  viewsChange: string
  socialEngagement: number
  engagementChange: string
  inquiries: number
  inquiriesChange: string
  conversionRate: number
  conversionChange: string
  topProperties: Property[]
  socialStats: SocialMediaStats[]
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  totalViews,
  viewsChange,
  socialEngagement,
  engagementChange,
  inquiries,
  inquiriesChange,
  conversionRate,
  conversionChange,
  topProperties,
  socialStats,
}) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Analytics & Insights</h1>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{viewsChange}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Social Engagement</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{socialEngagement.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{engagementChange}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inquiries}</div>
          <p className="text-xs text-muted-foreground">{inquiriesChange}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground">{conversionChange}</p>
        </CardContent>
      </Card>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProperties.map((property, index) => (
              <div key={property.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{property.title}</p>
                    <p className="text-xs text-muted-foreground">{property.views} views</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{property.likes} likes</p>
                  <p className="text-xs text-muted-foreground">{property.shares} shares</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {socialStats.map((stat, index) => (
              <React.Fragment key={stat.platform}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{stat.platform}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium">{stat.reach.toLocaleString()} reach</p>
                    <p className="text-xs text-muted-foreground">{stat.engagements} engagements</p>
                  </div>
                </div>
                {index < socialStats.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)
