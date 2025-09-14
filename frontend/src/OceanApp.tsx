import { useEffect, useRef, useState } from "react";
import { useUser } from "./UserContext";
import { AuthModal } from "./AuthModal";
import { getBottle, getDefaultOcean, getOceanByUserID, getTags, createBottle } from "./services/api";
import { useNavigate } from 'react-router-dom';

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

const NUM_BOTTLES = 25;
const BOTTLE_SPEED = 0.5;
const BOTTLE_WIDTH = 100;
const BOTTLE_HEIGHT = 100;
const BOB_AMPLITUDE = 5;
const BOB_SPEED_MIN = 0.01;
const BOB_SPEED_MAX = 0.03;
const VERTICAL_ZONES = 6;

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

type Tag = {
  id: number;
  name: string;
};

const getRandomBottleImage = () =>
  bottleImageUrls[Math.floor(Math.random() * bottleImageUrls.length)];

const OceanApp = () => {
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [popupBottle, setPopupBottle] = useState<Bottle | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateBottleModal, setShowCreateBottleModal] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const createBottleRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const [currentOcean, setCurrentOcean] = useState<Ocean | null>(null);
  const [messageContent, setMessageContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Create bottle form states
  const [bottleContent, setBottleContent] = useState<string>("");
  const [bottleAuthor, setBottleAuthor] = useState<string>("");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [locationFrom, setLocationFrom] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  
  const { user, logout } = useUser();

  const navigate = useNavigate();

  // Check if we're on the personal ocean page
  const isPersonalOcean = currentOcean?.user_id === user?.id && user !== null;
  // Check if we're on someone else's personal ocean
  const isOthersPersonalOcean = currentOcean?.user_id && currentOcean?.user_id !== user?.id;

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

  // Fetch tags when create bottle modal opens
  useEffect(() => {
    const fetchTags = async () => {
      if (showCreateBottleModal && !isPersonalOcean) {
        try {
          const response = await getTags();
          // Filter out the default tag
          const filteredTags = response.data.filter((tag: Tag) => 
            tag.name.toLowerCase() !== 'default' && tag.name.toLowerCase() !== 'personal'
          );
          setTags(filteredTags);
        } catch (error) {
          console.error("Failed to fetch tags:", error);
        }
      }
    };

    fetchTags();
  }, [showCreateBottleModal, isPersonalOcean]);

  // Initialize bottles
  useEffect(() => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const horizontalSpacing = width / NUM_BOTTLES; // Normal horizontal distribution

  const initialBottles: Bottle[] = Array.from({ length: NUM_BOTTLES }).map(
    (_, i) => {
      // Normal horizontal spacing
      const baseX = i * horizontalSpacing + horizontalSpacing / 2;
      
      // Small horizontal jitter
      const jitter = Math.min(horizontalSpacing * 0.3, 50);
      const x = baseX + (Math.random() * 2 - 1) * jitter;
      
      // Distribute across vertical zones
      const zoneHeight = (height - BOTTLE_HEIGHT * 2) / VERTICAL_ZONES;
      const zone = Math.floor(Math.random() * VERTICAL_ZONES); // Random zone assignment
      const baseY = (zoneHeight * zone) + BOTTLE_HEIGHT + (Math.random() * zoneHeight * 0.8);
      
      const bobOffset = Math.random() * Math.PI * 2;
      const bobSpeed = BOB_SPEED_MIN + Math.random() * (BOB_SPEED_MAX - BOB_SPEED_MIN);
      const img = getRandomBottleImage();
      const rotation = Math.random() * 10 - 5;

      return { id: i, x, y: baseY, baseY, bobOffset, bobSpeed, img, rotation };
    }
  );

  setBottles(initialBottles);
  }, []);

