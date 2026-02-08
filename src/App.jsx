import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { TodoPage } from "./pages/TodoPage";

function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <div style={styles.brand}>SNS + ToDo</div>

        <nav style={styles.nav}>
          <Link to="/todos" style={styles.link}>ToDo一覧</Link>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/todos" replace />} />
          <Route path="/todos" element={<TodoPage />} />
          <Route path="*" element={<Navigate to="/todos" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  header: { position: "sticky", top: 0, background: "white", borderBottom: "1px solid #eef0f6", zIndex: 10 },
  inner: { maxWidth: 980, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  brand: { fontWeight: 800 },
  nav: { display: "flex", gap: 12 },
  link: { textDecoration: "none", color: "#111", padding: "8px 10px", borderRadius: 10, border: "1px solid #e6e7ef" },
};
