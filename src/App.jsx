import './App.css';
import { Canvas, useLoader } from '@react-three/fiber';
import Experience from './components/Experience';
import { AsciiRenderer, Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, LUT, BrightnessContrast, HueSaturation, ToneMapping } from '@react-three/postprocessing'
import { LUTCubeLoader, ToneMappingMode } from 'postprocessing'
import { useControls } from 'leva';
import Model from '/public/Heart'

function App() {

  // Environment Texture
  const texture = useLoader(LUTCubeLoader, '/F-6800-STD.cube')

  // Leva Control Panel
  const { backgroundColor, heart, waveform, shadow } = useControls({
    backgroundColor: '#151520',
    heart: '#000000',
    waveform: '#fff0f0',  // The color control for waveform
    shadow: '#ffffff',
  });


  // What we return to be rendered within our 3D Canvas
  return (
    <div className="App">

      {/* Fixed header */}
      <h2 className="fixed-header">BPM Song <br /> Selector</h2>


      <p className="fixed-para">
        BPM: <span className="fixed-italic">Reading...</span>
        <br />
        Heart Song: <span className="fixed-italic">Selecting...</span>
      </p>

      <Canvas>

        // Background colour
        <color attach="background" args={[backgroundColor]} />

        // Lighting
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        // Environment Texture
        <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/blue_photo_studio_1k.hdr" resolution={512}>
          <group rotation={[0, 0, 1]}>
            <Lightformer form="circle" intensity={10} position={[0, 10, -10]} scale={20} onUpdate={(self) => self.lookAt(0, 0, 0)} />
            <Lightformer intensity={0.1} onUpdate={(self) => self.lookAt(0, 0, 0)} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[50, 10, 1]} />
            <Lightformer intensity={0.1} onUpdate={(self) => self.lookAt(0, 0, 0)} position={[10, 1, 0]} rotation-y={-Math.PI / 2} scale={[50, 10, 1]} />
            <Lightformer color="white" intensity={0.2} onUpdate={(self) => self.lookAt(0, 0, 0)} position={[0, 1, 0]} scale={[10, 100, 1]} />
          </group>
        </Environment>

        // Post-processing Effects
        <EffectComposer disableNormalPass>
          <Bloom mipmapBlur luminanceThreshold={1} intensity={2} />
          <LUT lut={texture} />
          <BrightnessContrast brightness={0} contrast={0.1} />
          <HueSaturation hue={0} saturation={-0.25} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>

        // Our Experience Component
        <Experience />

        // Renderer's (overlays) to play with, check out react-three/drei or storybook
        <AsciiRenderer fgColor="orange" bgColor="blue" />


        // Our Model (Heart)
        <Model waveform={waveform} />

      </Canvas>

    </div >
  );
}

export default App;



