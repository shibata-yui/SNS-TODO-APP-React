import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchPosts } from "../api/posts";
import { updateProfile } from "../api/profile";
import { apiFetch } from "../api/client";
import { fetchLikedPosts } from "../api/likes";
import { fetchBookmarkedPosts } from "../api/bookmarks";
import { fetchFollowings, fetchFollowers } from "../api/auth";
import { ConfirmModal } from "../components/ConfirmModal";

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

  // 💡 追加：画像アップロード用の状態
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [activeTab, setActiveTab] = useState("myPosts");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [userList, setUserList] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

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

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalOpen]);

  async function handleShowFollowings() {
    setModalTitle("フォロー中");
    setModalOpen(true);
    setModalLoading(true);
    try {
      const data = await fetchFollowings(user.id);
      setUserList(data || []);
    } catch (error) {
      console.error("フォロー中取得エラー:", error);
    } finally {
      setModalLoading(false);
    }
  }

  async function handleShowFollowers() {
    setModalTitle("フォロワー");
    setModalOpen(true);
    setModalLoading(true);
    try {
      const data = await fetchFollowers(user.id);
      setUserList(data || []);
    } catch (error) {
      console.error("フォロワー取得エラー:", error);
    } finally {
      setModalLoading(false);
    }
  }

  function startEdit() {
    setEditName(user?.name || "");
    setEditBio(user?.bio || "");
    // 💡 編集開始時は画像の選択状態をリセット
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(true);
  }

  function cancelEdit() {
    // 💡 キャンセル時もリセット
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(false);
  }

  // 💡 追加：画像ファイルが選ばれた時の処理（プレビュー用）
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // プレビュー用のURLを生成
    }
  }

