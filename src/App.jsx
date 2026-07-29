import { useState } from "react";
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase/config";
import Login from "./components/Login";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import ReportCard from "./components/ReportCard";
import PhotoUpload from "./components/PhotoUpload";
import AnnouncementForm from "./components/AnnouncementForm";
import ClassSizeManager from "./components/ClassSizeManager";
import ClassManager from "./components/ClassManager";
import AddStudentForm from "./components/AddStudentForm";
import EditStudentForm from "./components/EditStudentForm";
import FeesManager from "./components/FeesManager";
import FeesOverview from "./components/FeesOverview";
import DashboardCards from "./components/DashboardCards";
import TeacherManager from "./components/TeacherManager";
import AddTeacherForm from "./components/AddTeacherForm";
import AttendanceReport from "./components/AttendanceReport";
import TimetableManager from "./components/TimetableManager";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [myStudentRecord, setMyStudentRecord] = useState(null);
  const [myTeacherClass, setMyTeacherClass] = useState(null);
  const [classList, setClassList] = useState([]);
  const [adminSection, setAdminSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const refreshStudents = async () => {
    const studentsSnapshot = await getDocs(collection(db, "students"));
    const studentsList = studentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStudents(studentsList);
  };

  const refreshClassList = async () => {
    const ref = doc(db, "settings", "classList");
    const snap = await getDoc(ref);
    setClassList(snap.exists() ? snap.data().classes : []);
  };

  const handleLogin = async (loggedInUser) => {
    setUser(loggedInUser);
    setLoading(true);

    const userDocRef = doc(db, "users", loggedInUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    let userRole = "unknown";
    if (userDocSnap.exists()) {
      userRole = userDocSnap.data().role;
      setRole(userRole);
    }

    if (userRole === "teacher") {
      const teacherClass = userDocSnap.data().class || null;
      setMyTeacherClass(teacherClass);
    }

    if (userRole === "admin") {
      await refreshStudents();
      await refreshClassList();
    }

    if (userRole === "student") {
      const q = query(collection(db, "students"), where("email", "==", loggedInUser.email));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const studentDoc = snapshot.docs[0];
        setMyStudentRecord({ id: studentDoc.id, ...studentDoc.data() });
      }
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    setStudents([]);
    setViewingStudent(null);
    setEditingStudent(null);
    setMyStudentRecord(null);
    setMyTeacherClass(null);
    setAdminSection("dashboard");
    setSidebarOpen(false);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student record? This cannot be undone.")) {
      return;
    }
    await deleteDoc(doc(db, "students", studentId));
    await refreshStudents();
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return <p>Loading your dashboard...</p>;
  }

  if (role === "admin") {
    if (viewingStudent) {
      return (
        <div style={{ padding: "20px" }}>
          <button onClick={() => setViewingStudent(null)} style={{ marginBottom: "10px" }}>
            ← Back
          </button>
          <PhotoUpload
            studentId={viewingStudent.id}
            onUploaded={async (url) => {
              const studentRef = doc(db, "students", viewingStudent.id);
              await updateDoc(studentRef, { photoUrl: url });
              alert("Photo saved to student record!");
              setViewingStudent({ ...viewingStudent, photoUrl: url });
            }}
          />
          <ClassSizeManager className={viewingStudent.class} />
          <FeesManager studentId={viewingStudent.id} />
          <ReportCard
            studentId={viewingStudent.id}
            studentName={viewingStudent.fullName}
            studentClass={viewingStudent.class}
          />
        </div>
      );
    }

    const menuItems = [
      { key: "dashboard", label: "Dashboard" },
      { key: "announcements", label: "Announcements" },
      { key: "classes", label: "Manage Classes" },
      { key: "students", label: "Students" },
      { key: "teachers", label: "Teachers" },
      { key: "attendance", label: "Attendance Reports" },
      { key: "timetable", label: "Timetable" },
      { key: "fees", label: "Fees" },
    ];

    return (
      <div style={{ minHeight: "100vh", position: "relative", background: "white" }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "fixed",
            top: "15px",
            left: "15px",
            zIndex: 20,
            background: "#1565C0",
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
            background: "#1565C0",
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
          <h3>Admin Portal</h3>
          <p style={{ fontSize: "14px", opacity: 0.9, wordBreak: "break-word" }}>{user.email}</p>
          <button onClick={handleLogout} style={{ marginBottom: "10px" }}>Logout</button>
          <hr />
          {menuItems.map((item) => (
            <div
              key={item.key}
              onClick={() => {
                setAdminSection(item.key);
                setSidebarOpen(false);
              }}
              style={{
                padding: "10px 0",
                cursor: "pointer",
                fontWeight: adminSection === item.key ? "bold" : "normal",
                color: adminSection === item.key ? "#FFD54F" : "white",
              }}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div style={{ padding: "20px", paddingTop: "70px", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden", color: "#0D2B4E" }}>
          {adminSection === "dashboard" && (
            <div>
              <h1>Dashboard</h1>
              <DashboardCards totalStudents={students.length} totalClasses={classList.length} />
            </div>
          )}

          {adminSection === "announcements" && (
            <div>
              <h1>Announcements</h1>
              <AnnouncementForm user={user} />
            </div>
          )}

          {adminSection === "classes" && (
            <div>
              <h1>Manage Classes</h1>
              <ClassManager onClassesUpdated={setClassList} />
            </div>
          )}

          {adminSection === "timetable" && (
            <div>
              <h1>Timetable</h1>
              <TimetableManager classList={classList} />
            </div>
          )}

         {adminSection === "fees" && (
            <div>
              <h1>Fees</h1>
              <FeesOverview students={students} classList={classList} />
            </div>
          )}

          {adminSection === "attendance" && (
            <div>
              <h1>Attendance Reports</h1>
              <AttendanceReport classList={classList} />
            </div>
          )}

          {adminSection === "teachers" && (
            <div>
              <h1>Teachers</h1>
              <AddTeacherForm classList={classList} onTeacherAdded={() => window.location.reload()} />
              <TeacherManager classList={classList} />
            </div>
          )}

          {adminSection === "students" && (
            <div>
              <h1>Students</h1>

              <AddStudentForm classList={classList} onStudentAdded={refreshStudents} />

              {editingStudent && (
                <EditStudentForm
                  student={editingStudent}
                  classList={classList}
                  onCancel={() => setEditingStudent(null)}
                  onSaved={async () => {
                    await refreshStudents();
                    setEditingStudent(null);
                  }}
                />
              )}

              <h2>Student List</h2>
              <div style={{ overflowX: "auto" }}>
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", minWidth: "700px" }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Guardian</th>
                      <th>Guardian Phone</th>
                      <th>Medical Report</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>{student.id}</td>
                        <td>{student.fullName}</td>
                        <td>{student.class}</td>
                        <td>{student.guardianName}</td>
                        <td>{student.guardianPhone}</td>
                        <td>{student.medicalReport || "None"}</td>
                        <td>
                          <button onClick={() => setViewingStudent(student)}>View</button>{" "}
                          <button onClick={() => setEditingStudent(student)}>Edit</button>{" "}
                          <button onClick={() => handleDeleteStudent(student.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (role === "teacher") {
    return <TeacherDashboard user={user} onLogout={handleLogout} teacherClass={myTeacherClass} />;
  }

  if (role === "student") {
    if (!myStudentRecord) {
      return <p>No student record found linked to your account. Contact the school admin.</p>;
    }
    return <StudentDashboard user={user} studentInfo={myStudentRecord} onLogout={handleLogout} />;
  }

  return <h1>No role assigned. Contact the school admin.</h1>;
}

export default App;