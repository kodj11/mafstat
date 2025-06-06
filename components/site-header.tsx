"use client"

import { SidebarIcon } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { useDashboard } from "@/contexts/dashboard-context"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const { breadcrumbPath, setBreadcrumbPath, setContent } = useDashboard()

  const handleBreadcrumbClick = (idx: number) => {
    if (idx === 0) {
      setBreadcrumbPath(["Главная"])
      setContent(null)
    } else {
      setBreadcrumbPath(breadcrumbPath.slice(0, idx + 1))
      setContent(null) // Можно доработать для возврата к нужному контенту
    }
  }

  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-[--header-height] w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {breadcrumbPath.map((crumb, idx) => (
              <>
                <BreadcrumbItem key={crumb + idx}>
                  {idx < breadcrumbPath.length - 1 ? (
                    <BreadcrumbLink href="#" onClick={() => handleBreadcrumbClick(idx)}>
                      {crumb}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {idx < breadcrumbPath.length - 1 && <BreadcrumbSeparator />}
              </>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  )
}
