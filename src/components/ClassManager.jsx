import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function ClassManager({ onClassesUpdated }) {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState("");
  const [status, setStatus] = useState("");

  const fetchClasses = async () => {
    const ref = doc(db, "settings", "classList");
    const snap = await getDoc(ref);
    const list = snap.exists() ? snap.data().classes : [];
    setClasses(list);
    if (onClassesUpdated) onClassesUpdated(list);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAdd = async () => {
    if (!newClass.trim()) return;
    if (classes.includes(newClass.trim())) {
      setStatus("That class already exists.");
      return;
    }
    const updated = [...classes, newClass.trim()];
    await setDoc(doc(db, "settings", "classList"), { classes: updated });
    setClasses(updated);
    setNewClass("");
    setStatus("Class added!");
    if (onClassesUpdated) onClassesUpdated(updated);
  };

  const handleRemove = async (className) => {
    const updated = classes.filter((c) => c !== className);
    await setDoc(doc(db, "settings", "classList"), { classes: updated });
    setClasses(updated);
    if (onClassesUpdated) onClassesUpdated(updated);
  };

  return (
    <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #555", maxWidth: "500px" }}>
      <h3>Manage Classes</h3>
      <div style={{ marginBottom: "10px" }}>
        <input type="text" value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="e.g. JHS 1" />
        <button onClick={handleAdd} style={{ marginLeft: "8px" }}>
          Add Class
        </button>
      </div>
      {status && <p>{status}</p>}
      <ul>
        {classes.map((c) => (
          <li key={c} style={{ marginBottom: "5px" }}>
            {c} <button onClick={() => handleRemove(c)} style={{ marginLeft: "8px" }}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ClassManager;