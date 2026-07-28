import { useState } from "react";
import FeesManager from "./FeesManager";

function FeesOverview({ students }) {
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (selectedStudent) {
    return (
      <div>
        <button onClick={() => setSelectedStudent(null)} style={{ marginBottom: "10px" }}>
          ← Back to list
        </button>
        <h3>{selectedStudent.fullName} ({selectedStudent.id})</h3>
        <FeesManager studentId={selectedStudent.id} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", minWidth: "500px" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Class</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.fullName}</td>
                <td>{s.class}</td>
                <td>
                  <button onClick={() => setSelectedStudent(s)}>Manage Fees</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FeesOverview;