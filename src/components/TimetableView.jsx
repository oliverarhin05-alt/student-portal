import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6"];

function TimetableView({ className }) {
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!className) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const ref = doc(db, "timetables", className);
      const snap = await getDoc(ref);
      setTimetable(snap.exists() ? snap.data().schedule || {} : {});
      setLoading(false);
    };
    fetchTimetable();
  }, [className]);

  if (!className) return <p>No class assigned yet.</p>;
  if (loading) return <p>Loading timetable...</p>;

  return (
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
                <td key={day}>{(timetable[day] && timetable[day][period]) || "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TimetableView;