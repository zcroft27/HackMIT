import { useState } from "react";
import { useUser } from "./UserContext";
import { signUp, login } from "./services/api";

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal = ({ onClose }: AuthModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      let response;
      
      if (isSignUp) {
        response = await signUp({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName || undefined,
          last_name: formData.lastName || undefined,
        });
      } else {
        response = await login(formData.email, formData.password);
      }

      const data = response.data as {
        user: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
        };
      };

      // Set user in context
      setUser({
        id: data.user.id,
        email: data.user.email,
        firstName: formData.firstName || data.user.first_name,
        lastName: formData.lastName || data.user.last_name,
      });

      onClose();
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.5rem",
    marginBottom: "1rem",
    background: "#333",
    border: "2px solid #fff",
    color: "white",
    fontFamily: "'Press Start 2P', cursive",
    fontSize: "10px",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "0.5rem",
    fontSize: "10px",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "black",
          border: "4px solid #fff",
          boxShadow: "0 0 0 4px #000",
          padding: "2rem",
          fontFamily: "'Press Start 2P', cursive",
          color: "white",
          textShadow: "2px 2px #000",
          minWidth: "400px",
          maxWidth: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: "16px", marginBottom: "1.5rem", textAlign: "center" }}>
          {isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
        </h2>

        {error && (
          <p style={{ color: "#ff6b6b", fontSize: "10px", marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        <div>
          {isSignUp && (
            <>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                style={inputStyle}
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />

              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                style={inputStyle}
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </>
          )}

          <label style={labelStyle}>Email</label>
          <input
            type="email"
            style={inputStyle}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit(e as any)}
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            style={inputStyle}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit(e as any)}
          />

          {!isSignUp && (
            <label style={{ display: "flex", alignItems: "center", marginBottom: "1rem", fontSize: "10px" }}>
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                style={{ marginRight: "0.5rem" }}
              />
              Remember Me
            </label>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: loading ? "#666" : "white",
              color: "black",
              border: "none",
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "1rem",
            }}
          >
            {loading ? "LOADING..." : isSignUp ? "SIGN UP" : "SIGN IN"}
          </button>
        </div>

        <p style={{ fontSize: "10px", textAlign: "center" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            style={{ color: "#4ECDC4", cursor: "pointer" }}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
};