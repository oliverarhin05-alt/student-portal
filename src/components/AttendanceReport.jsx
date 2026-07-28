import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

function AttendanceReport({ classList }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedDate, setExpandedDate] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!selectedClass) {
        setRecords([]);
        return;
      }
      setLoading(true);

      const studentsSnap = await getDocs(
        query(collection(db, "students"), where("class", "==", selectedClass))
      );
      const studentsList = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStudents(studentsList);

      const q = query(collection(db, "attendance"), where("class", "==", selectedClass));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => d.data()).sort((a, b) => (a.date < b.date ? 1 : -1));
      setRecords(list);
      setLoading(false);
    };
    fetchRecords();
  }, [selectedClass]);

  const getName = (studentId) => {
    const s = students.find((st) => st.id === studentId);
    return s ? s.fullName : studentId;
  };

  return (
    <div>
      <div style={{ marginBottom: "15px" }}>
        <label>Select Class: </label>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">-- Select Class --</option>
          {classList && classList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : !selectedClass ? (
        <p>Select a class to view attendance records.</p>
      ) : records.length === 0 ? (
        <p>No attendance records found for {selectedClass}.</p>
      ) : (
        records.map((rec, i) => {
          const entries = Object.entries(rec.records || {});
          const present = entries.filter(([, v]) => v === "Present").map(([id]) => id);
          const absent = entries.filter(([, v]) => v === "Absent").map(([id]) => id);
          const late = entries.filter(([, v]) => v === "Late").map(([id]) => id);
          const isExpanded = expandedDate === rec.date;

          return (
            <div key={i} style={{ padding: "10px", border: "1px solid #555", marginBottom: "10px" }}>
              <p
                onClick={() => setExpandedDate(isExpanded ? null : rec.date)}
                style={{ cursor: "pointer", margin: 0 }}
              >
                <strong>{rec.date}</strong> — Present: {present.length}, Absent: {absent.length}, Late: {late.length}{" "}
                <span style={{ color: "#4ea1ff" }}>{isExpanded ? "(hide details)" : "(view details)"}</span>
              </p>

              {isExpanded && (
                <div style={{ marginTop: "10px" }}>
                  <p style={{ color: "lightgreen", marginBottom: "4px" }}>
                    <strong>Present:</strong> {present.length > 0 ? present.map(getName).join(", ") : "None"}
                  </p>
                  <p style={{ color: "#e63946", marginBottom: "4px" }}>
                    <strong>Absent:</strong> {absent.length > 0 ? absent.map(getName).join(", ") : "None"}
                  </p>
                  <p style={{ color: "orange", marginBottom: "0" }}>
                    <strong>Late:</strong> {late.length > 0 ? late.map(getName).join(", ") : "None"}
                  </p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default AttendanceReport;