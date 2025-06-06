'use client'

import React, { useState } from 'react';
import axios from 'axios';
import {SetToken, RequireTokenEntry} from '@/components/auth/Auth' //, fetchToken
import API_BASE_URL from "@/lib/server";
import { NavMenu } from "../navbar";

export default function Reg(){

    const [email,setEmail] = useState('');
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');
    
    const handleSubmit = (event: any) => {
        event.preventDefault();
        if(email.length <= 6){
          alert("Пустое или неправильное поле email!");
          return;
        }
        else if(password.length <= 5){
          alert("Поле пароля не может быть пустым или очень маленьким!");
          return;
        }
        else if(username.length === 0){
          alert("Пустое поле username!");
          return;
        } 
        else{
            var server_ip = 'localhost';
            console.log('axios')
            axios.post(`${API_BASE_URL}/api/reg`, {
                email: email,
                password: password,
                username: username
            })
            .then(function (response) {
                if (response.status === 401) {
                    SetToken('');
                    window.location.replace('/login');
                    return;
                }
                //console.log(response);
                if (response.data["detail"] === "Регистрация временно закрыта администратором") {
                    alert("Регистрация временно закрыта администратором");
                    return;
                }
                if (response.data["reg_error"] === "Несуществующая почта!") {
                    alert("Введите существующую почту!");
                    console.log('mail error');
                }
                else if (response.data["reg_error"] === "Такой логин уже используется!"){
                    alert("Игровой ник занят кем-то другим:(");
                    console.log('nickname already used');
                }
                else if (response.data["reg_error"] === "Такая почта уже используется!"){
                    alert("Хм.. Такая почта уже зарегистрирована!");
                    console.log('mail already used');
                }
                else { 
                    if(response.data.token){
                      console.log('axios Good')
                      console.log(response.data.token, ' token after reg')
                        SetToken(response.data.token)
                        window.location.replace('/profile');
                        console.log('Good');
                    }
                }
            })
            .catch(function (error) {
                if (error.response && error.response.status === 401) {
                    SetToken('');
                    window.location.replace('/login');
                }
                // Обработка случая, когда регистрация временно закрыта (403)
                else if (error.response && error.response.status === 403 && error.response.data && error.response.data.detail === "Регистрация временно закрыта администратором") {
                    alert("Регистрация временно закрыта администратором");
                }
                //console.log(error, 'error');
            });
        }
    }

    const requireTokenEntry = RequireTokenEntry();
    return (
        <>
            {typeof requireTokenEntry === 'undefined' ? null : requireTokenEntry}
            <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen pt-8 pb-10 gap-16 sm:p-10 font-[family-name:var(--font-geist-sans)]">
                <NavMenu />
                <div className="kometa-ui">
                    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-1 lg:px-8">
                        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight ">
                                Регистрация аккаунта
                            </h2>
                        </div>

                        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm"> 
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium leading-6 ">
                                        Ваша почта
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full rounded-md border-spacing-2 px-2 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-2xl sm:leading-6"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium leading-6 ">
                                        Ваш игровой ник
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="username"
                                            name="username"
                                            type="username"
                                            required
                                            autoComplete="login"
                                            value={username} 
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="block w-full rounded-md border-spacing-2 px-2 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-2xl sm:leading-6"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="block text-sm font-medium leading-6 ">
                                            Пароль
                                        </label>
                                    </div>
                                    <div className="mt-2">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            autoComplete="current-password"
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full rounded-md border-spacing-2 px-2 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-2xl sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        onClick={handleSubmit}
                                        className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                    >
                                        Регистрация
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}