import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Line } from '@react-three/drei';
import * as THREE from 'three';

// ---- Constants ----
const FIELD_COLOR = '#363636'; // Dark grey from the image
const LINE_COLOR = '#FFFFFF';
const LINE_WIDTH = 2;
const BASE_SIZE = 0.8;
const DIAMOND_RADIUS = 25; // Distance from home to 1st/3rd
const OUTFIELD_RADIUS = 60;

// ---- Helper Components ----

// The main dark grey playing surface
const FieldSurface = () => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); // Home plate
    s.lineTo(OUTFIELD_RADIUS, 0); // Right field line
    s.absarc(0, 0, OUTFIELD_RADIUS, 0, Math.PI / 2, false); // Outfield arc
    s.lineTo(0, 0); // Left field line
    return s;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color={FIELD_COLOR} roughness={0.9} metalness={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
};

// The thick base underneath the field
const FieldBase = () => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(OUTFIELD_RADIUS + 2, 0);
    s.absarc(0, 0, OUTFIELD_RADIUS + 2, 0, Math.PI / 2, false);
    s.lineTo(0, 0);
    return s;
  }, []);

  const extrudeSettings = { depth: 1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.2, bevelThickness: 0.2 };

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color="#2a2a2a" roughness={1} />
    </mesh>
  );
};

// All the white lines
const FieldLines = () => {
  const points = useMemo(() => {
    const p: THREE.Vector3[][] = [];
    
    // Foul Lines
    p.push([new THREE.Vector3(0, 0.06, 0), new THREE.Vector3(OUTFIELD_RADIUS, 0.06, 0)]);
    p.push([new THREE.Vector3(0, 0.06, 0), new THREE.Vector3(0, 0.06, OUTFIELD_RADIUS)]);

    // Outfield Arc
    const arc = new THREE.Path().absarc(0, 0, OUTFIELD_RADIUS, 0, Math.PI / 2, false);
    const arcPoints = arc.getPoints(50).map(pt => new THREE.Vector3(pt.x, 0.06, pt.y));
    p.push(arcPoints);

    // Infield Diamond
    const diamond = [
        new THREE.Vector3(0, 0.06, 0), // Home
        new THREE.Vector3(DIAMOND_RADIUS, 0.06, 0), // 1st
        new THREE.Vector3(DIAMOND_RADIUS, 0.06, DIAMOND_RADIUS), // 2nd
        new THREE.Vector3(0, 0.06, DIAMOND_RADIUS), // 3rd
        new THREE.Vector3(0, 0.06, 0), // Back to Home
    ];
    p.push(diamond);

    // Pitcher's Mound Circle
    const moundCenter = new THREE.Vector3(DIAMOND_RADIUS / 2, 0.06, DIAMOND_RADIUS / 2);
    const moundArc = new THREE.Path().absarc(moundCenter.x, moundCenter.z, 3, 0, Math.PI * 2, false);
    p.push(moundArc.getPoints(32).map(pt => new THREE.Vector3(pt.x, 0.06, pt.y)));

    // Pitcher's Rubber
    p.push([
        new THREE.Vector3(moundCenter.x - 0.5, 0.06, moundCenter.z),
        new THREE.Vector3(moundCenter.x + 0.5, 0.06, moundCenter.z)
    ]);

    return p;
  }, []);

  return (
    <group>
      {points.map((linePoints, i) => (
        <Line key={i} points={linePoints} color={LINE_COLOR} lineWidth={LINE_WIDTH} position={[0, 0.01, 0]} />
      ))}
    </group>
  );
};

const Bases = () => {
    return (
        <group position={[0, 0.1, 0]}>
            {/* 1st Base */}
            <mesh position={[DIAMOND_RADIUS, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[BASE_SIZE, BASE_SIZE]} />
                <meshBasicMaterial color={LINE_COLOR} />
            </mesh>
             {/* 2nd Base */}
             <mesh position={[DIAMOND_RADIUS, 0, DIAMOND_RADIUS]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[BASE_SIZE, BASE_SIZE]} />
                <meshBasicMaterial color={LINE_COLOR} />
            </mesh>
             {/* 3rd Base */}
             <mesh position={[0, 0, DIAMOND_RADIUS]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[BASE_SIZE, BASE_SIZE]} />
                <meshBasicMaterial color={LINE_COLOR} />
            </mesh>
             {/* Home Plate */}
             <mesh position={[0, 0, 0]} rotation={[-Math.PI/2, 0, -Math.PI/4]}>
                 <circleGeometry args={[BASE_SIZE * 0.7, 5]} />
                 <meshBasicMaterial color={LINE_COLOR} />
             </mesh>
        </group>
    )
}


// ---- Main Component ----
export default function Field() {
  return (
    <>
      {/* Light Grey Background */}
      <color attach="background" args={['#e0e0e0']} />

      <OrthographicCamera
        makeDefault
        position={[50, 50, 50]} // Isometric-ish view
        zoom={5}
        near={-100}
        far={500}
        onUpdate={(c) => c.lookAt(20, 0, 20)} // Look at the center of the diamond
      />

      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 50, 30]} intensity={1} castShadow />

      <group rotation={[0, -Math.PI / 4, 0]} position={[0,0,0]}> {/* Rotate the whole field to match the image's orientation */}
        <FieldBase />
        <FieldSurface />
        <FieldLines />
        <Bases />
      </group>
    </>
  );
}
