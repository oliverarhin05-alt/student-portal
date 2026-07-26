import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function FeesView({ studentId }) {
  const [term, setTerm] = useState("First Term");
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFee = async () => {
      setLoading(true);
      const ref = doc(db, "fees", `${studentId}_${term}`);
      const snap = await getDoc(ref);
      setFeeData(snap.exists() ? snap.data() : null);
      setLoading(false);
    };
    fetchFee();
  }, [studentId, term]);

  return (
    <div>
      <div style={{ marginBottom: "15px" }}>
        <label>Term: </label>
        <select value={term} onChange={(e) => setTerm(e.target.value)}>
          <option value="First Term">First Term</option>
          <option value="Second Term">Second Term</option>
          <option value="Third Term">Third Term</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : !feeData ? (
        <p>No fee record available yet for {term}.</p>
      ) : (
        <div>
          <p><strong>Total Fee:</strong> GHS {feeData.totalFee}</p>
          <p><strong>Amount Paid:</strong> GHS {feeData.amountPaid}</p>
          <p><strong>Balance:</strong> GHS {feeData.totalFee - feeData.amountPaid}</p>
          <p>
            <strong>Status:</strong>{" "}
            {feeData.totalFee - feeData.amountPaid <= 0 ? (
              <span style={{ color: "lightgreen" }}>Fully Paid</span>
            ) : (
              <span style={{ color: "orange" }}>Balance Owing</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export default FeesView;