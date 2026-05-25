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
