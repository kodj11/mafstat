"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  Swords,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { GamesList } from "@/components/games-list"
import { useDashboard } from "@/contexts/dashboard-context"
import {AddGameForm} from "@/components/add-game"
import { GamesSummaryTable } from "@/components/games-summary-table"
import { PlayersList } from "@/components/PlayersList"
import { AddPlayerForm } from "@/components/AddPlayerForm"
import { GeneralSettings } from "@/components/GeneralSettings"

const data = {
  user: {
    name: "мохомор",
    email: "remoteforsli@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Игры",
      url: "#",
      icon: Swords,
      isActive: true,
      items: [
        {
          title: "Все игры",
          url: "#all-games",
          onClick: () => {} // Будет переопределено ниже
        },
        {
          title: "Добавить игру",
          url: "#add-game",
          onClick: () => {} // Можно добавить обработчик
        },
        {
          title: "Добавить турнир",
          url: "#add-tournament",
          onClick: () => {}, // Можно добавить обработчик
          disabled: true
        },
      ],
    },
    {
      title: "Игроки",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Все игроки",
          url: "#all-players",
          onClick: () => {} // Можно добавить обработчик
        },
        {
          title: "Добавить игрока",
          url: "#add-player",
          onClick: () => {} // Можно добавить обработчик
        },
        {
          title: "Управление пользователями",
          url: "#quantum",
          onClick: () => {} // Можно добавить обработчик
        },
      ],
    },/*
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#intro",
          onClick: () => {} // Можно добавить обработчик
        },
        {
          title: "Get Started",
          url: "#start",
          onClick: () => {} // Можно добавить обработчик
        },
        {
          title: "Tutorials",
          url: "#tutorials",
          onClick: () => {} // Можно добавить обработчик
        },
        {
          title: "Changelog",
          url: "#changelog",
          onClick: () => {} // Можно добавить обработчик
        },
      ],
    },*/
    {
      title: "Настройки системы",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Основные настройки",
          url: "#general",
          onClick: () => {} // Можно добавить обработчик
        },/*
        {
          title: "Team",
          url: "#team",
          onClick: () => {} // Можно добавить обработчик
        },
        {
          title: "Billing",
          url: "#billing",
          onClick: () => {} // Можно добавить обработчик
        },
        {
          title: "Limits",
          url: "#limits",
          onClick: () => {} // Можно добавить обработчик
        },*/
      ],
    },
  ],/*
  navSecondary: [
    {
      title: "Support",
      url: "#support",
      icon: LifeBuoy,
      onClick: () => {} // Можно добавить обработчик
    },
    {
      title: "Feedback",
      url: "#feedback",
      icon: Send,
      onClick: () => {} // Можно добавить обработчик
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#design",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#sales",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#travel",
      icon: Map,
    },
  ],*/
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setContent, setBreadcrumbPath } = useDashboard()
  console.log("AppSidebar render, setContent:", !!setContent) // Отладочное сообщение

  const handleAllGamesClick = () => {
    setBreadcrumbPath(["Главная", "Все игры"])
    setContent(<GamesList />)
  }

  const handleAddGameClick = () => {
    setBreadcrumbPath(["Главная", "Добавить игру"])
    setContent(<AddGameForm />)
  }

  const handleSummaryTableClick = () => {
    setBreadcrumbPath(["Главная", "Сформировать таблицу"])
    setContent(<GamesSummaryTable />)
  }

  const handleAllPlayersClick = () => {
    setBreadcrumbPath(["Главная", "Все игроки"])
    setContent(<PlayersList />)
  }

  const handleAddPlayerClick = () => {
    setBreadcrumbPath(["Главная", "Добавить игрока"])
    setContent(<AddPlayerForm />)
  }

  const handleGeneralSettingsClick = () => {
    setBreadcrumbPath(["Главная", "Основные настройки"])
    setContent(<GeneralSettings />)
  }

  // Обновляем данные с обработчиками
  const updatedData = {
    ...data,
    navMain: data.navMain.map(item => {
      if (item.title === "Игры") {
        return {
          ...item,
          items: item.items.map(subItem => {
            if (subItem.title === "Все игры") {
              return {
                ...subItem,
                onClick: handleAllGamesClick
              }
            }
            if (subItem.title === "Добавить игру") {
              return {
                ...subItem,
                onClick: handleAddGameClick
              }
            }
            if (subItem.title === "Сформировать таблицу") {
              return {
                ...subItem,
                onClick: handleSummaryTableClick
              }
            }
            return subItem
          }).concat({
            title: "Сформировать таблицу",
            url: "#summary-table",
            onClick: handleSummaryTableClick
          })
        }
      }
      if (item.title === "Игроки") {
        return {
          ...item,
          items: item.items.map(subItem => {
            if (subItem.title === "Все игроки") {
              return {
                ...subItem,
                onClick: handleAllPlayersClick
              }
            }
            if (subItem.title === "Добавить игрока") {
              return {
                ...subItem,
                onClick: handleAddPlayerClick
              }
            }
            return subItem
          })
        }
      }
      if (item.title === "Настройки системы") {
        return {
          ...item,
          items: item.items.map(subItem => {
            if (subItem.title === "Основные настройки") {
              return {
                ...subItem,
                onClick: handleGeneralSettingsClick
              }
            }
            return subItem
          })
        }
      }
      return item
    })
  }

  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/profile">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Gatti</span>
                  <span className="truncate text-xs">club</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={updatedData.navMain} />
        {/*<NavProjects projects={updatedData.projects} />
        <NavSecondary items={updatedData.navSecondary} className="mt-auto" />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}