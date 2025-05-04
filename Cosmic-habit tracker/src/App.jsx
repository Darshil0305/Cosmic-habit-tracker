import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, CameraControls } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva'; // Re-add Leva
import { useDispatch } from 'react-redux';
import HabitGalaxy from './components/HabitGalaxy';
import HabitControls from './features/habits/HabitControls';
import { recalculateAllPositions } from './features/habits/habitsSlice';
import './styles/App.css';
import * as THREE from 'three'; // Import THREE

// Component for subtle camera movement
function CinematicCameraRig({ controlsRef }) {
  useFrame((state, delta) => {
    if (controlsRef.current) {
      // Example: Very slow, subtle orbit and distance change
      // controlsRef.current.azimuthAngle += delta * 0.005; // Slow horizontal rotation
      // controlsRef.current.polarAngle = THREE.MathUtils.lerp(controlsRef.current.polarAngle, Math.PI / 2 + 0.1, delta * 0.1); // Gently adjust vertical angle
      // controlsRef.current.distance = THREE.MathUtils.lerp(controlsRef.current.distance, 85, delta * 0.05); // Gently adjust distance

      // More subtle random drift (optional)
      const time = state.clock.elapsedTime;
      controlsRef.current.truck(Math.sin(time * 0.1) * delta * 0.1, Math.cos(time * 0.15) * delta * 0.1, false); // Slow sideways drift
    }
  });
  return null;
}


function App() {
  const cameraControlsRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(recalculateAllPositions());
  }, [dispatch]);

  // Leva controls for post-processing
   const { bloomIntensity, dofFocusDistance, dofFocalLength, dofBokehScale, vignetteDarkness } = useControls('PostProcessing', {
     bloomIntensity: { value: 1.2, min: 0, max: 5, step: 0.1 },
     dofFocusDistance: { value: 0.01, min: 0, max: 1, step: 0.001 },
     dofFocalLength: { value: 0.05, min: 0, max: 1, step: 0.001 },
     dofBokehScale: { value: 4, min: 0, max: 10, step: 0.1 },
     vignetteDarkness: { value: 0.6, min: 0, max: 1, step: 0.05 },
   });

  return (
    <>
      <Leva collapsed />
      <Canvas
         camera={{ position: [0, 20, 80], fov: 60 }}
         gl={{ antialias: true, alpha: false }} // Enable antialiasing
         dpr={[1, 2]} // Pixel ratio settings for performance/quality balance
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} /> {/* Lower ambient, rely more on point lights/emissive */}
          <pointLight position={[100, 100, 100]} intensity={0.6} color="#ffffff" />
          <pointLight position={[-100, -100, -100]} intensity={0.3} color="#aaaaff" />

          <Stars radius={300} depth={60} count={8000} factor={7} saturation={0} fade speed={0.3} />

          <HabitGalaxy cameraControlsRef={cameraControlsRef} />

          <CameraControls ref={cameraControlsRef} smoothTime={0.8} maxDistance={200} minDistance={5}/>
          <CinematicCameraRig controlsRef={cameraControlsRef} /> {/* Add subtle camera movement */}

          <EffectComposer>
            <Bloom
              luminanceThreshold={0.2} // Lower threshold to catch more glows
              luminanceSmoothing={0.8}
              height={400} // Increase height for better quality bloom
              intensity={bloomIntensity}
              mipmapBlur // Use mipmap blur for better performance/look
            />
             <DepthOfField
               focusDistance={dofFocusDistance} // Normalized distance
               focalLength={dofFocalLength}   // Normalized focal length
               bokehScale={dofBokehScale}
               height={480} // Quality setting
             />
             <Vignette eskil={false} offset={0.1} darkness={vignetteDarkness} />
             {/* Add ChromaticAberration, FilmGrain later if desired */}
          </EffectComposer>
        </Suspense>
      </Canvas>
      <HabitControls />
    </>
  );
}

export default App;
