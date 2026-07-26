import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

function ReportCard({ studentId, studentName, onBack }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      const q = query(collection(db, "scores"), where("studentId", "==", studentId));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setScores(list);
      setLoading(false);
    };
    fetchScores();
  }, [studentId]);

  const totalOfAll = scores.reduce((sum, s) => sum + (s.total || 0), 0);
  const average = scores.length > 0 ? (totalOfAll / scores.length).toFixed(1) : 0;

  return (
    <div>
      {onBack && (
        <button onClick={onBack} style={{ marginBottom: "15px" }}>
          ← Back
        </button>
      )}
      <h2>Report Card</h2>
      <p>
        <strong>Student:</strong> {studentName} &nbsp; | &nbsp; <strong>ID:</strong> {studentId}
      </p>

      {loading ? (
        <p>Loading scores...</p>
      ) : scores.length === 0 ? (
        <p>No scores recorded yet.</p>
      ) : (
        <>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Class Test</th>
                <th>Exam</th>
                <th>Total</th>
                <th>Grade</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => (
                <tr key={s.id}>
                  <td>{s.subject}</td>
                  <td>{s.classScore}</td>
                  <td>{s.examScore}</td>
                  <td>{s.total}</td>
                  <td>{s.grade}</td>
                  <td>{s.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ marginTop: "15px" }}>
            <strong>Average Score:</strong> {average}
          </p>
        </>
      )}
    </div>
  );
}

export default ReportCard;