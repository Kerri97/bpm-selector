import { useEffect, useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

// Our Experience component 
const Experience = () => {
  const [audioStarted, setAudioStarted] = useState(false); // A state variable that tracks whether the audio has started or not. It's initially set to false.
  const [frequencyData, setFrequencyData] = useState([]); // This will store the audio frequency data that we visualize (such as how loud different frequency ranges are).

  // These are references to store things we need to keep track of but don't want to re-render (like the audio analyzer or the 3D shapes representing the frequency data).
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const meshRefs = useRef([]);

  // Function to handle our audio
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

  // This only runs when audioStarted changes state
  useEffect(() => {
    if (audioStarted && analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      let animationFrameId;
      const updateFrequencyData = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        setFrequencyData([...dataArray]);
        animationFrameId = requestAnimationFrame(updateFrequencyData);
      };

      updateFrequencyData();

      return () => cancelAnimationFrame(animationFrameId); // Cleanup
    }
  }, [audioStarted]);
  // the function listens for state changes here

  useFrame(() => { // Runs every frame of our animation
    if (meshRefs.current && frequencyData.length) {
      meshRefs.current.forEach((mesh, i) => {
        if (mesh) {
          const scale = frequencyData[i] / 255; // Normalize frequency data
          mesh.scale.set(2, scale * 4, 2);
        }
      });
    }
  });

  return (
    <>
      <OrbitControls enableZoom={true} enableRotate={true} enablePan={true} />

      {!audioStarted && (
        
        <mesh>
          <Html center>
            <button
              onClick={handlePlayAudio}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                borderRadius: '5px',
                background: 'grey',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Enter
            </button>
          </Html>
        </mesh>
      )}

      {audioStarted && (
        <group>
          {[...Array(64)].map((_, i) => (
            <mesh
              key={i}
              ref={(ref) => (meshRefs.current[i] = ref)}
              position={[i * 0.2 - 6.4, 0, 0]}
            >
              <boxGeometry args={[0.15, 0.15, 0.15]} />
              <meshBasicMaterial color={waveform} />

            

            </mesh>
            
           
          ))}
        </group>
      )}
    </>
  );
};

// Exporting our Experience component 
export default Experience;














