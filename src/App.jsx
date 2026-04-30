import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, Scroll, useScroll, Environment, ContactShadows, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Mail, MapPin, GraduationCap, CalendarHeart, Code, Camera } from 'lucide-react';

// --- STYLIZED AVATAR ---
function Avatar() {
  const group = useRef();
  const leftLeg = useRef();
  const rightLeg = useRef();
  const leftArm = useRef();
  const rightArm = useRef();
  const scroll = useScroll();

  useFrame(() => {
    // scroll.offset goes from 0 to 1 over the full scroll distance
    const offset = scroll.offset;
    
    // Move avatar forward on the Z axis
    // Total journey length is 50 units (0 to -50)
    group.current.position.z = -offset * 50;

    // Bobbing effect while walking
    const walkSpeed = 80;
    const isScrolling = scroll.delta > 0.0001 || scroll.delta < -0.0001; // detect if currently scrolling
    
    if (isScrolling) {
      group.current.position.y = Math.sin(offset * walkSpeed * 2) * 0.1 - 1;
      leftLeg.current.rotation.x = Math.sin(offset * walkSpeed) * 0.8;
      rightLeg.current.rotation.x = Math.sin(offset * walkSpeed + Math.PI) * 0.8;
      leftArm.current.rotation.x = Math.sin(offset * walkSpeed + Math.PI) * 0.8;
      rightArm.current.rotation.x = Math.sin(offset * walkSpeed) * 0.8;
    } else {
      // Return to idle stance slowly
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -1, 0.1);
      leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0, 0.1);
      rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, 0, 0.1);
      leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, 0, 0.1);
      rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, 0, 0.1);
    }
  });

  return (
    <group ref={group} position={[0, -1, 0]}>
      {/* Floating Head/Drone */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={0.5} />
          {/* Eyes */}
          <mesh position={[-0.15, 0.1, 0.26]}>
            <boxGeometry args={[0.1, 0.05, 0.01]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.15, 0.1, 0.26]}>
            <boxGeometry args={[0.1, 0.05, 0.01]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>
      </Float>

      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.4]} />
        <meshStandardMaterial color="#222233" metalness={0.8} roughness={0.2} />
        {/* Core Light */}
        <mesh position={[0, 0, 0.21]}>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="#ff00ea" />
        </mesh>
      </mesh>

      {/* Legs */}
      <group position={[-0.2, 0.5, 0]} ref={leftLeg}>
         <mesh position={[0, -0.4, 0]}>
           <boxGeometry args={[0.2, 0.8, 0.2]} />
           <meshStandardMaterial color="#ffffff" />
         </mesh>
      </group>
      <group position={[0.2, 0.5, 0]} ref={rightLeg}>
         <mesh position={[0, -0.4, 0]}>
           <boxGeometry args={[0.2, 0.8, 0.2]} />
           <meshStandardMaterial color="#ffffff" />
         </mesh>
      </group>

      {/* Arms */}
      <group position={[-0.45, 1.4, 0]} ref={leftArm}>
         <mesh position={[0, -0.35, 0]}>
           <boxGeometry args={[0.15, 0.7, 0.15]} />
           <meshStandardMaterial color="#00f3ff" />
         </mesh>
      </group>
      <group position={[0.45, 1.4, 0]} ref={rightArm}>
         <mesh position={[0, -0.35, 0]}>
           <boxGeometry args={[0.15, 0.7, 0.15]} />
           <meshStandardMaterial color="#00f3ff" />
         </mesh>
      </group>
    </group>
  );
}

