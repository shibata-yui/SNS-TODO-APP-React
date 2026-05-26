import { apiFetch } from "./client";

// 裏側の「自分がいいねした投稿一覧」を引っ張ってくる処理
export async function fetchLikedPosts() {
    return await apiFetch('/likes');
}
