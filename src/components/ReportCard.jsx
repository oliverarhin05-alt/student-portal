import { useState, useEffect } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function ReportCard({ studentId, studentName, photoUrl, studentClass, onBack }) {
  const [term, setTerm] = useState("First Term");
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState(null);
  const [classSize, setClassSize] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const q = query(
        collection(db, "scores"),
        where("studentId", "==", studentId),
        where("term", "==", term)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setScores(list);

      if (studentClass) {
        const studentsInClassSnap = await getDocs(
          query(collection(db, "students"), where("class", "==", studentClass))
        );
        const classmateIds = studentsInClassSnap.docs.map((d) => d.id);

        const totals = {};
        for (const id of classmateIds) {
          const sq = query(
            collection(db, "scores"),
            where("studentId", "==", id),
            where("term", "==", term)
          );
          const sSnap = await getDocs(sq);
          const sum = sSnap.docs.reduce((acc, d) => acc + (d.data().total || 0), 0);
          totals[id] = sum;
        }

        const ranked = Object.entries(totals).sort((a, b) => b[1] - a[1]);
        const rankIndex = ranked.findIndex(([id]) => id === studentId);
        setPosition(rankIndex >= 0 ? rankIndex + 1 : null);

        const sizeRef = doc(db, "classSizes", studentClass);
        const sizeSnap = await getDoc(sizeRef);
        setClassSize(sizeSnap.exists() ? sizeSnap.data().totalStudents : classmateIds.length);
      }

      setLoading(false);
    };

    fetchData();
  }, [studentId, term, studentClass]);

  const totalOfAll = scores.reduce((sum, s) => sum + (s.total || 0), 0);
  const average = scores.length > 0 ? (totalOfAll / scores.length).toFixed(1) : 0;

  return (
    <div>
      {onBack && (
        <button onClick={onBack} style={{ marginBottom: "15px" }}>
          ← Back
        </button>
      )}

      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto",
            border: "2px dashed #888",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "#888",
          }}
        >
          School Logo
        </div>
        <h2>Report Card</h2>
      </div>

      <p>
        <strong>Student:</strong> {studentName} &nbsp; | &nbsp; <strong>ID:</strong> {studentId}
      </p>

      <div style={{ marginBottom: "15px" }}>
        <label>Term: </label>
        <select value={term} onChange={(e) => setTerm(e.target.value)}>
          <option value="First Term">First Term</option>
          <option value="Second Term">Second Term</option>
          <option value="Third Term">Third Term</option>
        </select>
      </div>

      {loading ? (
        <p>Loading scores...</p>
      ) : scores.length === 0 ? (
        <p>No scores recorded yet for {term}.</p>
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
          {position && (
            <p>
              <strong>Class Position:</strong> {position} out of {classSize}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default ReportCard;