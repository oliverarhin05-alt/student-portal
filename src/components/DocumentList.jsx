import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

function DocumentList({ audience }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      const q = query(collection(db, "documents"), where("audience", "==", audience));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setDocuments(list);
      setLoading(false);
    };
    fetchDocs();
  }, [audience]);

  if (loading) return <p>Loading documents...</p>;
  if (documents.length === 0) return <p>No documents available yet.</p>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", minWidth: "500px" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.title}</td>
              <td>{doc.category}</td>
              <td>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                  {doc.fileName}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DocumentList;