import { useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { secondaryAuth } from "../firebase/secondaryAuth";

function AddTeacherForm({ classList, onTeacherAdded }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teacherClass, setTeacherClass] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!email || !password) {
      setStatus("Please fill in email and password.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUid = userCredential.user.uid;

      await setDoc(doc(db, "users", newUid), {
        role: "teacher",
        email,
        class: teacherClass || "",
      });

      await signOut(secondaryAuth);

      setStatus(`Teacher "${email}" added successfully!`);
      setEmail("");
      setPassword("");
      setTeacherClass("");

      if (onTeacherAdded) onTeacherAdded();
    } catch (err) {
      setStatus("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #555", maxWidth: "500px" }}>
      <h3>Add New Teacher</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Password: </label>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Assign Class (optional): </label>
          <select value={teacherClass} onChange={(e) => setTeacherClass(e.target.value)}>
            <option value="">-- Select Class --</option>
            {classList && classList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Teacher"}
        </button>
      </form>
      {status && <p style={{ marginTop: "10px" }}>{status}</p>}
    </div>
  );
}

export default AddTeacherForm;