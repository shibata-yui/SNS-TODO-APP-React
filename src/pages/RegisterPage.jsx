import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      // 裏側（Laravel）の登録APIへデータを送信
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error("登録に失敗しました。入力内容をご確認ください。");
      }

      alert("登録が完了しました！ログイン画面へ移動します。");
      navigate("/login"); // 登録成功時はログイン画面へ誘導
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>新規会員登録</h2>
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>登録する</button>
      </form>
      <button onClick={() => navigate("/login")} style={styles.linkButton}>
        すでにアカウントをお持ちの方はこちら
      </button>
    </div>
  );
}

const styles = {
  container: { maxWidth: 400, margin: "40px auto", padding: 24, textAlign: "center", background: "#fff", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  title: { marginBottom: 24 },
  error: { color: "red", marginBottom: 16 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  inputGroup: { display: "flex", flexDirection: "column", textAlign: "left", gap: 8 },
  input: { padding: 10, borderRadius: 4, border: "1px solid #ccc", fontSize: 16 },
  button: { padding: "12px", background: "#222", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold", fontSize: 16 },
  linkButton: { marginTop: 24, background: "none", border: "none", color: "#0066cc", cursor: "pointer", textDecoration: "underline" }
};
