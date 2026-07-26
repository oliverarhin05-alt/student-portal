import { useState } from "react";
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase/config";
import Login from "./components/Login";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import ReportCard from "./components/ReportCard";
import PhotoUpload from "./components/PhotoUpload";
import AnnouncementForm from "./components/AnnouncementForm";
import ClassSizeManager from "./components/ClassSizeManager";
import AddStudentForm from "./components/AddStudentForm";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [myStudentRecord, setMyStudentRecord] = useState(null);

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

    if (userRole === "admin") {
      const studentsSnapshot = await getDocs(collection(db, "students"));
      const studentsList = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsList);
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
    setMyStudentRecord(null);
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
          <ReportCard
            studentId={viewingStudent.id}
            studentName={viewingStudent.fullName}
            photoUrl={viewingStudent.photoUrl}
            studentClass={viewingStudent.class}
          />
        </div>
      );
    }

    return (
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Admin Dashboard</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
        <p>Welcome, {user.email}</p>

        <AnnouncementForm user={user} />

        <AddStudentForm
          onStudentAdded={async () => {
            const studentsSnapshot = await getDocs(collection(db, "students"));
            const studentsList = studentsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setStudents(studentsList);
          }}
        />

        <h2>Students</h2>
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Class</th>
              <th>Guardian</th>
              <th>Guardian Phone</th>
              <th>Medical Report</th>
              <th>Report Card</th>
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
                  <button onClick={() => setViewingStudent(student)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (role === "teacher") {
    return <TeacherDashboard user={user} onLogout={handleLogout} />;
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