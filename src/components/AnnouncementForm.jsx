import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

function AnnouncementForm({ user }) {
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("students");
  const [status, setStatus] = useState("");
  const [posted, setPosted] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "announcements"));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setPosted(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await addDoc(collection(db, "announcements"), {
      message,
      audience,
      postedBy: user.email,
      createdAt: serverTimestamp(),
    });

    setStatus("Announcement posted!");
    setMessage("");
    fetchAll();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "announcements", id));
    fetchAll();
  };

  return (
    <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #555", maxWidth: "600px" }}>
      <h3>Post Announcement</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Audience: </label>
          <select value={audience} onChange={(e) => setAudience(e.target.value)}>
            <option value="students">Students</option>
            <option value="staff">Staff (Teachers)</option>
          </select>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your announcement..."
            rows="4"
            style={{ width: "100%" }}
            required
          />
        </div>
        <button type="submit">Post Announcement</button>
      </form>
      {status && <p>{status}</p>}

      <h3 style={{ marginTop: "20px" }}>Posted Announcements</h3>
      {loading ? (
        <p>Loading...</p>
      ) : posted.length === 0 ? (
        <p>No announcements posted yet.</p>
      ) : (
        posted.map((a) => (
          <div key={a.id} style={{ padding: "10px", border: "1px solid #555", marginBottom: "10px" }}>
            <p>
              <strong>[{a.audience === "staff" ? "Staff" : "Students"}]</strong> {a.message}
            </p>
            <small>
              Posted {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : "..."}
            </small>
            <br />
            <button onClick={() => handleDelete(a.id)} style={{ marginTop: "5px" }}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default AnnouncementForm;