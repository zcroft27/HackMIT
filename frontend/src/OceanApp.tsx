import { useEffect, useRef, useState } from "react";

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
  rotation: number; // NEW
};

const getRandomBottleImage = () =>
  bottleImageUrls[Math.floor(Math.random() * bottleImageUrls.length)];

const OceanApp = () => {
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [popupBottle, setPopupBottle] = useState<Bottle | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const animationRef = useRef<number | null>(null);

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

            // Respawn bottle if offscreen
            if (newX < -BOTTLE_WIDTH) {
              newX = width + Math.random() * width * 0.5;
              newBaseY = Math.random() * (height - BOTTLE_HEIGHT);
              newImg = getRandomBottleImage();
              newRotation = Math.random() * 10 - 5; // reset tilt
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        height: "120%", // bigger so we can move vertically too
        backgroundImage: `url('${oceanImageUrl}')`,
        backgroundRepeat: "repeat",
        backgroundSize: "auto 100%",
        backgroundPosition: "0 0",
        animation: "scrollOcean 40s linear infinite",
    }}
    />


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
      background: "black", // pixel-style purple
      border: "4px solid #fff",
      boxShadow: "0 0 0 4px #000", // chunky border
      fontFamily: "'Press Start 2P', cursive", // pixel font
      fontSize: "14px",
      lineHeight: "1.5",
      textShadow: "2px 2px #000",
      imageRendering: "pixelated",
    }}
  >
    <p style={{ margin: 0 }}>
      You will have 3 sons next year.
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
