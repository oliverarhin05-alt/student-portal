import { useState } from "react";
import ReportCard from "./ReportCard";
import AnnouncementList from "./AnnouncementList";
import FeesView from "./FeesView";

function StudentDashboard({ user, studentInfo, onLogout }) {
  const [activeSection, setActiveSection] = useState("profile");

  const menuItems = [
    { key: "profile", label: "My Profile" },
    { key: "reportcard", label: "Report Card" },
    { key: "fees", label: "Fees" },
    { key: "announcements", label: "Announcements" },
    { key: "about", label: "About School" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ width: "220px", background: "#1a1a2e", padding: "20px", color: "white" }}>
        <h3>Student Portal</h3>
        <p style={{ fontSize: "14px", opacity: 0.8 }}>{user.email}</p>
        <button onClick={onLogout} style={{ marginBottom: "10px" }}>Logout</button>
        <hr />
        {menuItems.map((item) => (
          <div
            key={item.key}
            onClick={() => setActiveSection(item.key)}
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

      <div style={{ flex: 1, padding: "30px" }}>
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