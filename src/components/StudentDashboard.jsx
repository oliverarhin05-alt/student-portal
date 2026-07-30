import { useState } from "react";
import ReportCard from "./ReportCard";
import AnnouncementList from "./AnnouncementList";
import FeesView from "./FeesView";
import AttendanceHistory from "./AttendanceHistory";
import TimetableView from "./TimetableView";
import DocumentList from "./DocumentList";
import SettingsPanel from "./SettingsPanel";

function StudentDashboard({ user, studentInfo, onLogout }) {
  const [activeSection, setActiveSection] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { key: "profile", label: "My Profile" },
    { key: "reportcard", label: "Report Card" },
    { key: "attendance", label: "Attendance" },
    { key: "timetable", label: "Timetable" },
    { key: "fees", label: "Fees" },
    { key: "documents", label: "Documents" },
    { key: "announcements", label: "Announcements" },
    { key: "about", label: "About School" },
    { key: "settings", label: "Settings" },
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
        <h3>Student Portal</h3>
        <p style={{ fontSize: "14px", opacity: 0.9, wordBreak: "break-word" }}>{user.email}</p>
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
              color: activeSection === item.key ? "#FFD54F" : "white",
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      <div style={{ padding: "20px", paddingTop: "70px", maxWidth: "100%", boxSizing: "border-box", color: "#0D2B4E" }}>
        {activeSection === "profile" && (
          <div>
            <h2>My Profile</h2>
            {studentInfo.photoUrl && (
              <img
                src={studentInfo.photoUrl}
                alt="Student passport photo"
                style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }}
              />
            )}
            <p><strong>Full Name:</strong> {studentInfo.fullName}</p>
            <p><strong>Student ID:</strong> {studentInfo.id}</p>
            <p><strong>Class:</strong> {studentInfo.class}</p>
            <p>
              <strong>Date of Birth:</strong>{" "}
              {studentInfo.dob?.toDate ? studentInfo.dob.toDate().toLocaleDateString() : "N/A"}
            </p>
            <p><strong>Guardian Name:</strong> {studentInfo.guardianName}</p>
            <p><strong>Guardian Phone:</strong> {studentInfo.guardianPhone}</p>
            <p><strong>Medical Report:</strong> {studentInfo.medicalReport || "None"}</p>
          </div>
        )}

        {activeSection === "reportcard" && (
          <ReportCard
            studentId={studentInfo.id}
            studentName={studentInfo.fullName}
            studentClass={studentInfo.class}
          />
        )}

        {activeSection === "attendance" && (
          <div>
            <h2>Attendance</h2>
            <AttendanceHistory studentId={studentInfo.id} studentClass={studentInfo.class} />
          </div>
        )}

        {activeSection === "timetable" && (
          <div>
            <h2>Timetable</h2>
            <TimetableView className={studentInfo.class} />
          </div>
        )}

        {activeSection === "fees" && (
          <div>
            <h2>Fees</h2>
            <FeesView studentId={studentInfo.id} />
          </div>
        )}

        {activeSection === "documents" && (
          <div>
            <h2>Documents</h2>
            <DocumentList audience="students" />
          </div>
        )}

        {activeSection === "announcements" && (
          <div>
            <h2>Announcements</h2>
            <AnnouncementList audience="students" />
          </div>
        )}

        {activeSection === "about" && (
          <div>
            <h2>About School</h2>
            <p>School information will be available here soon.</p>
          </div>
        )}

        {activeSection === "settings" && (
          <div>
            <h2>Settings</h2>
            <SettingsPanel user={user} />
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;