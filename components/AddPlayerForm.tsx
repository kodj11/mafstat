import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Mail, BadgeCheck, Globe } from "lucide-react";
import API_BASE_URL from "@/lib/server";
import Cookies from 'js-cookie';

// Фоновое облако ников (все под одним углом, абсолютное позиционирование)
function NicknamesCloud({ nicknames }: { nicknames: string[] }) {
  const lines = 10;
  const perLine = Math.ceil(nicknames.length / lines);
  const nickLines: string[][] = Array.from({ length: lines }, (_, i) =>
    nicknames.slice(i * perLine, (i + 1) * perLine)
  );
  return (
    <div
      className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none select-none"
      style={{ transform: 'rotate(12deg)' }}
    >
      {nickLines.map((line, idx) => (
        <div
          key={idx}
          className="absolute left-0  flex whitespace-nowrap"
          style={{
            top: `${(idx + 0.5) * (100 / lines) * 2.3}%`,
            height: '10vh',
            animation: `${idx % 2 === 0 ? 'marquee-ltr' : 'marquee-rtl'} ${132 - idx * 2}s linear infinite`,
            // Чередуем направление и скорость
            willChange: 'transform',
          }}
        >
          {[...line, ...line, ...line].map((nick, i) => {
            const size = Math.random() * 4.2 + 4.8; // 2.8em - 5em
            const opacity = 0.65 + Math.random() * 0.35; // 0.55-0.9
            return (
              <span
                key={nick + i}
                style={{
                  fontSize: `${size}em`,
                  opacity,
                  marginLeft: 0,
                  marginRight: 0,
                  padding: '0 0.2em',
                  whiteSpace: 'nowrap',
                }}
                className="text-zinc-400 font-bold pointer-events-none select-none"
              >
                {nick}
              </span>
            );
          })}
        </div>
      ))}
      <style>{`
        @keyframes marquee-ltr {
          0% { transform: translateX(-100vw); }
          100% { transform: translateX(0vw); }
        }
        @keyframes marquee-rtl {
          0% { transform: translateX(0vw); }
          100% { transform: translateX(-100vw); }
        }
      `}</style>
    </div>
  );
}

export function AddPlayerForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Игрок");
  const [geolocation, setGeolocation] = useState("Россия");
  const [isOpenProfile, setIsOpenProfile] = useState(true);
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [nicknames, setNicknames] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": Cookies.get('csrf_token') || ''
      },
      body: JSON.stringify({ limit: 30, offset: 0 })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.players) {
          setNicknames(data.players.map((p: any) => p.username));
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username || !password) {
      toast({ title: "Заполните все поля", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": Cookies.get('csrf_token') || ''
        },
        body: JSON.stringify({
          email,
          username,
          password,
          profile: {
            status,
            geolocation,
            is_open_profile: isOpenProfile ? 1 : 0,
            contact_email: contactEmail || null
          }
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Игрок успешно добавлен!", description: `ID: ${data.user_id}` });
        setEmail("");
        setUsername("");
        setPassword("");
        setStatus("Игрок");
        setGeolocation("Россия");
        setIsOpenProfile(true);
        setContactEmail("");
      } else {
        toast({ title: "Ошибка", description: data.detail || "Не удалось добавить игрока", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Ошибка сети", description: "Попробуйте позже", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="relative min-h-[420px] flex items-center justify-center py-12">
        {/*<NicknamesCloud nicknames={nicknames} />*/}
      <div className="relative w-full max-w-lg">
        
        <form
          onSubmit={handleSubmit}
          className="relative z-10 w-full rounded-2xl bg-white/90 dark:bg-zinc-900/90 shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 backdrop-blur-md"
          style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)" }}
        >
            
          <h2 className="text-2xl font-bold mb-6 text-center tracking-tight">Добавить игрока</h2>
          {/* Первая строка */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="username" className="flex items-center gap-2 mb-2"><User className="w-4 h-4" />Имя пользователя</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="off" />
            </div>
            <div className="flex-1">
              <Label htmlFor="password" className="flex items-center gap-2 mb-2"><Lock className="w-4 h-4" />Пароль</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            </div>
          </div>
          {/* Вторая строка */}
          <div className="mb-4">
            <Label htmlFor="email" className="flex items-center gap-2 mb-2"><Mail className="w-4 h-4" />Почта</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="off" />
          </div>
          {/* Третья строка */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="status" className="flex items-center gap-2 mb-2"><BadgeCheck className="w-4 h-4" />Статус</Label>
              <Input id="status" value={status} onChange={e => setStatus(e.target.value)} />
            </div>
            <div className="flex-1">
              <Label htmlFor="geolocation" className="flex items-center gap-2 mb-2"><Globe className="w-4 h-4" />Геолокация</Label>
              <Input id="geolocation" value={geolocation} onChange={e => setGeolocation(e.target.value)} />
            </div>
          </div>
          {/* Открытый профиль и контактный email */}
          <div className="flex items-center gap-2 mb-4">
            <input id="is_open_profile" type="checkbox" checked={isOpenProfile} onChange={e => setIsOpenProfile(e.target.checked)} className="accent-zinc-500" />
            <Label htmlFor="is_open_profile">Открытый профиль</Label>
            <div className="flex-1" />
            <Label htmlFor="contact_email" className="flex items-center gap-2 mb-2">Контактный email</Label>
            <Input id="contact_email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="max-w-[180px]" />
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-2 text-base font-semibold shadow-md">
            {loading ? "Добавление..." : "Добавить игрока"}
          </Button>
        </form>
      </div>
    </div>
  );
} 