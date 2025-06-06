// app/dashboard/page.tsx
"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useDashboard } from "@/contexts/dashboard-context"
import { DashboardCard } from "@/components/DashboardCard"
import { List, PlusCircle, PlayCircle, Table, UserRoundSearch } from "lucide-react"
import { GamesList } from "@/components/games-list"
import { AddGameForm } from "@/components/add-game"
import React from "react"
import { GamesSummaryTable } from "@/components/games-summary-table"
import { PlayersList } from "@/components/PlayersList"
import { InputOTP } from "@/components/ui/input-otp"
import { InputOTPGroup } from "@/components/ui/input-otp"
import { InputOTPSlot } from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Cookies from 'js-cookie'

import API_BASE_URL from "@/lib/server";

export default function Page() {
  const { content, setContent, setBreadcrumbPath, pinVerified, setPinVerified } = useDashboard()
  const [otp, setOtp] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [isError, setIsError] = React.useState(false)
  const { toast } = useToast()

  const handleAllGamesClick = React.useCallback(() => {
    setBreadcrumbPath(["Главная", "Все игры"])
    setContent(<GamesList />)
  }, [setContent, setBreadcrumbPath])

  const handleAddGameClick = React.useCallback(() => {
    setBreadcrumbPath(["Главная", "Добавить игру"])
    setContent(<AddGameForm />)
  }, [setContent, setBreadcrumbPath])

  const handlePlayGameClick = React.useCallback(() => {
    setBreadcrumbPath(["Главная", "Провести игру"])
    setContent(<div>Провести игру (заглушка)</div>)
  }, [setContent, setBreadcrumbPath])

  const handleSummaryTableClick = React.useCallback(() => {
    setBreadcrumbPath(["Главная", "Сформировать таблицу"])
    setContent(<GamesSummaryTable />)
  }, [setContent, setBreadcrumbPath])

  const handleAllPlayersClick = React.useCallback(() => {
    setBreadcrumbPath(["Главная", "Все игроки"])
    setContent(<PlayersList />)
  }, [setContent, setBreadcrumbPath])

  const handlePinSubmit = async () => {
    setLoading(true)
    const csrfToken = Cookies.get('csrf_token') || '';
    const res = await fetch(`${API_BASE_URL}/api/settings/check-pin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify({ pin: otp })
    })
    if (res.ok) {
      setPinVerified(true)
      setOtp("")
      toast({ title: "Доступ разрешён" })
    } else {
      toast({ title: "Неверный пин-код", variant: "destructive" })
      setIsError(true)
      setOtp("")
      setTimeout(() => setIsError(false), 1000)
    }
    setLoading(false)
  }

  // --- Кастомная цифровая клавиатура ---
  const handleKeypadClick = (val: string) => {
    if (loading) return;
    if (val === 'back') {
      setOtp((prev) => prev.slice(0, -1))
    } else if (otp.length < 6) {
      setOtp((prev) => prev + val)
    }
  }

  // --- Автосабмит при 6 цифрах ---
  React.useEffect(() => {
    if (otp.length === 6 && !loading && !pinVerified) {
      handlePinSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp])

  const cards = [
    { icon: List, label: "Все игры", onClick: handleAllGamesClick },
    { icon: PlusCircle, label: "Добавить игру", onClick: handleAddGameClick },
    { icon: PlusCircle, label: "Добавить турнир", onClick: handleAddGameClick, disabled: true },
    { icon: PlayCircle, label: "Провести игру", onClick: handlePlayGameClick },
    { icon: Table, label: "Сформировать таблицу", onClick: handleSummaryTableClick },
    { icon: UserRoundSearch, label: "Все игроки", onClick: handleAllPlayersClick },
  ]

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className={pinVerified ? "flex flex-col" : "flex flex-col blurred"}>
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {content || (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {cards.map((card, idx) => (
                    <DashboardCard key={idx} {...card} />
                  ))}
                </div>
              )}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <Dialog open={!pinVerified}>
        <DialogContent hideCloseButton className="max-w-xs flex flex-col items-center gap-4">
          <div className="font-semibold text-lg">Введите пин-код для доступа</div>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={loading}
            inputMode="none"
            autoFocus
          >
            <InputOTPGroup isError={isError}>
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {/* Кастомная цифровая клавиатура */}
          <div className="grid grid-cols-3 gap-2 w-full mt-2 select-none">
            {Array.from({length: 9}, (_, i) => (i+1).toString()).map((n) => (
              <button
                key={n}
                className="btn btn-secondary text-lg py-2"
                onClick={() => handleKeypadClick(n)}
                disabled={loading || otp.length >= 6}
                tabIndex={-1}
                type="button"
              >
                {n}
              </button>
            ))}
            <div></div>
            <button
              className="btn btn-secondary text-lg py-2"
              onClick={() => handleKeypadClick('0')}
              disabled={loading || otp.length >= 6}
              tabIndex={-1}
              type="button"
            >
              0
            </button>
            <button
              className="btn btn-secondary text-lg py-2"
              onClick={() => handleKeypadClick('back')}
              disabled={loading || otp.length === 0}
              tabIndex={-1}
              type="button"
            >
              ⌫
            </button>
          </div>
          {/* Кнопка входа оставляем для fallback, но скрываем если автосабмит */}
          <button
            className="btn btn-primary w-full mt-2 hidden"
            disabled={loading || otp.length !== 6}
            onClick={handlePinSubmit}
            tabIndex={-1}
            type="button"
          >
            Войти
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}