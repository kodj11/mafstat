import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Star, ThumbsDown, Crown, Hash, Landmark, Crosshair, Pencil, X } from "lucide-react"; // Импортируем Crosshair и Pencil
import useSWR from 'swr';
import Cookies from 'js-cookie';
import API_BASE_URL from "@/lib/server";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Player {
  id: number;
  nickname: string;
  role: string;
  score: number;
  is_lead: boolean;
  is_killed_first?: boolean;
  additional_points?: number;
}

interface Game {
  game_id: number;
  game_date: string;
  winner: string;
  table_number: number;
  game_number: number;
  players: Player[];
  best_movers?: string[];
}

export function GamesList() {
  const token = Cookies.get('mafiaToken');
  const [page, setPage] = useState(1);
  const limit = 30;
  const offset = (page - 1) * limit;

  const currentYear = new Date().getFullYear();
  const years = ["Все года", ...Array.from({length: currentYear - 2020 + 1}, (_, i) => (2020 + i).toString())];
  const monthsList = [
    "Любой месяц",
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь"
  ];
  const [selectedYear, setSelectedYear] = useState<string>("Все года");
  const [selectedMonth, setSelectedMonth] = useState<string>("Любой месяц");

  // Преобразуем месяц в номер для API
  const monthParam = (selectedMonth !== "Любой месяц" && selectedYear !== "Все года") ? monthsList.indexOf(selectedMonth) : undefined;
  const yearParam = selectedYear !== "Все года" ? parseInt(selectedYear) : undefined;

  const fetcher = async (url: string, body: any, token: string) => {
    // Гарантируем, что limit и offset всегда числа
    const safeBody = {
      ...body,
      limit: typeof body.limit === 'number' && !isNaN(body.limit) ? body.limit : 30,
      offset: typeof body.offset === 'number' && !isNaN(body.offset) ? body.offset : 0,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-CSRF-Token': Cookies.get('csrf_token') || ''
      },
      body: JSON.stringify(safeBody),
    });
    if (res.status === 401) {
      Cookies.remove('mafiaToken');
      window.location.replace('/login');
      throw new Error('Unauthorized');
    }
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR(
    token ? ["/api/games-summary-strict", offset, limit, yearParam, monthParam, token] : null,
    ([_, offset, limit, year, month, token]) => fetcher(`${API_BASE_URL}/api/games-summary-strict`, { offset, limit, year, month }, token),
    { revalidateOnFocus: false }
  );

  const [expandedGames, setExpandedGames] = useState<Record<number, boolean>>({});
  const [editGameId, setEditGameId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadFoundPlayers, setLeadFoundPlayers] = useState<any[]>([]);
  const [leadIsSearching, setLeadIsSearching] = useState(false);
  const [playerSearch, setPlayerSearch] = useState<string[]>(Array(10).fill(""));
  const [playerFoundPlayers, setPlayerFoundPlayers] = useState<any[]>(Array(10).fill([]));
  const [playerIsSearching, setPlayerIsSearching] = useState<boolean[]>(Array(10).fill(false));
  const [openPlayerPopovers, setOpenPlayerPopovers] = useState<boolean[]>(Array(10).fill(false));
  const [openLeadPopover, setOpenLeadPopover] = useState(false);

  useEffect(() => {
    // Получаем всех игроков для автокомплита
    fetch(`${API_BASE_URL}/api/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": Cookies.get("csrf_token") || ""
      },
      body: JSON.stringify({ limit: 1000, offset: 0 })
    })
      .then(res => res.json())
      .then(data => setAllPlayers(data.players || []));
  }, []);

  // Поиск ведущего
  useEffect(() => {
    if (!openLeadPopover) return;
    if (leadSearch.length < 1) { setLeadFoundPlayers([]); setLeadIsSearching(false); return; }
    setLeadIsSearching(true);
    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/search-players`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": Cookies.get("csrf_token") || "" },
        body: JSON.stringify({ query: leadSearch, limit: 5, offset: 0 })
      })
        .then(res => res.json())
        .then(data => setLeadFoundPlayers(data.players || []))
        .finally(() => setLeadIsSearching(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [leadSearch, openLeadPopover]);

  // Поиск игроков
  useEffect(() => {
    openPlayerPopovers.forEach((open, idx) => {
      if (!open) return;
      const search = playerSearch[idx];
      if (search.length < 1) { setPlayerFoundPlayers(arr => { const copy = [...arr]; copy[idx] = []; return copy; }); setPlayerIsSearching(arr => { const copy = [...arr]; copy[idx] = false; return copy; }); return; }
      setPlayerIsSearching(arr => { const copy = [...arr]; copy[idx] = true; return copy; });
      const timer = setTimeout(() => {
        fetch(`${API_BASE_URL}/api/search-players`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": Cookies.get("csrf_token") || "" },
          body: JSON.stringify({ query: search, limit: 5, offset: 0 })
        })
          .then(res => res.json())
          .then(data => setPlayerFoundPlayers(arr => { const copy = [...arr]; copy[idx] = data.players || []; return copy; }))
          .finally(() => setPlayerIsSearching(arr => { const copy = [...arr]; copy[idx] = false; return copy; }));
      }, 200);
      return () => clearTimeout(timer);
    });
  }, [openPlayerPopovers, playerSearch]);

  const toggleGameExpand = (gameId: number) => {
    setExpandedGames((prev) => ({
      ...prev,
      [gameId]: !prev[gameId],
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const RoleDisplay = ({ role, isKilledFirst }: { role: string, isKilledFirst?: boolean }) => {
    let roleElement: JSX.Element;
    switch (role) {
      case "peaceful":
        roleElement = <span>Мирный</span>;
        break;
      case "sheriff":
        roleElement = (
          <span className="flex items-center">
            Шериф <Star className="ml-1 text-yellow-500" size={16} />
          </span>
        );
        break;
      case "mafia":
        roleElement = (
          <span className="flex items-center">
            Мафия <ThumbsDown className="ml-1" size={16} />
          </span>
        );
        break;
      case "don":
        roleElement = (
          <span className="flex items-center">
            Дон <Crown className="ml-1" size={16} />
          </span>
        );
        break;
      default:
        roleElement = <span>{role}</span>;
    }
    return (
      <span className="flex items-center">
        {roleElement}
        {isKilledFirst && <Crosshair className="ml-1.5 text-red-600" size={16} />}
      </span>
    );
  };

  if (error) return <div className="p-4 text-red-500">Ошибка: {error.message}</div>;

  // Скелетоны для загрузки
  const loadingSkeleton = (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="flex flex-col">
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 flex justify-between items-center">
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16 ml-2" />
                  <Skeleton className="h-3 w-16 ml-2" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="p-4 border-t mt-2">
              <div className="mb-4 flex flex-wrap items-center gap-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-12 ml-4" />
              </div>
              <div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const games = (data?.games && Array.isArray(data.games))
    ? data.games.map((game: Game) => ({
        ...game,
        players: game.players.filter((player: Player | null): player is Player => player !== null && player !== undefined),
      }))
    : [];

  // Пагинация
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Генерация массива страниц для пагинации (с ... если страниц много)
  function getPageNumbers(current: number, total: number) {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) range.unshift('...');
    if (current + delta < total - 1) range.push('...');
    range.unshift(1);
    if (total > 1) range.push(total);
    return Array.from(new Set(range));
  }

  const roles = [
    { value: "peaceful", label: "Мирный" },
    { value: "mafia", label: "Мафия" },
    { value: "don", label: "Дон" },
    { value: "sheriff", label: "Шериф" },
  ];

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Все игры</h2>
        {/* Mobile: stacked selectors below title, Desktop: inline */}
        <div className="flex-col gap-2 mt-2 flex md:hidden">
          <Select value={selectedYear} onValueChange={v => { setSelectedYear(v); setPage(1); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Год" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Год</SelectLabel>
                {years.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={v => { setSelectedMonth(v); setPage(1); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Месяц" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Месяц</SelectLabel>
                {monthsList.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="hidden md:flex flex-wrap items-center gap-4 mt-4 md:mt-0">
          <Select value={selectedYear} onValueChange={v => { setSelectedYear(v); setPage(1); }}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Год" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Год</SelectLabel>
                {years.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={v => { setSelectedMonth(v); setPage(1); }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Месяц" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Месяц</SelectLabel>
                {monthsList.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        loadingSkeleton
      ) : games.length === 0 ? (
        <p>Нет данных об играх</p>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            {games.map((game: Game) => {
              const leadPlayer = game.players.find((p: Player) => p.is_lead);
              const playersInTable = game.players.filter((player: Player) => !player.is_lead && player.nickname);
              const bestMoverNumbers = game.best_movers
                ?.map((bestMoverNickname: string) => {
                  const playerIndex = playersInTable.findIndex((player: Player) => player.nickname === bestMoverNickname);
                  return playerIndex !== -1 ? playerIndex + 1 : null;
                })
                .filter((number: number | null): number is number => number !== null);

              // Инлайн-редактирование
              const isEditing = editGameId === game.game_id;
              const [winner, setWinner] = isEditing ? [editForm.winner, (v: string) => setEditForm((f: any) => ({ ...f, winner: v }))] : [game.winner, () => {}];
              const [bestMoves, setBestMoves] = isEditing ? [editForm.best_movers, (v: string[]) => setEditForm((f: any) => ({ ...f, best_movers: v }))] : [game.best_movers || [], () => {}];
              const [playerScores, setPlayerScores] = isEditing
                ? [editForm.playerScores, (id: number, value: string) => setEditForm((f: any) => ({ ...f, playerScores: { ...f.playerScores, [id]: Number(value) } }))]
                : [Object.fromEntries(game.players.map((p) => [p.id, p.score])), () => {}];

              const handleBestMovesChange = (value: string) => {
                setBestMoves(value.split(",").map((s) => s.trim()).filter(Boolean));
              };

              const handleSave = async () => {
                try {
                  const res = await fetch(`${API_BASE_URL}/api/game/${game.game_id}`, {
                    method: "PATCH",
                    headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json",
                      "X-CSRF-Token": Cookies.get("csrf_token") || ""
                    },
                    body: JSON.stringify({
                      winner,
                      best_moves: bestMoves,
                      players: game.players.map((p) => ({ id: p.id, score: playerScores[p.id] }))
                    })
                  });
                  if (!res.ok) {
                    // Можно добавить обработку ошибок
                  } else {
                    setEditGameId(null);
                    mutate();
                  }
                } catch (e) {
                  // Можно добавить обработку ошибок
                }
              };

              return (
                <div key={game.game_id} className="flex flex-col">
                  <div className="border rounded-lg overflow-hidden transition-all">
                    {/* Только header кликабелен для раскрытия/сворачивания */}
                    <div
                      className="p-4 flex justify-between items-center cursor-pointer select-none"
                      onClick={() => toggleGameExpand(game.game_id)}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Trophy
                            className={game.winner === "peaceful" ? "text-red-500" : ""}
                            size={20}
                          />
                          <span>{formatDate(game.game_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Landmark size={14} />
                          <span>
                            {isEditing ? (
                              <Input
                                type="number"
                                min={1}
                                max={9}
                                value={editForm.table_number ?? game.table_number}
                                onChange={e => setEditForm((f: any) => ({ ...f, table_number: Number(e.target.value) }))}
                                className="w-16 px-1 py-0.5 text-sm"
                              />
                            ) : (
                              <>Стол: {game.table_number}</>
                            )}
                          </span>
                          <Hash size={14} className="ml-2" />
                          <span>
                            {isEditing ? (
                              <Input
                                type="number"
                                min={1}
                                max={49}
                                value={editForm.game_number ?? game.game_number}
                                onChange={e => setEditForm((f: any) => ({ ...f, game_number: Number(e.target.value) }))}
                                className="w-16 px-1 py-0.5 text-sm"
                              />
                            ) : (
                              <>Игра: {game.game_number}</>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {game.winner === "peaceful" ? "Мирные" : "Мафия"}
                      </div>
                    </div>
                    {expandedGames[game.game_id] && (
                      <div className="p-4 border-t mt-2 relative" onClick={e => e.stopPropagation()}>
                        {/* Кнопка редактирования */}
                        {!isEditing && (
                          <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-blue-600"
                            onClick={e => { e.stopPropagation(); setEditGameId(game.game_id); setEditForm({
                              winner: game.winner,
                              best_moves: game.best_movers || [],
                              playerRows: game.players.map((p: Player) => ({
                                id: p.id,
                                nickname: p.nickname,
                                role: p.role,
                                additional_points: typeof p.additional_points === 'number' ? p.additional_points : 0,
                              })),
                              table_number: game.table_number,
                              game_number: game.game_number,
                              lead_player_id: game.players.find((p: Player) => p.is_lead)?.id || null,
                              best_moves_numbers: (game.best_movers || []).map((_, i) => i + 1),
                            }); }}
                            title="Редактировать"
                          >
                            <Pencil size={20} />
                          </button>
                        )}
                        {/* Инлайн-редактирование ведущего */}
                        <div className="mb-4 flex flex-wrap items-center gap-x-4">
                          <span className="font-medium">Ведущий: </span>
                          {isEditing ? (
                            <Popover open={openLeadPopover} onOpenChange={open => { setOpenLeadPopover(open); if (open) { setLeadSearch(""); setLeadFoundPlayers([]); } }}>
                              <PopoverTrigger>
                                <Button variant="outline" className="w-40 truncate">
                                  {(() => {
                                    const lead = allPlayers.find(p => p.id === editForm.lead_player_id);
                                    return lead ? lead.username : "Выбрать ведущего";
                                  })()}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-0">
                                <Command>
                                  <CommandInput placeholder="Поиск ведущего..." value={leadSearch} onValueChange={setLeadSearch} />
                                  {leadIsSearching && (<div className="p-2 text-center text-sm text-muted-foreground">Поиск...</div>)}
                                  <CommandEmpty>Не найдено</CommandEmpty>
                                  <CommandGroup>
                                    {leadFoundPlayers.map((player: any) => (
                                      <CommandItem
                                        key={player.id}
                                        value={player.username}
                                        onSelect={() => { setEditForm((f: any) => ({ ...f, lead_player_id: player.id })); setOpenLeadPopover(false); setLeadSearch(""); setLeadFoundPlayers([]); }}
                                      >
                                        {player.username}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <span>{leadPlayer?.nickname || "Не указан"}</span>
                          )}
                        </div>
                        {/* Инлайн-редактирование лучших ходов */}
                        <div className="mb-4 flex flex-wrap items-center gap-x-4">
                          <span className="font-medium">Лучший ход: </span>
                          {isEditing ? (
                            <div className="flex gap-2">
                              {[0, 1, 2].map((idx) => (
                                <Input
                                  key={idx}
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={editForm.best_moves_numbers?.[idx] || ""}
                                  onChange={e => setEditForm((f: any) => {
                                    const arr = Array.isArray(f.best_moves_numbers) ? [...f.best_moves_numbers] : [null, null, null];
                                    arr[idx] = e.target.value === "" ? null : Math.max(1, Math.min(10, parseInt(e.target.value)));
                                    return { ...f, best_moves_numbers: arr };
                                  })}
                                  placeholder={`Ход ${idx + 1}`}
                                  className="w-16"
                                />
                              ))}
                            </div>
                          ) : (
                            <span>{(game.best_movers || []).join(", ")}</span>
                          )}
                        </div>
                        {/* Инлайн-редактирование игроков */}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>№</TableHead>
                              <TableHead>Ник</TableHead>
                              <TableHead>Роль</TableHead>
                              <TableHead>Баллы</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {playersInTable.map((player: Player, index: number) => (
                              <TableRow key={`${game.game_id}-${player.id}`}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <Popover open={openPlayerPopovers[index]} onOpenChange={open => { setOpenPlayerPopovers(arr => { const copy = [...arr]; copy[index] = open; return copy; }); if (open) { setPlayerSearch(arr => { const copy = [...arr]; copy[index] = ""; return copy; }); setPlayerFoundPlayers(arr => { const copy = [...arr]; copy[index] = []; return copy; }); } }}>
                                      <PopoverTrigger>
                                        <Button variant="outline" className="w-32 truncate">
                                          {(() => {
                                            const p = allPlayers.find(p => p.id === editForm.playerRows?.[index]?.id);
                                            return p ? p.username : "Выбрать игрока";
                                          })()}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-64 p-0">
                                        <Command>
                                          <CommandInput placeholder="Поиск игрока..." value={playerSearch[index]} onValueChange={v => setPlayerSearch(arr => { const copy = [...arr]; copy[index] = v; return copy; })} />
                                          {playerIsSearching[index] && (<div className="p-2 text-center text-sm text-muted-foreground">Поиск...</div>)}
                                          <CommandEmpty>Не найдено</CommandEmpty>
                                          <CommandGroup>
                                            {playerFoundPlayers[index].map((p: any) => (
                                              <CommandItem
                                                key={p.id}
                                                value={p.username}
                                                onSelect={() => { setEditForm((f: any) => {
                                                  const newRows = [...f.playerRows];
                                                  newRows[index] = { ...newRows[index], id: p.id, nickname: p.username };
                                                  return { ...f, playerRows: newRows, [`playerPopoverOpen${index}`]: false };
                                                }); setOpenPlayerPopovers(arr => { const copy = [...arr]; copy[index] = false; return copy; }); setPlayerSearch(arr => { const copy = [...arr]; copy[index] = ""; return copy; }); setPlayerFoundPlayers(arr => { const copy = [...arr]; copy[index] = []; return copy; }); }}
                                              >
                                                {p.username}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                  ) : (
                                    player.nickname
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <Select
                                      value={editForm.playerRows?.[index]?.role}
                                      onValueChange={v => setEditForm((f: any) => {
                                        const newRows = [...f.playerRows];
                                        newRows[index] = { ...newRows[index], role: v };
                                        return { ...f, playerRows: newRows };
                                      })}
                                    >
                                      <SelectTrigger className="w-28">
                                        <SelectValue placeholder="Роль" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {roles.map(r => (
                                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <RoleDisplay role={player.role} isKilledFirst={player.is_killed_first} />
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={editForm.playerRows?.[index]?.additional_points ?? playersInTable[index]?.additional_points ?? 0}
                                      onChange={e => setEditForm((f: any) => {
                                        const newRows = [...f.playerRows];
                                        newRows[index] = { ...newRows[index], additional_points: parseFloat(e.target.value) };
                                        return { ...f, playerRows: newRows };
                                      })}
                                      className="w-20 px-1 py-0.5 text-sm"
                                    />
                                  ) : (
                                    player.score
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {isEditing && (
                          <div className="flex gap-2 mt-4">
                            <button
                              className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
                              onClick={async () => {
                                // Преобразуем лучшие ходы (номера) в user_id
                                const bestMovesUserIds = (editForm.best_moves_numbers || []).map((num: number) => {
                                  const row = editForm.playerRows?.[num - 1];
                                  return row?.id;
                                }).filter(Boolean);
                                // Формируем PATCH-запрос
                                setIsSaving(true);
                                setEditError(null);
                                try {
                                  const res = await fetch(`${API_BASE_URL}/api/game/${game.game_id}`, {
                                    method: "PATCH",
                                    headers: {
                                      "Authorization": `Bearer ${token}`,
                                      "Content-Type": "application/json",
                                      "X-CSRF-Token": Cookies.get("csrf_token") || ""
                                    },
                                    body: JSON.stringify({
                                      table_number: editForm.table_number,
                                      game_number: editForm.game_number,
                                      winner: editForm.winner,
                                      lead_player_id: editForm.lead_player_id,
                                      best_moves: bestMovesUserIds,
                                      players: editForm.playerRows?.map((row: any) => ({
                                        user_id: row.id,
                                        role: row.role,
                                        additional_points: row.additional_points
                                      }))
                                    })
                                  });
                                  if (!res.ok) {
                                    const data = await res.json();
                                    setEditError(data.error || "Ошибка сохранения");
                                  } else {
                                    setEditGameId(null);
                                    mutate();
                                  }
                                } catch (e) {
                                  setEditError("Ошибка сети");
                                } finally {
                                  setIsSaving(false);
                                }
                              }}
                              disabled={isSaving}
                            >
                              Сохранить
                            </button>
                            <button
                              className="bg-gray-300 px-4 py-1 rounded"
                              onClick={() => setEditGameId(null)}
                              disabled={isSaving}
                            >
                              Отмена
                            </button>
                            {editError && <span className="text-red-500 ml-2">{editError}</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(page - 1)}
                    aria-disabled={page === 1}
                    tabIndex={page === 1 ? -1 : 0}
                    style={{ pointerEvents: page === 1 ? 'none' : undefined }}
                  />
                </PaginationItem>
                {getPageNumbers(page, totalPages).map((p, idx) =>
                  p === '...'
                    ? <PaginationItem key={"ellipsis-" + idx}><PaginationEllipsis /></PaginationItem>
                    : <PaginationItem key={p}>
                        <PaginationLink
                          isActive={p === page}
                          onClick={() => typeof p === 'number' && setPage(p)}
                          aria-current={p === page ? 'page' : undefined}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(page + 1)}
                    aria-disabled={page === totalPages}
                    tabIndex={page === totalPages ? -1 : 0}
                    style={{ pointerEvents: page === totalPages ? 'none' : undefined }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
