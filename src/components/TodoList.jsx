import { TodoItem } from "./TodoItem";

export function TodoList({ todos, onUpdate, onDelete, currentUserId }) {
  if (!todos.length) {
    return <div style={{ opacity: 0.7, padding: 8 }}>ToDoがありません</div>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {todos.map((t) => (
        <TodoItem
          key={t.id}
          todo={t}
          onUpdate={onUpdate}
          onDelete={onDelete}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
