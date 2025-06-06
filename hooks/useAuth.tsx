import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import useSWR from "swr";
import API_BASE_URL from "@/lib/server";

const fetcher = async (url: string, token: string, method: string = 'POST') => {
  const res = await fetch(url, {
    method,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(method === 'POST' ? { body: JSON.stringify({ token }) } : {})
  });
  if (res.status === 401) {
    Cookies.remove('mafiaToken');
    if (typeof window !== "undefined") window.location.replace('/login');
    throw new Error('Unauthorized');
  }
  return res.json();
};

export function useAuth() {
  const token = Cookies.get('mafiaToken');
  const { data, error, isLoading } = useSWR(
    token ? [`${API_BASE_URL}/api/get-user-id-by-token`, token, 'POST'] : null,
    ([url, token, method]) => fetcher(url, token, method)
  );

  const [user, setUser] = useState({ isAuthenticated: false, isAdmin: false });

  useEffect(() => {
    if (data && typeof data.is_admin !== 'undefined') {
      setUser({ isAuthenticated: true, isAdmin: !!data.is_admin });
    } else if (token) {
      setUser({ isAuthenticated: true, isAdmin: false });
    } else {
      setUser({ isAuthenticated: false, isAdmin: false });
    }
  }, [data, token]);

  return { user, error, isLoading };
}