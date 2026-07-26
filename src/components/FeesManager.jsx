import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function FeesManager({ studentId }) {
  const [term, setTerm] = useState("First Term");
  const [totalFee, setTotalFee] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchFee = async () => {
      const ref = doc(db, "fees", `${studentId}_${term}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setTotalFee(snap.data().totalFee.toString());
        setAmountPaid(snap.data().amountPaid.toString());
      } else {
        setTotalFee("");
        setAmountPaid("");
      }
    };
    fetchFee();
  }, [studentId, term]);

  const handleSave = async () => {
    if (!totalFee) {
      setStatus("Please enter the total fee.");
      return;
    }
    await setDoc(doc(db, "fees", `${studentId}_${term}`), {
      studentId,
      term,
      totalFee: Number(totalFee),
      amountPaid: Number(amountPaid) || 0,
    });
    setStatus("Fee record saved!");
  };

  return (
    <div style={{ marginTop: "10px", marginBottom: "10px", padding: "10px", border: "1px solid #555" }}>
      <h4>Fees</h4>
      <div style={{ marginBottom: "8px" }}>
        <label>Term: </label>
        <select value={term} onChange={(e) => setTerm(e.target.value)}>
          <option value="First Term">First Term</option>
          <option value="Second Term">Second Term</option>
          <option value="Third Term">Third Term</option>
        </select>
      </div>
      <div style={{ marginBottom: "8px" }}>
        <label>Total Fee (GHS): </label>
        <input type="number" value={totalFee} onChange={(e) => setTotalFee(e.target.value)} style={{ width: "100px" }} />
      </div>
      <div style={{ marginBottom: "8px" }}>
        <label>Amount Paid (GHS): </label>
        <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} style={{ width: "100px" }} />
      </div>
      <button onClick={handleSave}>Save Fee Record</button>
      {status && <p>{status}</p>}
    </div>
  );
}

export default FeesManager;