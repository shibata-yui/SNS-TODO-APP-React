import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 💡 追加：確認用パスワード
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  // 💡 追加：パスワード表示・非表示フラグ（falseで目隠し状態）
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // 💡 フロント側での事前チェック：一致していなければ送信自体をストップ
    if (password !== passwordConfirmation) {
      setError("パスワードと確認用パスワードが一致しません。");
      return;
    }

    try {
      // 裏側（Laravel）の登録APIへデータを送信
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        // 💡 password_confirmation も裏側に送信する（Laravelの標準機能で自動チェック可能にするため）
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation
        }),
      });

      // 💡 422などのエラー時にLaravelが返した具体的な警告文を取得する
      if (!response.ok) {
        const errorData = await response.json();
        // Laravelのバリデーションエラーメッセージがあればそれを採用、なければ汎用エラー
        if (errorData.errors) {
          // 例: "password": ["パスワードは英数字大文字小文字記号を最低1つ以上..."] を抽出
          const messages = Object.values(errorData.errors).flat().join(" ");
          throw new Error(messages);
        } else if (errorData.message) {
          throw new Error(errorData.message);
        }
        throw new Error("登録に失敗しました。入力内容をご確認ください。");
      }

      alert("登録が完了しました！ログイン画面へ移動します。");
      navigate("/login");
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

        {/* 💡 パスワード（目のアイコン付き） */}
        <div style={styles.inputGroup}>
          <label>パスワード</label>
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"} // ON/OFFでtypeを切り替える
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.passwordInput}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          </div>
        </div>

        {/* 💡 追加：確認用パスワード（同じく目のアイコン連動） */}
        <div style={styles.inputGroup}>
          <label>パスワード（確認用）</label>
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              style={styles.passwordInput}
            />
          </div>
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
  error: { color: "red", marginBottom: 16, background: "#fff3f3", padding: 10, borderRadius: 4, border: "1px solid #ffb3b3", textAlign: "left", fontSize: 14 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  inputGroup: { display: "flex", flexDirection: "column", textAlign: "left", gap: 8 },
  input: { padding: 10, borderRadius: 4, border: "1px solid #ccc", fontSize: 16, boxSizing: "border-box", width: "100%" },
  // 💡 パスワード枠用のスタイル
  passwordWrapper: { display: "flex", position: "relative", alignItems: "center", width: "100%" },
  passwordInput: { padding: "10px 40px 10px 10px", borderRadius: 4, border: "1px solid #ccc", fontSize: 16, boxSizing: "border-box", width: "100%" },
  eyeButton: { position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 0 },
  button: { padding: "12px", background: "#222", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold", fontSize: 16 },
  linkButton: { marginTop: 24, background: "none", border: "none", color: "#0066cc", cursor: "pointer", textDecoration: "underline" }
};
