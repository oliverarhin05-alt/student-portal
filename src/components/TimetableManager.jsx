import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6"];

function TimetableManager({ classList }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [timetable, setTimetable] = useState({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!selectedClass) return;
      setLoading(true);
      const ref = doc(db, "timetables", selectedClass);
      const snap = await getDoc(ref);
      setTimetable(snap.exists() ? snap.data().schedule || {} : {});
      setLoading(false);
    };
    fetchTimetable();
  }, [selectedClass]);

  const handleChange = (day, period, value) => {
    setTimetable((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [period]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedClass) {
      setStatus("Please select a class first.");
      return;
    }
    await setDoc(doc(db, "timetables", selectedClass), { schedule: timetable });
    setStatus("Timetable saved!");
  };

  return (
    <div>
      <div style={{ marginBottom: "15px" }}>
        <label>Class: </label>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">-- Select Class --</option>
          {classList && classList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : !selectedClass ? (
        <p>Select a class to edit its timetable.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%", minWidth: "700px" }}>
            <thead>
              <tr>
                <th>Period</th>
                {DAYS.map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period}>
                  <td><strong>{period}</strong></td>
                  {DAYS.map((day) => (
                    <td key={day}>
                      <input
                        type="text"
                        value={(timetable[day] && timetable[day][period]) || ""}
                        onChange={(e) => handleChange(day, period, e.target.value)}
                        placeholder="Subject"
                        style={{ width: "100px" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedClass && (
        <button onClick={handleSave} style={{ marginTop: "15px" }}>
          Save Timetable
        </button>
      )}
      {status && <p>{status}</p>}
    </div>
  );
}

export default TimetableManager;