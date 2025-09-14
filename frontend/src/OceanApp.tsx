import { useEffect, useRef, useState } from "react";
import { useUser } from "./UserContext";
import { AuthModal } from "./AuthModal";
import { getDefaultOcean, getOceanByUserID } from "./services/api";

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
const parchmentImageUrl = "/parchment.png";

const NUM_BOTTLES = 30;
const BOTTLE_SPEED = 0.5;
const BOTTLE_WIDTH = 100;
const BOTTLE_HEIGHT = 100;
const BOB_AMPLITUDE = 5;
const BOB_SPEED_MIN = 0.01;
const BOB_SPEED_MAX = 0.03;

type Bottle = {
  id: number;
  x: number;
  y: number;
  baseY: number;
  bobOffset: number;
  bobSpeed: number;
  img: string;
  rotation: number;
};

type Ocean = {
  id: number;
  name?: string;
  description?: string;
  user_id?: string;
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
  const [currentOcean, setCurrentOcean] = useState<Ocean | null>(null);
  const [messageContent, setMessageContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { user, logout } = useUser();

  // Check if we're on the personal ocean page
  const isPersonalOcean = currentOcean?.user_id === user?.id && user !== null;

  // Fetch default ocean on mount
  useEffect(() => {
    const fetchDefaultOcean = async () => {
      try {
        const response = await getDefaultOcean();
        setCurrentOcean(response.data);
      } catch (error) {
        console.error("Failed to fetch default ocean:", error);
      }
    };

    fetchDefaultOcean();
  }, []);

  // Initialize bottles
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const spacing = width / NUM_BOTTLES;

    const initialBottles: Bottle[] = Array.from({ length: NUM_BOTTLES }).map(
      (_, i) => {
        const baseX = i * spacing + spacing / 2;
        const jitter = (spacing - BOTTLE_WIDTH) / 2;
        const x = baseX + (Math.random() * 2 - 1) * jitter * 0.3;
        const baseY = Math.random() * (height - BOTTLE_HEIGHT);
        const bobOffset = Math.random() * Math.PI * 2;
        const bobSpeed =
          BOB_SPEED_MIN + Math.random() * (BOB_SPEED_MAX - BOB_SPEED_MIN);
        const img = getRandomBottleImage();
        const y = baseY;
        const rotation = Math.random() * 10 - 5;

        return { id: i, x, y, baseY, bobOffset, bobSpeed, img, rotation };
      }
    );

    setBottles(initialBottles);
  }, []);

  // Animate bottles
  useEffect(() => {
    const animate = () => {
      if (!popupBottle) {
        timeRef.current += 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

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

  const handlePersonalOcean = async () => {
    if (user?.id) {
      try {
        const response = await getOceanByUserID(user.id);
        setCurrentOcean(response.data);
        console.log("Switched to personal ocean:", response.data);
      } catch (error) {
        console.error("Failed to fetch personal ocean:", error);
      }
    }
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
        }}
      />

      {/* Ocean Info Display - Centered */}
      {currentOcean && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "1rem 1.5rem",
            zIndex: 15,
            color: "white",
            background: "rgba(0, 0, 0, 0.8)",
            border: "4px solid #fff",
            boxShadow: "0 0 0 4px #000",
            fontFamily: "'Press Start 2P', cursive",
            textShadow: "2px 2px #000",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "14px", marginBottom: "0.5rem" }}>
            {currentOcean.name || "Unnamed Ocean"}
          </h2>
          {currentOcean.description && (
            <p style={{ fontSize: "10px", lineHeight: "1.4", margin: 0 }}>
              {currentOcean.description}
            </p>
          )}
        </div>
      )}

      {/* Login Button */}
      {!user && (
        <button
          onClick={() => setShowAuthModal(true)}
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
          Login
        </button>
      )}

      {/* Personal Ocean Floating Island - Only show when NOT on personal ocean */}
      {user && !isPersonalOcean && (
        <div
          onClick={handlePersonalOcean}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            width: "120px",
            height: "120px",
            cursor: "pointer",
            zIndex: 15,
            animation: "floatIsland 3s ease-in-out infinite",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(1.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "brightness(1)";
          }}
        >
          {/* Island Base */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "80px",
              height: "40px",
              background: "#D2691E",
              borderRadius: "50%",
              border: "3px solid #8B4513",
              boxShadow: "0 4px 0 #654321",
            }}
          />
          
          {/* Sand */}
          <div
            style={{
              position: "absolute",
              bottom: "25px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "70px",
              height: "30px",
              background: "#F4A460",
              borderRadius: "50%",
            }}
          />
          
          {/* Palm Tree Trunk */}
          <div
            style={{
              position: "absolute",
              bottom: "35px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "8px",
              height: "40px",
              background: "#8B4513",
              borderLeft: "2px solid #654321",
              borderRight: "2px solid #654321",
            }}
          />
          
          {/* Palm Leaves */}
          <div
            style={{
              position: "absolute",
              bottom: "70px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60px",
              height: "30px",
              background: "#228B22",
              clipPath: "polygon(50% 0%, 0% 100%, 20% 80%, 40% 90%, 50% 70%, 60% 90%, 80% 80%, 100% 100%)",
              filter: "drop-shadow(2px 2px 0 #006400)",
            }}
          />
          
          {/* Glowing Star */}
          <div
            style={{
              position: "absolute",
              top: "0",
              right: "10px",
              width: "20px",
              height: "20px",
              background: "#FFD700",
              clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
              animation: "pulse 2s ease-in-out infinite",
              filter: "drop-shadow(0 0 10px #FFD700)",
            }}
          />
          
          {/* Text */}
          <div
            style={{
              position: "absolute",
              bottom: "-5px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "10px",
              textShadow: "2px 2px #000",
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            My Ocean
          </div>
        </div>
      )}

      {/* Logout button - Only show when on personal ocean */}
      {user && isPersonalOcean && (
        <button
          onClick={logout}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "0.75rem 1.5rem",
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

      {/* Bottles */}
      {bottles.map((b) => (
        <img
          key={b.id}
          src={b.img}
          alt="Bottle"
          onClick={(e) => {
            e.stopPropagation();
            if (!popupBottle) setPopupBottle(b);
          }}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            maxWidth: BOTTLE_WIDTH,
            maxHeight: BOTTLE_HEIGHT,
            width: "auto",
            height: "auto",
            cursor: "pointer",
            zIndex: 5,
            userSelect: "none",
            transform: `rotate(${b.rotation}deg)`,
            objectFit: "contain",
          }}
          draggable={false}
        />
      ))}

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
        
        @keyframes floatIsland {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default OceanApp;