import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchPosts } from "../api/posts";
import { updateProfile } from "../api/profile";
import { apiFetch } from "../api/client";
import { fetchLikedPosts } from "../api/likes";
import { fetchBookmarkedPosts } from "../api/bookmarks"; // 💡 追加：ブックマーク一覧を取得するツール

export function ProfilePage() {
  const { user, refreshMe } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]); // 💡 追加：ブックマークした投稿を入れる箱
  const [loading, setLoading] = useState(true);
  const [profileStats, setProfileStats] = useState({ followings_count: 0, followers_count: 0 });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  const [activeTab, setActiveTab] = useState("myPosts");

  useEffect(() => {
    async function loadProfileData() {
      try {
        const profileData = await apiFetch('/profile');
        setProfileStats({
          followings_count: profileData.followings_count || 0,
          followers_count: profileData.followers_count || 0,
        });

        const allPosts = await fetchPosts();
        const filtered = allPosts.filter(post => post.user_id === user?.id);
        setMyPosts(filtered);

        const likedData = await fetchLikedPosts();
        setLikedPosts(likedData);

        // 💡 追加：自分がブックマークした投稿も取得しておく
        const bookmarkData = await fetchBookmarkedPosts();
        setBookmarkedPosts(bookmarkData);

      } catch (error) {
        console.error("取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
        loadProfileData();
    }
  }, [user]);

  function startEdit() {
    setEditName(user?.name || "");
    setEditBio(user?.bio || "");
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      await updateProfile({
        name: editName,
        bio: editBio,
      });
      alert("プロフィールを更新しました！");
      await refreshMe();
      setIsEditing(false);
    } catch (error) {
      console.error("更新エラー:", error);
      alert("保存に失敗しました。");
    }
  }

  // 💡 修正：3つのタブのどれが選ばれているかで、表示するデータを切り替える
  let displayedPosts = [];
  if (activeTab === "myPosts") {
    displayedPosts = myPosts;
  } else if (activeTab === "likedPosts") {
    displayedPosts = likedPosts;
  } else if (activeTab === "bookmarkedPosts") {
    displayedPosts = bookmarkedPosts;
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.profileCard}>
          <div style={styles.iconPlaceholder}>
            <span style={{ fontSize: 40 }}>👤</span>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} style={styles.editForm}>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} style={styles.input} placeholder="名前" required />
              <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} style={styles.editBioInput} placeholder="自己紹介文を入力してください" />
              <div style={styles.actionArea}>
                <button type="submit" style={styles.saveButton}>保存する</button>
                <button type="button" onClick={cancelEdit} style={styles.cancelButton}>キャンセル</button>
              </div>
            </form>
          ) : (
            <>
              <h1 style={styles.userName}>{user?.name || "ユーザー名"}</h1>
              <p style={styles.bio}>{user?.bio || "自己紹介文はまだ設定されていません。"}</p>
              <div style={styles.stats}>
                <span><strong style={{fontSize: 18}}>{profileStats.followings_count}</strong> フォロー</span>
                <span><strong style={{fontSize: 18}}>{profileStats.followers_count}</strong> フォロワー</span>
              </div>
              <button onClick={startEdit} style={styles.editButton}>プロフィールを編集</button>
            </>
          )}
        </div>

        <div style={styles.postCard}>

          <div style={styles.tabContainer}>
            <button
              style={activeTab === "myPosts" ? styles.activeTab : styles.inactiveTab}
              onClick={() => setActiveTab("myPosts")}
            >
              自分の投稿
            </button>
            <button
              style={activeTab === "likedPosts" ? styles.activeTab : styles.inactiveTab}
              onClick={() => setActiveTab("likedPosts")}
            >
              いいね
            </button>
            {/* 💡 追加：ブックマーク用のタブボタン */}
            <button
              style={activeTab === "bookmarkedPosts" ? styles.activeTab : styles.inactiveTab}
              onClick={() => setActiveTab("bookmarkedPosts")}
            >
              ブックマーク
            </button>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", color: "#888", marginTop: 20 }}>読み込み中...</p>
          ) : displayedPosts.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
              {activeTab === "myPosts" && "まだ投稿がありません。"}
              {activeTab === "likedPosts" && "まだいいねした投稿がありません。"}
              {activeTab === "bookmarkedPosts" && "まだブックマークした投稿がありません。"}
            </p>
          ) : (
            <div style={styles.postList}>
              {displayedPosts.map(post => (
                <div key={post.id} style={styles.postItem}>
                  {/* いいね・ブックマークタブの時は、誰の投稿か分かるように名前を出す */}
                  {(activeTab === "likedPosts" || activeTab === "bookmarkedPosts") && post.user && (
                    <p style={styles.postAuthor}>👤 {post.user.name}さんの投稿</p>
                  )}
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

const styles = {
  page: { minHeight: "100vh", background: "#f6f7fb", padding: "24px 16px" },
  container: { maxWidth: 600, margin: "0 auto", display: "grid", gap: 20, width: "100%" },
  profileCard: { background: "white", borderRadius: 12, padding: 32, textAlign: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" },
  iconPlaceholder: { width: 100, height: 100, background: "#eef0f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  userName: { margin: "0 0 12px", fontSize: 24 },
  bio: { margin: "0 0 24px", color: "#555", whiteSpace: "pre-wrap", lineHeight: 1.6 },
  stats: { display: "flex", justifyContent: "center", gap: 32, marginBottom: 24, color: "#555" },
  editButton: { padding: "10px 24px", borderRadius: 20, border: "1px solid #ccc", background: "white", cursor: "pointer", fontWeight: "bold", fontSize: 14 },
  editForm: { display: "flex", flexDirection: "column", gap: 16, alignItems: "center", marginBottom: 16 },
  input: { width: "80%", padding: "10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 16, textAlign: "center" },
  editBioInput: { width: "80%", minHeight: 100, padding: "12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 15, resize: "vertical" },
  actionArea: { display: "flex", gap: 12 },
  saveButton: { padding: "10px 24px", borderRadius: 20, border: "none", background: "#222", color: "white", cursor: "pointer", fontWeight: "bold" },
  cancelButton: { padding: "10px 24px", borderRadius: 20, border: "1px solid #ccc", background: "white", cursor: "pointer", fontWeight: "bold", color: "#333" },
  postCard: { background: "white", borderRadius: 12, padding: "0 24px 24px 24px", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" },
  postList: { display: "grid", gap: 16, marginTop: 16 },
  postItem: { border: "1px solid #eef0f6", borderRadius: 12, padding: 16, background: "#fff" },
  content: { margin: "0 0 12px", whiteSpace: "pre-wrap", lineHeight: 1.5 },
  date: { fontSize: 12, color: "#888" },
  tabContainer: { display: "flex", borderBottom: "1px solid #eef0f6", marginBottom: "16px" },
  activeTab: { flex: 1, padding: "16px", background: "none", border: "none", borderBottom: "3px solid #222", cursor: "pointer", fontWeight: "bold", fontSize: "16px", color: "#222" },
  inactiveTab: { flex: 1, padding: "16px", background: "none", border: "none", borderBottom: "3px solid transparent", cursor: "pointer", fontWeight: "normal", fontSize: "16px", color: "#888" },
  postAuthor: { margin: "0 0 8px 0", fontSize: 14, fontWeight: "bold", color: "#555" }
};
