import React from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import Cookies from 'js-cookie';

const PAGE_SIZE = 30
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

function PlayerCard({ player }: { player: any }) {
  function show(val: any) {
    return val === null || val === undefined || val === "" ? "Не указано" : val
  }
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 flex flex-col items-center gap-2 border border-zinc-200 dark:border-zinc-800">
      <img
        src={player.avatar || "/avatar-placeholder.png"}
        alt="avatar"
        className="w-16 h-16 rounded-full border border-zinc-300 dark:border-zinc-700 object-cover"
      />
      <div className="font-bold text-lg">{show(player.username)}</div>
      <div className="text-xs text-zinc-500">{show(player.login)}</div>
      <div className="flex gap-2 text-xs mt-1">
        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          {player.is_admin ? "Админ" : "Пользователь"}
        </span>
        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          {player.is_online ? "Online" : "Offline"}
        </span>
        {player.is_open_profile && (
          <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700">
            Открыт
          </span>
        )}
      </div>
      <div className="text-sm mt-2 text-center">
        <span className="block font-medium">Статус:</span>
        <span className="block text-zinc-700 dark:text-zinc-300">{show(player.status)}</span>
      </div>
      <div className="text-xs text-zinc-500 mt-1">Локация: {show(player.geolocation)}</div>
      <div className="text-xs text-zinc-500">Почта: {show(player.contact_email)}</div>
      <div className="text-xs text-zinc-500">Зарегистрирован: {player.created_at ? new Date(player.created_at).toLocaleDateString() : "Не указано"}</div>
      <div className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold mt-2">Игр сыграно: {player.games_played ?? "Не указано"}</div>
    </div>
  )
}

function PlayerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 flex flex-col items-center gap-2 border border-zinc-200 dark:border-zinc-800 animate-pulse">
      <Skeleton className="w-16 h-16 rounded-full mb-2" />
      <Skeleton className="h-5 w-24 mb-1" />
      <Skeleton className="h-3 w-20 mb-2" />
      <div className="flex gap-2 w-full justify-center mb-2">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-4 w-12 rounded" />
      </div>
      <Skeleton className="h-4 w-32 mb-1" />
      <Skeleton className="h-3 w-24 mb-1" />
      <Skeleton className="h-3 w-28 mb-1" />
      <Skeleton className="h-3 w-28 mb-1" />
      <Skeleton className="h-3 w-24 mb-1" />
      <Skeleton className="h-4 w-20 mt-2" />
    </div>
  )
}

export function PlayersList() {
  const [players, setPlayers] = React.useState<any[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [searchValue, setSearchValue] = React.useState("")
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null)

  // Автоматический поиск с debounce
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      setSearchValue(search)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  React.useEffect(() => {
    setLoading(true)
    setError(null)
    const trimmed = searchValue.trim()
    const url = trimmed.length >= 1
      ? `${API_BASE_URL}/api/search-players`
      : `${API_BASE_URL}/api/players`
    const body = trimmed.length >= 1
      ? { query: trimmed, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }
      : { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": Cookies.get('csrf_token') || ''
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data.players || [])
        setTotal(data.total || 0)
      })
      .catch((e) => setError("Ошибка загрузки игроков"))
      .finally(() => setLoading(false))
  }, [page, searchValue])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-2">Все игроки</h2>
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          placeholder="Поиск по нику..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 w-full max-w-xs bg-white dark:bg-zinc-900"
        />
      </div>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => <PlayerCardSkeleton key={idx} />)
              : players.map((p) => <PlayerCard key={p.id} player={p} />)
            }
          </div>
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-disabled={page === 1}
                  tabIndex={page === 1 ? -1 : 0}
                  style={{ pointerEvents: page === 1 ? "none" : undefined }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    isActive={page === idx + 1}
                    onClick={() => setPage(idx + 1)}
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-disabled={page === totalPages}
                  tabIndex={page === totalPages ? -1 : 0}
                  style={{ pointerEvents: page === totalPages ? "none" : undefined }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  )
}

export default PlayersList 