import React from 'react';

const exploreBackgroundUrl = "/explorebackground.png";

const Explore = () => {
  const handleBackToOcean = () => {
    window.location.href = '/'; // Navigate back to main ocean
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#4A6741", // Different background color for explore
      }}
    >
      {/* Explore Background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "200%",
          height: "120%",
          backgroundImage: `url('${exploreBackgroundUrl}')`,
          backgroundRepeat: "repeat",
          backgroundSize: "auto 100%",
          backgroundPosition: "0 0",
          animation: "scrollExplore 40s linear infinite",
        }}
      />

      {/* Back to Ocean Button */}
      <button
        onClick={handleBackToOcean}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
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
        ← Back to Ocean
      </button>

      {/* Explore Page Title */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "2rem 3rem",
          zIndex: 15,
          color: "white",
          background: "rgba(0, 0, 0, 0.8)",
          border: "4px solid #fff",
          boxShadow: "0 0 0 4px #000",
          fontFamily: "'Press Start 2P', cursive",
          textShadow: "2px 2px #000",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "24px", marginBottom: "1rem" }}>
          EXPLORE THE SEAS
        </h1>
        <p style={{ fontSize: "12px", lineHeight: "1.6" }}>
          Discover different oceans,<br />
          Find new bottle collections,<br />
          Meet fellow explorers...
        </p>
      </div>

      <style>{`
        @keyframes scrollExplore {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default Explore;