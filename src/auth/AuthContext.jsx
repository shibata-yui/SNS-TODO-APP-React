// ログイン状態を React 全体で共有するためのファイル

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginApi, logout as logoutApi, fetchMe } from "../api/auth";

const AuthContext = createContext(null);

const STORAGE_KEY = "sns_todo_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      setAuthLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setUser(parsed.user ?? null);
      setToken(parsed.token ?? null);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  async function login(email, password) {
    const res = await loginApi({ email, password });

    const nextUser = res?.user ?? null;
    const nextToken = res?.token ?? null;

    if (!nextToken) {
      throw new Error("ログインAPIの返り値に token がありません。");
    }

    setUser(nextUser);
    setToken(nextToken);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user: nextUser,
        token: nextToken,
      })
    );
  }

  async function logout() {
    try {
      if (token) {
        await logoutApi(token);
      }
    } catch (error) {
      console.error("ログアウトAPIエラー:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  async function refreshMe() {
    if (!token) return;

    try {
      const me = await fetchMe(token);
      setUser(me);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: me,
          token,
        })
      );
    } catch (error) {
      console.error("ユーザー情報取得エラー:", error);
    }
  }

  const value = useMemo(() => {
    return {
      user,
      token,
      isLoggedIn: !!token,
      authLoading,
      login,
      logout,
      refreshMe,
    };
  }, [user, token, authLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth は AuthProvider の中で使ってください。");
  }

  return context;
}
