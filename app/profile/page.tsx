'use client'
import API_BASE_URL from "@/lib/server";
import React from "react";
import { NavMenu } from "../navbar";
import { RequireToken } from '@/components/auth/Auth'
import Cookies from 'js-cookie';
import { useState, useEffect } from "react";
import useSWR from 'swr';

import { ChartPie, UserRoundCog, Dot } from 'lucide-react';
import { TriangleAlert, LockKeyhole } from 'lucide-react';

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";

import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart"

import { ProfileEdit } from "@/components/ProfileEdit";

type RoleData = {
  name: string;
  games: number;
  wins: number;
  losses: number;
  fill: string;
};

const COLORS = ['#ff1f1f', '#777777', '#404040', '#ffdf00', '#ffffff'];
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

const fetchUserId = async () => {
  const token = Cookies.get('mafiaToken');
  if (!token) {
    window.location.replace('/login');
    throw new Error('Требуется авторизация');
  }
  const userIdResponse = await fetch(`${API_BASE_URL}/api/get-user-id-by-token`, { 
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (userIdResponse.status === 401) {
    Cookies.remove('mafiaToken');
    window.location.replace('/login');
    throw new Error('Unauthorized');
  }
  if (!userIdResponse.ok) {
    Cookies.remove('mafiaToken');
    window.location.replace('/login');
    throw new Error('Неверный токен авторизации');
  }
  const user_date = await userIdResponse.json();
  return user_date["user_id"];
};

const fetchProfileData = async (userId: string) => {
  const token = Cookies.get('mafiaToken');
  if (!token) throw new Error('Требуется авторизация');
  // Параллельно получаем профиль, win-stats и role-stats
  const [profileRes, winRes, roleRes] = await Promise.all([
    fetch(`${API_BASE_URL}/api/user/${userId}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    fetch(`${API_BASE_URL}/api/player/${userId}/win-stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    fetch(`${API_BASE_URL}/api/player/${userId}/role-stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  ]);
  if (!profileRes.ok) throw new Error('Ошибка при загрузке профиля');
  if (!winRes.ok) throw new Error('Ошибка при загрузке статистики');
  if (!roleRes.ok) throw new Error('Ошибка при загрузке статистики');
  const [profileData, winData, roleData] = await Promise.all([
    profileRes.json(),
    winRes.json(),
    roleRes.json()
  ]);
  // Проверяем, есть ли у пользователя игры
  const hasGames = winData.stats.some((stat: any) => stat.games > 0);
  if (!hasGames) throw new Error('no-games');
  // Форматируем данные для диаграммы (без Лидера)
  const formattedData = winData.stats
    .filter((stat: any) => stat.role !== 'lead')
    .map((stat: any, index: number) => {
      const roleName =
        stat.role === 'peaceful' ? 'Мирный' :
        stat.role === 'mafia' ? 'Мафия' :
        stat.role === 'don' ? 'Дон' : 'Шериф';
      const games = stat.games;
      const wins = stat.wins;
      const losses = games - wins;
      return {
        name: roleName,
        games,
        wins,
        losses,
        fill: COLORS[index % COLORS.length]
      };
    });
  const total = formattedData.reduce((sum: number, item: RoleData) => sum + item.games, 0);
  return {
    userProfile: {
      username: profileData.username,
      status: profileData.status,
      avatar: profileData.avatar,
      is_online: profileData.is_online,
      is_open_profile: profileData.is_open_profile
    },
    roleData: formattedData,
    totalGames: total
  };
};

export default function Profile() {
  //RequireToken();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Получаем user_id только один раз
  const { data: userId, error: userIdError, isLoading: isUserIdLoading } = useSWR('user-id', fetchUserId, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  });

  // Получаем профиль и статистику только если есть user_id
  const { data, error, isLoading } = useSWR(userId ? ['profile-data', userId] : null, () => fetchProfileData(userId), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  });

  const renderTwoLevelPieChart = () => {
    if (userIdError?.message === 'Неверный токен авторизации' || userIdError?.message === 'Требуется авторизация') {
      return (
        <Card>
          <CardHeader className="items-center">
            <CardTitle className="flex items-center pt-2">
              <LockKeyhole className="mr-3 opacity-90" />
              Ошибка авторизации
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center justify-center">
            <LockKeyhole size={64} className="text-red-500 mb-4" />
            <p className="text-xl text-center">Необходимо авторизоваться для просмотра статистики</p>
          </CardContent>
        </Card>
      );
    }
    if (userIdError) {
      return (
        <Card>
          <CardHeader className="items-center">
            <CardTitle className="flex items-center pt-2">
              <TriangleAlert className="mr-3 opacity-90" />
              Ошибка
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center justify-center">
            <TriangleAlert size={64} className="text-red-500 mb-4" />
            <p className="text-xl text-center">Произошла ошибка при загрузке данных</p>
            <p className="text-muted-foreground text-center mt-2">
              {userIdError.message}
            </p>
          </CardContent>
        </Card>
      );
    }
    if (error?.message === 'no-games') {
      return (
        <Card>
          <CardHeader className="items-center">
            <CardTitle className="flex items-center pt-2">
              <TriangleAlert className="mr-3 opacity-90" />
              Нет данных
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center justify-center">
            <TriangleAlert size={64} className="text-yellow-500 mb-4" />
            <p className="text-xl text-center">У вас пока нет сыгранных игр</p>
            <p className="text-muted-foreground text-center mt-2">
              После участия в играх здесь появится ваша статистика
            </p>
          </CardContent>
        </Card>
      );
    }
    if (error) {
      return (
        <Card>
          <CardHeader className="items-center">
            <CardTitle className="flex items-center pt-2">
              <TriangleAlert className="mr-3 opacity-90" />
              Ошибка
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center justify-center">
            <TriangleAlert size={64} className="text-red-500 mb-4" />
            <p className="text-xl text-center">Произошла ошибка при загрузке данных</p>
            <p className="text-muted-foreground text-center mt-2">
              {error.message}
            </p>
          </CardContent>
        </Card>
      );
    }
    if (isUserIdLoading || isLoading) {
      return (
        <CardContent className="h-[350px] flex flex-col items-center justify-center">
          <p>Загрузка данных...</p>
        </CardContent>
      );
    }
    return (
      <Card>
        <CardHeader className="items-center">
          <CardTitle className="flex items-center pt-2">
            <ChartPie className="mr-3 opacity-90" />
            Статистика по ролям
          </CardTitle>
        </CardHeader>
        <CardContent className={`${isMobile ? 'h-[450px]' : 'h-[350px]'}`}>
          {data ? (
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-full gap-4`}>
              <div className={`${isMobile ? 'w-full h-[300px]' : 'w-2/3 h-full'}`}> 
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <PieChart className="h-full">
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={data.roleData}
                      dataKey="games"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? 70 : 80}
                      fill="#8884d8"
                    >
                      {data.roleData.map((entry: RoleData, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Pie
                      data={data.roleData.flatMap((role: RoleData) => [
                        { name: `${role.name} победы`, value: role.wins, fill: role.fill },
                        { name: `${role.name} поражения`, value: role.losses, fill: `${role.fill}40` }
                      ])}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 85 : 105}
                      outerRadius={isMobile ? 120 : 140}
                    >
                      {data.roleData.flatMap((role: RoleData, index: number) => [
                        <Cell key={`win-cell-${index}`} fill={role.fill} />, <Cell key={`loss-cell-${index}`} fill={`${role.fill}40`} />
                      ])}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
              <div className={`${isMobile ? 'w-full' : 'w-1/3'} flex flex-col justify-center`}>
                <p className={`text-lg ${isMobile ? '' : 'mb-5'}`}>Количество игр и % побед</p>
                {data.totalGames > 0 && (
                  <p className={` ${isMobile ? 'mb-2' : 'mb-4'}`}>
                    Общий винрейт: {
                      Math.round(
                        (data.roleData.reduce((sum: number, role: RoleData) => sum + role.wins, 0) / data.totalGames) * 100
                      )
                    }%
                  </p>
                )}
                <div className={`${isMobile ? 'grid grid-cols-2 gap-2 mt-4' : 'space-y-4'}`}>
                  {data.roleData.map((role: RoleData) => (
                    <div key={role.name} className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: role.fill }}
                      />
                      <span>
                        {role.name}: {role.games} ({Math.round((role.wins / role.games) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <div className="flex flex-col items-center min-h-screen p-4 gap-8 sm:p-6 font-[family-name:var(--font-geist-sans)]">
        <NavMenu />
        <Card className={`mx-auto ${isMobile ? 'w-full' : 'w-full max-w-6xl'} shadow-lg dark:shadow-white/5 relative`}>
          <CardHeader className="flex flex-col items-center">
            <div className="absolute top-4 right-4">
              <ProfileEdit userProfile={data?.userProfile || null} />
            </div>
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={data?.userProfile?.avatar || "https://github.com/shadcn.png"} alt="User Avatar" />
                <AvatarFallback>
                  {data?.userProfile?.username ? data.userProfile.username.substring(0, 2).toUpperCase() : "CN"}
                </AvatarFallback>
              </Avatar>
              {data?.userProfile && (
                <Dot 
                  size={70} 
                  className={`absolute top-14 left-12 ${data.userProfile.is_online ? 'text-green-500' : 'text-gray-500'}`}
                  fill={data.userProfile.is_online ? 'green' : 'gray'}
                />
              )}
            </div>
            <CardTitle className="mt-4 flex items-center gap-2">
              {data?.userProfile?.username || "Loading..."}
            </CardTitle>
            <CardDescription>
              {data?.userProfile?.status || "Игрок в мафию"}
            </CardDescription>
          </CardHeader>
        </Card>
        <Carousel orientation="vertical" className={`mt-6 mx-auto ${isMobile ? 'w-full' : 'w-full max-w-6xl'} shadow-lg dark:shadow-white/5`}>
          <CarouselContent>
            <CarouselItem>
              {renderTwoLevelPieChart()}
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </>
  );
}