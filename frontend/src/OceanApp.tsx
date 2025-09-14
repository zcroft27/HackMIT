import { useEffect, useRef, useState } from "react";
import { useUser } from "./UserContext";
import { getBottle } from "./services/api";

const oceanImageUrl = "/background.png";
const bottleImageUrls = [
  "/bottle1.png",
  "/bottle2.png",
  "/bottle3.png",
  "/bottle4.png",
  "/bottle5.png",
  "/bottle6.png",
  "/bottle7.png",
  "/bottle8.png",
];
const boatImageUrl = "/boat.png";
const parchmentImageUrl = "/parchment.png";

const NUM_BOTTLES = 30;
const BOTTLE_SPEED = 0.5;
const BOTTLE_WIDTH = 100;
const BOTTLE_HEIGHT = 100;
const BOB_AMPLITUDE = 5;
const BOB_SPEED_MIN = 0.01;
const BOB_SPEED_MAX = 0.03;

const BOAT_AMPLITUDE = 15;
const BOAT_SPEED = 0.5;

type Bottle = {
  id: number;
  x: number;
  y: number;
  baseY: number;
  bobOffset: number;
  bobSpeed: number;
  img: string;
  rotation: number; // NEW
};

const AuthModal = ({ onClose }: { onClose: () => void }) => {
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

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignUp ? "signup" : "login";
      const body = isSignUp
        ? {
            email: formData.email,
            password: formData.password,
            first_name: formData.firstName || null,
            last_name: formData.lastName || null,
          }
        : {
            email: formData.email,
            password: formData.password,
            rememberMe: formData.rememberMe,
          };

      const response = await fetch(`http://localhost:8080/api/v1/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Set user in context
      setUser({
        id: data.user.id,
        email: data.user.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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

const getRandomBottleImage = () =>
  bottleImageUrls[Math.floor(Math.random() * bottleImageUrls.length)];

const OceanApp = () => {
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [popupBottle, setPopupBottle] = useState<Bottle | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const [userID, setUserID] = useState<string>("");
  // setUserID("98c2f579-4769-4a1d-bffd-0eb47c158720");
  const [oceanID, setOceanID] = useState<string>("");
  // setOceanID("2");
  const [messageContent, setMessageContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { user, setUser, logout } = useUser();

  // Check cookies on mount
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };

    const userId = getCookie("user_id") || getCookie("userID");
    const jwt = getCookie("jwt");

    if (userId && jwt) {
      // You might want to validate the JWT with the backend here
      setUser({ id: userId });
    }
  }, [setUser]);

  // Boat state
  const [boatY, setBoatY] = useState(window.innerHeight * 0.1); 
  const boatBaseY = window.innerHeight * 0.1; // baseline position
  const boatOffset = Math.random() * Math.PI * 2;

  // Initialize bottles
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const spacing = width / NUM_BOTTLES;

    const initialBottles: Bottle[] = Array.from({ length: NUM_BOTTLES }).map(
      (_, i) => {
      // Base x position evenly spaced
        const baseX = i * spacing + spacing / 2;

      // Add only a *small* random offset, but not enough to overlap
      const jitter = (spacing - BOTTLE_WIDTH) / 2; // max safe jitter
        const x = baseX + (Math.random() * 2 - 1) * jitter * 0.3;
      // ^ 0.3 keeps them from drifting too far

        const baseY = Math.random() * (height - BOTTLE_HEIGHT);
        const bobOffset = Math.random() * Math.PI * 2;
        const bobSpeed =
          BOB_SPEED_MIN + Math.random() * (BOB_SPEED_MAX - BOB_SPEED_MIN);
        const img = getRandomBottleImage();
        const y = baseY;
      const rotation = Math.random() * 10 - 5; // -5° to +5°

        return { id: i, x, y, baseY, bobOffset, bobSpeed, img, rotation };
      }
    );

    setBottles(initialBottles);
  }, []);

  useEffect(() => {
    const animate = () => {
      timeRef.current += 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Bottles
      if (!popupBottle) {
        setBottles((prev) =>
          prev.map((b) => {
            let newX = b.x - BOTTLE_SPEED;
            let newBaseY = b.baseY;
            let newImg = b.img;
            let newRotation = b.rotation;

            if (newX < -BOTTLE_WIDTH) {
              newX = width + Math.random() * width * 0.5;
              newBaseY = Math.random() * (height - BOTTLE_HEIGHT);
              newImg = getRandomBottleImage();
              newRotation = Math.random() * 10 - 5;
            }

            const newY =
              newBaseY +
              Math.sin(timeRef.current * b.bobSpeed + b.bobOffset) *
                BOB_AMPLITUDE;

            return {
              ...b,
              x: newX,
              baseY: newBaseY,
              y: newY,
              img: newImg,
              rotation: newRotation,
            };
          })
        );
      }

      // Boat bobbing
      const elapsed = timeRef.current / 60; // convert to seconds-ish
      const newBoatY =
        boatBaseY +
        Math.sin(elapsed * BOAT_SPEED + boatOffset) * BOAT_AMPLITUDE;
      setBoatY(newBoatY);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [popupBottle]);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setTimeout(() => {
          setPopupBottle(null);
        }, 10);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handlePersonalOcean = () => {
    // Navigate to personal ocean or handle the action
    console.log("Navigate to personal ocean for user:", user?.id);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#87CEEB",
      }}
    >
      {/* Background */}
      <div
        style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "200%",
            height: "120%",
            backgroundImage: `url('${oceanImageUrl}')`,
            backgroundRepeat: "repeat",
            backgroundSize: "auto 100%",
            backgroundPosition: "0 0",
            animation: "scrollOcean 40s linear infinite",
            animationPlayState: popupBottle || showAuthModal ? "paused" : "running",
        }}
      />

      {/* Login/Personal Ocean Button */}
      <button
        onClick={user ? handlePersonalOcean : () => setShowAuthModal(true)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "0.75rem 1.5rem",
          zIndex: 15,
          color: "white",
          background: "black",
          border: "4px solid #fff",
          boxShadow: "0 0 0 4px #000",
          fontFamily: "'Press Start 2P', cursive",
          fontSize: "12px",
          textShadow: "2px 2px #000",
          imageRendering: "pixelated",
          cursor: "pointer",
          textTransform: "uppercase",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#333";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "black";
        }}
      >
        {user ? "Personal Ocean" : "Login"}
      </button>

      <div
        onClick={() => alert("Going to the explore page!")}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          padding: "0.5rem 1rem",
          background: "black",
          border: "4px solid #fff",
          boxShadow: "0 0 0 4px #000",
          color: "white",
          fontFamily: "'Press Start 2P', cursive",
          fontSize: "12px",
          textAlign: "center",
          cursor: "pointer",
          zIndex: 25,
          display: "flex",
          flexDirection: "column", // stack vertically
          alignItems: "center",
          gap: "0.25rem",
          imageRendering: "pixelated",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#333";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "black";
        }}
      >
        <img
          src={boatImageUrl}
          alt="Boat"
          style={{
            width: "90px",
            height: "auto",
            imageRendering: "pixelated",
            pointerEvents: "none",
          }}
          draggable={false}
        />
        <span>Go Explore</span>
      </div>

      {/* Bottles */}
      {bottles.map((b) => (
        <img
            key={b.id}
            src={b.img}
            alt="Bottle"
            onClick={async (e) => {
              e.stopPropagation();
              if (!popupBottle && !isLoading) {
                setPopupBottle(b);
                setIsLoading(true);

                try {
                  const response = await getBottle(oceanID, userID);
                  const data = response.data;
                  setMessageContent(data.content || "The ocean whispers secrets...");
                } catch (error) {
                  console.error('Failed to fetch bottle message:', error);
                  setMessageContent("The ocean's connection is turbulent...");
                } finally {
                  setIsLoading(false);
                }
              }
            }}
            style={{
                position: "absolute",
                left: b.x,
                top: b.y,
                maxWidth: BOTTLE_WIDTH,   // limit width
                maxHeight: BOTTLE_HEIGHT, // limit height
                width: "auto",            // keep ratio
                height: "auto",           // keep ratio
                cursor: "pointer",
                zIndex: 5,
                userSelect: "none",
                transform: `rotate(${b.rotation}deg)`,
                objectFit: "contain",     // ensures no squishing
            }}
            draggable={false}
            />

      ))}
      {/* Logout button (only when logged in) */}
      {user && (
        <button
          onClick={logout}
          style={{
            position: "fixed",
            top: "20px",
            right: "220px",
            padding: "0.75rem 1rem",
            zIndex: 15,
            color: "white",
            background: "#8B0000",
            border: "4px solid #fff",
            boxShadow: "0 0 0 4px #000",
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "12px",
            textShadow: "2px 2px #000",
            imageRendering: "pixelated",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#A52A2A";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#8B0000";
          }}
        >
          Logout
        </button>
      )}

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      
      {/* Popup */}
      {popupBottle && (
        <div
          ref={popupRef}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "1.5rem 2rem",
            zIndex: 20,
            color: "white",
            textAlign: "center",
            background: "black",
            border: "4px solid #fff",
            boxShadow: "0 0 0 4px #000",
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "14px",
            lineHeight: "1.5",
            textShadow: "2px 2px #000",
            imageRendering: "pixelated",
          }}
        >
          {/* Close X button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPopupBottle(null);
              setMessageContent("");
            }}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
              fontFamily: "'Press Start 2P', cursive",
              textShadow: "2px 2px #000",
              padding: "0",
              lineHeight: "1",
            }}
          >
            ✕
          </button>
          
          <p style={{ margin: 0 }}>
            {isLoading ? "Reading the message..." : messageContent}
          </p>
        </div>
      )}



      <style>{`
        @keyframes scrollOcean {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default OceanApp;
