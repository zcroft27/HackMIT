import React from 'react';

const exploreBackgroundUrl = "/newExploreBackground.png";

// The original polygon points data remains the same
const sections = [
{
id: "northwest",
polygon: [[0, 0], [22, 0], [28, 12], [25, 28], [18, 35], [8, 32], [0, 18]],
waypoints: [[14, 16]]
},
{
id: "north",
polygon: [[22, 0], [58, 0], [62, 8], [55, 22], [48, 30], [38, 25], [28, 32], [25, 28], [28, 12]],
waypoints: [[42, 15]]
},
{
id: "northeast",
polygon: [[58, 0], [100, 0], [100, 42], [88, 48], [72, 45], [65, 38], [55, 22], [62, 8]],
waypoints: [[78, 25]]
},
{
id: "westcentral",
polygon: [[0, 18], [8, 32], [18, 35], [22, 48], [15, 62], [5, 58], [0, 45]],
waypoints: [[12, 40]]
},
{
id: "central",
polygon: [[18, 35], [38, 25], [48, 30], [52, 42], [45, 55], [35, 60], [22, 48]],
waypoints: [[35, 42]]
},
{
id: "eastcentral",
polygon: [[48, 30], [55, 22], [65, 38], [72, 45], [68, 58], [52, 62], [45, 55], [52, 42]],
waypoints: [[60, 45]]
},
{
id: "southwest",
polygon: [[0, 45], [5, 58], [15, 62], [22, 75], [12, 88], [0, 100]],
waypoints: [[10, 72]]
},
{
id: "south",
polygon: [[15, 62], [22, 48], [35, 60], [45, 55], [52, 62], [48, 78], [35, 85], [25, 92], [12, 88], [22, 75]],
waypoints: [[32, 75]]
},
{
id: "southeast",
polygon: [[52, 62], [68, 58], [72, 45], [88, 48], [100, 42], [100, 100], [25, 100], [25, 92], [35, 85], [48, 78]],
waypoints: [[75, 80]]
}
];


/**
* Converts an array of polygon points into a closed SVG path string with smooth curves.
* @param {number[][]} points - Array of [x, y] coordinates.
* @param {number} tension - Controls the "curviness". 0 is straight, ~0.2 is a good starting point.
* @returns {string} The 'd' attribute string for an SVG <path> element.
*/
const createCurvedPath = (points: number[][], tension = 0.2) => {
if (points.length < 3) return ""; // Not enough points to curve

// Duplicate the first two and last two points to handle control points for the closing curve
const extendedPoints = [points[points.length - 2], points[points.length - 1], ...points, points[0], points[1]];
const pathData = [];
for (let i = 2; i < extendedPoints.length - 2; i++) {
const p0 = extendedPoints[i - 2];
const p1 = extendedPoints[i - 1];
const p2 = extendedPoints[i];
const p3 = extendedPoints[i + 1];

// Calculate control points for the cubic Bézier curve between p1 and p2
const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
const cp2y = p2[1] - (p3[1] - p1[1]) * tension;

if (pathData.length === 0) {
pathData.push(`M ${p1[0]},${p1[1]}`);
}
pathData.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`);
}

return pathData.join(" ") + " Z"; // "Z" closes the path
};

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

{/* SVG Path Outlines */}
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
{sections.map((section) => (
<path
key={section.id}
d={createCurvedPath(section.polygon, 0.22)}
fill={`rgba(255, 0, 0, 0.05)`}
stroke="white"
strokeWidth="0.3"
strokeDasharray="1 2" // Smaller dash, larger gap for a "hashed" look
strokeLinecap="round"
strokeLinejoin="round"
pathLength="100" // Normalizes dash pattern across all shapes
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