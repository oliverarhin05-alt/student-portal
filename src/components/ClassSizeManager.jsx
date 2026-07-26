import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function ClassSizeManager({ className }) {
  const [size, setSize] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchSize = async () => {
      const ref = doc(db, "classSizes", className);
      const snap = await getDoc(ref);
      if (snap.exists()) setSize(snap.data().totalStudents.toString());
    };
    if (className) fetchSize();
  }, [className]);

  const handleSave = async () => {
    if (!size) return;
    await setDoc(doc(db, "classSizes", className), { totalStudents: Number(size) });
    setStatus("Saved!");
  };

  return (
    <div style={{ marginTop: "10px", marginBottom: "10px" }}>
      <label>Total students in {className}: </label>
      <input type="number" value={size} onChange={(e) => setSize(e.target.value)} style={{ width: "60px" }} />
      <button onClick={handleSave} style={{ marginLeft: "8px" }}>Save</button>
      {status && <span style={{ marginLeft: "8px" }}>{status}</span>}
    </div>
  );
}

export default ClassSizeManager;