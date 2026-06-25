import { apiFetch } from "./client";

export function fetchTodos() {
  return apiFetch("/todos");
}

export function fetchTodo(id) {
  return apiFetch(`/todos/${id}`);
}

export function createTodo(payload) {
  return apiFetch("/todos", { method: "POST", body: JSON.stringify(payload) });
}

export function updateTodo(id, payload) {
  return apiFetch(`/todos/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteTodo(id) {
  return apiFetch(`/todos/${id}`, { method: "DELETE" });
}

export function deleteCompletedTodos() {
  return apiFetch("/todos/completed", { method: "DELETE" });
}
