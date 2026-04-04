import React from "react";

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function toYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function statusLabel(status) {
  if (status === "completed") return "完了";
  if (status === "in_progress") return "進行中";
  return "未着手";
}

export function TodoCalendar({ todos }) {
  const [cursor, setCursor] = React.useState(() => new Date());

  // due_date があるものだけ日付でまとめる
  const map = React.useMemo(() => {
    const grouped = new Map();
    for (const t of todos) {
      if (!t.due_date) continue;
      const key = t.due_date; // "YYYY-MM-DD"想定
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(t);
    }
    return grouped;
  }, [todos]);

  const first = startOfMonth(cursor);
  const last = endOfMonth(cursor);

  // 月初の曜日に合わせて、カレンダー開始日（前月の余白）を決める
  const start = addDays(first, -first.getDay()); // 日曜スタート
  const end = addDays(last, 6 - last.getDay());

  const days = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    days.push(new Date(d));
  }

  const monthTitle = `${cursor.getFullYear()}年 ${cursor.getMonth() + 1}月`;

  return (
    <div>
      <div style={styles.head}>
        <button
          type="button"
          style={styles.navBtn}
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
        >
          ←
        </button>
        <div style={styles.month}>{monthTitle}</div>
        <button
          type="button"
          style={styles.navBtn}
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
        >
          →
        </button>
      </div>

      <div style={styles.weekHeader}>
        {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
          <div key={w} style={styles.weekCell}>{w}</div>
        ))}
      </div>

      <div style={styles.grid}>
        {days.map((date) => {
          const ymd = toYmd(date);
          const items = map.get(ymd) || [];
          const isOtherMonth = date.getMonth() !== cursor.getMonth();

          return (
            <div key={ymd} style={{ ...styles.cell, ...(isOtherMonth ? styles.other : {}) }}>
              <div style={styles.dayNum}>{date.getDate()}</div>

              <div style={styles.items}>
                {items.slice(0, 3).map((t) => (
                  <div key={t.id} style={styles.chip} title={t.description || ""}>
                    <span style={styles.chipTitle}>{t.title}</span>
                    <span style={styles.chipMeta}>
                      {statusLabel(t.status)} / P{t.priority ?? "-"}
                    </span>
                  </div>
                ))}
                {items.length > 3 ? (
                  <div style={styles.more}>+{items.length - 3}件</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  month: { fontWeight: 700 },
  navBtn: {
    width: 36,
    height: 32,
    borderRadius: 10,
    border: "1px solid #e6e7ef",
    background: "white",
    cursor: "pointer",
  },
  weekHeader: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 8 },
  weekCell: { fontSize: 12, opacity: 0.7, textAlign: "center" },
  grid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 },
  cell: {
    minHeight: 110,
    border: "1px solid #eef0f6",
    borderRadius: 12,
    padding: 10,
    background: "white",
    overflow: "hidden",
  },
  other: { background: "#fafbff", opacity: 0.7 },
  dayNum: { fontSize: 12, opacity: 0.75, marginBottom: 8 },
  items: { display: "grid", gap: 6 },
  chip: {
    border: "1px solid #e6e7ef",
    borderRadius: 10,
    padding: "6px 8px",
    fontSize: 11,
    background: "white",
    display: "grid",
    gap: 2,
  },
  chipTitle: { fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  chipMeta: { opacity: 0.7 },
  more: { fontSize: 11, opacity: 0.7, paddingLeft: 2 },
};
