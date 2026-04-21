export function TodoToolbar({
  sortKey,
  onChangeSort,
  query,
  onChangeQuery,

  statusFilter,
  onChangeStatusFilter,
  categoryFilter,
  onChangeCategoryFilter,
  categories,

  groupByCategory,
  onToggleGroupByCategory,

  onBulkDeleteDone,
  doneCount,
}) {
  return (
    <div style={{ display: "grid", gap: 10, marginBottom: 8 }}>
      <div style={styles.row}>
        <input
          style={styles.input}
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          placeholder="検索（タイトル・説明・カテゴリ）"
        />

        <select style={styles.select} value={sortKey} onChange={(e) => onChangeSort(e.target.value)}>
          <option value="due_date">期限が近い順</option>
          <option value="priority">優先度が高い順</option>
          <option value="status">ステータス順</option>
        </select>
      </div>

      <div style={styles.row}>
        {/* ✅ ステータス切替 */}
        <select style={styles.select} value={statusFilter} onChange={(e) => onChangeStatusFilter(e.target.value)}>
          <option value="all">全ステータス</option>
          <option value="未着手">未着手</option>
          <option value="進行中">進行中</option>
          <option value="完了">完了</option>
        </select>

        {/* ✅ カテゴリ切替 */}
        <select
          style={styles.select}
          value={categoryFilter}
          onChange={(e) => onChangeCategoryFilter(e.target.value)}>

            <option value="all">全カテゴリ</option>
            <option value="仕事">仕事</option>
            <option value="プライベート">プライベート</option>
            <option value="学習">学習</option>
        </select>


        {/* ✅ カテゴリ別表示（グループ表示） */}
        <label style={styles.checkbox}>
          <input type="checkbox" checked={groupByCategory} onChange={onToggleGroupByCategory} />
          カテゴリ別に表示
        </label>

        <div style={{ flex: 1 }} />

        {/* ✅ 完了一括削除 */}
        <button
          type="button"
          style={styles.dangerBtn}
          onClick={() => {
            if (doneCount === 0) return;
            const ok = confirm(`完了タスク（${doneCount}件）を一括削除しますか？`);
            if (ok) onBulkDeleteDone();
          }}
          disabled={doneCount === 0}
          title={doneCount === 0 ? "完了タスクがありません" : "完了タスクを一括削除"}
        >
          完了を一括削除（{doneCount}）
        </button>
      </div>
    </div>
  );
}

const styles = {
  row: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  input: {
    flex: 1,
    minWidth: 220,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e6e7ef",
    outline: "none",
  },
  select: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e6e7ef",
    background: "white",
  },
  checkbox: { display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12, opacity: 0.85 },
  dangerBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ffd3d3",
    background: "#fff3f3",
    cursor: "pointer",
  },
};
