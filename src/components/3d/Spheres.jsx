import { Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { secondary } from "../../theme";

const Particle = ({ position }) => {
  const ref = useRef(null);
  const factor = Math.random()*10
  useFrame((state) => {
    const { clock } = state;
    // ref.current.rotation.x = clock.getElapsedTime();
    ref.current.position.x = Math.sin(clock.elapsedTime / 4 + factor*10);
    ref.current.position.y = Math.cos(clock.elapsedTime / 4 + factor*10);
    // ref.current.position.y = Math.cos(clock.elapsedTime / 10)*10;
    // ref.current.position.z = Math.sin(clock.elapsedTime / 10)*10;
    ref.current.position.needsUpdate = true;

    // ref.current.scale.x = 1 + Math.sin(clock.elapsedTime / 10);
    // ref.current.scale.y = 1 + Math.sin(clock.elapsedTime / 10);
    // ref.current.scale.z = 1 + Math.sin(clock.elapsedTime / 10);
    ref.current.needsUpdate = true;
  });
  return <Sphere ref={ref} material-color={`rgba(${200+Math.floor(Math.random()*55)},${200 + Math.floor(Math.random()*55)},0,0.3)`}></Sphere>;
};
const Spheres = () => {
  const group = useRef(null);
  return (
    <group ref={group}>
      <Particle></Particle>
      <Particle></Particle>
      <Particle></Particle>
      <Particle></Particle>
      <Particle></Particle>
    </group>
  );
};

export default Spheres;
