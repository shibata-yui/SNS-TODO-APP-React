import React from "react";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "OK",
  cancelText = "キャンセル",
  isDanger = false,
  showCancel = true,
}) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      {/* 💡 追加：白い画面（modal）の中をクリックしても、背景のクリック判定に伝わらないようにブロックする（e.stopPropagation） */}
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttonGroup}>
          <button
            onClick={onConfirm}
            style={isDanger ? styles.dangerButton : styles.confirmButton}
          >
          {confirmText}
          </button>

        {showCancel && (
          <button onClick={onClose} style={styles.cancelButton}>
            {cancelText}
      </button>
      )}
      </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  title: {
    marginTop: 0,
    marginBottom: "12px",
    fontSize: "20px",
    color: "#333",
  },
  message: {
    marginBottom: "24px",
    color: "#666",
    fontSize: "16px",
    lineHeight: "1.5",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
  },
  cancelButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "#f9f9f9",
    color: "#333",
    cursor: "pointer",
    fontWeight: "bold",
  },
  confirmButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  dangerButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#e53e3e",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
