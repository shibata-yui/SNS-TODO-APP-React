import { apiFetch } from "./client";

// プロフィールを更新する関数
export function updateProfile(payload) {
  return apiFetch("/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
