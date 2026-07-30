import { useState, useEffect } from "react";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function SettingsPanel({ user }) {
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profileStatus, setProfileStatus] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setPhone(snap.data().phone || "");
        setAddress(snap.data().address || "");
      }
    };
    fetchProfile();
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileStatus("");
    try {
      await updateDoc(doc(db, "users", user.uid), { phone, address });
      setProfileStatus("Profile updated successfully!");
    } catch (err) {
      setProfileStatus("Error: " + err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus("New password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordStatus("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordStatus("Error: incorrect current password or " + err.message);
    }
    setPasswordLoading(false);
  };

  const boxStyle = {
    padding: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    maxWidth: "450px",
    marginBottom: "20px",
  };

  return (
    <div>
      <div style={boxStyle}>
        <h3>Account Information</h3>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <div style={boxStyle}>
        <h3>Update Profile</h3>
        <form onSubmit={handleProfileSave}>
          <div style={{ marginBottom: "10px" }}>
            <label>Phone Number: </label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Address: </label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <button type="submit">Save Profile</button>
        </form>
        {profileStatus && <p>{profileStatus}</p>}
      </div>

      <div style={boxStyle}>
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordChange}>
          <div style={{ marginBottom: "10px" }}>
            <label>Current Password: </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>New Password: </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Confirm New Password: </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={passwordLoading}>
            {passwordLoading ? "Updating..." : "Change Password"}
          </button>
        </form>
        {passwordStatus && <p>{passwordStatus}</p>}
      </div>
    </div>
  );
}

export default SettingsPanel;