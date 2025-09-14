import React from 'react';

const exploreBackgroundUrl = "/newExploreBackground.png";

// The original polygon points data remains the same
const sections = [
  {
    id: "flow1",
    // Top flowing piece
    polygon: [[0, 0], [35, 0], [40, 15], [45, 30], [35, 45], [20, 35], [5, 20], [0, 10]],
    waypoints: [[20, 18]]
  },
  {
    id: "flow2",
    polygon: [[35, 0], [70, 0], [65, 20], [55, 35], [45, 30], [40, 15]],
    waypoints: [[52, 15]]
  },
  {
    id: "flow3",
    polygon: [[70, 0], [100, 0], [100, 25], [90, 40], [75, 45], [55, 35], [65, 20]],
    waypoints: [[82, 22]]
  },
  {
    id: "flow4",
    // Left vertical flow
    polygon: [[0, 10], [5, 20], [20, 35], [15, 55], [10, 60], [0, 70]],
    waypoints: [[8, 45]]
  },
  {
    id: "flow5",
    // Central meandering piece
    polygon: [[20, 35], [35, 45], [45, 30], [55, 35], [75, 45], [80, 55], [45, 70], [30, 65], [15, 55]],
    waypoints: [[45, 50]]
  },
  {
    id: "flow6",
    // Right side piece
    polygon: [[75, 45], [90, 40], [100, 25], [100, 70], [88, 75], [80, 55]],
    waypoints: [[90, 65]]
  },
  {
    id: "flow7",
    // Bottom left piece
    polygon: [[0, 70], [10, 60], [15, 55], [30, 65], [35, 75], [30, 100], [0, 100]],
    waypoints: [[18, 85]]
  },
  {
    id: "flow8",
    // Bottom center piece
    polygon: [[30, 65], [45, 70], [80, 55], [70, 72], [65, 100], [30, 100], [35, 75]],
    waypoints: [[50, 80]]
  },
  {
    id: "flow9",
    // Bottom right piece
    polygon: [[80, 55], [88, 75], [100, 70], [100, 100], [65, 100], [70, 72]],
    waypoints: [[82, 85]]
  }
];

/**
 * Extract all unique curved edges from the sections
 */
const getUniqueCurvedEdges = (tension = 0.2) => {
  const edgeMap = new Map();
  
  sections.forEach(section => {
    const points = section.polygon;
    const extendedPoints = [points[points.length - 2], points[points.length - 1], ...points, points[0], points[1]];
    
    for (let i = 2; i < extendedPoints.length - 2; i++) {
      const p0 = extendedPoints[i - 2];
      const p1 = extendedPoints[i - 1];
      const p2 = extendedPoints[i];
      const p3 = extendedPoints[i + 1];
      
      // Create edge key for deduplication
      const edgeKey = [p1, p2].sort((a, b) => {
        if (a[0] !== b[0]) return a[0] - b[0];
        return a[1] - b[1];
      }).map(p => `${p[0]},${p[1]}`).join('-');
      
      if (!edgeMap.has(edgeKey)) {
        // Calculate control points for the cubic Bézier curve
        const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
        const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
        const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
        const cp2y = p2[1] - (p3[1] - p1[1]) * tension;
        
        edgeMap.set(edgeKey, {
          path: `M ${p1[0]},${p1[1]} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`
        });
      }
    }
  });
  
  return Array.from(edgeMap.values());
};

const whirlpoolUrl = "/whirlpool.png";

const Explore = () => {
  const handleBackToOcean = () => {
    window.location.href = '/'; // Navigate back to main ocean
  };
  
  const uniqueEdges = getUniqueCurvedEdges(0.22);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#4A6741",
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
        }}
      />

      {/* SVG Path Outlines - Only unique edges */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        {uniqueEdges.map((edge, idx) => (
          <path
            key={`edge-${idx}`}
            d={edge.path}
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            strokeDasharray="10 20"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
          />
        ))}
      </svg>

      {/* Waypoints */}
      {sections.flatMap(section =>
        section.waypoints.map(([x, y], idx) => (
          <div
            key={`${section.id}-wp${idx}`}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: "12px",
              height: "12px",
              backgroundColor: "yellow",
              border: "2px solid black",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          />
        ))
      )}

      {/* Whirlpool in flow8 section */}
      <div
        style={{
          position: "absolute",
          left: "17.5%", // Center of flow7 (0-35 range)
          bottom: "0", // Against the bottom of screen
          width: "30%", // Fits within flow7 width
          height: "35%", // Proportional height
          transform: "translateX(-50%)", // Center horizontally
          zIndex: 6,
          pointerEvents: "none",
        }}
      >
        <img
          src={whirlpoolUrl}
          alt="Whirlpool"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "bottom center",
          }}
        />
      </div>

      {/* Back to Ocean Button */}
      {/* <button
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
      </button> */}

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






