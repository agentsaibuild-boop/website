"use client";

import { useState, useRef } from "react";

interface Doc {
  id: string;
  name: string;
  fileType: string;
  fileSize: number;
  status: string;
  createdAt: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileExt(name: string) {
  return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

export function DocumentsClient({ documents: initial }: { documents: Doc[] }) {
  const [docs, setDocs] = useState<Doc[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/documents/upload", {
      method: "POST",
      body: form,
    });

    setUploading(false);
    if (res.ok) {
      const doc: Doc = await res.json();
      setDocs((prev) => [{ ...doc }, ...prev]);
    } else {
      const d = await res.json();
      setUploadError(d.error || "Грешка при качване");
    }

    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(id: string) {
    if (!confirm("Изтриване на документа?")) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocs((prev) => prev.filter((d) => d.id !== id));
    }
  }

  return (
    <div className="page-content">
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1>Документи</h1>
          <p className="page-subtitle">Качете документи за обработка от AI агента</p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            id="file-upload"
            style={{ display: "none" }}
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
            onChange={handleUpload}
          />
          <label
            htmlFor="file-upload"
            className="btn-sm"
            style={{ cursor: "pointer" }}
          >
            {uploading ? "Качване…" : "+ Качи документ"}
          </label>
        </div>
      </div>

      {uploadError && <p className="auth-error" style={{ maxWidth: 520 }}>{uploadError}</p>}

      <div className="section-card">
        <div className="section-card-header">
          <h2>Всички документи</h2>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>{docs.length} файла</span>
        </div>

        {docs.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: "2rem", opacity: 0.3 }}>📄</span>
            <span>Няма качени документи</span>
            <label htmlFor="file-upload" className="btn-ghost-sm" style={{ cursor: "pointer" }}>
              Качете първия документ
            </label>
          </div>
        ) : (
          <div className="document-list">
            {docs.map((doc) => (
              <div key={doc.id} className="document-row">
                <span className="doc-icon">{fileExt(doc.name)}</span>
                <div className="doc-info">
                  <p className="doc-name">{doc.name}</p>
                  <p className="doc-meta">
                    {formatBytes(doc.fileSize)} · {new Date(doc.createdAt).toLocaleDateString("bg-BG")}
                  </p>
                </div>
                <span className={`status-badge status-${doc.status.toLowerCase()}`}>
                  {doc.status === "UPLOADED" ? "качен" :
                   doc.status === "PROCESSING" ? "обработва се" :
                   doc.status === "COMPLETED" ? "завършен" : "грешка"}
                </span>
                <button
                  onClick={() => handleDelete(doc.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-muted)",
                    cursor: "pointer",
                    fontSize: "1rem",
                    padding: "0.25rem",
                    lineHeight: 1,
                  }}
                  title="Изтрий"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
