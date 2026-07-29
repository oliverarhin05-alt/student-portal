import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

function DashboardCards({ totalStudents, totalClasses }) {
  const [totalTeachers, setTotalTeachers] = useState(0);

  useEffect(() => {
    const fetchTeachers = async () => {
      const q = query(collection(db, "users"), where("role", "==", "teacher"));
      const snapshot = await getDocs(q);
      setTotalTeachers(snapshot.size);
    };
    fetchTeachers();
  }, []);

  const cardStyle = {
    background: "#1565C0",
    color: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    minWidth: "140px",
  };

  return (
    <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "20px" }}>
      <div style={cardStyle}>
        <h2 style={{ margin: 0 }}>{totalStudents}</h2>
        <p style={{ margin: 0, fontSize: "14px" }}>Total Students</p>
      </div>
      <div style={cardStyle}>
        <h2 style={{ margin: 0 }}>{totalTeachers}</h2>
        <p style={{ margin: 0, fontSize: "14px" }}>Total Teachers</p>
      </div>
      <div style={cardStyle}>
        <h2 style={{ margin: 0 }}>{totalClasses}</h2>
        <p style={{ margin: 0, fontSize: "14px" }}>Total Classes</p>
      </div>
    </div>
  );
}

export default DashboardCards;