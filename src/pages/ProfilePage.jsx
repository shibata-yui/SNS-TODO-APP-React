import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchPosts } from "../api/posts";
import { updateProfile } from "../api/profile";
import { apiFetch } from "../api/client";
import { fetchLikedPosts } from "../api/likes";
import { fetchBookmarkedPosts } from "../api/bookmarks";

export function ProfilePage() {
  const { user, refreshMe } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
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
  stats: { display: "flex", justifyContent: "center", gap: 32, marginBottom
