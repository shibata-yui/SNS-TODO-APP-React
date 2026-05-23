import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn, authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (authLoading) {
    return <div style={styles.center}>認証状態を確認中です...</div>;
  }

  if (isLoggedIn) {
    return <Navigate to="/posts" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) {
      setError("メールアドレスを入力してください。");
      return;
    }

    if (!password.trim()) {
      setError("パスワードを入力してください。");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/posts", { replace: true });
    } catch (error) {
      console.error("ログインエラー:", error);
      setError(
        "ログインに失敗しました。Laravel側のログインAPI未実装、またはメールアドレス・パスワードが正しくない可能性があります。"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>ログイン</h1>

        <p style={styles.desc}>
          メールアドレスとパスワードを入力してください。
        </p>

        {error ? <div style={styles.error}>{error}</div> : null}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            メールアドレス
            <input
              type="email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@test.com"
            />
          </label>

          <label style={styles.label}>
            パスワード
            <input
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
            />
          </label>

          <button type="submit" style={styles.button} disabled={submitting}>
            {submitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div style={styles.registerArea}>
          <span>アカウントをお持ちでない方はこちら</span>
          <Link to="/register" style={styles.registerLink}>
            新規登録
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 80px)",
    display: "grid",
    placeItems: "center",
    background: "#f6f7fb",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    background: "white",
    borderRadius: 16,
    padding: 32,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    display: "grid",
    gap: 20,
  },
  title: {
    margin: 0,
    fontSize: 28,
  },
  desc: {
    margin: 0,
    color: "#555",
    fontSize: 16,
  },
  form: {
    display: "grid",
    gap: 12,
  },
  label: {
    display: "grid",
    gap: 6,
    fontSize: 16,
  },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d9dce8",
    outline: "none",
  },
  button: {
    padding: "12px 16px",
    borderRadius: 10,
    border: "none",
    background: "#111",
    color: "white",
    cursor: "pointer",
  },
  registerArea: {
    marginTop: 4,
    textAlign: "center",
    display: "grid",
    gap: 8,
    fontSize: 16,
  },
  registerLink: {
    color: "#0066cc",
    textDecoration: "underline",
    fontWeight: 700,
  },
  error: {
    padding: 10,
    borderRadius: 10,
    background: "#fff3f3",
    border: "1px solid #ffd3d3",
    color: "#b00020",
    fontSize: 16,
  },
  center: {
    minHeight: "calc(100vh - 80px)",
    display: "grid",
    placeItems: "center",
  },
};
