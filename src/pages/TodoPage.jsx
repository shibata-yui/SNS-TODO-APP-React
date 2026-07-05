import { useMemo, useState, useEffect } from "react";
import { TodoStats } from "../components/TodoStats";
import { TodoToolbar } from "../components/TodoToolbar";
import { TodoList } from "../components/TodoList";
import { TodoForm } from "../components/TodoForm";
import { ViewToggle } from "../components/ViewToggle";
import { TodoCalendar } from "../components/TodoCalendar";
import { fetchTodos, createTodo, updateTodo, deleteTodo, deleteCompletedTodos} from "../api/todos";
import { useAuth } from "../auth/AuthContext";
// 💡 追加：先ほど作った共通モーダルをインポート
import { ConfirmModal } from "../components/ConfirmModal";

export function TodoPage() {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);

  const [view, setView] = useState("list");
  const [sortKey, setSortKey] = useState("due_date");
  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [groupByCategory, setGroupByCategory] = useState(false);

  // 💡 追加：モーダルの状態を管理するState
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    isDanger: false,
    onConfirm: null, // OKが押された時に実行する関数を丸ごと保存する箱
  });

  // 💡 追加：モーダルを閉じるための共通処理
  const closeModal = () => setModal({ ...modal, isOpen: false });

  const openAlertModal = (message) => {
  setModal({
    isOpen: true,
    title: "エラー",
    message,
    isDanger: false,
    onConfirm: closeModal,
  });
};

  useEffect(() => {
    async function loadTodos() {
      try {
        const data = await fetchTodos();
        if (Array.isArray(data)) {
          setTodos(data);
        } else {
          console.error("Laravelから予期せぬデータが返ってきました:", data);
          setTodos([]);
        }
      } catch (error) {
        console.error("ToDo一覧取得エラー:", error);
        openAlertModal("ToDo一覧の取得に失敗しました。Laravel側が起動しているか確認してください。");
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

    list.sort((a, b) => {
      if (sortKey === "priority") return (b.priority ?? 0) - (a.priority ?? 0);
      if (sortKey === "status") return String(a.status).localeCompare(String(b.status));
      const da = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
      const db = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
      return da - db;
    });

    return list;
  }, [todos, sortKey, query, statusFilter, categoryFilter]);

  async function handleCreate(payload) {
    try {
      const newTodo = await createTodo(payload);
      setTodos((prev) => [newTodo, ...prev]);
    } catch (error) {
      console.error("ToDo追加エラー:", error);
      openAlertModal(`ToDoの追加に失敗しました。\n${error.message}`);
    }
  }

  async function handleUpdate(id, patch) {
    try {
      const targetTodo = todos.find((todo) => todo.id === id);
      if (!targetTodo) {
        openAlertModal("更新対象のToDoが見つかりません。");
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

      const updatedTodo = await updateTodo(id, payload);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
    } catch (error) {
      console.error("ToDo更新エラー:", error);
      openAlertModal(`ToDoの更新に失敗しました。\n${error.message}`);
    }
  }

  // 💡 変更：いきなり削除せず、モーダルを開く設定をセットする
  function handleDelete(id) {
    setModal({
      isOpen: true,
      title: "ToDoの削除",
      message: (
        <>
          このToDoを削除してもよろしいですか？<br />
          この操作は取り消せません。
        </>
      ),
      isDanger: true,
      onConfirm: async () => {
        closeModal(); // まずモーダルを閉じる
        try {
          await deleteTodo(id);
          setTodos((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
          console.error("ToDo削除エラー:", error);
          openAlertModal("ToDoの削除に失敗しました。");
        }
      },
    });
  }

  // 💡 変更：完了タスク一括削除も同様に、まずはモーダルを開く
  function handleBulkDeleteDone() {
    setModal({
      isOpen: true,
      title: "完了タスクの一括削除",
      message: "完了済みのタスクをすべて削除してもよろしいですか？",
      isDanger: true,
      onConfirm: async () => {
        closeModal();
        try {
          await deleteCompletedTodos();
          setTodos((prev) => prev.filter((t) => t.status !== "completed"));
        } catch (error) {
          console.error("完了タスク一括削除エラー:", error);
          openAlertModal("完了タスクの一括削除に失敗しました。");
        }
      },
    });
  }

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

      {/* 💡 追加：ページの一番下にモーダルコンポーネントを配置 */}
      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        isDanger={modal.isDanger}
        confirmText={modal.isDanger ? "削除する" : "OK"}
        showCancel={modal.isDanger}
      />
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f6f7fb", padding: 8 },
  container: { maxWidth: 980, margin: "0 auto", display: "grid", gap: 16 ,width: "100%"},
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
