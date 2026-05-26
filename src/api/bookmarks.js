import { apiFetch } from "./client";

// 裏側の「自分がブックマークした投稿一覧」を引っ張ってくる処理
export async function fetchBookmarkedPosts() {
    return await apiFetch('/bookmarks');
}
