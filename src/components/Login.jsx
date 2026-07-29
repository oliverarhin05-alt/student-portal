import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLogin(userCredential.user);
    } catch (err) {
      setError("Invalid email or password");
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetMessage("");
    if (!resetEmail) {
      setResetMessage("Please enter your email address.");
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Password reset email sent! Check your inbox (and spam folder).");
    } catch (err) {
      setResetMessage("Could not send reset email. Please check the address and try again.");
    }
    setResetLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1565C0, #0D47A1)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          width: "100%",
          maxWidth: "380px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "#1565C0",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            margin: "0 auto 15px",
          }}
        >
          🎓
        </div>
        <h2 style={{ margin: "0 0 5px", color: "#1565C0" }}>School Portal</h2>

        {!showReset ? (
          <>
            <p style={{ margin: "0 0 25px", color: "#777", fontSize: "14px" }}>Sign in to continue</p>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />

              <div style={{ textAlign: "right", marginBottom: "12px" }}>
                <span
                  onClick={() => {
                    setShowReset(true);
                    setResetEmail(email);
                    setResetMessage("");
                  }}
                  style={{ fontSize: "13px", color: "#1565C0", cursor: "pointer", textDecoration: "underline" }}
                >
                  Forgot password?
                </span>
              </div>

              {error && <p style={{ color: "#e63946", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#1565C0",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p style={{ margin: "0 0 25px", color: "#777", fontSize: "14px" }}>
              Enter your email to receive a password reset link
            </p>

            <form onSubmit={handleReset}>
              <input
                type="email"
                placeholder="Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />

              {resetMessage && (
                <p style={{ color: resetMessage.includes("sent") ? "green" : "#e63946", fontSize: "13px", marginBottom: "12px" }}>
                  {resetMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#1565C0",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginBottom: "10px",
                }}
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <span
              onClick={() => {
                setShowReset(false);
                setResetMessage("");
              }}
              style={{ fontSize: "13px", color: "#1565C0", cursor: "pointer", textDecoration: "underline" }}
            >
              ← Back to login
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;