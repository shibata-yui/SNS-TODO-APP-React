import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchPosts } from "../api/posts";
import { updateProfile } from "../api/profile";

export function ProfilePage() {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 編集機能のための「状態管理（スイッチとデータ）」 ---
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    async function loadMyPosts() {
      try {
        const allPosts = await fetchPosts();
        const filtered = allPosts.filter(post => post.user_id === user?.id);
        setMyPosts(filtered);
      } catch (error) {
        console.error("取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }
    loadMyPosts();
  }, [user]);

  // --- 編集モードを開くときの処理 ---
  function startEdit() {
    setEditName(user?.name || "");
    setEditBio(user?.bio || "");
    setIsEditing(true); // スイッチをON
  }

  // --- 編集モードをキャンセルするときの処理 ---
  function cancelEdit() {
    setIsEditing(false); // スイッチをOFF
  }

  // --- 保存ボタンを押したときの仮処理 ---
  async function handleSave(e) {
    e.preventDefault();
    try {
      // 相方さんが作った「完璧な通信ツール」を使って送信！
      await updateProfile({
        name: editName,
        bio: editBio,
      });

      alert("プロフィールを更新しました！");
      // 画面を再読み込みして最新のデータにする
      window.location.reload();

    } catch (error) {
      console.error("更新エラー:", error);
      alert("保存に失敗しました。");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* プロフィール上部エリア */}
        <div style={styles.profileCard}>
          <div style={styles.iconPlaceholder}>
            <span style={{ fontSize: 40 }}>👤</span>
          </div>

          {/* ここから：isEditing が true なら入力枠を、false なら今まで通りの文字を表示 */}
          {isEditing ? (
            <form onSubmit={handleSave} style={styles.editForm}>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={styles.input}
                placeholder="名前"
                required
              />
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                style={styles.editBioInput}
                placeholder="自己紹介文を入力してください"
              />
              <div style={styles.actionArea}>
                <button type="submit" style={styles.saveButton}>保存する</button>
                <button type="button" onClick={cancelEdit} style={styles.cancelButton}>キャンセル</button>
              </div>
            </form>
          ) : (
            <>
              <h1 style={styles.userName}>{user?.name || "ユーザー名"}</h1>
              <p style={styles.bio}>
                {user?.bio || "自己紹介文はまだ設定されていません。"}
              </p>

              <div style={styles.stats}>
                <span><strong style={{fontSize: 18}}>0</strong> フォロー</span>
                <span><strong style={{fontSize: 18}}>0</strong> フォロワー</span>
              </div>

              <button onClick={startEdit} style={styles.editButton}>
                プロフィールを編集
              </button>
            </>
          )}
          {/* ここまで */}
        </div>

        {/* 自分の投稿一覧エリア（変更なし） */}
        <div style={styles.postCard}>
          <h2 style={styles.h2}>自分の投稿一覧</h2>

          {loading ? (
            <p style={{ textAlign: "center", color: "#888" }}>読み込み中...</p>
          ) : myPosts.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888" }}>まだ投稿がありません。</p>
          ) : (
            <div style={styles.postList}>
              {myPosts.map(post => (
                <div key={post.id} style={styles.postItem}>
                  <p style={styles.content}>{post.contents}</p>
                  <div style={styles.date}>
                    {new Date(post.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// デザイン（スタイル）に追加分を記述
const styles = {
  page: { minHeight: "100vh", background: "#f6f7fb", padding: "24px 16px" },
  container: { maxWidth: 600, margin: "0 auto", display: "grid", gap: 20, width: "100%" },
  profileCard: { background: "white", borderRadius: 12, padding: 32, textAlign: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" },
  iconPlaceholder: { width: 100, height: 100, background: "#eef0f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  userName: { margin: "0 0 12px", fontSize: 24 },
  bio: { margin: "0 0 24px", color: "#555", whiteSpace: "pre-wrap", lineHeight: 1.6 },
  stats: { display: "flex", justifyContent: "center", gap: 32, marginBottom: 24, color: "#555" },
  editButton: { padding: "10px 24px", borderRadius: 20, border: "1px solid #ccc", background: "white", cursor: "pointer", fontWeight: "bold", fontSize: 14 },

  /* 追加したスタイル */
  editForm: { display: "flex", flexDirection: "column", gap: 16, alignItems: "center", marginBottom: 16 },
  input: { width: "80%", padding: "10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 16, textAlign: "center" },
  editBioInput: { width: "80%", minHeight: 100, padding: "12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 15, resize: "vertical" },
  actionArea: { display: "flex", gap: 12 },
  saveButton: { padding: "10px 24px", borderRadius: 20, border: "none", background: "#222", color: "white", cursor: "pointer", fontWeight: "bold" },
  cancelButton: { padding: "10px 24px", borderRadius: 20, border: "1px solid #ccc", background: "white", cursor: "pointer", fontWeight: "bold", color: "#333" },

  postCard: { background: "white", borderRadius: 12, padding: 24, boxShadow: "0 6px 18px rgba(0,0,0,0.06)" },
  h2: { margin: "0 0 20px", fontSize: 18, borderBottom: "1px solid #eef0f6", paddingBottom: 12 },
  postList: { display: "grid", gap: 16 },
  postItem: { border: "1px solid #eef0f6", borderRadius: 12, padding: 16, background: "#fff" },
  content: { margin: "0 0 12px", whiteSpace: "pre-wrap", lineHeight: 1.5 },
  date: { fontSize: 12, color: "#888" },
};