async function handleSave(e) {
    e.preventDefault();
    try {
      // 1. テキスト情報の更新
      await updateProfile({
        name: editName,
        bio: editBio,
      });

      // 2. 画像の更新
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const savedAuth = localStorage.getItem("sns_todo_auth");
        let token = null;
        if (savedAuth) {
          try {
            token = JSON.parse(savedAuth).token;
          } catch(err) {}
        }

        // 💡 修正：fetchの結果を「res」という箱で受け取る
        const res = await fetch('http://localhost:8000/api/user/avatar', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: formData,
        });

        // もしLaravelの検問（バリデーション）に引っかかった場合 (422エラー)
        if (res.status === 422) {
          // 💡 修正：alertの代わりにモーダルのスイッチをONにする
          setIsErrorModalOpen(true);
          return;
        }

        // それ以外の予期せぬエラーの場合
        if (!res.ok) {
          throw new Error("画像の保存に失敗しました");
        }
      }

      // 💡 エラーなく通過した場合のみ、最新の情報を読み直して画面を閉じる
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

  // 💡 ユーザーの画像URL（画像がない場合はnull）
  // ※LaravelのストレージURLを指定。ポートが違う場合は修正してください。
  const userAvatarUrl = user?.avatar ? `http://localhost:8000/storage/${user.avatar}` : null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.profileCard}>
          {/* 💡 アイコン表示部分の改修 */}
          <div style={styles.iconPlaceholder}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" style={styles.avatarImage} />
            ) : userAvatarUrl ? (
              <img src={userAvatarUrl} alt="User Avatar" style={styles.avatarImage} />
            ) : (
              <span style={{ fontSize: 40 }}>👤</span>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} style={styles.editForm}>
              {/* 💡 ファイル選択ボタンを追加 */}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
                style={styles.fileInput}
              />

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
                <span onClick={handleShowFollowings} style={styles.statsLink}>
                  <strong style={{fontSize: 18}}>{profileStats.followings_count}</strong> フォロー
                </span>
                <span onClick={handleShowFollowers} style={styles.statsLink}>
                  <strong style={{fontSize: 18}}>{profileStats.followers_count}</strong> フォロワー
                </span>
              </div>

              <button onClick={startEdit} style={styles.editButton}>プロフィールを編集</button>
            </>
          )}
        </div>

        <div style={styles.postCard}>
          <div style={styles.tabContainer}>
            <button style={activeTab === "myPosts" ? styles.activeTab : styles.inactiveTab} onClick={() => setActiveTab("myPosts")}>自分の投稿</button>
            <button style={activeTab === "likedPosts" ? styles.activeTab : styles.inactiveTab} onClick={() => setActiveTab("likedPosts")}>いいね</button>
            <button style={activeTab === "bookmarkedPosts" ? styles.activeTab : styles.inactiveTab} onClick={() => setActiveTab("bookmarkedPosts")}>ブックマーク</button>
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
                    <p style={styles.postAuthor}>
                      {/* 💡 投稿一覧のアイコンも連動（簡易版） */}
                      {post.user.avatar ? (
                        <img src={`http://localhost:8000/storage/${post.user.avatar}`} alt="icon" style={styles.smallAvatarImage} />
                      ) : (
                        "👤 "
                      )}
                      {post.user.name}さんの投稿
                    </p>
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

      {/* ユーザー一覧モーダル（省略せずそのまま） */}
      {modalOpen && (
        <div style={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>{modalTitle}</h3>
              <button style={styles.closeButton} onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              {modalLoading ? (
                <p style={{ textAlign: "center", color: "#888" }}>読み込み中...</p>
              ) : userList.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", padding: "20px 0" }}>対象のユーザーがいません。</p>
              ) : (
                <div style={styles.userListContainer}>
                  {userList.map((u) => (
                    <div key={u.id} style={styles.userItem}>
                      <div style={styles.smallIcon}>
                        {/* 💡 モーダル内のアイコンも連動 */}
                        {u.avatar ? (
                          <img src={`http://localhost:8000/storage/${u.avatar}`} alt="icon" style={styles.smallAvatarImage} />
                        ) : (
                          "👤"
                        )}
                      </div>
                      <div style={styles.modalUserName}>{u.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        onConfirm={() => setIsErrorModalOpen(false)}
        title="画像のサイズエラー"
        message="画像サイズが大きすぎます。容量2MB以内、縦横2000px×2000px以内のものを選択してください。"
        showCancel={false}
        isDanger={true}
        confirmText="確認"
      />
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f6f7fb", padding: "24px 16px" },
  container: { maxWidth: 600, margin: "0 auto", display: "grid", gap: 20, width: "100%" },
  profileCard: { background: "white", borderRadius: 12, padding: 32, textAlign: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" },

  // 💡 変更：overflowをhiddenにして丸く切り抜く
  iconPlaceholder: { width: 100, height: 100, background: "#eef0f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", overflow: "hidden" },

  // 💡 追加：画像用のスタイル（枠いっぱいに表示）
  avatarImage: { width: "100%", height: "100%", objectFit: "cover" },
  smallAvatarImage: { width: 24, height: 24, borderRadius: "50%", objectFit: "cover", verticalAlign: "middle", marginRight: 8 },
  fileInput: { marginBottom: 12, fontSize: 14 },

  userName: { margin: "0 0 12px", fontSize: 24 },
  bio: { margin: "0 0 24px", color: "#555", whiteSpace: "pre-wrap", lineHeight: 1.6 },
  stats: { display: "flex", justifyContent: "center", gap: 32, marginBottom: 24, color: "#555" },
  statsLink: { cursor: "pointer", padding: "4px 8px", borderRadius: 4, transition: "background 0.2s" },
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
  postAuthor: { margin: "0 0 8px 0", fontSize: 14, fontWeight: "bold", color: "#555" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0, 0, 0, 0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalContent: { background: "white", width: "90%", maxWidth: 400, borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #eef0f6" },
  closeButton: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#888" },
  modalBody: { maxHeight: 300, overflowY: "auto", padding: "10px 20px" },
  userListContainer: { display: "flex", flexDirection: "column", gap: 12 },
  userItem: { display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #f6f7fb" },
  smallIcon: { width: 36, height: 36, background: "#eef0f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  modalUserName: { fontSize: 16, fontWeight: "bold", color: "#333" }
};
