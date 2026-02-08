export function ViewToggle({ view, onChange }) {
  return (
    <div style={styles.wrap}>
      <button
        type="button"
        onClick={() => onChange("list")}
        style={{ ...styles.btn, ...(view === "list" ? styles.active : {}) }}
      >
        リスト
      </button>
      <button
        type="button"
        onClick={() => onChange("calendar")}
        style={{ ...styles.btn, ...(view === "calendar" ? styles.active : {}) }}
      >
        カレンダー
      </button>
    </div>
  );
}

const styles = {
  wrap: { display: "inline-flex", gap: 8 },
  btn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #e6e7ef",
    background: "white",
    cursor: "pointer",
    fontSize: 12,
  },
  active: { boxShadow: "0 6px 18px rgba(0,0,0,0.08)" },
};
