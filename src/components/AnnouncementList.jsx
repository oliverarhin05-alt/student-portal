import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

function AnnouncementList({ audience }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const q = query(collection(db, "announcements"), where("audience", "==", audience));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAnnouncements(list);
      setLoading(false);
    };
    fetchAnnouncements();
  }, [audience]);

  if (loading) return <p>Loading announcements...</p>;
  if (announcements.length === 0) return <p>No announcements yet.</p>;

  return (
    <div>
      {announcements.map((a) => (
        <div key={a.id} style={{ padding: "10px", border: "1px solid #555", marginBottom: "10px" }}>
          <p>{a.message}</p>
          <small>
            Posted by {a.postedBy} on {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : "..."}
          </small>
        </div>
      ))}
    </div>
  );
}

export default AnnouncementList;