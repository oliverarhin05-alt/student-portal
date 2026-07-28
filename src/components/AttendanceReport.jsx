import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

function AttendanceReport({ classList }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!selectedClass) {
        setRecords([]);
        return;
      }
      setLoading(true);
      const q = query(collection(db, "attendance"), where("class", "==", selectedClass));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => d.data()).sort((a, b) => (a.date < b.date ? 1 : -1));
      setRecords(list);
      setLoading(false);
    };
    fetchRecords();
  }, [selectedClass]);

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
          const presentCount = entries.filter(([, v]) => v === "Present").length;
          const absentCount = entries.filter(([, v]) => v === "Absent").length;
          const lateCount = entries.filter(([, v]) => v === "Late").length;

          return (
            <div key={i} style={{ padding: "10px", border: "1px solid #555", marginBottom: "10px" }}>
              <p>
                <strong>{rec.date}</strong> — Present: {presentCount}, Absent: {absentCount}, Late: {lateCount}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}

export default AttendanceReport;