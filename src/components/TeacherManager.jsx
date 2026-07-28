import { useState, useEffect } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function TeacherManager({ classList }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editClass, setEditClass] = useState("");

  const fetchTeachers = async () => {
    setLoading(true);
    const q = query(collection(db, "users"), where("role", "==", "teacher"));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setTeachers(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const startEdit = (teacher) => {
    setEditingId(teacher.id);
    setEditClass(teacher.class || "");
  };

  const saveClass = async (teacherId) => {
    await updateDoc(doc(db, "users", teacherId), { class: editClass });
    setEditingId(null);
    fetchTeachers();
  };

  return (
    <div style={{ marginTop: "20px", maxWidth: "600px" }}>
      {loading ? (
        <p>Loading teachers...</p>
      ) : teachers.length === 0 ? (
        <p>No teachers found yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Assigned Class</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id}>
                  <td>{t.email}</td>
                  <td>
                    {editingId === t.id ? (
                      <select value={editClass} onChange={(e) => setEditClass(e.target.value)}>
                        <option value="">-- Select Class --</option>
                        {classList && classList.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      t.class || "Not assigned"
                    )}
                  </td>
                  <td>
                    {editingId === t.id ? (
                      <button onClick={() => saveClass(t.id)}>Save</button>
                    ) : (
                      <button onClick={() => startEdit(t)}>Edit Class</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TeacherManager;