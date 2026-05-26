import { apiFetch } from "./client";

// 裏側のフォロー機能（toggle）を叩く処理
export async function toggleFollow(userId) {
    return await apiFetch(`/users/${userId}/follow`, {
        method: "POST",
    });
}
