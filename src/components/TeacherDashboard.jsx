import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import AnnouncementList from "./AnnouncementList";

function getGrade(total) {
  if (total >= 90) return { grade: "A", remark: "Excellent" };
  if (total >= 80) return { grade: "B", remark: "Very Good" };
  if (total >= 70) return { grade: "C", remark: "Good" };
  if (total >= 60) return { grade: "D", remark: "Credit" };
  if (total >= 50) return { grade: "E", remark: "Pass" };
  return { grade: "F", remark: "Fail" };
}

function TeacherDashboard({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [classScore, setClassScore] = useState("");
  const [examScore, setExamScore] = useState("");
  const [remark, setRemark] = useState("");
  const [message, setMessage] = useState("");
  const [lastGrade, setLastGrade] = useState(null);
  const [term, setTerm] = useState("First Term");

  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, "students"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
    };
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLastGrade(null);

    if (!selectedStudentId || !subject || !classScore || !examScore) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);
    const total = Number(classScore) + Number(examScore);
    const { grade, remark: autoRemark } = getGrade(total);

    await addDoc(collection(db, "scores"), {
      studentId: selectedStudentId,
      studentName: student ? student.fullName : "",
      subject,
      term,
      classScore: Number(classScore),
      examScore: Number(examScore),
      total,
      grade,
      remark: remark || autoRemark,
      enteredBy: user.email,
      createdAt: serverTimestamp(),
    });

    setMessage("Score saved successfully!");
    setLastGrade({ total, grade, autoRemark });
    setSubject("");
    setClassScore("");
    setExamScore("");
    setRemark("");
    setSelectedStudentId("");
  };

  const sectionStyle = {
    background: "#1e1e2f",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    maxWidth: "600px",
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Teacher Dashboard</h1>
        <button onClick={onLogout}>Logout</button>
      </div>
      <p style={{ marginBottom: "20px" }}>Welcome, {user.email}</p>

      <div style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>Enter Student Score</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>Term: </label>
            <select value={term} onChange={(e) => setTerm(e.target.value)}>
              <option value="First Term">First Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Third Term">Third Term</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Student: </label>
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} required>
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.class})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Subject: </label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Class Test Score: </label>
            <input type="number" value={classScore} onChange={(e) => setClassScore(e.target.value)} required />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Exam Score: </label>
            <input type="number" value={examScore} onChange={(e) => setExamScore(e.target.value)} required />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Remark (optional): </label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Leave blank to auto-generate"
            />
          </div>

          <button type="submit">Save Score</button>
        </form>

        {message && <p>{message}</p>}
        {lastGrade && (
          <p>
            Total: {lastGrade.total} — Grade: <strong>{lastGrade.grade}</strong> ({lastGrade.autoRemark})
          </p>
        )}
      </div>

      <div style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>Staff Announcements</h2>
        <AnnouncementList audience="staff" />
      </div>
    </div>
  );
}

export default TeacherDashboard;