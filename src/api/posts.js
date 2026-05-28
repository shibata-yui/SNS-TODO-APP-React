import { apiFetch } from "./client";

export function fetchPosts() {
  return apiFetch("/posts");
}

export function createPost(payload) {
  return apiFetch("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePost(id, payload) {
  return apiFetch(`/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deletePost(id) {
  return apiFetch(`/posts/${id}`, {
    method: "DELETE",
  });
}


export function toggleLike(postId) {
  return apiFetch(`/posts/${postId}/like`, {
    method: "POST",
  });
}

export function toggleBookmark(postId) {
  return apiFetch(`/posts/${postId}/bookmark`, {
    method: "POST",
  });
}

//投稿詳細取得
export function fetchPost(id) {
  return apiFetch(`/posts/${id}`);
}

//コメント投稿
export function createComment(postId, payload) {
  return apiFetch(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

//コメント更新(編集)
export function updateComment(commentId, payload) {
  return apiFetch(`/comments/${commentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

//コメント削除
export function deleteComment(commentId) {
  return apiFetch(`/comments/${commentId}`, {
    method: "DELETE",
  });
}
