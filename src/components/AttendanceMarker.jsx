import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function AttendanceMarker({ teacherClass }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "students"));
      let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (teacherClass) {
        list = list.filter((s) => s.class === teacherClass);
      }
      setStudents(list);

      const attendanceDocId = `${teacherClass}_${date}`;
      const attendanceSnap = await getDoc(doc(db, "attendance", attendanceDocId));
      if (attendanceSnap.exists()) {
        setAttendance(attendanceSnap.data().records || {});
      } else {
        const defaults = {};
        list.forEach((s) => (defaults[s.id] = "Present"));
        setAttendance(defaults);
      }
      setLoading(false);
    };
    if (teacherClass) fetchStudentsAndAttendance();
  }, [teacherClass, date]);

  const handleChange = (studentId, value) => {
    setAttendance((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    const attendanceDocId = `${teacherClass}_${date}`;
    await setDoc(doc(db, "attendance", attendanceDocId), {
      class: teacherClass,
      date,
      records: attendance,
    });
    setStatus("Attendance saved!");
  };

  if (!teacherClass) {
    return <p>No class assigned to your account yet. Contact the admin.</p>;
  }

  return (
    <div>
      <div style={{ marginBottom: "15px" }}>
        <label>Date: </label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p>No students found in {teacherClass}.</p>
      ) : (
        <div>
          {students.map((s) => (
            <div key={s.id} style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ minWidth: "150px" }}>{s.fullName}</span>
              <select value={attendance[s.id] || "Present"} onChange={(e) => handleChange(s.id, e.target.value)}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>
            </div>
          ))}
          <button onClick={handleSave} style={{ marginTop: "10px" }}>
            Save Attendance
          </button>
        </div>
      )}
      {status && <p>{status}</p>}
    </div>
  );
}

export default AttendanceMarker;