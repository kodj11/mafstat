"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import Cookies from 'js-cookie'
import useSWR from 'swr'

import { LogOut } from 'lucide-react';

import LogoSvg from './logo.svg'
import CalcSvg from './calc.svg'
import GlobeSvg from './globe.svg'
import CupSvg from './cup.svg'

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

import { useAuth } from "@/hooks/useAuth";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Ваша статистика",
    href: "/profile",
    description:
      "Посмотрите свою статистику. Изучите сильные и слабые карты, общую статистику и не только.",
  },
  {
    title: "Поздравляем с 14 февраля",
    href: "/",
    description:
      "Мой код работает только для тебя. С Днём всех влюблённых!",
  },
  {
    title: "Плейлист обучния",
    href: "https://www.youtube.com/playlist?list=PLYO2D_2jkrbkuCZrmthls6C31ZW1km1Ox",
    description:
      "Видео для начинающих. Хороший способ познать азы мафии.",
  },
  {
    title: "СЛИ",
    href: "https://сли.рф/",
    description: "Самый лучший институт.",
  },
  {
    title: "Сайт FSM",
    href: "https://vk.com/fsmrussia",
    description:
      "Федерация Спортивной Мафии. Правила, новости, контент.",
  },
  {
    title: "Группа ВК Гатти",
    href: "https://vk.com/mgatti",
    description:
      "В нашем клубе мы играем в спортивную и городскую мафию.",
  },
]



export function NavMenu() {
  const { user, isLoading } = useAuth();

  const handleLogout = () => {
    Cookies.remove('mafiaToken');
    window.location.replace('/login');
  };

  return (
    <div className="flex justify-between items-center p-4 ">
      <Link href="/" className="text-2xl font-bold">
        <LogoSvg
          alt="Мафия GATTI Сыктывкар"
          width={60}
          height={60}
          className="mr-2 flex justify-start"
        />
      </Link>
      <div className="hidden md:block ddnav">
        <DesktopMenu isAuthenticated={user.isAuthenticated} isAdmin={user.isAdmin} handleLogout={handleLogout} />
      </div>
      <div className="md:hidden fixed right-3">
        <MobileMenu isAuthenticated={user.isAuthenticated} isAdmin={user.isAdmin} handleLogout={handleLogout} />
      </div>
    </div>
  );
}

function DesktopMenu({ isAuthenticated, isAdmin, handleLogout }: { isAuthenticated: boolean, isAdmin: boolean, handleLogout: () => void }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-xl">Инструменты мафии</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[600px] lg:w-[610px] lg:grid-cols-[1fr_1fr_1fr]">
            <li className="w-auto">
                <NavigationMenuLink asChild>
                  <a
                    className="flex bg-gradient-complex-1 h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/table"
                  >
                    <div className="flex justify-center items-center mb-2">
                    <CalcSvg
                        alt="Калькулятор мафия"
                        width={60}
                        height={60}
                        className="object-contain"
                    />
                    </div>
                    <div className="mb-2 mt-4 text-xl font-medium">
                      Стол теории
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Место, для расчётов всех вариантов развития игры. 
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li className="w-full">
                <NavigationMenuLink asChild>
                  <a
                    className="flex bg-gradient-complex-2 h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/map"
                  >
                    <div className="flex justify-center items-center mb-2">
                    <GlobeSvg
                        alt="Где поиграть в мафию"
                        width={55}
                        height={55}
                        className="object-contain "
                    />
                    </div>
                    <div className="mb-2 mt-4 text-xl font-medium">
                      Карта мафии
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Глобус, на котором вы можете найти клубы спортивной мафии. 
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <li className="w-full">
                <NavigationMenuLink asChild>
                  <a
                    className="flex bg-gradient-complex-3 h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="https://gomafia.pro/tournaments"
                  >
                    <div className="flex justify-center items-center mb-2">
                    <CupSvg
                        alt="Турнир по мафии"
                        width={55}
                        height={55}
                        className="object-contain"
                    />
                    </div>
                    <div className="mb-2 mt-4 text-xl font-medium">
                      Турниры
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Портал с открытыми для регистрации турнирами.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-xl">Полезное</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[600px] md:grid-cols-2 lg:w-[610px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {isAdmin && (
          <NavigationMenuItem>
            <Link href="/dashboard" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                ВКлуб
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        )}
        <NavigationMenuItem>
          {isAuthenticated ? (
            <NavigationMenuLink 
              className={navigationMenuTriggerStyle()} 
              onClick={handleLogout}
              asChild
            >
              
              <a className="cursor-pointer">
                Выйти 
                <LogOut className="ml-2 opacity-90"/>
              </a>
            </NavigationMenuLink>
          ) : (
            <Link href="/profile" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Начать →
              </NavigationMenuLink>
            </Link>
          )}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function MobileMenu({ isAuthenticated, isAdmin, handleLogout }: { isAuthenticated: boolean, isAdmin: boolean, handleLogout: () => void }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Меню Гатти</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <nav className="flex flex-col space-y-4">
          <Link href="/" className="text-lg font-medium">
            На главную
          </Link>
          <Link href="/table" className="text-lg font-medium">
            Стол теории
          </Link>
          {isAdmin && (
            <Link href="/dashboard" className="text-lg font-medium text-red-600">
              ВКлуб
            </Link>
          )}
          <details className="group">
            <summary className="text-lg font-medium cursor-pointer list-none">
              Инструменты
            </summary>
            <ul className="mt-2 space-y-2 pl-4">
              <li><Link href="/map">Карта мафии</Link></li>
              <li><Link href="https://vk.com/fsmrussia">FSM</Link></li>
              <li><Link href="https://vk.com/mgatti">Группа ВК</Link></li>
            </ul>
          </details>
          <details className="group">
            <summary className="text-lg font-medium cursor-pointer list-none">
              Полезное
            </summary>
            <ul className="mt-2 space-y-2 pl-4">
              {components.map((component) => (
                <li key={component.title}>
                  <Link href={component.href}>{component.title}</Link>
                </li>
              ))}
            </ul>
          </details>
          {isAuthenticated && (
            <div 
              onClick={handleLogout}
              className="text-lg font-medium cursor-pointer hover:underline"
            >
              Выйти
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"