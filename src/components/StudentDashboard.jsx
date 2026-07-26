import { useState } from "react";
import ReportCard from "./ReportCard";
import AnnouncementList from "./AnnouncementList";
import FeesView from "./FeesView";

function StudentDashboard({ user, studentInfo, onLogout }) {
  const [activeSection, setActiveSection] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { key: "profile", label: "My Profile" },
    { key: "reportcard", label: "Report Card" },
    { key: "fees", label: "Fees" },
    { key: "announcements", label: "Announcements" },
    { key: "about", label: "About School" },
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
          background: "#1a1a2e",
          padding: "20px",
          color: "white",
          position: "fixed",
          top: 0,
          left: sidebarOpen ? 0 : "-220px",
          height: "100%",
          transition: "left 0.25s ease",
          zIndex: 16,
        }}
      >
        <h3>Student Portal</h3>
        <p style={{ fontSize: "14px", opacity: 0.8 }}>{user.email}</p>
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

      <div style={{ padding: "30px", paddingTop: "70px" }}>
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

        {activeSection === "fees" && (
          <div>
            <h2>Fees</h2>
            <FeesView studentId={studentInfo.id} />
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
      </div>
    </div>
  );
}

export default StudentDashboard;