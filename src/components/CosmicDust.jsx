import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function CosmicDust({ count = 500, size = 0.1, color = '#555577', radius = 150 }) {
  const pointsRef = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute in a spherical volume, denser towards center?
      const r = radius * Math.cbrt(Math.random()); // Cube root for more even distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count, radius]);

  // Subtle movement (optional)
  // useFrame((state, delta) => {
  //   if (pointsRef.current) {
  //     pointsRef.current.rotation.y += delta * 0.005;
  //   }
  // });

  return (
    <points ref={pointsRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        size={size}
        color={color}
        sizeAttenuation={true} // Points get smaller further away
        transparent
        opacity={0.3}
        depthWrite={false} // Don't obscure objects behind them
        blending={THREE.AdditiveBlending} // Glowy effect
      />
    </points>
  );
}

export default CosmicDust;
