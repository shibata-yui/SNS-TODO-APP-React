import { useEffect, useState } from "react";

export function TodoForm({
  onSubmit,
  submitLabel = "保存",
  initialValues,
  onCancel,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(2);
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("todo");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  // ✅ 編集時：初期値を入れる
  useEffect(() => {
    if (!initialValues) return;
    setTitle(initialValues.title ?? "");
    setDescription(initialValues.description ?? "");
    setPriority(initialValues.priority ?? 2);
    setDueDate(initialValues.due_date ?? "");
    setStatus(initialValues.status ?? "todo");
    setCategory(initialValues.category ?? "");
  }, [initialValues]);

  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setError("タイトルは必須です");
      return;
    }
    setError("");

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority: Number(priority),
      due_date: dueDate || null,
      status,
      category: category.trim() || null,
    };

    onSubmit?.(payload);

    // ✅ 新規作成のときだけリセット（編集時は閉じる想定が多いのでリセットしない）
    if (!initialValues) {
      setTitle("");
      setDescription("");
      setPriority(2);
      setDueDate("");
      setStatus("todo");
      setCategory("");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error ? <div style={styles.error}>{error}</div> : null}

      <label style={styles.label}>
        タイトル（必須）
        <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label style={styles.label}>
        説明
        <textarea style={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <div style={styles.grid}>
        <label style={styles.label}>
          優先度
          <select style={styles.input} value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value={1}>1（低）</option>
            <option value={2}>2（中）</option>
            <option value={3}>3（高）</option>
          </select>
        </label>

        <label style={styles.label}>
          期限
          <input style={styles.input} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        <label style={styles.label}>
          ステータス
          <select style={styles.input} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todo">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="done">完了</option>
          </select>
        </label>

        <label style={styles.label}>
          カテゴリ
          <input style={styles.input} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="例：開発" />
        </label>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" style={styles.button}>{submitLabel}</button>
        {onCancel ? (
          <button type="button" style={styles.ghost} onClick={onCancel}>キャンセル</button>
        ) : null}
      </div>
    </form>
  );
}

const styles = {
  form: { display: "grid", gap: 12 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  label: { display: "grid", gap: 6, fontSize: 12, opacity: 0.85 },
  input: { padding: "10px 12px", borderRadius: 10, border: "1px solid #e6e7ef", outline: "none" },
  textarea: { minHeight: 80, padding: "10px 12px", borderRadius: 10, border: "1px solid #e6e7ef", outline: "none" },
  button: { padding: "10px 12px", borderRadius: 10, border: "1px solid #e6e7ef", background: "white", cursor: "pointer" },
  ghost: { padding: "10px 12px", borderRadius: 10, border: "1px solid #e6e7ef", background: "#fafbff", cursor: "pointer" },
  error: { padding: 10, borderRadius: 10, background: "#fff3f3", border: "1px solid #ffd3d3", color: "#b00020" },
};