// Updated animation with vertical zone respawn
useEffect(() => {
  const animate = () => {
    timeRef.current += 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (!popupBottle && !showCreateBottleModal) {
      setBottles((prev) =>
        prev.map((b) => {
          let newX = b.x - BOTTLE_SPEED;
          let newBaseY = b.baseY;
          let newImg = b.img;
          let newRotation = b.rotation;

          if (newX < -BOTTLE_WIDTH) {
            // Normal horizontal respawn
            newX = width + Math.random() * width * 0.5;
            
            // Random vertical zone respawn
            const zoneHeight = (height - BOTTLE_HEIGHT * 2) / VERTICAL_ZONES;
            const zone = Math.floor(Math.random() * VERTICAL_ZONES);
            newBaseY = (zoneHeight * zone) + BOTTLE_HEIGHT + (Math.random() * zoneHeight * 0.8);
            
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
  }, [popupBottle, showCreateBottleModal]);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setTimeout(() => {
          setPopupBottle(null);
        }, 10);
      }
      if (createBottleRef.current && !createBottleRef.current.contains(e.target as Node)) {
        setTimeout(() => {
          setShowCreateBottleModal(false);
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

  const handleCreateBottle = async () => {
    if (!bottleContent.trim()) {
      alert("Please write a message for your bottle!");
      return;
    }

    setIsCreating(true);
    try {
      const bottleData: any = {
        content: bottleContent,
        author: bottleAuthor || null,
        location_from: locationFrom || null,
      };

      // If in personal ocean, set personal flag
      if (isPersonalOcean) {
        bottleData.personal = true;
        bottleData.user_id = user?.id;
      } else if (selectedTagId) {
        // Only add tag if not in personal ocean
        bottleData.tag_id = selectedTagId;
      }

      await createBottle(bottleData);
      
      // Reset form
      setBottleContent("");
      setBottleAuthor("");
      setSelectedTagId(null);
      setLocationFrom("");
      setShowCreateBottleModal(false);
      
      alert("Your bottle has been cast into the ocean!");
    } catch (error) {
      console.error("Failed to create bottle:", error);
      alert("Failed to create bottle. Please try again.");
    } finally {
      setIsCreating(false);
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
            animationPlayState: popupBottle || showAuthModal || showCreateBottleModal ? "paused" : "running",
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

      <div
        onClick={() => navigate('/explore')}
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
          flexDirection: "column",
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

      {/* Create Bottle Button - Only show if logged in and not in someone else's personal ocean */}
      {!isOthersPersonalOcean && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowCreateBottleModal(true);
          }}
          style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "1rem 2rem",
            zIndex: 15,
            color: "white",
            background: "#006400",
            border: "4px solid #fff",
            boxShadow: "0 0 0 4px #000",
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "14px",
            textShadow: "2px 2px #000",
            imageRendering: "pixelated",
            cursor: "pointer",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#228B22";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#006400";
          }}
        >
          <span style={{ fontSize: "18px" }}>📝</span>
          Cast a Bottle
        </button>
      )}

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
                  if (currentOcean) {
                    const [response] = await Promise.all([
                    await getBottle(String(currentOcean.id), user?.id),
                    new Promise(resolve => setTimeout(resolve, 750))
                    ]);
                    const data = response.data;
                    setMessageContent(data.content || "The ocean whispers secrets...");
                  } else {
                    setMessageContent("No ocean selected.");
                  }
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

      {/* Personal Ocean Lighthouse - Only show when NOT on personal ocean */}
      {user && !isPersonalOcean && (
        <div
          onClick={handlePersonalOcean}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            width: "70",
            height: "140px",
            cursor: "pointer",
            zIndex: 15,
            animation: "floatIsland 3s ease-in-out infinite",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(1.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "brightness(1)";
          }}
        >
          <img
            src="/lighthouse.png"
            alt="Lighthouse"
            style={{
              width: "50px",
              imageRendering: "pixelated",
              pointerEvents: "none",
              filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))",
            }}
            draggable={false}
          />
          
          <div
            style={{
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

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Bottle Message Popup */}
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
            {isLoading ? "Unfurling the scroll..." : messageContent}
          </p>
        </div>
      )}

      {/* Create Bottle Modal */}
      {showCreateBottleModal && (
        <div
          ref={createBottleRef}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "2rem",
            zIndex: 20,
            color: "white",
            background: "black",
            border: "4px solid #fff",
            boxShadow: "0 0 0 4px #000",
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "12px",
            textShadow: "2px 2px #000",
            imageRendering: "pixelated",
            minWidth: "400px",
            maxWidth: "500px",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCreateBottleModal(false);
              // Reset form
              setBottleContent("");
              setBottleAuthor("");
              setSelectedTagId(null);
              setLocationFrom("");
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
          
          <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "16px", textAlign: "center" }}>
            Cast Your Message
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Message Content */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Message *
              </label>
              <textarea
                value={bottleContent}
                onChange={(e) => setBottleContent(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "0.5rem",
                  background: "#333",
                  border: "2px solid #fff",
                  color: "white",
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "10px",
                  resize: "vertical",
                }}
                placeholder="Write your message..."
                maxLength={500}
              />
            </div>

            {/* Author */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Author (optional)
              </label>
              <input
                type="text"
                value={bottleAuthor}
                onChange={(e) => setBottleAuthor(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  background: "#333",
                  border: "2px solid #fff",
                  color: "white",
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "10px",
                }}
                placeholder="Anonymous"
              />
            </div>

            {/* Location */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Location (optional)
              </label>
              <input
                type="text"
                value={locationFrom}
                onChange={(e) => setLocationFrom(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  background: "#333",
                  border: "2px solid #fff",
                  color: "white",
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "10px",
                }}
                placeholder="Where are you casting from?"
              />
            </div>

            {/* Tags - Only show if not in personal ocean */}
            {!isPersonalOcean && tags.length > 0 && (
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Tag (optional)
                </label>
                <select
                  value={selectedTagId || ""}
                  onChange={(e) => setSelectedTagId(e.target.value ? Number(e.target.value) : null)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    background: "#333",
                    border: "2px solid #fff",
                    color: "white",
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  <option value="">No tag</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Personal Ocean Note */}
            {isPersonalOcean && (
              <p style={{ 
                fontSize: "10px", 
                textAlign: "center", 
                margin: "0.5rem 0",
                color: "#FFD700" 
              }}>
                This bottle will stay in your personal ocean
              </p>
            )}

            {/* Submit Button */}
            <button
              onClick={handleCreateBottle}
              disabled={isCreating || !bottleContent.trim()}
              style={{
                padding: "0.75rem 1.5rem",
                marginTop: "0.5rem",
                background: isCreating || !bottleContent.trim() ? "#555" : "#006400",
                border: "2px solid #fff",
                color: "white",
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "12px",
                cursor: isCreating || !bottleContent.trim() ? "not-allowed" : "pointer",
                textAlign: "center",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (!isCreating && bottleContent.trim()) {
                  e.currentTarget.style.background = "#228B22";
                }
              }}
              onMouseLeave={(e) => {
                if (!isCreating && bottleContent.trim()) {
                  e.currentTarget.style.background = "#006400";
                }
              }}
            >
              {isCreating ? "Casting..." : "Cast Bottle"}
            </button>
          </div>
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