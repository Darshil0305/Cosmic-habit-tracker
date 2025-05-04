import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { Text, Sparkles, Ring, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import { completeHabit, selectHabitColor } from '../features/habits/habitsSlice';

// Import Shaders
import vertexShader from '../graphics/shaders/celestial.vert?raw';
import nebulaFragmentShader from '../graphics/shaders/nebula.frag?raw';
import starFragmentShader from '../graphics/shaders/star.frag?raw';
import planetFragmentShader from '../graphics/shaders/planet.frag?raw';

// --- Shader Material Definitions ---
const NebulaMaterial = shaderMaterial(
  { uTime: 0, uColor1: new THREE.Color(0x000000), uColor2: new THREE.Color(0x000000), uStageProgress: 0 },
  vertexShader,
  nebulaFragmentShader,
  (material) => {
    material.blending = THREE.AdditiveBlending;
    material.depthWrite = false;
    material.transparent = true;
  }
);

const StarMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color(0x000000), uStageProgress: 0, uIntensity: 1.0 },
  vertexShader,
  starFragmentShader,
   (material) => {
    // material.side = THREE.DoubleSide; // Usually not needed for stars
    material.toneMapped = false;
  }
);

const PlanetMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color(0x000000), uStageProgress: 0, uIntensity: 1.0 },
  vertexShader,
  planetFragmentShader
);

// Extend R3F to recognize these materials as JSX tags
extend({ NebulaMaterial, StarMaterial, PlanetMaterial });

// --- Ripple Effect (Unchanged) ---
function RippleEffect({ position, color, active }) {
  const meshRef = useRef();
  const initialScale = 0.1;
  const maxScale = 8;
  const duration = 0.7;
  let startTime = useRef(active ? performance.now() : 0);

  useFrame(() => {
    if (!meshRef.current || !active) {
       if(meshRef.current) meshRef.current.visible = false;
       return;
    }
    const now = performance.now();
    if (!meshRef.current.visible) {
       startTime.current = now;
       meshRef.current.scale.set(initialScale, initialScale, initialScale);
       meshRef.current.material.opacity = 1.0;
       meshRef.current.visible = true;
    }
    const elapsed = (now - startTime.current) / 1000;
    if (elapsed < duration) {
      const progress = elapsed / duration;
      const scale = initialScale + (maxScale - initialScale) * progress;
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.material.opacity = 1.0 - progress;
    } else {
       meshRef.current.visible = false;
    }
  });

  return (
    <Ring ref={meshRef} args={[0.9, 1, 64]} position={position} rotation={[-Math.PI / 2, 0, 0]} visible={active && meshRef.current?.visible} >
      <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={1} />
    </Ring>
  );
}

