import { useState } from "react";
import { resetPassword } from "../services/authService.js";

export default function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!token) {
      setMessageType("error");
      setMessage(
        "The password reset link is invalid or missing its token."
      );
      return;
    }

    if (password.length < 12 || password.length > 72) {
      setMessageType("error");
      setMessage("Password must be between 12 and 72 characters.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setMessageType("error");
      setMessage("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setMessageType("error");
      setMessage("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setMessageType("error");
      setMessage("Password must contain at least one number.");
      return;
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({
        token,
        password,
      });

      setMessageType("success");
      setMessage(
        result.message ||
          "Your password has been reset successfully. You can now sign in."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessageType("error");
      setMessage(
        error.message ||
          "Unable to reset your password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        {/* Left Panel */}
        <div className="visual-panel">
          <div className="visual-overlay">
            <span className="visual-pill">SMART POS SECURITY</span>

            <h1>
              Create a new
              <br />
              password.
            </h1>

            <p>
              Secure your account with a strong password that only you know.
            </p>
          </div>

          <div className="visual-caption">
            Smart POS · Retail management system
          </div>
        </div>

        {/* Right Panel */}
        <div className="form-panel">
          <div className="form-content">
            <div className="brand">
              <span className="brand-icon">SP</span>

              <span className="brand-copy">
                <strong>Smart POS</strong>
                <br />
                <small>AI powered System</small>
              </span>
            </div>

            <div className="welcome-copy">
              <h2>Reset Password</h2>
              <p>Enter and confirm your new password below.</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <label htmlFor="new-password">New Password</label>

              <input
                id="new-password"
                name="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter your new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                required
              />

              <label htmlFor="confirm-password">
                Confirm Password
              </label>

              <input
                id="confirm-password"
                name="confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                disabled={loading}
                required
              />

              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) =>
                    setShowPassword(event.target.checked)
                  }
                  disabled={loading}
                />
                <span>Show password</span>
              </label>

              {/* Corrected template literal syntax */}
              {message && (
                <div
                  className={`form-message ${messageType}`}
                  role="status"
                  aria-live="polite"
                >
                  {message}
                </div>
              )}

              <button
                className="login-button"
                type="submit"
                disabled={loading || !token}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>

              <a className="back-to-login" href="/">
                Back to Login
              </a>
            </form>

            <p className="footer-note">
              Keep your account secure with a strong password.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}