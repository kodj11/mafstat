"use client" 
import API_BASE_URL from "@/lib/server";
import { useState, useEffect } from "react"
import { useDashboard } from "@/contexts/dashboard-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

import Cookies from 'js-cookie';

const roles = [
  { value: "peaceful", label: "Мирный" },
  { value: "mafia", label: "Мафия" },
  { value: "don", label: "Дон" },
  { value: "sheriff", label: "Шериф" },
]

interface Player {
  id: number;
  username: string;
  created_at: string; // ISO date string
}

interface FormPlayer {
  id: number | null;
  username: string;
  role: string;
  additionalPoints: number;
  killedFirst: boolean;
}

export function AddGameForm() {
  const { setContent } = useDashboard()
  const { toast } = useToast()
  const [gameDate, setGameDate] = useState(new Date().toISOString().slice(0, 16))
  const [winner, setWinner] = useState<"mafia" | "peaceful">("peaceful")
  const [tableNumber, setTableNumber] = useState<"1" | "2">("1");
  const [gameNumber, setGameNumber] = useState(1);
  const [players, setPlayers] = useState<FormPlayer[]>(Array(10).fill(null).map(() => ({
    id: null,
    username: "",
    role: "peaceful",
    additionalPoints: 0,
    killedFirst: false
  })))
  const [bestMoves, setBestMoves] = useState<[number | null, number | null, number | null]>([null, null, null])
  const [leadPlayer, setLeadPlayer] = useState<{id: number | null, username: string}>({id: null, username: ""})
  const [searchQuery, setSearchQuery] = useState("")
  const [foundPlayers, setFoundPlayers] = useState<Player[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [openPlayerPopovers, setOpenPlayerPopovers] = useState<boolean[]>(Array(10).fill(false))
  const [openLeadPopover, setOpenLeadPopover] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const hasDuplicatePlayers = () => {
    const ids = players.map(p => p.id).filter(id => id !== null)
    return new Set(ids).size !== ids.length
  }

  const validateRoles = () => {
    const roleCount = { mafia: 0, sheriff: 0, don: 0, peaceful: 0 }
    players.forEach(player => {
      if (player.role in roleCount) roleCount[player.role as keyof typeof roleCount]++
    })
    return {
      isValid: roleCount.mafia === 2 && roleCount.sheriff === 1 && roleCount.don === 1,
      message: `Роли: Мафия (${roleCount.mafia}/2), Шериф (${roleCount.sheriff}/1), Дон (${roleCount.don}/1)`
    }
  }

  const hasEmptyPlayers = () => players.some(player => player.id === null)

  const isFormValid = () => {
    const rolesValidation = validateRoles()
    return !hasDuplicatePlayers() && rolesValidation.isValid && !hasEmptyPlayers()
  }

  const getErrorMessages = () => {
    const errors = []
    if (hasDuplicatePlayers()) errors.push("Есть повторяющиеся игроки")
    if (hasEmptyPlayers()) errors.push("Не все игроки выбраны")
    const rolesValidation = validateRoles()
    if (!rolesValidation.isValid) errors.push(rolesValidation.message)
    return errors
  }

  useEffect(() => {
    if (searchQuery.length > 1) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        fetchPlayers(searchQuery).finally(() => setIsSearching(false))
      }, 150)
      return () => clearTimeout(timer)
    } else {
      setFoundPlayers([])
      setIsSearching(false)
    }
  }, [searchQuery])

  useEffect(() => {
    if (!Cookies.get('csrf_token')) {
      fetch(`${API_BASE_URL}/api/csrf-token`, { credentials: 'include' });
    }
  }, []);

  const fetchPlayers = async (query: string) => {
    try {
      const csrfToken = Cookies.get('csrf_token');
      const response = await fetch(`${API_BASE_URL}/api/search-players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || ''
        },
        body: JSON.stringify({
          query,
          limit: 30,
          offset: 0
        })
      });
      const data = await response.json();
      setFoundPlayers(data.players || []);
    } catch (error) {
      console.error('Error searching players:', error);
      toast({
        variant: "destructive",
        title: "Ошибка поиска",
        description: "Не удалось найти игроков.",
      });
    }
  }

  const handlePlayerChange = (index: number, field: string, value: any) => {
    const newPlayers = [...players]
    if (field === "killedFirst" && value === true) {
      newPlayers.forEach((p, i) => { if (i !== index) p.killedFirst = false })
    }
    if (field === "additionalPoints") {
      value = Math.min(1, Math.max(-1, parseFloat(value) || 0))
    }
    newPlayers[index] = { ...newPlayers[index], [field]: value }
    setPlayers(newPlayers)
  }

  const handleSelectPlayer = (index: number, player: Player) => {
    const newPlayers = [...players]
    newPlayers[index] = { ...newPlayers[index], id: player.id, username: player.username }
    setPlayers(newPlayers)
    setSearchQuery("")
    setFoundPlayers([])
    const newOpenPopovers = [...openPlayerPopovers]
    newOpenPopovers[index] = false
    setOpenPlayerPopovers(newOpenPopovers)
  }

  const handleSelectLeadPlayer = (player: Player) => {
    setLeadPlayer({ id: player.id, username: player.username })
    setSearchQuery("")
    setFoundPlayers([])
    setOpenLeadPopover(false)
  }

  const handleBestMoveChange = (index: number, value: string) => {
    const numValue = value === "" ? null : parseInt(value)
    if (numValue !== null && numValue >= 2 && numValue <= 10 && index < 2) {
      const newBestMoves = [...bestMoves] as [number | null, number | null, number | null]
      newBestMoves[index] = numValue
      setBestMoves(newBestMoves)
      setTimeout(() => {
        const nextInput = document.querySelector(`input[placeholder="Ход ${index + 2}"]`) as HTMLInputElement
        if (nextInput) nextInput.focus()
      }, 0)
      return
    }
    if (numValue !== null && (numValue < 1 || numValue > 10)) return
    const newBestMoves = [...bestMoves] as [number | null, number | null, number | null]
    newBestMoves[index] = numValue
    setBestMoves(newBestMoves)
  }

  const handleUndoDelete = async (gameId: number) => {
    const token = Cookies.get('mafiaToken');
    if (!token) {
        toast({ variant: "destructive", title: "Ошибка авторизации", description: "Пожалуйста, войдите снова." });
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/delete-game`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ game_id: gameId })
        });
        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.detail || 'Не удалось отменить создание игры');
        toast({ title: "Действие отменено", description: `Создание игры (ID: ${gameId}) было отменено.` });
    } catch (error) {
        console.error('Error undoing game creation:', error);
        toast({ variant: "destructive", title: "Ошибка отмены", description: (error as Error).message || 'Не удалось связаться с сервером.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) {
        const errorMessages = getErrorMessages().join("; ");
        setErrorMessage(errorMessages);
        toast({ variant: "destructive", title: "Ошибка валидации", description: errorMessages });
        return;
    }
    setIsSubmitting(true)
    setErrorMessage(null)
    const token = Cookies.get('mafiaToken');
    const gameData = {
      date: gameDate,
      table: tableNumber,
      game_number: gameNumber,
      winner,
      participants: players.map(p => p.id).filter(id => id !== null),
      leadPlayerId: leadPlayer.id,
      bestMoves: bestMoves.filter(m => m !== null && m >= 1 && m <= 10),
      players: players.filter(p => p.id !== null).map(p => ({
        id: p.id, role: p.role, additionalPoints: p.additionalPoints, killedFirst: p.killedFirst
      }))
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/add-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(gameData)
      })
      const responseData = await response.json()
      if (!response.ok) throw new Error(responseData.detail || 'Ошибка при добавлении игры')
      toast({
        title: "Игра успешно добавлена!",
        description: `ID игры: ${responseData.game_id}`,
        action: (<ToastAction altText="Отменить" onClick={() => handleUndoDelete(responseData.game_id)}>Отменить</ToastAction>),
      })
      setPlayers(prevPlayers => prevPlayers.map(player => ({
          id: player.id, username: player.username,
          role: "peaceful", additionalPoints: 0, killedFirst: false
      })));
      setGameDate(new Date().toISOString().slice(0, 16))
      setBestMoves([null, null, null])
      setLeadPlayer({id: null, username: ""})
    } catch (error) {
      console.error('Error submitting game:', error)
      const errorMessageText = (error as Error).message || 'Неизвестная ошибка';
      setErrorMessage(errorMessageText)
      toast({ variant: "destructive", title: "Ошибка добавления игры", description: errorMessageText })
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePlayerPopover = (index: number, open: boolean) => {
    const newOpenPopovers = [...openPlayerPopovers]
    newOpenPopovers[index] = open
    setOpenPlayerPopovers(newOpenPopovers)
    if (open) { setSearchQuery(""); setFoundPlayers([]) }
  }

  const toggleLeadPopover = (open: boolean) => {
    setOpenLeadPopover(open);
    if (open) { setSearchQuery(""); setFoundPlayers([]) }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="max-h-20 py-4">
        <CardTitle className="text-xl">Добавить новую игру</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {errorMessage}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gameDate">Дата игры</Label>
              <Input id="gameDate" type="datetime-local" value={gameDate} onChange={(e) => setGameDate(e.target.value)} className="rounded-md"/>
            </div>
            <div className="space-y-2">
              <Label>Победитель</Label>
              <div className="flex gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="peaceful-winner" checked={winner === "peaceful"} onCheckedChange={() => setWinner("peaceful")}/>
                  <Label htmlFor="peaceful-winner">Мирные</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mafia-winner" checked={winner === "mafia"} onCheckedChange={() => setWinner("mafia")}/>
                  <Label htmlFor="mafia-winner">Мафия</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Номер стола</Label>
              <Select value={tableNumber} onValueChange={(value: "1" | "2") => setTableNumber(value)}>
                <SelectTrigger className="rounded-md">
                  <SelectValue placeholder="Стол"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Стол 1</SelectItem>
                  <SelectItem value="2">Стол 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gameNumber">Номер игры</Label>
              <Input 
                id="gameNumber" 
                type="number" 
                min="1" 
                value={gameNumber} 
                onChange={(e) => setGameNumber(Math.max(1, Number(e.target.value)))} 
                className="rounded-md"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Участники игры</Label>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] p-2 text-center">#</TableHead>
                    <TableHead className="p-2">Ник</TableHead>
                    <TableHead className="p-2">Роль</TableHead>
                    <TableHead className="p-2 w-[100px]">Доп. баллы</TableHead>
                    <TableHead className="text-center p-2 w-[100px]">Убит первым</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player, index) => (
                    <TableRow key={index}>
                      <TableCell className="p-2 text-center">{index + 1}</TableCell>
                      <TableCell className="p-1">
                        <Popover open={openPlayerPopovers[index]} onOpenChange={(open) => togglePlayerPopover(index, open)}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between text-xs sm:text-sm h-9">
                              {player.username || "Выбрать игрока"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 max-w-64 md:max-w-96" align="start">
                            <Command>
                              <CommandInput placeholder="Поиск игроков..." value={searchQuery} onValueChange={setSearchQuery}/>
                              {isSearching && (<div className="p-2 text-center text-sm text-muted-foreground">Поиск...</div>)}
                              <CommandEmpty>Игроки не найдены</CommandEmpty>
                              <CommandGroup className="max-h-60 overflow-y-auto">
                                {foundPlayers.map((foundPlayer) => (
                                  <CommandItem key={foundPlayer.id} value={foundPlayer.username} onSelect={() => handleSelectPlayer(index, foundPlayer)}>
                                    <div className="flex flex-col w-full">
                                      <span>{foundPlayer.username}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ID: {foundPlayer.id} | Зарегистрирован: {new Date(foundPlayer.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="p-1">
                        <Select value={player.role} onValueChange={(value) => handlePlayerChange(index, "role", value)}>
                          <SelectTrigger className="h-9 text-xs sm:text-sm"><SelectValue placeholder="Роль" /></SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (<SelectItem key={role.value} value={role.value} className="text-xs sm:text-sm">{role.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-1">
                        <Input type="number" step="0.1" min="-1" max="1" value={player.additionalPoints} onChange={(e) => handlePlayerChange(index, "additionalPoints", e.target.value)} className="w-full h-9 text-xs sm:text-sm"/>
                      </TableCell>
                      <TableCell className="text-center p-1">
                        <Checkbox checked={player.killedFirst} onCheckedChange={(checked) => handlePlayerChange(index, "killedFirst", checked)}/>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leadPlayer">Ведущий</Label>
              <Popover open={openLeadPopover} onOpenChange={toggleLeadPopover}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between h-9">
                    {leadPlayer.username || "Найти ведущего"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[250px] sm:w-[300px]" align="start">
                  <Command>
                    <CommandInput placeholder="Поиск ведущего..." value={searchQuery} onValueChange={setSearchQuery}/>
                    {isSearching && (<div className="p-2 text-center text-sm text-muted-foreground">Поиск...</div>)}
                    <CommandEmpty>Игроки не найдены</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                      {foundPlayers.map((foundPlayer) => (
                        <CommandItem key={foundPlayer.id} value={foundPlayer.username} onSelect={() => handleSelectLeadPlayer(foundPlayer)}>
                          <div className="flex flex-col w-full">
                            <span>{foundPlayer.username}</span>
                            <span className="text-xs text-muted-foreground">
                              ID: {foundPlayer.id} | Зарегистрирован: {new Date(foundPlayer.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Лучший ход (игроки 1-10)</Label>
              <div className="flex gap-2">
                {[0, 1, 2].map((idx) => (
                  <Input key={idx} type="number" min="1" max="10" value={bestMoves[idx] || ""} onChange={(e) => handleBestMoveChange(idx, e.target.value)} placeholder={`Ход ${idx + 1}`} className="w-full h-9"/>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setContent(null)}>Отмена</Button>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Button type="submit" disabled={!isFormValid() || isSubmitting}>
                      {isSubmitting ? "Сохранение..." : "Сохранить игру"}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!isFormValid() && (
                  <TooltipContent side="top" className="max-w-[300px] bg-destructive text-destructive-foreground p-2 rounded-md shadow-lg">
                    <div className="flex flex-col gap-1 text-xs">
                      {getErrorMessages().map((error, idx) => (<span key={idx}>• {error}</span>))}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
