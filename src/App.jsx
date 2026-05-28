import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { TodoPage } from "./pages/TodoPage";
import { LoginPage } from "./pages/LoginPage";
import { PostPage } from "./pages/PostPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { RegisterPage } from "./pages/RegisterPage";
import UserSearchPage from './pages/UserSearchPage';
import { PostDetailPage } from "./pages/PostDetailPage";

function Header() {
  const { isLoggedIn, logout, user } = useAuth();

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link to="/posts" style={styles.brand}>
          SNS + ToDo
        </Link>

        <nav style={styles.nav}>
          {isLoggedIn ? (
            <>
              <Link
                to="/users"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#333',
                  textDecoration: 'none',
                  padding: '8px'
                }}
                title="ユーザー検索"
              >
                {/* 虫眼鏡のSVGアイコン */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </Link>

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

        {/* ↓ 元からあったログイン画面のルート ↓ */}
        <Route path="/login" element={<LoginPage />} />

        {/* ↓ 新しく追加した新規登録画面のルート ↓ */}
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <PostPage />
            </ProtectedRoute>
          }
        />

        <Route
  path="/posts/:postId"
  element={
    <ProtectedRoute>
      <PostDetailPage />
    </ProtectedRoute>
  }
/>

        <Route
          path="/users"
          element={
            <UserSearchPage />
          } />

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
  brand: {
    fontWeight: 800,
    color: "#111",
    textDecoration: "none",
  },
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
