import { useState } from "react";
import { TodoForm } from "./TodoForm";

function badgeText(status) {
  if (status === "completed") return "完了";
  if (status === "in_progress") return "進行中";
  return "未着手"; // pending を想定
}

export function TodoItem({ todo, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);

  const isCompleted = todo.status === "completed";

  function quickToggleCompleted() {
    // ✅ シンプル版：完了 ↔ 未着手（pending）
    // 設計書の順番通りに「未着手→進行中→完了」ボタンにしたい場合は下に別案あり
    const next = isCompleted ? "pending" : "completed";
    onUpdate?.(todo.id, { status: next });
  }

  return (
    <div style={styles.item}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              onClick={quickToggleCompleted}
              style={styles.smallBtn}
            >
              {isCompleted ? "未完了に戻す" : "完了にする"}
            </button>

            <span style={styles.badge}>{badgeText(todo.status)}</span>
          </div>

          <div
            style={{
              ...styles.title,
              textDecoration: isCompleted ? "line-through" : "none",
              opacity: isCompleted ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {todo.title}
          </div>

          {todo.description ? <div style={styles.desc}>{todo.description}</div> : null}

          <div style={styles.meta}>
            <span>カテゴリ：{todo.category || "—"}</span>
            <span>優先度：{todo.priority ?? "—"}</span>
            <span>期限：{todo.due_date || "—"}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            style={styles.smallBtn}
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? "閉じる" : "編集"}
          </button>

          <button
            type="button"
            style={styles.dangerBtn}
            onClick={() => {
              const ok = confirm("このタスクを削除しますか？");
              if (ok) onDelete?.(todo.id);
            }}
          >
            削除
          </button>
        </div>
      </div>

      {editing ? (
        <div style={{ marginTop: 12, borderTop: "1px dashed #eef0f6", paddingTop: 12 }}>
          <TodoForm
            initialValues={todo}
            submitLabel="更新"
            onSubmit={(payload) => {
              onUpdate?.(todo.id, payload);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  item: {
    border: "1px solid #eef0f6",
    borderRadius: 12,
    padding: 12,
    background: "#fff",
  },
  title: { fontWeight: 700, fontSize: 16 },
  desc: { marginTop: 6, opacity: 0.85 },
  meta: { marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, opacity: 0.7 },
  badge: {
    height: 26,
    padding: "0 10px",
    borderRadius: 999,
    border: "1px solid #e6e7ef",
    display: "inline-flex",
    alignItems: "center",
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  smallBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e6e7ef",
    background: "white",
    cursor: "pointer",
    fontSize: 12,
  },
  dangerBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #ffd3d3",
    background: "#fff3f3",
    cursor: "pointer",
    fontSize: 12,
  },
};