// // Alternative 1: Flowing diagonal divisions
// const sectionsV1 = [
//   {
//     id: "northwest",
//     polygon: [[0, 0], [35, 0], [32, 15], [28, 25], [15, 30], [0, 28]],
//     waypoints: [[16, 15]]
//   },
//   {
//     id: "north",
//     polygon: [[35, 0], [70, 0], [68, 12], [65, 28], [50, 35], [32, 32], [28, 25], [32, 15]],
//     waypoints: [[50, 18]]
//   },
//   {
//     id: "northeast",
//     polygon: [[70, 0], [100, 0], [100, 35], [85, 38], [72, 42], [65, 28], [68, 12]],
//     waypoints: [[82, 20]]
//   },
//   {
//     id: "westcentral",
//     polygon: [[0, 28], [15, 30], [18, 45], [12, 60], [0, 65]],
//     waypoints: [[8, 45]]
//   },
//   {
//     id: "central",
//     polygon: [[15, 30], [28, 25], [32, 32], [50, 35], [55, 50], [48, 65], [30, 68], [18, 62], [12, 60], [18, 45]],
//     waypoints: [[35, 48]]
//   },
//   {
//     id: "eastcentral",
//     polygon: [[50, 35], [65, 28], [72, 42], [85, 38], [88, 55], [80, 70], [65, 75], [48, 65], [55, 50]],
//     waypoints: [[68, 52]]
//   },
//   {
//     id: "southwest",
//     polygon: [[0, 65], [12, 60], [18, 62], [20, 80], [10, 100], [0, 100]],
//     waypoints: [[10, 82]]
//   },
//   {
//     id: "south",
//     polygon: [[18, 62], [30, 68], [48, 65], [65, 75], [60, 85], [45, 100], [10, 100], [20, 80]],
//     waypoints: [[38, 85]]
//   },
//   {
//     id: "southeast",
//     polygon: [[65, 75], [80, 70], [88, 55], [85, 38], [100, 35], [100, 100], [45, 100], [60, 85]],
//     waypoints: [[78, 85]]
//   }
// ];

// // Alternative 2: Wave-like organic divisions
// const sectionsV2 = [
//   {
//     id: "northwest",
//     polygon: [[0, 0], [30, 0], [35, 20], [25, 35], [10, 40], [0, 30]],
//     waypoints: [[15, 20]]
//   },
//   {
//     id: "north",
//     polygon: [[30, 0], [65, 0], [60, 15], [55, 30], [40, 40], [25, 35], [35, 20]],
//     waypoints: [[45, 20]]
//   },
//   {
//     id: "northeast",
//     polygon: [[65, 0], [100, 0], [100, 40], [90, 45], [75, 38], [55, 30], [60, 15]],
//     waypoints: [[80, 22]]
//   },
//   {
//     id: "westcentral",
//     polygon: [[0, 30], [10, 40], [15, 55], [8, 70], [0, 72]],
//     waypoints: [[7, 50]]
//   },
//   {
//     id: "central",
//     polygon: [[10, 40], [25, 35], [40, 40], [55, 30], [75, 38], [70, 55], [50, 65], [30, 60], [15, 55]],
//     waypoints: [[42, 48]]
//   },
//   {
//     id: "eastcentral",
//     polygon: [[75, 38], [90, 45], [100, 40], [100, 72], [85, 68], [70, 55]],
//     waypoints: [[85, 55]]
//   },
//   {
//     id: "southwest",
//     polygon: [[0, 72], [8, 70], [15, 55], [30, 60], [25, 85], [15, 100], [0, 100]],
//     waypoints: [[12, 85]]
//   },
//   {
//     id: "south",
//     polygon: [[30, 60], [50, 65], [70, 55], [85, 68], [75, 90], [55, 100], [15, 100], [25, 85]],
//     waypoints: [[50, 80]]
//   },
//   {
//     id: "southeast",
//     polygon: [[85, 68], [100, 72], [100, 100], [55, 100], [75, 90]],
//     waypoints: [[85, 85]]
//   }
// ];

// // Alternative 3: Radial/spiral-inspired divisions
// const sectionsV3 = [
//   {
//     id: "northwest",
//     polygon: [[0, 0], [40, 0], [38, 25], [20, 40], [0, 35]],
//     waypoints: [[20, 18]]
//   },
//   {
//     id: "north",
//     polygon: [[40, 0], [75, 0], [70, 22], [50, 35], [38, 25]],
//     waypoints: [[55, 15]]
//   },
//   {
//     id: "northeast",
//     polygon: [[75, 0], [100, 0], [100, 30], [85, 40], [70, 22]],
//     waypoints: [[85, 15]]
//   },
//   {
//     id: "westcentral",
//     polygon: [[0, 35], [20, 40], [25, 60], [10, 75], [0, 70]],
//     waypoints: [[12, 55]]
//   },
//   {
//     id: "central",
//     // Large central polygon
//     polygon: [[20, 40], [38, 25], [50, 35], [70, 22], [85, 40], [80, 55], [55, 70], [35, 65], [25, 60]],
//     waypoints: [[50, 50]]
//   },
//   {
//     id: "eastcentral",
//     polygon: [[85, 40], [100, 30], [100, 65], [88, 72], [80, 55]],
//     waypoints: [[88, 50]]
//   },
//   {
//     id: "southwest",
//     polygon: [[0, 70], [10, 75], [25, 60], [35, 65], [30, 85], [20, 100], [0, 100]],
//     waypoints: [[15, 85]]
//   },
//   {
//     id: "south",
//     polygon: [[35, 65], [55, 70], [80, 55], [88, 72], [80, 88], [65, 100], [20, 100], [30, 85]],
//     waypoints: [[50, 82]]
//   },
//   {
//     id: "southeast",
//     polygon: [[88, 72], [100, 65], [100, 100], [65, 100], [80, 88]],
//     waypoints: [[85, 85]]
//   }
// ];

// // Choose which version to use - you can change this to sectionsV1, sectionsV2, or sectionsV3
// const sections = sectionsV3;