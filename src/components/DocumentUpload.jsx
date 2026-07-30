import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { GOOGLE_CLIENT_ID } from "../googleConfig";

function DocumentUpload({ user, onUploaded }) {
  const [accessToken, setAccessToken] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Notes");
  const [audience, setAudience] = useState("students");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const connectToDrive = () => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (tokenResponse) => {
        if (tokenResponse.error) {
          setMessage("Authorization failed.");
          return;
        }
        setAccessToken(tokenResponse.access_token);
        setMessage("Connected to Google Drive. Now choose a file below.");
      },
    });
    tokenClient.requestAccessToken();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !accessToken) return;
    if (!title.trim()) {
      setMessage("Please enter a title before selecting a file.");
      return;
    }
    await uploadFile(file, accessToken);
  };

  const uploadFile = async (file, token) => {
    setUploading(true);
    setMessage("Uploading...");

    const metadata = {
      name: file.name,
      mimeType: file.type,
    };

    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", file);

    try {
      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
        {
          method: "POST",
          headers: new Headers({ Authorization: "Bearer " + token }),
          body: form,
        }
      );
      const data = await response.json();

      if (data.id) {
        await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: "reader", type: "anyone" }),
        });

        const fileUrl = `https://drive.google.com/file/d/${data.id}/view`;

        await addDoc(collection(db, "documents"), {
          title,
          category,
          audience,
          fileName: file.name,
          fileUrl,
          uploadedBy: user.email,
          createdAt: serverTimestamp(),
        });

        setMessage("Document uploaded successfully!");
        setTitle("");
        if (onUploaded) onUploaded();
      } else {
        setMessage("Upload failed.");
      }
    } catch (err) {
      setMessage("Upload error: " + err.message);
    }

    setUploading(false);
  };

  return (
    <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ccc", maxWidth: "500px" }}>
      <h3>Upload Document</h3>

      <div style={{ marginBottom: "10px" }}>
        <label>Title: </label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Term 1 Notes" />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Category: </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Notes">Notes</option>
          <option value="Assignments">Assignments</option>
          <option value="Circulars">Circulars</option>
          <option value="Past Questions">Past Questions</option>
        </select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Audience: </label>
        <select value={audience} onChange={(e) => setAudience(e.target.value)}>
          <option value="students">Students</option>
          <option value="staff">Staff (Teachers)</option>
        </select>
      </div>

      {!accessToken ? (
        <button onClick={connectToDrive}>Connect to Google Drive</button>
      ) : (
        <div>
          <label>Choose File: </label>
          <input type="file" onChange={handleFileSelect} disabled={uploading} />
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

export default DocumentUpload;