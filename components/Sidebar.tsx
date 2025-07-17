import React from "react"
import {
  Sidebar as ShadSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarItem, User } from "@/types/property"

interface SidebarProps {
  items: SidebarItem[]
  activeId: string
  onItemClick: (id: string) => void
  user: User
}

export const Sidebar: React.FC<SidebarProps> = ({ items, activeId, onItemClick, user }) => (
  <ShadSidebar>
    <SidebarHeader>
      <div className="flex items-center gap-2 px-4 py-2">
        {(() => {
          const IconComponent = items[0]?.icon
          return IconComponent && <IconComponent className="h-6 w-6" />
        })()}
        <span className="font-semibold">RealEstate Pro</span>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton onClick={() => onItemClick(item.id)} isActive={activeId === item.id}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.role}</span>
          </div>
        </div>
      </div>
    </SidebarFooter>
  </ShadSidebar>
)
