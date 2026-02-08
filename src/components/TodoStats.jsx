function startOfTodayMs() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function bucketDue(dueYmd) {
  if (!dueYmd) return "期限なし";
  const ms = new Date(dueYmd).getTime();
  if (Number.isNaN(ms)) return "期限なし";

  const today = startOfTodayMs();
  const diffDays = Math.floor((ms - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "期限切れ";
  if (diffDays === 0) return "今日";
  if (diffDays <= 7) return "7日以内";
  return "それ以降";
}

function countBy(todos, keyFn, keysInOrder) {
  const m = new Map();
  for (const k of keysInOrder) m.set(k, 0);
  for (const t of todos) {
    const k = keyFn(t);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return keysInOrder.map((k) => [k, m.get(k) ?? 0]);
}

export function TodoStats({ todos }) {
  const total = todos.length;

  const statusCounts = countBy(
    todos,
    (t) => {
      if (t.status === "done") return "完了";
      if (t.status === "in_progress") return "進行中";
      return "未着手";
    },
    ["未着手", "進行中", "完了"]
  );

  const dueCounts = countBy(
    todos,
    (t) => bucketDue(t.due_date),
    ["期限切れ", "今日", "7日以内", "それ以降", "期限なし"]
  );

  const priorityCounts = countBy(
    todos,
    (t) => `P${t.priority ?? "-"}`,
    ["P3", "P2", "P1", "P-"]
  );

  return (
    <div style={styles.wrap}>
      <div style={styles.top}>
        <div style={styles.total}>合計：{total}</div>
        <div style={styles.note}>※統計は「全ToDo」を対象（フィルタ前）</div>
      </div>

      <div style={styles.grid}>
        <Block title="ステータス別" items={statusCounts} />
        <Block title="期限別" items={dueCounts} />
        <Block title="優先度別" items={priorityCounts} />
      </div>
    </div>
  );
}

function Block({ title, items }) {
  return (
    <div style={styles.card}>
      <div style={styles.h}>{title}</div>
      <div style={styles.list}>
        {items.map(([k, v]) => (
          <div key={k} style={styles.row}>
            <span style={styles.k}>{k}</span>
            <span style={styles.v}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: "grid", gap: 10 },
  top: { display: "flex", alignItems: "baseline", justifyContent: "space-between" },
  total: { fontWeight: 800, fontSize: 14 },
  note: { fontSize: 12, opacity: 0.65 },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  card: {
    background: "white",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  h: { fontWeight: 800, marginBottom: 10 },
  list: { display: "grid", gap: 6 },
  row: { display: "flex", justifyContent: "space-between", fontSize: 13 },
  k: { opacity: 0.8 },
  v: { fontWeight: 800 },
};
