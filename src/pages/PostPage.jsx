import { useEffect, useState } from "react";
import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
} from "../api/posts";
import { useAuth } from "../auth/AuthContext";

export function PostPage() {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const data = await fetchPosts();
      setPosts(data);
      setError("");
    } catch (error) {
      console.error("投稿一覧取得エラー:", error);
      setError("投稿一覧の取得に失敗しました。");
    }
  }

  async function handleCreatePost(e) {
    e.preventDefault();

    if (!content.trim()) {
      alert("投稿内容を入力してください。");
      return;
    }

    try {
      const newPost = await createPost({
        contents: content,
      });

      setPosts((prev) => [newPost, ...prev]);
      setContent("");
    } catch (error) {
      console.error("投稿作成エラー:", error);
      alert("投稿の作成に失敗しました。");
    }
  }

  function startEdit(post) {
    setEditingPostId(post.id);
    setEditingContent(post.contents);
  }

  function cancelEdit() {
    setEditingPostId(null);
    setEditingContent("");
  }

  async function handleUpdatePost(postId) {
    if (!editingContent.trim()) {
      alert("投稿内容を入力してください。");
      return;
    }

    try {
      const updatedPost = await updatePost(postId, {
        contents: editingContent,
      });

      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );

      cancelEdit();
    } catch (error) {
      console.error("投稿更新エラー:", error);
      alert("投稿の更新に失敗しました。");
    }
  }

  async function handleDeletePost(postId) {
    if (!confirm("この投稿を削除しますか？")) {
      return;
    }

    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("投稿削除エラー:", error);
      alert("投稿の削除に失敗しました。");
    }
  }



  async function handleToggleLike(postId) {
  try {
    const result = await toggleLike(postId);

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              is_liked: result.liked,
              likes_count: result.liked
                ? Number(post.likes_count || 0) + 1
                : Math.max(Number(post.likes_count || 0) - 1, 0),
            }
          : post
      )
    );
  } catch (error) {
    console.error("いいね切り替えエラー:", error);
    alert("いいねの切り替えに失敗しました。");
  }
}

async function handleToggleBookmark(postId) {
  try {
    const result = await toggleBookmark(postId);

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              is_bookmarked: result.bookmarked,
            }
          : post
      )
    );
  } catch (error) {
    console.error("ブックマーク切り替えエラー:", error);
    alert("ブックマークの切り替えに失敗しました。");
  }
}



  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>タイムライン</h1>

        <div style={styles.card}>
          <h2 style={styles.h2}>新規投稿</h2>

          <form onSubmit={handleCreatePost}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="いま何してる？"
              style={styles.textarea}
            />

            <button type="submit" style={styles.button}>
              投稿する
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h2 style={styles.h2}>投稿一覧</h2>

          {error && <p style={styles.error}>{error}</p>}

          {posts.length === 0 ? (
            <p>投稿がありません</p>
          ) : (
            <div style={styles.postList}>
              {posts.map((post) => {
                const isOwnPost = user?.id === post.user_id;
                const isEditing = editingPostId === post.id;

                return (
                  <div key={post.id} style={styles.postItem}>
                    <div style={styles.meta}>
                      {post.user?.name || "ユーザー"}
                    </div>

                    {isEditing ? (
                      <>
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          style={styles.textarea}
                        />

                        <div style={styles.actionArea}>
                          <button
                            type="button"
                            style={styles.button}
                            onClick={() => handleUpdatePost(post.id)}
                          >
                            保存
                          </button>

                          <button
                            type="button"
                            style={styles.cancelButton}
                            onClick={cancelEdit}
                          >
                            キャンセル
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                          <p style={styles.content}>{post.contents}</p>
                          <div style={styles.reactionArea}>
                          <button
                            type="button"
                            style={post.is_liked ? styles.activeReactionButton : styles.reactionButton}
                            onClick={() => handleToggleLike(post.id)}
                          >
                            {post.is_liked ? "❤️ いいね済み" : "🤍 いいね"} {post.likes_count ?? 0}
                          </button>

                          <button
                            type="button"
                            style={
                            post.is_bookmarked
                            ? styles.activeReactionButton
                            : styles.reactionButton
                            }
                            onClick={() => handleToggleBookmark(post.id)}
                          >
                          {post.is_bookmarked ? "🔖 保存済み" : "📑 ブックマーク"}
                          </button>
                    </div>



                        <div style={styles.date}>
                          投稿日時：{new Date(post.created_at).toLocaleString()}
                        </div>

                        {isOwnPost && (
                          <div style={styles.actionArea}>
                            <button
                              type="button"
                              style={styles.smallButton}
                              onClick={() => startEdit(post)}
                            >
                              編集
                            </button>

                            <button
                              type="button"
                              style={styles.deleteButton}
                              onClick={() => handleDeletePost(post.id)}
                            >
                              削除
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    padding: 16,
  },
  container: {
    maxWidth: 900,
    margin: "0 auto",
    display: "grid",
    gap: 16,
    width: "100%",
  },
  title: {
    margin: "8px 0 0",
    fontSize: 28,
  },
  h2: {
    margin: "0 0 12px",
    fontSize: 18,
  },
  card: {
    background: "white",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    resize: "vertical",
    boxSizing: "border-box",
  },
  button: {
    marginTop: 10,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #222",
    background: "#222",
    color: "white",
    cursor: "pointer",
  },
  cancelButton: {
    marginTop: 10,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #ccc",
    background: "white",
    color: "#333",
    cursor: "pointer",
  },
  smallButton: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "white",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #ffb3b3",
    background: "#fff3f3",
    color: "#b00020",
    cursor: "pointer",
  },
  postList: {
    display: "grid",
    gap: 12,
  },
  postItem: {
    border: "1px solid #eef0f6",
    borderRadius: 12,
    padding: 12,
    background: "#fff",
  },
  meta: {
    fontWeight: 700,
    marginBottom: 8,
  },
  content: {
    margin: "8px 0",
    whiteSpace: "pre-wrap",
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
  },
  actionArea: {
    display: "flex",
    gap: 8,
    marginTop: 10,
  },
  error: {
    color: "#b00020",
    background: "#fff3f3",
    padding: 10,
    borderRadius: 10,
  },

  reactionArea: {
  display: "flex",
  gap: 8,
  marginTop: 10,
  flexWrap: "wrap",
},
reactionButton: {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
},
activeReactionButton: {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #222",
  background: "#222",
  color: "white",
  cursor: "pointer",
},



};
