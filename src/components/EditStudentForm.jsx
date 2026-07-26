import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function EditStudentForm({ student, classList, onSaved, onCancel }) {
  const [fullName, setFullName] = useState(student.fullName || "");
  const [studentClass, setStudentClass] = useState(student.class || "");
  const [guardianName, setGuardianName] = useState(student.guardianName || "");
  const [guardianPhone, setGuardianPhone] = useState(student.guardianPhone || "");
  const [email, setEmail] = useState(student.email || "");
  const [medicalReport, setMedicalReport] = useState(student.medicalReport || "");
  const [status, setStatus] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "students", student.id), {
      fullName,
      class: studentClass,
      guardianName,
      guardianPhone,
      email,
      medicalReport,
    });
    setStatus("Saved!");
    if (onSaved) onSaved();
  };

  return (
    <div style={{ padding: "15px", border: "1px solid #555", maxWidth: "500px", marginBottom: "20px" }}>
      <h3>Edit Student ({student.id})</h3>
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: "10px" }}>
          <label>Full Name: </label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Class: </label>
          <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)} required>
            <option value="">-- Select Class --</option>
            {classList && classList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
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
          <label>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Medical Report: </label>
          <input type="text" value={medicalReport} onChange={(e) => setMedicalReport(e.target.value)} />
        </div>
        <button type="submit">Save Changes</button>{" "}
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}

export default EditStudentForm;