// --- CITYSCAPE BACKGROUND ---
function City() {
  const buildings = useMemo(() => {
    const arr = [];
    for(let i=0; i<80; i++) {
      const x = (Math.random() - 0.5) * 60;
      const z = -Math.random() * 60 + 5; // Buildings along the Z path
      
      // Keep a clear path in the middle for the avatar
      if (Math.abs(x) < 4) continue;
      
      const height = Math.random() * 12 + 2;
      const isNeon = Math.random() > 0.8;
      const color = isNeon ? (Math.random() > 0.5 ? '#00f3ff' : '#ff00ea') : '#0a0a20';
      
      arr.push({ 
        position: [x, height/2 - 2, z], 
        args: [Math.random()*2+1, height, Math.random()*2+1],
        color,
        isNeon
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#020208" roughness={0.1} metalness={0.8} />
      </mesh>
      
      {/* Floor Grid */}
      <gridHelper args={[200, 100, '#ff00ea', '#111133']} position={[0, -1.99, 0]} />

      {/* Buildings */}
      {buildings.map((b, i) => (
        <mesh key={i} position={b.position}>
          <boxGeometry args={b.args} />
          <meshStandardMaterial 
            color={b.color} 
            emissive={b.isNeon ? b.color : '#000000'} 
            emissiveIntensity={b.isNeon ? 2 : 0} 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
      ))}
      
      <Sparkles count={500} scale={[20, 10, 60]} position={[0, 3, -25]} color="#00f3ff" size={2} speed={0.2} />
    </group>
  );
}

// --- CAMERA FOLLOWER ---
function CameraFollower() {
  const scroll = useScroll();
  useFrame((state) => {
    const targetZ = -scroll.offset * 50;
    // Smoothly interpolate camera position to follow avatar
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ + 6, 0.1);
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, Math.sin(scroll.offset * Math.PI) * 2, 0.1); // Slight sway
    state.camera.lookAt(0, 0, targetZ - 10);
  });
  return null;
}

// --- MAIN APP ---
export default function App() {
  return (
    <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
      <color attach="background" args={['#020208']} />
      <fog attach="fog" args={['#020208', 10, 40]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={2} color="#00f3ff" />
      <pointLight position={[-10, 5, -20]} intensity={50} color="#ff00ea" distance={50} />
      
      <ScrollControls pages={4} damping={0.2}>
        <City />
        <Avatar />
        <CameraFollower />

        <Scroll html style={{ width: '100%' }}>
          {/* PAGE 1: HERO */}
          <div className="section" style={{ top: '0vh' }}>
            <h1>System Init.</h1>
            <p>Welcome to my digital space. I'm a Data Analyst & Web Developer. Scroll down to start the journey.</p>
            <div style={{ marginTop: '2rem', animation: 'bounce 2s infinite' }}>↓ SCROLL ↓</div>
          </div>

          {/* PAGE 2: ABOUT ME */}
          <div className="section" style={{ top: '100vh', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ background: 'rgba(5, 5, 26, 0.7)', padding: '3rem', borderRadius: '20px', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 243, 255, 0.2)', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <h2>About Me</h2>
              <p>I am a versatile Data Analyst and Web Developer with a passion for building intelligent, data-driven systems. I bridge the gap between complex datasets, machine learning models, and immersive digital interfaces.</p>
              
              <div style={{ display: 'flex', gap: '2rem', margin: '1.5rem 0', flexWrap: 'wrap', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem 2rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00f3ff' }}>
                  <GraduationCap size={20} /> <span>BCA (Completing 2025)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff00ea' }}>
                  <CalendarHeart size={20} /> <span>21 Years Old</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00f3ff' }}>
                  <MapPin size={20} /> <span>Udaipur, Rajasthan, India</span>
                </div>
              </div>

              <p style={{ color: '#00f3ff' }}>From analyzing raw data in Python to building full-stack platforms and 3D WebGL experiences, I transform concepts into scalable realities.</p>
              <ul className="skills" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
              <li>Python / SQL</li>
              <li>Data Analytics & AI</li>
              <li>React & Next.js</li>
              <li>Three.js / WebGL</li>
              <li>Supabase / Node.js</li>
            </ul>
            </div>
          </div>
          {/* PAGE 3: PROJECTS */}
          <div className="section" style={{ top: '200vh' }}>
            <h2>Flagship Projects</h2>
            <div className="projects-grid">
              <div className="project-card">
                <h3>Ultimate Excel AI</h3>
                <p>Data automation tool turning complex spreadsheets into intuitive AI-driven insights.</p>
                <a href="https://ultimateexcelai-jfvekpuol2jlhinncbenm8.streamlit.app/" target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Initialize App</a>
              </div>
              <div className="project-card">
                <h3>Cric-Pulse</h3>
                <p>Real-time strategy and sports data prediction engine with live websocket integration via Telegram Mini App.</p>
                <a href="https://cric-pulse-iota.vercel.app/" target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Initialize App</a>
              </div>
              <div className="project-card">
                <h3>IPL Booking App</h3>
                <p>High-fidelity sports ticketing system with physical M-Ticket digital downloads.</p>
                <a href="https://ipl-booking-app.vercel.app/" target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Initialize App</a>
              </div>
              <div className="project-card">
                <h3>Aether E-Com</h3>
                <p>High-performance full-stack web application with seamless UI/UX and secure checkout integration.</p>
                <a href="https://aether-ecommerce.onrender.com/" target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Initialize App</a>
              </div>
            </div>
          </div>

          {/* PAGE 4: CONTACT */}
          <div className="section" style={{ top: '300vh', alignItems: 'center', textAlign: 'center' }}>
            <h2>Establish Connection</h2>
            <p>Ready to collaborate on data or web projects? Ping my server.</p>
            
            <div style={{ display: 'flex', gap: '2rem', margin: '2rem 0', flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href="https://github.com/rpn39073-cmyk" target="_blank" rel="noreferrer" style={{ color: '#00f3ff', transition: 'transform 0.2s', display: 'flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none', fontWeight: 'bold' }} onMouseEnter={(e)=>e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={(e)=>e.currentTarget.style.transform='scale(1)'}><Code size={24} /> GitHub</a>
              <a href="https://www.instagram.com/21._rahull?igsh=MXZkcmQ2NTIwdXB5eQ==" target="_blank" rel="noreferrer" style={{ color: '#ff00ea', transition: 'transform 0.2s', display: 'flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none', fontWeight: 'bold' }} onMouseEnter={(e)=>e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={(e)=>e.currentTarget.style.transform='scale(1)'}><Camera size={24} /> Instagram</a>
              <a href="mailto:sutharrahul513@gmail.com" style={{ color: '#00f3ff', transition: 'transform 0.2s', display: 'flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none', fontWeight: 'bold' }} onMouseEnter={(e)=>e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={(e)=>e.currentTarget.style.transform='scale(1)'}><Mail size={24} /> Email</a>
            </div>

            <div className="form-group">
              <input type="text" placeholder="Your Designation / Name" />
              <input type="email" placeholder="Signal Origin (Email)" />
              <textarea rows={4} placeholder="Transmit Message..."></textarea>
              <button className="btn">Send Transmission</button>
            </div>
          </div>
        </Scroll>
      </ScrollControls>
    </Canvas>
  );
}
