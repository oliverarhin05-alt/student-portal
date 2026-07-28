import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

function AttendanceHistory({ studentId, studentClass }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const q = query(collection(db, "attendance"), where("class", "==", studentClass));
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map((d) => d.data())
        .filter((rec) => rec.records && rec.records[studentId])
        .map((rec) => ({ date: rec.date, status: rec.records[studentId] }))
        .sort((a, b) => (a.date < b.date ? 1 : -1));
      setRecords(list);
      setLoading(false);
    };
    if (studentClass) fetchHistory();
  }, [studentId, studentClass]);

  if (loading) return <p>Loading attendance...</p>;
  if (records.length === 0) return <p>No attendance records yet.</p>;

  const presentCount = records.filter((r) => r.status === "Present").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;
  const lateCount = records.filter((r) => r.status === "Late").length;

  return (
    <div>
      <p>
        <strong>Present:</strong> {presentCount} &nbsp; <strong>Absent:</strong> {absentCount} &nbsp;{" "}
        <strong>Late:</strong> {lateCount}
      </p>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceHistory;