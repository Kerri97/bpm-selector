import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'

// Our Experience Component (audio waveform vis & interactivity)
const Experience = ({ waveform }) => {
  const [audioStarted, setAudioStarted] = useState(false); // A state that tracks if the audio has started playing or not. It's initially set to false.
  const [frequencyData, setFrequencyData] = useState([]); // A state that stores the audio frequency data for our audio waveform vis

  // These are references to store things we need to keep track of but don't want to re-render.
  const analyserRef = useRef(null); 
  const audioContextRef = useRef(null);
  const meshRefs = useRef([]); // References to 3D mesh elements

  // Function to handle our audio file
  const handlePlayAudio = async () => {
    try {
      // Initialize AudioContext
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Load audio
      const response = await fetch('/assets/songs/Electric_Feel.mp3');
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Create audio source and analyser
      const audioSource = audioContext.createBufferSource();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128; // Low resolution for smoother visualization
      analyserRef.current = analyser;

      // Connect audio nodes
      audioSource.buffer = audioBuffer;
      audioSource.connect(analyser);
      analyser.connect(audioContext.destination);

      // Start playback
      audioSource.start();
      setAudioStarted(true);
    } catch (error) {
      console.error('Error starting audio:', error);
    }
  };

  // This effect re-renders only when audioStarted changes state
  useEffect(() => {
    if (audioStarted && analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      let animationFrameId;
      const updateFrequencyData = () => {
        analyserRef.current.getByteFrequencyData(dataArray); // Get audio frequency data
        setFrequencyData([...dataArray]); // Update state with frequency data
        animationFrameId = requestAnimationFrame(updateFrequencyData); // Schedule next frame
      };

      updateFrequencyData();

      return () => cancelAnimationFrame(animationFrameId); // Cleanup
    }
  }, [audioStarted]); 
  // hook
  
// Update the scale of each mesh on every frame
  useFrame(() => { 

    if (meshRefs.current && frequencyData.length) {

      meshRefs.current.forEach((mesh, i) => {

        if (mesh) {

          const scale = frequencyData[i] / 255; // Normalize frequency data
          // set our mesh to scale by 4 on its Y axis, based on frequency
          mesh.scale.set(2, scale * 4, 2);
        }
      });
    }
  });

  return (
    <>

   {/* High-level abstraction of camera controls using OrbitControls from @react-three/drei */}
      <OrbitControls enableZoom={true} enableRotate={true} enablePan={true} />

    {/* We implement conditional rendering to create an 'Enter' overlay, my favourite technique for overlays */}
      {/* If audio has not started we render our button */}
      {!audioStarted && (

        <mesh>
          <Html center>
            <button
              onClick={handlePlayAudio}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                borderRadius: '5px',
                background: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Enter
            </button>
          </Html>
        </mesh>
      )}
      {/* If the audio has started we render our audio reactive waveform */}
      {audioStarted && (
        <group>
          {[...Array(64)].map((_, i) => (
            <mesh
              key={i}
              ref={(ref) => (meshRefs.current[i] = ref)} // Store reference for each mesh
              position={[i * 0.2 - 6.4, 0, 0]} // Position each mesh along X-axis
            >
              <boxGeometry args={[0.15, 0.15, 0.15]} /> {/* Box geometry for each bar */}
              <meshBasicMaterial color={waveform} /> {/* Color set from waveform prop */}

            </mesh>


          ))}
        </group>
      )}
    </>
  );
};

// Exporting our Experience component 
export default Experience;














