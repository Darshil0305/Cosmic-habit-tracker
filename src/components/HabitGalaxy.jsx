import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { useSelector } from 'react-redux';
import { selectAllHabits } from '../features/habits/habitsSlice';
import HabitCelestialBody from './HabitCelestialBody';
import CosmicDust from './CosmicDust'; // Import CosmicDust

// Galactic Core (Unchanged)
function GalacticCore() {
  const meshRef = useRef();
  const coreColor = '#ffeeaa';
  const coreSize = 4;
  const coreIntensity = 1.5;
  useFrame((state, delta) => { /* ... rotation/pulsing ... */
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
      const time = state.clock.getElapsedTime();
      meshRef.current.material.emissiveIntensity = coreIntensity * (1 + Math.sin(time * 2) * 0.2);
    }
  });
  return (
    <Sphere ref={meshRef} args={[coreSize, 32, 32]} position={[0, 0, 0]}>
      <meshStandardMaterial color={coreColor} emissive={coreColor} emissiveIntensity={coreIntensity} roughness={0.2} metalness={0.1} toneMapped={false} />
      <pointLight color={coreColor} intensity={coreIntensity * 2} distance={coreSize * 5} />
    </Sphere>
  );
}


function HabitGalaxy({ cameraControlsRef }) {
  const habits = useSelector(selectAllHabits);
  const galaxyRef = useRef();

  useFrame((state, delta) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += delta * 0.01;
    }
  });

  if (!Array.isArray(habits)) {
     console.error("Habits is not an array:", habits);
     return null;
  }

  return (
    <group ref={galaxyRef}>
      <GalacticCore />
      {/* Add Cosmic Dust Clouds */}
      <CosmicDust count={1000} size={0.15} color="#444466" radius={100} />
      <CosmicDust count={500} size={0.2} color="#665555" radius={150} />

      {habits.map((habit) => (
        <HabitCelestialBody
          key={habit.id}
          habit={habit}
          cameraControlsRef={cameraControlsRef}
        />
      ))}
    </group>
  );
}

export default HabitGalaxy;
