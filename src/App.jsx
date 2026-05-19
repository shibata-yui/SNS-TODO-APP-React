import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { TodoPage } from "./pages/TodoPage";
import { LoginPage } from "./pages/LoginPage";
import { PostPage } from "./pages/PostPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AuthProvider, useAuth } from "./auth/AuthContext";

function Header() {
  const { isLoggedIn, logout, user } = useAuth();

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <div style={styles.brand}>SNS + ToDo</div>

        <nav style={styles.nav}>
          {isLoggedIn ? (
            <>
              <Link to="/posts" style={styles.link}>
                SNS投稿一覧
              </Link>

              <Link to="/todos" style={styles.link}>
                ToDo一覧
              </Link>

              <Link to="/profile" style={{ ...styles.link, fontWeight: "bold", border: "none" }}>
                {user?.name ? `${user.name} さんのプロフィール` : "プロフィール"}
              </Link>

              <button type="button" style={styles.button} onClick={logout}>
                ログアウト
              </button>
            </>
          ) : (
            <Link to="/login" style={styles.link}>
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function ProtectedRoute({ children }) {
  const { isLoggedIn, authLoading } = useAuth();

  if (authLoading) {
    return <div style={{ padding: 24 }}>認証状態を確認中です...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <Header />

      <Routes>
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? "/posts" : "/login"} replace />}
        />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <PostPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/todos"
          element={
            <ProtectedRoute>
              <TodoPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    background: "white",
    borderBottom: "1px solid #eef0f6",
    zIndex: 10,
  },
  inner: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { fontWeight: 800 },
  nav: { display: "flex", gap: 12, alignItems: "center" },
  link: {
    textDecoration: "none",
    color: "#111",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e6e7ef",
  },
  button: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e6e7ef",
    background: "white",
    cursor: "pointer",
  },
  userText: {
    fontSize: 14,
    color: "#333",
  },
};
