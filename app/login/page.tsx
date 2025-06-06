'use client'

import React, { useState } from 'react';
import axios from 'axios';
import { SetToken, RequireTokenEntry } from '@/components/auth/Auth'; //, fetchToken

import { NavMenu } from "../navbar";
import EmojiBackground from '@/components/auth/EmojiBackground.js';
import API_BASE_URL from "@/lib/server";
import { AlertCircle } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

function AlertDestructive() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Ошибка!</AlertTitle>
      <AlertDescription>
        Неверные данные!
      </AlertDescription>
    </Alert>
  );
}

export default function Login() {
  const [login, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (login.length === 0) {
      alert("Почему логин пустой?!");
      return;
    } else if (password.length <= 5) {
      alert("Пароль слишком короткий!");
      return;
    } else {
      axios.post(`${API_BASE_URL}/api/login`, {
        username: login,
        password: password
      })
        .then(function (response) {
          if (response.status === 401) {
            SetToken('');
            window.location.replace('/login');
            return;
          }
          if (response.data.login_error) {
            setError(true); // Устанавливаем состояние ошибки в true
          } else {
            if (response.data.token) {
              SetToken(response.data.token);
              /* Переадресация на /profile */
              window.location.replace('/profile');
            }
          }
        })
        .catch(function (error) {
          if (error.response && error.response.status === 401) {
            SetToken('');
            window.location.replace('/login');
          } else {
            setError(true); // Устанавливаем состояние ошибки в true
          }
        });
    }
  };

  const requireTokenEntry = RequireTokenEntry();

  return (
    <>
      {typeof requireTokenEntry === 'undefined' ? null : requireTokenEntry}
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen pt-8 pb-10 gap-16 sm:p-10 font-[family-name:var(--font-geist-sans)]">
        <NavMenu />
        <div className="kometa-ui">
          <EmojiBackground />
          <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-1 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
                Вход в аккаунт
              </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              {error && <AlertDestructive />}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6">
                    Почта или логин
                  </label>
                  <div className="mt-2">
                    <input
                      id="login"
                      name="login"
                      type="email"
                      required
                      autoComplete="email"
                      value={login}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full rounded-md border-spacing-2 px-2 py-1.5  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-2xl sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6 ">
                      Пароль
                    </label>
                    <div className="text-sm">
                      <a href="forget" className="font-semibold text-red-300 hover:text-red-600">
                        Забыли пароль?
                      </a>
                    </div>
                  </div>
                  <div className="mt-2">
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md border-spacing-2 px-2 py-1.5  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-2xl sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <button
                    onClick={handleSubmit}
                    className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    Войти
                  </button>
                </div>
              </form>

              <p className="mt-5 text-center text-xs">
                Впервые тут?{' '}
                <a href="reg" className="font-semibold leading-5 text-red-300 hover:text-red-600">
                  Пройти регистрацию
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}