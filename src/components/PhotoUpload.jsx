import { useState } from "react";
import { GOOGLE_CLIENT_ID } from "../googleConfig";

function PhotoUpload({ studentId, onUploaded }) {
  const [accessToken, setAccessToken] = useState(null);
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
        setMessage("Connected to Google Drive. Now choose a photo below.");
      },
    });
    tokenClient.requestAccessToken();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !accessToken) return;
    await uploadFile(file, accessToken);
  };

  const uploadFile = async (file, token) => {
    setUploading(true);
    setMessage("Uploading...");

    const metadata = {
      name: `${studentId}_photo.jpg`,
      mimeType: file.type,
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
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
        await fetch(
          `https://www.googleapis.com/drive/v3/files/${data.id}/permissions`,
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ role: "reader", type: "anyone" }),
          }
        );

        const photoUrl = `https://drive.google.com/thumbnail?id=${data.id}&sz=w400`;
        setMessage("Photo uploaded successfully!");
        if (onUploaded) onUploaded(photoUrl);
      } else {
        setMessage("Upload failed.");
      }
    } catch (err) {
      setMessage("Upload error: " + err.message);
    }

    setUploading(false);
  };

  return (
    <div style={{ marginTop: "10px", padding: "10px", border: "1px solid #555" }}>
      {!accessToken ? (
        <button onClick={connectToDrive}>Connect to Google Drive</button>
      ) : (
        <div>
          <label>Upload Passport Photo: </label>
          <input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} />
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default PhotoUpload;