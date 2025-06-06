'use client'

import React from "react";
import Cookies from 'js-cookie';
import { useState, useEffect } from "react";
import { UserRoundCog } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import API_BASE_URL from "@/lib/server";
export function ProfileEdit({ userProfile }: { userProfile: { username: string; status: string | null; is_open_profile: boolean } | null }) {
  const [formData, setFormData] = useState({
    username: userProfile?.username || '',
    status: userProfile?.status || '',
    is_open_profile: userProfile?.is_open_profile ?? true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    general: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        username: userProfile.username,
        status: userProfile.status || '',
        is_open_profile: userProfile.is_open_profile,
      });
    }
  }, [userProfile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Сбрасываем ошибки при изменении
    if (name === 'newPassword' || name === 'confirmPassword') {
      setErrors(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    }
  };

  const validatePasswords = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (passwordData.newPassword.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
      isValid = false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrors({ ...errors, general: '' });

    try {
      const token = Cookies.get('mafiaToken');
      if (!token) throw new Error('Требуется авторизация');

      const userIdResponse = await fetch(`${API_BASE_URL}/api/get-user-id-by-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!userIdResponse.ok) throw new Error('Неверный токен авторизации');
      const { user_id: userId } = await userIdResponse.json();

      // Обновляем профиль
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}/update-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-Token': Cookies.get('csrf_token') || ''
        },
        body: JSON.stringify({
          username: formData.username,
          status: formData.status,
          is_open_profile: formData.is_open_profile
        })
      });

      if (!response.ok) throw new Error('Ошибка при обновлении профиля');

      setSuccessMessage('Профиль успешно обновлен');
    } catch (error) {
      setErrors({
        ...errors,
        general: error instanceof Error ? error.message : 'Произошла ошибка'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrors({ ...errors, general: '' });

    if (!validatePasswords()) {
      setIsLoading(false);
      return;
    }

    try {
      const token = Cookies.get('mafiaToken');
      if (!token) throw new Error('Требуется авторизация');

      const response = await fetch(`${API_BASE_URL}/api/update-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Ошибка при изменении пароля');
      }

      setSuccessMessage('Пароль успешно изменен');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setErrors({
        ...errors,
        general: error instanceof Error ? error.message : 'Произошла ошибка'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <UserRoundCog size={26} className="cursor-pointer" />
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Редактирование профиля</SheetTitle>
          <SheetDescription>
            Измените данные вашего профиля. <br/>Не забудьте сохранить изменения.
          </SheetDescription>
        </SheetHeader>

        {successMessage && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
            {successMessage}
          </div>
        )}

        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Никнейм 
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleProfileChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Статус
              </Label>
              <Input
                id="status"
                name="status"
                value={formData.status}
                onChange={handleProfileChange}
                className="col-span-3"
                placeholder="Ваш статус"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_open_profile" className="text-right">
                Тип профиля
              </Label>
              <div className="col-span-3 flex items-center">
                <input
                  type="checkbox"
                  id="is_open_profile"
                  name="is_open_profile"
                  checked={formData.is_open_profile}
                  onChange={handleProfileChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="is_open_profile" className="ml-2">
                  {formData.is_open_profile ? 'Профиль виден всем' : 'Профиль скрыт'}
                </Label>
              </div>
            </div>

            <SheetFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </SheetFooter>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium">Изменение пароля</h3>
          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentPassword" className="text-right">
                Текущий пароль
              </Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPassword" className="text-right">
                Новый пароль
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="col-span-3"
              />
              {errors.password && (
                <p className="col-span-3 col-start-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmPassword" className="text-right">
                Подтвердите пароль
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="col-span-3"
              />
              {errors.confirmPassword && (
                <p className="col-span-3 col-start-2 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <SheetFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Сохранение...' : 'Изменить пароль'}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}