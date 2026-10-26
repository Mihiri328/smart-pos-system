import { useState } from "react";
import logo from "../img/white logo.png";
import { ShoppingCart, Eye, EyeOff } from "lucide-react";
import {
  login,
  requestPasswordReset
} from "../services/authService.js";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!username.trim() || !password) {
      setMessageType("error");
      setMessage("Please enter your username/email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login({
        username: username.trim(),
        password,
        rememberMe
      });

      setMessageType("success");
      setMessage("Login successful.");

      if (onLogin) {
        onLogin(result.user);
      }
    } catch (error) {
      setMessageType("error");
      setMessage(
        error.message || "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setMessage("");

    const email = username.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessageType("error");
      setMessage(
        "Enter your email address in the Username / Email field first."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await requestPasswordReset(email);

      setMessageType("success");
      setMessage(result.message);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error.message || "Unable to request a password reset."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card" aria-label="Smart POS sign in">

        {/* Left Visual Panel */}
        <div className="visual-panel">
          <div className="visual-overlay">
            <span className="visual-pill">
              SMARTER RETAIL. SIMPLER BUSINESS.
            </span>

            <h1>
              Everything you need
              <br />
              to run your store.
            </h1>

            <p>
              Sales, inventory, and customers — all in one place.
            </p>
          </div>

          <div className="visual-caption">
            Smart POS · Retail management system
          </div>
        </div>

        {/* Right Login Panel */}
        <div className="form-panel">
          <div className="form-content">

            {/* Brand */}
            <a
              className="brand"
              href="/"
              aria-label="Smart POS home"
              onClick={(event) => event.preventDefault()}
            >
              <span className="brand-icon">
                <img src={logo} alt="Smart POS Logo" className="brand-logo" width={220}/>
                </span>
            </a>

            {/* Welcome Message */}
            <div className="welcome-copy">
              <h2>Sign in</h2>
              <p>Enter your Username and Password.</p>
            </div>

            {/* Login Form */}
            <form className="login-form" onSubmit={handleSubmit}>

              {/* Username */}
              <label htmlFor="username">
                Username / Email
              </label>

              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your Username or Email"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={loading}
                required
              />

              {/* Password */}
              <label htmlFor="password" className="password-label">
                Password
              </label>

              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  required
                />

                {/* Show / Hide Password */}
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="form-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                    disabled={loading}
                  />

                  <span>Remember Me</span>
                </label>

                <a
                  href="#forgot-password"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </a>
              </div>

              {/* Success / Error Message */}
              {message && (
                <div
                  className={`form-message ${messageType}`}
                  role="status"
                  aria-live="polite"
                >
                  {message}
                </div>
              )}

              {/* Login Button */}
              <button
                className="login-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            {/* Footer */}
            <p className="footer-note">
              Secure access to your business dashboard
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}