// --- Main Component ---
function HabitCelestialBody({ habit, cameraControlsRef }) {
  const groupRef = useRef();
  const materialRef = useRef(); // Ref for the material instance
  const [hovered, setHovered] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const dispatch = useDispatch();

  const hexColor = useSelector(state => selectHabitColor(state, habit.category, habit.stage));
  const baseColor = useMemo(() => new THREE.Color(hexColor), [hexColor]);
  const nebulaColor2 = useMemo(() => baseColor.clone().offsetHSL(0.3, 0.1, -0.2), [baseColor]);

  // Update shader uniforms in useFrame
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    // Update uniforms on the CURRENT material instance
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      // Update other uniforms if they change dynamically (like intensity on hover)
      if (materialRef.current.uniforms.uIntensity) {
         materialRef.current.uniforms.uIntensity.value = calculatedProps.materialProps.uIntensity;
      }
       if (materialRef.current.uniforms.uColor1) {
         materialRef.current.uniforms.uColor1.value = calculatedProps.materialProps.uColor1;
       }
       if (materialRef.current.uniforms.uColor2) {
         materialRef.current.uniforms.uColor2.value = calculatedProps.materialProps.uColor2;
       }
        if (materialRef.current.uniforms.uColor) {
         materialRef.current.uniforms.uColor.value = calculatedProps.materialProps.uColor;
       }
    }
    // Update group position and rotation
    if (groupRef.current && habit.position) {
      groupRef.current.position.set(...habit.position);
      groupRef.current.position.y += Math.sin(time * 0.5 + habit.id) * 0.2; // Bobbing
      groupRef.current.rotation.y += delta * 0.02 * (habit.stage + 1);
      groupRef.current.rotation.x += delta * 0.01 * (habit.stage + 1);
    }
  });

  // Determine props based on stage
  // Use useMemo carefully here, ensure dependencies are correct
  const calculatedProps = useMemo(() => {
    let size = 1;
    let materialType = 'star'; // Default type as string
    let materialProps = { uColor: baseColor, uIntensity: 1.0 };
    let showRings = false;
    let sparkleScale = 0;
    const time = performance.now(); // Use performance.now for less frequent changes than Date.now

    switch (habit.stage) {
      case 0: // Nebula
        size = 1.8 + Math.sin(time * 0.0001 + habit.id) * 0.2;
        materialType = 'nebula';
        materialProps = { uColor1: baseColor, uColor2: nebulaColor2, uStageProgress: 0.5 }; // Pass initial uniforms
        sparkleScale = 0;
        break;
      case 1: // Forming Star
        size = 1.2;
        materialType = 'star';
        materialProps = { uColor: baseColor, uIntensity: 1.2 + (hovered ? 0.3 : 0), uStageProgress: 0.5 };
        sparkleScale = 2;
        break;
      case 2: // Stable Star
        size = 1.6;
        materialType = 'star';
        materialProps = { uColor: baseColor, uIntensity: 1.5 + (hovered ? 0.4 : 0), uStageProgress: 0.5 };
        sparkleScale = 1;
        break;
      case 3: // Planetary System
        size = 1.8;
        materialType = 'star'; // Keep star at center
        materialProps = { uColor: baseColor, uIntensity: 1.8 + (hovered ? 0.5 : 0), uStageProgress: 0.5 };
        showRings = true;
        sparkleScale = 0.5;
        break;
      case 4: // Phenomenon
        size = 2.5 + Math.sin(time * 0.0005 + habit.id) * 0.3;
        materialType = 'star'; // Could be 'planet' or custom later
        materialProps = { uColor: baseColor, uIntensity: 2.5 + (hovered ? 0.8 : 0) + Math.sin(time * 0.001 + habit.id) * 0.5, uStageProgress: 0.5 };
        showRings = true;
        sparkleScale = 5;
        break;
      default: break;
    }

    return { size, materialType, materialProps, showRings, sparkleScale };
  // Update memoization dependencies: stage, baseColor, nebulaColor2, hovered, habit.id
  }, [habit.stage, baseColor, nebulaColor2, hovered, habit.id]);


  const handleClick = (event) => {
    event.stopPropagation();
    dispatch(completeHabit({ id: habit.id }));
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 800);

    if (cameraControlsRef.current && habit.position) {
      const targetPosition = new THREE.Vector3(...habit.position);
      cameraControlsRef.current.setLookAt(
        targetPosition.x + calculatedProps.size * 5, targetPosition.y + calculatedProps.size * 3, targetPosition.z + calculatedProps.size * 5,
        targetPosition.x, targetPosition.y, targetPosition.z,
        true
      );
    }
  };

   if (!habit || !habit.position) return null;

  // Helper function to render the correct material tag
  const renderMaterial = () => {
    const props = {
      ref: materialRef, // Assign ref here
      key: calculatedProps.materialType, // Use type for key
      ...calculatedProps.materialProps // Spread initial uniforms
    };
    switch (calculatedProps.materialType) {
      case 'nebula':
        return <nebulaMaterial {...props} />;
      case 'star':
        return <starMaterial {...props} />;
      case 'planet':
        return <planetMaterial {...props} />; // Assuming planet shader exists
      default:
        return <starMaterial {...props} />; // Fallback
    }
  };

  return (
    <group ref={groupRef}>
      <mesh
        // Apply size via scale to the mesh
        scale={calculatedProps.size}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); }}
        onPointerOut={(event) => setHovered(false)}
        onClick={handleClick}
        castShadow
      >
        <sphereGeometry args={[1, 64, 64]} />
        {/* Render the material using the helper */}
        {renderMaterial()}
      </mesh>

      {/* Sparkles */}
      {calculatedProps.sparkleScale > 0 && habit.stage !== 0 && (
         <Sparkles
           count={habit.stage * 30 + 20}
           // Use calculated size for scale
           scale={calculatedProps.size * calculatedProps.sparkleScale * (hovered ? 1.2 : 1)}
           size={calculatedProps.size * 0.6}
           speed={0.4}
           color={baseColor}
         />
      )}

       {/* Rings */}
       {calculatedProps.showRings && (
         <>
           <Ring args={[calculatedProps.size * 1.3, calculatedProps.size * 1.5, 64]} rotation={[-Math.PI / 2.2, 0.2, 0.1]}>
             <meshStandardMaterial color="#aaaaaa" side={THREE.DoubleSide} roughness={0.8} metalness={0.2} transparent opacity={0.4}/>
           </Ring>
           {habit.stage >= 4 &&
             <Ring args={[calculatedProps.size * 1.8, calculatedProps.size * 1.9, 64]} rotation={[-Math.PI / 1.8, -0.1, 0.3]}>
               <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.3} side={THREE.DoubleSide} transparent opacity={0.3}/>
             </Ring>
           }
         </>
       )}

      {/* Hover Text */}
      {hovered && (
        <Text position={[0, calculatedProps.size * 1.5, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000" >
          {`${habit.name}\nStreak: ${habit.streak}`}
        </Text>
      )}

       {/* Ripple Effect */}
       <RippleEffect position={[0, -calculatedProps.size * 0.5, 0]} color={baseColor} active={showRipple} />
    </group>
  );
}

export default HabitCelestialBody;
