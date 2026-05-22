// function nowIso() {
//   return new Date().toISOString();
// }

import { useMemo, useState, useEffect } from "react";
// import sampleTodos from "../mock/todos.sample.json";
import { TodoStats } from "../components/TodoStats";
import { TodoToolbar } from "../components/TodoToolbar";
import { TodoList } from "../components/TodoList";
import { TodoForm } from "../components/TodoForm";
import { ViewToggle } from "../components/ViewToggle";
import { TodoCalendar } from "../components/TodoCalendar";
// バックと繋ぐにあたって追記↓
// import { useEffect } from "react";
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "../api/todos";
import { useAuth } from "../auth/AuthContext";

export function TodoPage() {
  // const [todos, setTodos] = useState(sampleTodos);
  // バックと繋ぐにあたって変更
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);

  const [view, setView] = useState("list"); // list / calendar
  const [sortKey, setSortKey] = useState("due_date"); // due_date / priority / status
  const [query, setQuery] = useState("");

  // ✅ 表示切替：ステータス/カテゴリ（=要件）
  const [statusFilter, setStatusFilter] = useState("all"); // all / todo / in_progress / completed
  const [categoryFilter, setCategoryFilter] = useState("all"); // all or category name
  const [groupByCategory, setGroupByCategory] = useState(false); // カテゴリ別表示


// 最初に一覧を取得(※バックと繋ぐにあたって追記)
useEffect(() => {
    async function loadTodos() {
      try {
        const data = await fetchTodos();

        // 💡 ここから石橋を叩く処理（安全装置）に変更
        if (Array.isArray(data)) {
          // ちゃんとリスト（配列）で返ってきたらセットする
          setTodos(data);
        } else {
          // リストじゃない謎のデータ（エラー文など）が返ってきたら、画面を落とさず空っぽにする
          console.error("Laravelから予期せぬデータが返ってきました:", data);
          setTodos([]);
        }
        // 💡 ここまで

      } catch (error) {
        console.error("ToDo一覧取得エラー:", error);
        alert("ToDo一覧の取得に失敗しました。Laravel側が起動しているか確認してください。");
      }
    }

    loadTodos();
  }, []);


  const categories = useMemo(() => {
    const set = new Set();
    for (const t of todos) if (t.category) set.add(t.category);
    return ["all", ...Array.from(set)];
  }, [todos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...todos];

    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    if (categoryFilter !== "all") list = list.filter((t) => t.category === categoryFilter);

    if (q) {
      list = list.filter((t) =>
        (t.title ?? "").toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q) ||
        (t.category ?? "").toLowerCase().includes(q)
      );
    }

    // ✅ 要件：優先度順 / ステータス順 / 期限順
    list.sort((a, b) => {
      if (sortKey === "priority") return (b.priority ?? 0) - (a.priority ?? 0);
      if (sortKey === "status") return String(a.status).localeCompare(String(b.status));
      const da = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
      const db = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
      return da - db;
    });

    return list;
  }, [todos, sortKey, query, statusFilter, categoryFilter]);

  // ✅ 作成
  // バックと繋ぐにあたって変更
  async function handleCreate(payload) {
    try {
      console.log("送信するデータ:", payload);

      const newTodo = await createTodo(payload);

      console.log("保存できたデータ:", newTodo);

      setTodos((prev) => [newTodo, ...prev]);
    } catch (error) {
      console.error("ToDo追加エラー:", error);
      alert(`ToDoの追加に失敗しました。\n${error.message}`);
    }
  }

  // ✅ 編集（更新）
// バックとつなぐにあたって変更
  async function handleUpdate(id, patch) {
  try {
    const targetTodo = todos.find((todo) => todo.id === id);

    if (!targetTodo) {
      alert("更新対象のToDoが見つかりません。");
      return;
    }

    const payload = {
      title: targetTodo.title,
      description: targetTodo.description,
      priority: targetTodo.priority,
      due_date: targetTodo.due_date,
      status: targetTodo.status,
      category: targetTodo.category,
      ...patch,
    };

    console.log("更新で送信するデータ:", payload);

    const updatedTodo = await updateTodo(id, payload);

    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? updatedTodo : todo))
    );
  } catch (error) {
    console.error("ToDo更新エラー:", error);
    alert(`ToDoの更新に失敗しました。\n${error.message}`);
  }
}

  // ✅ 削除（1件）
// バックと繋ぐにあたって変更
 async function handleDelete(id) {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("ToDo削除エラー:", error);
      alert("ToDoの削除に失敗しました。");
    }
  }


  // ✅ 完了タスク一括削除
// バックと繋ぐにあたって変更
// これは今の時点では画面側だけで削除しています
  // 本当にDBからも消したいなら、あとでLaravel側に一括削除APIが必要！！
  function handleBulkDeleteDone() {
    setTodos((prev) => prev.filter((t) => t.status !== "completed"));
  }



  // ✅ カテゴリ別表示用にまとめる
  const groupedByCategoryList = useMemo(() => {
    const map = new Map();
    for (const t of filtered) {
      const key = t.category || "（未分類）";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>ToDo</h1>

        {/* ✅ 統計表示（テキストでシンプル） */}
        <TodoStats todos={todos} />

        <div style={styles.card}>
          <TodoToolbar
            sortKey={sortKey}
            onChangeSort={setSortKey}
            query={query}
            onChangeQuery={setQuery}
            statusFilter={statusFilter}
            onChangeStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            onChangeCategoryFilter={setCategoryFilter}
            categories={categories}
            groupByCategory={groupByCategory}
            onToggleGroupByCategory={() => setGroupByCategory((v) => !v)}
            onBulkDeleteDone={handleBulkDeleteDone}
            doneCount={todos.filter((t) => t.status === "completed").length}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <ViewToggle view={view} onChange={setView} />
          </div>

          {view === "calendar" ? (
            <TodoCalendar todos={filtered} />
          ) : groupByCategory ? (
            <div style={{ display: "grid", gap: 14 }}>
              {groupedByCategoryList.map(([cat, list]) => (
                <section key={cat} style={styles.section}>
                  <div style={styles.sectionTitle}>{cat}</div>
                  <TodoList
                    todos={list}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    currentUserId={user?.id}
                  />
                </section>
              ))}
            </div>
          ) : (
            <TodoList
              todos={filtered}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              currentUserId={user?.id}
              />
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.h2}>新規タスク</h2>
          <TodoForm onSubmit={handleCreate} submitLabel="追加" />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f6f7fb", padding: 8 },
  container: { maxWidth: 1200, margin: "0 auto", display: "grid", gap: 16 ,width: "100%"},
  title: { margin: "8px 0 0", fontSize: 28 },
  h2: { margin: "0 0 12px", fontSize: 18 },
  card: {
    background: "white",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  section: { border: "1px solid #eef0f6", borderRadius: 12, padding: 12, background: "#fff" },
  sectionTitle: { fontWeight: 800, marginBottom: 10 },
};
