import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import AnnouncementList from "./AnnouncementList";
import AttendanceMarker from "./AttendanceMarker";

function getGrade(total) {
  if (total >= 90) return { grade: "A", remark: "Excellent" };
  if (total >= 80) return { grade: "B", remark: "Very Good" };
  if (total >= 70) return { grade: "C", remark: "Good" };
  if (total >= 60) return { grade: "D", remark: "Credit" };
  if (total >= 50) return { grade: "E", remark: "Pass" };
  return { grade: "F", remark: "Fail" };
}

function TeacherDashboard({ user, onLogout, teacherClass }) {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [classScore, setClassScore] = useState("");
  const [examScore, setExamScore] = useState("");
  const [remark, setRemark] = useState("");
  const [message, setMessage] = useState("");
  const [lastGrade, setLastGrade] = useState(null);
  const [term, setTerm] = useState("First Term");
  const [activeSection, setActiveSection] = useState("scores");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, "students"));
      let list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (teacherClass) {
        list = list.filter((s) => s.class === teacherClass);
      }
      setStudents(list);
    };
    fetchStudents();
  }, [teacherClass]);

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

  const menuItems = [
    { key: "scores", label: "Enter Scores" },
    { key: "attendance", label: "Mark Attendance" },
    { key: "announcements", label: "Staff Announcements" },
  ];

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "fixed",
          top: "15px",
          left: "15px",
          zIndex: 20,
          background: "#1a1a2e",
          color: "white",
          border: "none",
          padding: "10px 14px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "18px",
        }}
      >
        ☰
      </button>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            zIndex: 15,
          }}
        />
      )}

      <div
        style={{
          width: "220px",
          maxWidth: "80vw",
          background: "#1a1a2e",
          padding: "20px",
          color: "white",
          position: "fixed",
          top: 0,
          left: sidebarOpen ? 0 : "-220px",
          height: "100%",
          transition: "left 0.25s ease",
          zIndex: 16,
          overflowY: "auto",
        }}
      >
        <h3>Teacher Portal</h3>
        <p style={{ fontSize: "14px", opacity: 0.8, wordBreak: "break-word" }}>
          {user.email} {teacherClass && `— ${teacherClass}`}
        </p>
        <button onClick={onLogout} style={{ marginBottom: "10px" }}>Logout</button>
        <hr />
        {menuItems.map((item) => (
          <div
            key={item.key}
            onClick={() => {
              setActiveSection(item.key);
              setSidebarOpen(false);
            }}
            style={{
              padding: "10px 0",
              cursor: "pointer",
              fontWeight: activeSection === item.key ? "bold" : "normal",
              color: activeSection === item.key ? "#4ea1ff" : "white",
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      <div style={{ padding: "20px", paddingTop: "70px", maxWidth: "100%", boxSizing: "border-box" }}>
        {activeSection === "scores" && (
          <div style={{ maxWidth: "500px" }}>
            <h1>Enter Student Score</h1>
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
        )}

        {activeSection === "attendance" && (
          <div>
            <h1>Mark Attendance</h1>
            <AttendanceMarker teacherClass={teacherClass} />
          </div>
        )}

        {activeSection === "announcements" && (
          <div>
            <h1>Staff Announcements</h1>
            <AnnouncementList audience="staff" />
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;