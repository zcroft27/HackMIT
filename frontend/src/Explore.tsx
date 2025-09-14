import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomPersonalOcean, getOceans, getOceanByUserID } from './services/api';
import { useUser } from './UserContext';

const exploreBackgroundUrl = "/newExploreBackground.png";

const redWaypointUrl = "/redWaypoint.png";

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
    waypoints: [[90, 55]]
  },
  {
    id: "flow7",
    // Bottom left piece
    polygon: [[0, 70], [10, 60], [15, 55], [30, 65], [35, 75], [30, 100], [0, 100]],
    //waypoints: [[18, 85]]
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
    waypoints: [[82, 80]]
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

// Waypoint color mapping based on ocean properties
type Ocean = {
  user_id?: string | null;
  name?: string | null;
  description?: string | null;
  id: number;
  // Add other properties if needed
};

const getWaypointColor = (ocean: Ocean) => {
  // You can customize this logic based on ocean properties
  if (ocean.name?.toLowerCase().includes('fitness')) return 'black';
  if (ocean.name?.toLowerCase().includes('gratitude')) return 'green';
  if (ocean.name?.toLowerCase().includes('affirmation')) return 'purple';
  if (ocean.name?.toLowerCase().includes('self')) return 'pink';
  if (ocean.name?.toLowerCase().includes('question')) return 'red';
  if (ocean.name?.toLowerCase().includes('activities')) return 'teal';
  if (ocean.name?.toLowerCase().includes('default')) return 'grey';
  // Default color
  return 'magenta';
};

const waypointImages = {
  red: redWaypointUrl,
};

const whirlpoolUrl = "/whirlpool.png";

const Explore = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [personalOceans, setPersonalOceans] = useState<Ocean[]>([]);
  const [waypointOceanMap, setWaypointOceanMap] = useState<
    Array<{ position: number[]; sectionId: string; key: string; ocean: Ocean }>
  >([]);
    const { user, logout } = useUser();
  

  useEffect(() => {
    const fetchPersonalOceans = async () => {
      try {
        const response = await getOceans();
        console.log('All oceans:', response.data);
        const allOceans = Array.isArray(response.data.oceans)
          ? response.data.oceans
          : [];

        // Filter for personal oceans
        const personal = allOceans.filter((ocean: Ocean) => ocean.user_id === null);
        setPersonalOceans(personal);
            
        
        // Simple shuffle helper
        const shuffleArray = <T,>(array: T[]): T[] => {
          const copy = [...array];
          for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
          }
          return copy;
        };

        const sectionsWithWaypoints = sections.filter(s => s.waypoints && s.waypoints.length > 0);
        const shuffledSections = shuffleArray(sectionsWithWaypoints);

        const mappedWaypoints = personal
          .slice(0, shuffledSections.length)
          .map((ocean: Ocean, idx: number) => {
            const section = shuffledSections[idx];
            const position = section.waypoints ? section.waypoints[0] : [0, 0];
            return {
              ocean,
              position,
              sectionId: section.id,
              key: `waypoint-${idx}`,
            };
          });

        // const mappedWaypoints = personal.slice(0, sectionsWithWaypoints.length).map((ocean: Ocean, idx: number) => {
        //   const section = sectionsWithWaypoints[idx];
        //   const position = section.waypoints ? section.waypoints[0] : [0, 0];
        //   return {
        //     ocean,
        //     position,
        //     sectionId: section.id,
        //     key: `waypoint-${idx}`,
        //   };
        // });
        
        setWaypointOceanMap(mappedWaypoints);
      } catch (error) {
        console.error('Failed to fetch oceans:', error);
      }
    };

    fetchPersonalOceans();
  }, []);

  const handleWhirlpoolClick = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await getRandomPersonalOcean();
      const randomOcean = response.data;
      
      // Navigate to home with the ocean data
      navigate('/', { state: { ocean: randomOcean } });
    } catch (error) {
      console.error('Failed to fetch random personal ocean:', error);
      alert('Failed to find a personal ocean. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWaypointClick = (ocean: Ocean) => {
    navigate('/', { state: { ocean } });
  };

  const handlePersonalOcean = async () => {
      if (user?.id) {
        try {
          const response = await getOceanByUserID(user.id);
          navigate('/', { state: { ocean: response.data } });
          console.log("Switched to personal ocean:", response.data);
        } catch (error) {
          console.error("Failed to fetch personal ocean:", error);
        }
      }
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


      {user?.id && (
        <div
          onClick={handlePersonalOcean}
          style={{
            position: "fixed",
            top: "50px",
            right: "50px",
            width: "100px",
            height: "80px",
            cursor: "pointer",
            zIndex: 100,
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
            src="/plane.png"
            alt="Plane"
            style={{
              width: "70px",
              imageRendering: "pixelated",
              pointerEvents: "none",
              zIndex: 100,
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

      

      {/* Ocean Waypoints */}
      {waypointOceanMap.map(({ ocean, position, key }) => {
        const [x, y] = position;
        const color = getWaypointColor(ocean);
        const waypointImage = redWaypointUrl;
        console.log("Waypoint:", ocean.name, "Color:", color, "Image:", waypointImage);

        
        return (
          <div
            key={key}
            onClick={() => handleWaypointClick(ocean)}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: "200px",
              height: "200px",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              cursor: "pointer",
              transition: "transform 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
            }}
          >
            {/* Inner waypoint image container */}
            <div style={{ 
              width: "70px", 
              height: "70px",
              position: "relative",
            }}>
              {waypointImage ? (
                <img
                  src={waypointImage}
                  alt={ocean.name || 'Personal Ocean'}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                // Fallback if no waypoint image
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: color,
                    border: "3px solid white",
                    borderRadius: "50%",
                    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                  }}
                />
              )}
              {/* Ocean name label */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-30px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "3px",
                  fontSize: "12px",
                  fontFamily: "'Press Start 2P', cursive",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {ocean.name || 'Ocean'}
              </div>
            </div>
          </div>
        );
      })}

      {/* Whirlpool in flow8 section - Now clickable */}
      <div
        onClick={handleWhirlpoolClick}
        style={{
          position: "absolute",
          left: "17.5%", // Center of flow7 (0-35 range)
          bottom: "0", // Against the bottom of screen
          width: "30%", // Fits within flow7 width
          height: "35%", // Proportional height
          transform: "translateX(-50%)", // Center horizontally
          zIndex: 6,
          cursor: isLoading ? "wait" : "pointer",
          transition: "filter 0.3s ease",
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.filter = "brightness(1.2) drop-shadow(0 0 20px rgba(64, 224, 208, 0.8))";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "none";
        }}
      >
        <img
          src={whirlpoolUrl}
          alt="Whirlpool - Click to visit a random personal ocean"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "bottom center",
            pointerEvents: "none",
          }}
        />
        {/* Loading spinner overlay */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "12px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              animation: "pulse 1s ease-in-out infinite",
            }}
          >
            Loading...
          </div>
        )}
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

      {/* Parchment Border Frame - Top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "40px",
          backgroundColor: "#f4e4c1",
          backgroundImage: `
            radial-gradient(ellipse at top left, rgba(139, 105, 20, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at top right, rgba(92, 51, 23, 0.1) 0%, transparent 50%)
          `,
          borderBottom: "4px solid #8b6914",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          zIndex: 20,
        }}
      />
      
      {/* Parchment Border Frame - Bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40px",
          backgroundColor: "#f4e4c1",
          backgroundImage: `
            radial-gradient(ellipse at bottom left, rgba(139, 105, 20, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(92, 51, 23, 0.1) 0%, transparent 50%)
          `,
          borderTop: "4px solid #8b6914",
          boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.3)",
          zIndex: 20,
        }}
      />
      
      {/* Parchment Border Frame - Left */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: 0,
          bottom: "40px",
          width: "40px",
          backgroundColor: "#f4e4c1",
          backgroundImage: `
            radial-gradient(ellipse at left center, rgba(139, 105, 20, 0.1) 0%, transparent 50%)
          `,
          borderRight: "4px solid #8b6914",
          boxShadow: "4px 0 8px rgba(0, 0, 0, 0.3)",
          zIndex: 20,
        }}
      />
      
      {/* Parchment Border Frame - Right */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          right: 0,
          bottom: "40px",
          width: "40px",
          backgroundColor: "#f4e4c1",
          backgroundImage: `
            radial-gradient(ellipse at right center, rgba(139, 105, 20, 0.1) 0%, transparent 50%)
          `,
          borderLeft: "4px solid #8b6914",
          boxShadow: "-4px 0 8px rgba(0, 0, 0, 0.3)",
          zIndex: 20,
        }}
      />
      
      {/* Corner pieces for seamless connection */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "44px",
          height: "44px",
          backgroundColor: "#f4e4c1",
          zIndex: 21,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "44px",
          height: "44px",
          backgroundColor: "#f4e4c1",
          zIndex: 21,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "44px",
          height: "44px",
          backgroundColor: "#f4e4c1",
          zIndex: 21,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "44px",
          height: "44px",
          backgroundColor: "#f4e4c1",
          zIndex: 21,
        }}
      />

      <style>{`
        @keyframes scrollExplore {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Explore;