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
const BOTTLE_WIDTH = 350;
const BOTTLE_HEIGHT = 350;
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
        const x = i * spacing + Math.random() * spacing * 0.5;
        const baseY = Math.random() * (height - BOTTLE_HEIGHT);
        const bobOffset = Math.random() * Math.PI * 2;
        const bobSpeed =
          BOB_SPEED_MIN + Math.random() * (BOB_SPEED_MAX - BOB_SPEED_MIN);
        const img = getRandomBottleImage();
        const y = baseY;
        return { id: i, x, y, baseY, bobOffset, bobSpeed, img };
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

            // Only respawn new bottle if popup is not open
            if (newX < -BOTTLE_WIDTH) {
              newX = width + Math.random() * width * 0.5;
              newBaseY = Math.random() * (height - BOTTLE_HEIGHT);
              newImg = getRandomBottleImage();
            }

            const newY =
              newBaseY +
              Math.sin(timeRef.current * b.bobSpeed + b.bobOffset) *
                BOB_AMPLITUDE;

            return { ...b, x: newX, baseY: newBaseY, y: newY, img: newImg };
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
        // Add a small delay to prevent immediate reopening
        setTimeout(() => {
          setPopupBottle(null);
        }, 10);
      }
    };

    // Always listen to clicks on the document
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
          height: "100%",
          backgroundImage: `url('${oceanImageUrl}')`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "0 center",
          animation: "scrollOcean 20s linear infinite",
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
            if (!popupBottle) setPopupBottle(b); // capture exact clicked bottle
          }}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: BOTTLE_WIDTH,
            height: BOTTLE_HEIGHT,
            cursor: "pointer",
            zIndex: 5,
            userSelect: "none",
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
            padding: "2rem",
            borderRadius: "8px",
            zIndex: 20,
            color: "white",
            textAlign: "center",
            backgroundImage: `url('${parchmentImageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          }}
        >
          <p style={{ textShadow: "1px 1px 2px black" }}>Clicked a bottle!</p>
          <img
            src={popupBottle.img}
            alt="Bottle"
            style={{ width: 200, height: 200 }}
          />
          <p style={{ textShadow: "1px 1px 2px black" }}>
            Click outside this popup to close.
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