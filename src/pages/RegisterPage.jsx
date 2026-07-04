import { useState } from "react";
import { useNavigate } from "react-router-dom";
// 💡 追加：共通モーダルをインポート
import { ConfirmModal } from "../components/ConfirmModal";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  // 💡 追加：モーダルの状態を管理するState
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: null,
    onConfirm: null,
  });

  const navigate = useNavigate();

  // 💡 追加：モーダルを閉じるための共通処理
  const closeModal = () => setModal({ ...modal, isOpen: false });

async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // フロント側での事前チェック：一致していなければ送信自体をストップ
    if (password !== passwordConfirmation) {
      setError("パスワードと確認用パスワードが一致しません。");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation
        }),
      });

      // 💡 修正：レスポンスがOKかどうかに関わらず、まずは中身（JSON）を取り出す
      const responseData = await response.json();

      // 💡 修正：バックエンドからエラー（errors）が返ってきているか厳格にチェック
      if (!response.ok || responseData.errors || responseData.message === "Unauthenticated.") {
        // Laravelのバリデーションエラーメッセージがあればそれを採用
        if (responseData.errors) {
          const messages = Object.values(responseData.errors).flat().join(" ");
          throw new Error(messages);
        } else if (responseData.message) {
          throw new Error(responseData.message);
        }
        throw new Error("登録に失敗しました。入力内容をご確認ください。");
      }

      // 💡 エラーが一切投げられなかった（完全に成功した）場合のみモーダルを表示
      setModal({
        isOpen: true,
        title: "登録完了",
        message: (
          <>
            登録が完了しました！<br />
            ログイン画面へ移動します。
          </>
        ),
        onConfirm: () => {
          closeModal();
          navigate("/login");
        },
      });

    } catch (err) {
      // 💡 メアド重複などのエラーは必ずここに落ちてきて、赤文字で画面に表示される
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
            // 💡 修正：半角カンマ(,)と全角カンマ(，)が入力されたら、強制的に半角ドット(.)に置き換える
            onChange={(e) => setEmail(e.target.value.replace(/[,，]/g, "."))}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>パスワード</label>
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
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

        <div style={styles.inputGroup}>
          <label>パスワード（確認用）</label>
          <div style={styles.passwordWrapper}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              style={styles.passwordInput}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              {showConfirmPassword ? "👁️" : "🙈"}
            </button>
          </div>
        </div>

        <button type="submit" style={styles.button}>登録する</button>
      </form>

      <button onClick={() => navigate("/login")} style={styles.linkButton}>
        すでにアカウントをお持ちの方はこちら
      </button>

      {/* 💡 追加：ページの一番下にモーダルコンポーネントを配置 */}
      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        confirmText="ログイン画面へ"
        cancelText="閉じる"
      />
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
  passwordWrapper: { display: "flex", position: "relative", alignItems: "center", width: "100%" },
  passwordInput: { padding: "10px 40px 10px 10px", borderRadius: 4, border: "1px solid #ccc", fontSize: 16, boxSizing: "border-box", width: "100%" },
  eyeButton: { position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 0 },
  button: { padding: "12px", background: "#222", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold", fontSize: 16 },
  linkButton: { marginTop: 24, background: "none", border: "none", color: "#0066cc", cursor: "pointer", textDecoration: "underline" }
};
