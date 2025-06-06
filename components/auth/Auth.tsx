'use client';

import { useState, useEffect } from 'react';
import API_BASE_URL from "@/lib/server";
import axios from 'axios';

import Cookies from 'js-cookie';

const FetchToken = (key: any) => {
  if (typeof window !== 'undefined') {
    return Cookies.get(key);
  }
  return null;
};

export const SetToken = (token: any) => {
  if (typeof window !== 'undefined') {
    Cookies.set('mafiaToken', token, { path: '/' })
  } else {
    console.warn('Window is undefined. Cookies can only be set in the browser.');
  }
}

export function RequireToken() { 
  
  useEffect(() => {
    const auth = FetchToken('mafiaToken');
    console.log(auth, ' tokern req ')
    var auth2 = false;
    if (auth === 'null') {
      //return <Navigate to="/" state={{ from: location }} />;
    }
    axios.post(`${API_BASE_URL}/api/tokencheck`, {
        auth
    }, {
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    .then(function (response) {
        console.log(response);
        if (response.data["login_error"] === "Несуществующий токен.") {
          auth2 = false;
          localStorage.removeItem('mafiaToken');
        }else { 
            if(response.data['login_result']){
                auth2 = true;
                return;
            }
        }
    })
    .catch(function (error) {
        console.log(error, 'error');
        auth2 = false;
        localStorage.removeItem('mafiaToken');
    });
    if (!auth) {
      //return <Navigate to="/" state={{ from: location }} />;
      window.location.replace('/login');
    } else {
      return;
    }
  }, []);
}
 
export function RequireTokenEntry() { 
  useEffect(() => {
    var server_ip = 'localhost'; 
    const auth = FetchToken('mafiaToken');
    console.log(auth, ' tokern req entry ')
    var auth2 = false;
    if (auth === 'null') {
      //return <Navigate to="/" state={{ from: location }} />;
      return;
    }
    axios.post(`${API_BASE_URL}/api/tokencheck`, {
        auth
    }, {
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    .then(function (response) {
        console.log(response);
        if (response.data["login_error"] === "Несуществующий токен.") {
          auth2 = false;
          localStorage.removeItem('mafiaToken');
        }else { 
            if(response.data['login_result']){
                auth2 = true;
            }
            window.location.replace('/profile');
        }
    })
    .catch(function (error) {
        console.log(error, 'error');
        auth2 = false;
        localStorage.removeItem('mafiaToken');
    });
    if (!auth) {
      //return <Navigate to="/" state={{ from: location }} />;
      return;
    }
  }, []);
}