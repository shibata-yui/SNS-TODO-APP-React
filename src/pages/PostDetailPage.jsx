import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchPost,
  createComment,
  updateComment,
  deleteComment,
} from "../api/posts";
import { useAuth } from "../auth/AuthContext";

export function PostDetailPage() {
  const { postId } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [commentContent, setCommentContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPost();
  }, [postId]);

  async function loadPost() {
    try {
      const data = await fetchPost(postId);
      setPost(data);
      setError("");
    } catch (error) {
      console.error("投稿詳細取得エラー:", error);
      setError("投稿詳細の取得に失敗しました。");
    }
  }

  async function handleCreateComment(e) {
    e.preventDefault();

    if (!commentContent.trim()) {
      alert("コメントを入力してください。");
      return;
    }

    try {
      const newComment = await createComment(post.id, {
        content: commentContent,
      });

      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));

      setCommentContent("");
    } catch (error) {
      console.error("コメント作成エラー:", error);
      alert("コメントの作成に失敗しました。");
    }
  }

  function startEditComment(comment) {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditingCommentContent("");
  }

  async function handleUpdateComment(commentId) {
    if (!editingCommentContent.trim()) {
      alert("コメントを入力してください。");
      return;
    }

    try {
      const updatedComment = await updateComment(commentId, {
        content: editingCommentContent,
      });

      setPost((prev) => ({
        ...prev,
        comments: (prev.comments || []).map((comment) =>
          comment.id === commentId ? updatedComment : comment
        ),
      }));

      cancelEditComment();
    } catch (error) {
      console.error("コメント更新エラー:", error);
      alert("コメントの更新に失敗しました。");
    }
  }

  async function handleDeleteComment(commentId) {
    if (!confirm("このコメントを削除しますか？")) {
      return;
    }

    try {
      await deleteComment(commentId);

      setPost((prev) => ({
        ...prev,
        comments: (prev.comments || []).filter(
          (comment) => comment.id !== commentId
        ),
      }));
    } catch (error) {
      console.error("コメント削除エラー:", error);
      alert("コメントの削除に失敗しました。");
    }
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <p style={styles.error}>{error}</p>
          <Link to="/posts" style={styles.backLink}>
            投稿一覧へ戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/posts" style={styles.backLink}>
          ← 投稿一覧へ戻る
        </Link>

        <div style={styles.card}>
          <h1 style={styles.title}>投稿詳細</h1>

          <div style={styles.meta}>{post.user?.name || "ユーザー"}</div>

          <p style={styles.content}>{post.contents}</p>

          <div style={styles.date}>
            投稿日時：{new Date(post.created_at).toLocaleString()}
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.h2}>コメント</h2>

          <form onSubmit={handleCreateComment} style={styles.commentForm}>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="コメントを入力"
              style={styles.textarea}
            />

            <button type="submit" style={styles.button}>
              コメントする
            </button>
          </form>

          {(post.comments || []).length === 0 ? (
            <p>コメントはまだありません</p>
          ) : (
            <div style={styles.commentList}>
              {(post.comments || []).map((comment) => {
                const isOwnComment = user?.id === comment.user_id;
                const isEditing = editingCommentId === comment.id;

                return (
                  <div key={comment.id} style={styles.commentItem}>
                    <div style={styles.commentMeta}>
                      {comment.user?.name || "ユーザー"}
                    </div>

                    {isEditing ? (
                      <>
                        <textarea
                          value={editingCommentContent}
                          onChange={(e) =>
                            setEditingCommentContent(e.target.value)
                          }
                          style={styles.textarea}
                        />

                        <div style={styles.actionArea}>
                          <button
                            type="button"
                            style={styles.button}
                            onClick={() => handleUpdateComment(comment.id)}
                          >
                            保存
                          </button>

                          <button
                            type="button"
                            style={styles.cancelButton}
                            onClick={cancelEditComment}
                          >
                            キャンセル
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p style={styles.commentContent}>{comment.content}</p>

                        <div style={styles.date}>
                          投稿日時：
                          {new Date(comment.created_at).toLocaleString()}
                        </div>

                        {isOwnComment && (
                          <div style={styles.actionArea}>
                            <button
                              type="button"
                              style={styles.smallButton}
                              onClick={() => startEditComment(comment)}
                            >
                              編集
                            </button>

                            <button
                              type="button"
                              style={styles.deleteButton}
                              onClick={() => handleDeleteComment(comment.id)}
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
    maxWidth: 980,
    margin: "0 auto",
    display: "grid",
    gap: 16,
    width: "100%",
  },
  card: {
    background: "white",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  title: {
    margin: "0 0 12px",
    fontSize: 28,
  },
  h2: {
    margin: "0 0 12px",
    fontSize: 18,
  },
  meta: {
    fontSize: 13,
    fontWeight: 700,
    color: "#555",
    marginBottom: 8,
  },
  content: {
    margin: "0 0 12px",
    whiteSpace: "pre-wrap",
    lineHeight: 1.6,
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
  },
  textarea: {
    width: "100%",
    minHeight: 90,
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
    padding: "7px 10px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "7px 10px",
    borderRadius: 8,
    border: "1px solid #ffb3b3",
    background: "#fff3f3",
    color: "#b00020",
    cursor: "pointer",
  },
  backLink: {
    color: "#111",
    textDecoration: "none",
    fontWeight: 700,
  },
  commentForm: {
    marginBottom: 16,
  },
  commentList: {
    display: "grid",
    gap: 12,
  },
  commentItem: {
    background: "#f6f7fb",
    borderRadius: 10,
    padding: 12,
  },
  commentMeta: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
  },
  commentContent: {
    margin: "0 0 8px",
    whiteSpace: "pre-wrap",
    lineHeight: 1.5,
  },
  actionArea: {
    display: "flex",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  error: {
    color: "#b00020",
  },
};
