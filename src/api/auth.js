// ログイン・ログアウトのAPI呼び出し関数をまとめたファイル

import { apiFetch } from "./client";

// /login にメールとパスワードを送る
export function login(payload) {
  return apiFetch("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ログアウト時に /logout を呼ぶ
export function logout(token) {
  return apiFetch("/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ログイン中ユーザー確認で /me を呼ぶ
export function fetchMe(token) {
  return apiFetch("/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
