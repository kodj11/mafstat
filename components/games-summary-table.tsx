import React, { useMemo, useState, useRef, useEffect } from "react"
import useSWR from "swr"
import Cookies from "js-cookie"
import API_BASE_URL from "@/lib/server"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ThumbsDown, Crown, Star, Crosshair } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"

interface Player {
  id: number
  username: string
}

interface GamePlayer {
  id: number
  nickname: string
  role: string
  score: number
  is_lead: boolean
  is_killed_first?: boolean
}

interface Game {
  game_id: number
  game_date: string
  winner: string
  table_number: number
  game_number: number
  players: GamePlayer[]
}

type SortKey =
  | "username"
  | "games"
  | "wins"
  | "sumAdd"
  | "avgScore"
  | "total"
  | "place"
  | { type: "game"; gameId: number }

type SortOrder = "asc" | "desc"

interface PlayerStats {
  games: number
  wins: number
  sumAdd: number
  avgScore: number
  total: number
  place: number | null
}

export function GamesSummaryTable() {
  const token = Cookies.get("mafiaToken")
  const fetcher = async (url: string, body: any, token?: string) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": Cookies.get("csrf_token") || ""
      },
      body: JSON.stringify(body),
    })
    if (res.status === 401) {
      Cookies.remove("mafiaToken")
      window.location.replace("/login")
      throw new Error("Unauthorized")
    }
    return res.json()
  }

  // Состояние выбранной даты (по умолчанию сегодня)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().slice(0, 10)
  })

  // Получаем все игры за выбранный день с сервера
  const { data: gamesData, error: gamesError, isLoading: gamesLoading, mutate } = useSWR(
    token ? ["/api/games-summary", selectedDate, token] : null,
    ([_, date, token]) => fetcher(`${API_BASE_URL}/api/games-summary`, { start_date: date, end_date: date }, token),
    { revalidateOnFocus: false }
  )

  // Получаем всех игроков
  const { data: playersData, error: playersError, isLoading: playersLoading } = useSWR(
    token ? [`${API_BASE_URL}/api/players`, token] : null,
    ([url, token]) => fetcher(url, {}, token),
    { revalidateOnFocus: false }
  )

  // Обновлять данные при смене даты
  useEffect(() => { mutate() }, [selectedDate])

  // Игры за выбранный день (уже с сервера)
  const filteredGames: Game[] = useMemo(() => {
    if (!gamesData?.games) return []
    return gamesData.games.filter((g: Game) => Array.isArray(g.players) && g.players.length >= 5)
  }, [gamesData])

  // Сортируем игры по столу и номеру игры
  const sortedGameColumns = useMemo(() => {
    return [...filteredGames]
      .sort((a, b) => {
        if (a.table_number !== b.table_number) return a.table_number - b.table_number
        return a.game_number - b.game_number
      })
      .map(g => ({
        game_id: g.game_id,
        table_number: g.table_number,
        game_number: g.game_number,
        winner: g.winner
      }))
  }, [filteredGames])

  // Состояние порядка столбцов игр (game_id[])
  const [gameOrder, setGameOrder] = useState<number[] | null>(null)

  // Итоговый порядок столбцов игр
  const orderedGameColumns = useMemo(() => {
    if (!gameOrder) return sortedGameColumns
    // gameOrder — массив game_id в нужном порядке
    return gameOrder.map(id => sortedGameColumns.find(g => g.game_id === id)).filter(Boolean) as typeof sortedGameColumns
  }, [gameOrder, sortedGameColumns])

  // Собираем всех игроков, которые играли в выбранный день
  const playersList: Player[] = useMemo(() => {
    // Собираем всех уникальных игроков из игр
    const playerMap = new Map<number, Player>();
    filteredGames.forEach(g => {
      g.players.forEach(p => {
        if (p.id && !playerMap.has(p.id)) {
          playerMap.set(p.id, { id: p.id, username: p.nickname });
        }
      });
    });
    return Array.from(playerMap.values());
  }, [filteredGames])

  // Вспомогательная функция для красивого вывода баллов
  function formatPoints(val: number | null | undefined) {
    if (val === null || val === undefined) return "";
    const s = (Math.round(val * 100) / 100).toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1");
    return s;
  }

  // Для каждой ячейки: игрок-игра — очки (score из базы)
  function getPlayerGameScore(player: Player, game: Game): number | null {
    const p = game.players.find(gp => gp.id === player.id)
    if (!p) return null
    return p.score ?? null
  }

  // Считаем всего игр, побед, сумму допов и средний балл за день для игрока
  function getPlayerStats(player: Player): PlayerStats {
    let games = 0
    let wins = 0
    let sumAdd = 0
    let sumScore = 0
    filteredGames.forEach(game => {
      const p = game.players.find(gp => gp.id === player.id)
      if (p) {
        games++
        sumScore += p.score || 0
        if (
          (game.winner === "mafia" && (p.role === "mafia" || p.role === "don")) ||
          (game.winner === "peaceful" && (p.role === "peaceful" || p.role === "sheriff"))
        ) {
          wins++
        }
        let add = 0
        if (typeof p.score === "number") {
          if (
            (game.winner === "mafia" && (p.role === "mafia" || p.role === "don")) ||
            (game.winner === "peaceful" && (p.role === "peaceful" || p.role === "sheriff"))
          ) {
            add = p.score - 1
          } else {
            add = p.score
          }
          if (add < 0) add = 0
          sumAdd += add
        }
      }
    })
    const avgScore = games > 0 ? sumScore / games : 0
    const total = avgScore * games + sumAdd
    return { games, wins, sumAdd, avgScore, total, place: 0 }
  }

  // Сортировка
  const [sortKey, setSortKey] = useState<SortKey>("username")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  // Drag & drop refs
  const dragColIdx = useRef<number | null>(null)

  // Массив для сортировки
  const sortedPlayers = useMemo(() => {
    const arr = playersList.map(player => {
      const stats = getPlayerStats(player)
      const gameScores = orderedGameColumns.map(g => {
        const game = filteredGames.find(game => game.game_id === g.game_id)
        return game ? getPlayerGameScore(player, game) : null
      })
      return { player, stats, gameScores }
    })
    // Считаем максимальное количество игр за вечер
    const maxGames = filteredGames.reduce((max, g) => Math.max(max, g.players.length), 0)
    const totalGames = filteredGames.length
    // Сортируем: сначала по total, потом по sumAdd, потом по avgScore, потом по username
    arr.sort((a, b) => {
      // Для сортировки мест — только те, кто сыграл >= половины игр
      const aEnough = a.stats.games >= Math.ceil(totalGames / 2)
      const bEnough = b.stats.games >= Math.ceil(totalGames / 2)
      if (aEnough && !bEnough) return -1
      if (!aEnough && bEnough) return 1
      // Если оба не входят в рейтинг — сортируем между собой по total, sumAdd, avgScore, username
      if (!aEnough && !bEnough) {
        if (b.stats.total !== a.stats.total) return b.stats.total - a.stats.total
        if (b.stats.sumAdd !== a.stats.sumAdd) return b.stats.sumAdd - a.stats.sumAdd
        if (b.stats.avgScore !== a.stats.avgScore) return b.stats.avgScore - a.stats.avgScore
        return a.player.username.localeCompare(b.player.username, "ru")
      }
      // Сортировка по total, sumAdd, avgScore, username для рейтинга
      if (b.stats.total !== a.stats.total) return b.stats.total - a.stats.total
      if (b.stats.sumAdd !== a.stats.sumAdd) return b.stats.sumAdd - a.stats.sumAdd
      if (b.stats.avgScore !== a.stats.avgScore) return b.stats.avgScore - a.stats.avgScore
      return a.player.username.localeCompare(b.player.username, "ru")
    })
    // Места по убыванию total, при равенстве total — по sumAdd, avgScore, username
    let lastTotal: number | null = null
    let lastSumAdd: number | null = null
    let lastAvg: number | null = null
    let lastUsername: string | null = null
    let lastPlace = 0
    let placeCounter = 0
    arr.forEach((item, idx) => {
      const enough = item.stats.games >= Math.ceil(totalGames / 2)
      if (!enough) {
        item.stats.place = null
        return
      }
      placeCounter++
      if (
        lastTotal === null ||
        item.stats.total !== lastTotal ||
        item.stats.sumAdd !== lastSumAdd ||
        item.stats.avgScore !== lastAvg ||
        item.player.username !== lastUsername
      ) {
        lastPlace = placeCounter
        lastTotal = item.stats.total
        lastSumAdd = item.stats.sumAdd
        lastAvg = item.stats.avgScore
        lastUsername = item.player.username
      }
      item.stats.place = lastPlace
    })
    return arr
  }, [playersList, orderedGameColumns, filteredGames, sortKey, sortOrder])

  function handleSort(col: SortKey) {
    if (JSON.stringify(col) === JSON.stringify(sortKey)) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(col)
      setSortOrder("asc")
    }
  }

  // Drag & drop handlers
  function handleDragStart(idx: number) {
    dragColIdx.current = idx
  }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    // Можно добавить визуальный эффект
  }
  function handleDrop(idx: number) {
    if (dragColIdx.current === null || dragColIdx.current === idx) return
    const currentOrder = gameOrder || sortedGameColumns.map(g => g.game_id)
    const newOrder = [...currentOrder]
    const [removed] = newOrder.splice(dragColIdx.current, 1)
    newOrder.splice(idx, 0, removed)
    setGameOrder(newOrder)
    dragColIdx.current = null
  }

  const tableRef = useRef<HTMLDivElement>(null)

  if (gamesError || playersError) return <div className="p-4 text-red-500">Ошибка загрузки данных</div>

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex flex-row items-center gap-4 flex-wrap">
          <CardTitle className="mb-0">Сводная таблица игрового дня</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Input
                id="games-summary-date"
                value={selectedDate}
                readOnly
                className="w-[160px] cursor-pointer text-xl border rounded px-2 py-1"
                onClick={e => e.currentTarget.blur()} // чтобы не было клавиатуры на мобилках
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                className="text-xl"
                mode="single"
                selected={selectedDate ? new Date(selectedDate) : undefined}
                onSelect={date => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    setSelectedDate(`${year}-${month}-${day}`);
                  }
                }}
                initialFocus
                disabled={date => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        {(gamesLoading || playersLoading) ? (
          <div className="overflow-x-auto" ref={tableRef}>
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <TableHead key={idx}><Skeleton className="h-6 w-32" /></TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 10 }).map((_, idx) => (
                  <TableRow key={idx}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-28" /></TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="overflow-x-auto" ref={tableRef}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("username")}>Ник {sortKey === "username" && (sortOrder === "asc" ? "▲" : "▼")}</TableHead>
                  {orderedGameColumns.map((g, idx) => (
                    <TableHead
                      key={g.game_id}
                      className={
                        `cursor-pointer select-none text-center border-r ` +
                        (g.winner === "peaceful" ? "bg-red-500 text-white" : "")
                      }
                      style={{ minWidth: 90, maxWidth: 90, width: 90 }}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={e => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
                      onClick={() => handleSort({ type: "game", gameId: g.game_id })}
                    >
                      <div className={
                        `text-base font-semibold ` +
                        (g.winner === "peaceful" ? "text-white" : "")
                      }>Стол {g.table_number}</div>
                      <div className={
                        `text-sm ` +
                        (g.winner === "peaceful" ? "text-white" : "text-muted-foreground")
                      }>Игра {g.game_number}</div>
                    </TableHead>
                  ))}
                  <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort("games")}>Всего игр {sortKey === "games" && (sortOrder === "asc" ? "▲" : "▼")}</TableHead>
                  <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort("wins")}>Побед {sortKey === "wins" && (sortOrder === "asc" ? "▲" : "▼")}</TableHead>
                  <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort("sumAdd")}>Сумма допов {sortKey === "sumAdd" && (sortOrder === "asc" ? "▲" : "▼")}</TableHead>
                  <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort("avgScore")}>Средний балл {sortKey === "avgScore" && (sortOrder === "asc" ? "▲" : "▼")}</TableHead>
                  <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort("total")}>ИТОГ {sortKey === "total" && (sortOrder === "asc" ? "▲" : "▼")}</TableHead>
                  <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort("place")}>Место {sortKey === "place" && (sortOrder === "asc" ? "▲" : "▼")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGames.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={orderedGameColumns.length + 7} className="text-center py-8 text-lg text-muted-foreground">
                      Нет игр за выбранный день
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedPlayers.map(({ player, stats, gameScores }) => (
                    <TableRow key={player.id}>
                      <TableCell className="border-r text-base">{player.username}</TableCell>
                      {gameScores.map((score, idx) => {
                        const game = filteredGames.find(game => game.game_id === orderedGameColumns[idx].game_id)
                        const p = game?.players.find(gp => gp.id === player.id)
                        let icon = null
                        if (p?.is_killed_first) {
                          icon = <Crosshair size={18} className="ml-1 text-red-500 inline-block align-middle" />
                        } else if (p?.role === "mafia") {
                          icon = <ThumbsDown size={18} className="ml-1 text-black dark:text-white inline-block align-middle" />
                        } else if (p?.role === "don") {
                          icon = <Crown size={18} className="ml-1 text-black dark:text-white inline-block align-middle" />
                        } else if (p?.role === "sheriff") {
                          icon = <Star size={18} className="ml-1 text-yellow-400 inline-block align-middle" />
                        }
                        // score === null => игрок не участвовал
                        return (
                          <TableCell key={orderedGameColumns[idx].game_id} className="text-center border-r align-middle py-1 text-base" style={{ minWidth: 90, maxWidth: 90, width: 90 }}>
                            <span className="inline-flex items-center justify-center">
                              {score === null || score === undefined ? "" : formatPoints(score)}{icon}
                            </span>
                          </TableCell>
                        )
                      })}
                      <TableCell className="text-center border-r text-base">{stats.games || ""}</TableCell>
                      <TableCell className="text-center border-r text-base">{stats.wins || ""}</TableCell>
                      <TableCell className="text-center border-r text-base">{formatPoints(stats.sumAdd)}</TableCell>
                      <TableCell className="text-center border-r text-base">{stats.games > 0 ? formatPoints(stats.avgScore) : ""}</TableCell>
                      <TableCell className="text-center border-r text-base">{formatPoints(stats.total)}</TableCell>
                      <TableCell className="text-center text-base">{stats.place ?? ""}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 