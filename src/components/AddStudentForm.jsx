import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function AddStudentForm({ onStudentAdded }) {
  const [studentId, setStudentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [dob, setDob] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [email, setEmail] = useState("");
  const [medicalReport, setMedicalReport] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!studentId || !fullName || !studentClass || !email) {
      setStatus("Please fill in all required fields (ID, Name, Class, Email).");
      return;
    }

    try {
      await setDoc(doc(db, "students", studentId), {
        fullName,
        class: studentClass,
        dob: dob ? new Date(dob) : null,
        guardianName,
        guardianPhone,
        email,
        medicalReport: medicalReport || "",
      });

      setStatus(`Student "${fullName}" added successfully! Remember to create their login account in Firebase Authentication (email: ${email}) and add a matching "users" document with role: student.`);

      setStudentId("");
      setFullName("");
      setStudentClass("");
      setDob("");
      setGuardianName("");
      setGuardianPhone("");
      setEmail("");
      setMedicalReport("");

      if (onStudentAdded) onStudentAdded();
    } catch (err) {
      setStatus("Error adding student: " + err.message);
    }
  };

  return (
    <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #555", maxWidth: "500px" }}>
      <h3>Add New Student</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Student ID: </label>
          <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Full Name: </label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Class: </label>
          <input type="text" value={studentClass} onChange={(e) => setStudentClass(e.target.value)} required />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Date of Birth: </label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Guardian Name: </label>
          <input type="text" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Guardian Phone: </label>
          <input type="text" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Student Email (for login): </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Medical Report (optional): </label>
          <input type="text" value={medicalReport} onChange={(e) => setMedicalReport(e.target.value)} placeholder="e.g. None" />
        </div>
        <button type="submit">Add Student</button>
      </form>
      {status && <p style={{ marginTop: "10px" }}>{status}</p>}
    </div>
  );
}

export default AddStudentForm;