"use client"

import { ComponentType } from "react"

interface NavItem {
  title: string
  url: string
  icon?: ComponentType<{ className?: string }>
  isActive?: boolean
  onClick?: () => void
  items?: Array<{
    title: string
    url: string
    onClick?: () => void
    icon?: ComponentType<{ className?: string }>
    disabled?: boolean
  }>
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div key={item.title}>
          <button
            onClick={(e) => {
              e.preventDefault()
              item.onClick?.()
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-accent w-full text-left ${
              item.isActive ? "bg-accent" : ""
            }`}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.title}
          </button>
          {item.items && (
            <div className="ml-6 mt-1 space-y-1">
              {item.items.map((subItem) => (
                <button
                  key={subItem.title}
                  onClick={(e) => {
                    if (subItem.disabled) {
                      e.preventDefault()
                      return
                    }
                    e.preventDefault()
                    subItem.onClick?.()
                  }}
                  className={`block px-3 py-1.5 text-sm rounded w-full text-left ${subItem.disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-accent'} `}
                  disabled={subItem.disabled}
                >
                  {subItem.icon && <subItem.icon className="h-4 w-4 mr-2" />}
                  {subItem.title}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}