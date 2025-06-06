import React, { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

import { useToast } from "@/hooks/use-toast"
import { Lock, KeyRound, CalendarDays } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

import API_BASE_URL from "@/lib/server";
import Cookies from 'js-cookie';

// Получить JWT-токен из cookie (или localStorage, если нужно)
const getToken = () => {
  const token = Cookies.get('mafiaToken');
  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
};

export function GeneralSettings() {
  const [isOpenReg, setIsOpenReg] = useState(true)
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpNew, setOtpNew] = useState("")
  const [otpStep, setOtpStep] = useState<"check"|"set">("check")
  const [period, setPeriod] = useState("")
  const { toast } = useToast()

  const token = getToken();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`).then(r => r.json()).then(d => setIsOpenReg(!!d.is_open_reg))
  }, [])

  const handleToggleReg = async () => {
    setLoading(true)
    const csrfToken = Cookies.get('csrf_token') || '';
    const res = await fetch(`${API_BASE_URL}/api/settings/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify({ is_open_reg: !isOpenReg })
    })
    if (res.ok) {
      setIsOpenReg(v => !v)
      toast({ title: "Статус регистрации обновлён" })
    } else {
      toast({ title: "Ошибка", description: "Не удалось обновить статус регистрации", variant: "destructive" })
    }
    setLoading(false)
  }

  const handleOtpCheck = async () => {
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
      setOtpStep("set")
      toast({ title: "Пин-код подтверждён. Введите новый." })
    } else {
      toast({ title: "Неверный пин-код", variant: "destructive" })
    }
    setLoading(false)
  }

  const handleOtpSet = async () => {
    setLoading(true)
    const csrfToken = Cookies.get('csrf_token') || '';
    const res = await fetch(`${API_BASE_URL}/api/settings/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify({ new_pin: otpNew })
    })
    if (res.ok) {
      setOtp("")
      setOtpNew("")
      setOtpStep("check")
      toast({ title: "Пин-код обновлён" })
    } else {
      toast({ title: "Ошибка", description: "Не удалось обновить пин-код", variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <Card className="p-6 flex items-center gap-4">
        <Lock className="text-muted-foreground" />
        <div className="flex-1">
          <div className="font-semibold">Доступ к регистрации</div>
          <div className="text-sm text-muted-foreground">Включить или выключить регистрацию новых пользователей</div>
        </div>
        <Switch checked={isOpenReg} onCheckedChange={handleToggleReg} disabled={loading} />
      </Card>
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="text-muted-foreground" />
          <div className="font-semibold">Пин-код для доступа к админ-панели</div>
        </div>
        {otpStep === "check" ? (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Введите текущий пин-код</div>
            <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={loading}>
              <InputOTPGroup>
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <Button onClick={handleOtpCheck} disabled={loading || otp.length !== 6} className="mt-2">Проверить</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Введите новый пин-код</div>
            <InputOTP maxLength={6} value={otpNew} onChange={setOtpNew} disabled={loading}>
              <InputOTPGroup>
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <Button onClick={handleOtpSet} disabled={loading || otpNew.length !== 6} className="mt-2">Сохранить новый пин-код</Button>
            <Button variant="ghost" onClick={() => { setOtpStep("check"); setOtp(""); setOtpNew("") }} className="mt-2">Отмена</Button>
          </div>
        )}
      </Card>
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-muted-foreground" />
          <div className="font-semibold">Доступ к результатам периода</div>
        </div>
        <div className="text-sm text-muted-foreground">Управление доступом к результатам выбранного периода</div>
        <div className="flex gap-2 items-center">
          <Input type="text" placeholder="Период (например, 2024-01)" value={period} onChange={e => setPeriod(e.target.value)} className="max-w-xs" />
          <Button disabled>Сохранить</Button>
        </div>
      </Card>
    </div>
  )
} 