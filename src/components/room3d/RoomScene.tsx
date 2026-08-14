import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import {
  wallDirection,
  wallInwardNormal,
  wallLength,
  type Design,
  type FloorPlan,
  type Opening,
  type PlacedFurniture,
  type Wall,
} from "@/lib/room-model";
import { getSpec } from "@/lib/furniture";

/**
 * 3D geometry is generated DIRECTLY from the validated 2D wall coordinates.
 * No wall is ever repositioned, rotated or resized here — the plan is the
 * single source of truth, this file is only a projection of it.
 */

function buildWallGeometry(wall: Wall, openings: Opening[]) {
  const len = wallLength(wall);
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(len, 0);
  shape.lineTo(len, wall.height);
  shape.lineTo(0, wall.height);
  shape.closePath();

  for (const o of openings) {
    const x0 = o.offset - o.width / 2;
    const x1 = o.offset + o.width / 2;
    const y0 = o.sill;
    const y1 = o.sill + o.height;
    const hole = new THREE.Path();
    hole.moveTo(x0, y0);
    hole.lineTo(x1, y0);
    hole.lineTo(x1, y1);
    hole.lineTo(x0, y1);
    hole.closePath();
    shape.holes.push(hole);
  }

  return new THREE.ExtrudeGeometry(shape, {
    depth: wall.thickness,
    bevelEnabled: false,
  });
}

function TexturedMaterial({ url, color, length, height }: { url: string; color: string; length: number; height: number }) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1 / length, 1 / height);
  return <meshStandardMaterial map={texture} roughness={0.8} color="#ffffff" side={THREE.DoubleSide} />;
}

function SurfaceTexturedMaterial({ url }: { url: string }) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  return <meshStandardMaterial map={texture} roughness={0.7} color="#ffffff" side={THREE.DoubleSide} />;
}

function WallMaterial({ color, photoUrl, length, height }: { color: string; photoUrl?: string | undefined; length: number; height: number }) {
  if (photoUrl) {
    return <TexturedMaterial url={photoUrl} color={color} length={length} height={height} />;
  }
  return <meshStandardMaterial color={color} roughness={0.92} side={THREE.DoubleSide} />;
}

function WallMesh({
  wall,
  openings,
  color,
  photoUrl,
}: {
  wall: Wall;
  openings: Opening[];
  color: string;
  photoUrl?: string | undefined;
}) {
  const geometry = useMemo(() => buildWallGeometry(wall, openings), [wall, openings]);
  const d = wallDirection(wall);
  const n = wallInwardNormal(wall);
  const theta = Math.atan2(-d.z, d.x);
  // Inner face sits exactly on the plan line; the body extrudes outwards.
  const px = wall.start.x - n.x * wall.thickness;
  const pz = wall.start.z - n.z * wall.thickness;

  return (
    <mesh
      geometry={geometry}
      position={[px, 0, pz]}
      rotation={[0, theta, 0]}
      castShadow
      receiveShadow
    >
      <WallMaterial color={color} photoUrl={photoUrl} length={wallLength(wall)} height={wall.height} />
    </mesh>
  );
}

function OpeningInsert({ wall, opening }: { wall: Wall; opening: Opening }) {
  const d = wallDirection(wall);
  const n = wallInwardNormal(wall);
  const theta = Math.atan2(-d.z, d.x);
  const cx = wall.start.x + d.x * opening.offset - (n.x * wall.thickness) / 2;
  const cz = wall.start.z + d.z * opening.offset - (n.z * wall.thickness) / 2;
  const cy = opening.sill + opening.height / 2;

  if (opening.type === "window") {
    return (
      <group position={[cx, cy, cz]} rotation={[0, theta, 0]}>
        <mesh>
          <boxGeometry args={[opening.width, opening.height, 0.03]} />
          <meshPhysicalMaterial
            color="#cfe6f2"
            transparent
            opacity={0.28}
            roughness={0.05}
            metalness={0}
            transmission={0.8}
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.05, opening.height, wall.thickness + 0.02]} />
          <meshStandardMaterial color="#f2efe9" />
        </mesh>
        {/* daylight coming through the window */}
        <pointLight
          position={[n.x * 0.4, 0, n.z * 0.4]}
          intensity={12}
          distance={9}
          color="#dbe9ff"
        />
      </group>
    );
  }

  return (
    <group position={[cx, cy, cz]} rotation={[0, theta, 0]}>
      <mesh castShadow>
        <boxGeometry args={[opening.width - 0.04, opening.height - 0.03, 0.05]} />
        <meshStandardMaterial color="#efece6" roughness={0.6} />
      </mesh>
      <mesh position={[opening.width / 2 - 0.14, 0, 0.06]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  );
}

function FurniturePiece({
  item,
  selected,
  onSelect,
}: {
  item: PlacedFurniture;
  selected: boolean;
  onSelect?: ((id: string) => void) | undefined;
}) {
  const spec = getSpec(item.type);
  const color = item.color ?? spec.color;
  const rot = (item.rotation * Math.PI) / 180;

  const body = () => {
    switch (spec.type) {
      case "sofa":
        return (
          <group>
            <mesh position={[0, 0.22, 0]} castShadow>
              <boxGeometry args={[spec.width, 0.44, spec.depth]} />
              <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.62, -spec.depth / 2 + 0.14]} castShadow>
              <boxGeometry args={[spec.width, 0.46, 0.26]} />
              <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
          </group>
        );
      case "bed":
        return (
          <group>
            <mesh position={[0, 0.28, 0]} castShadow>
              <boxGeometry args={[spec.width, 0.5, spec.depth]} />
              <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.75, -spec.depth / 2 + 0.06]} castShadow>
              <boxGeometry args={[spec.width, 0.9, 0.1]} />
              <meshStandardMaterial color="#6d5942" roughness={0.8} />
            </mesh>
          </group>
        );
      case "carpet":
        return (
          <mesh position={[0, 0.011, 0]} receiveShadow>
            <boxGeometry args={[spec.width, 0.02, spec.depth]} />
            <meshStandardMaterial color={color} roughness={1} />
          </mesh>
        );
      case "plant":
        return (
          <group>
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.16, 0.4, 20]} />
              <meshStandardMaterial color="#9c6b4a" />
            </mesh>
            <mesh position={[0, 0.9, 0]} castShadow>
              <sphereGeometry args={[0.45, 20, 20]} />
              <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>
          </group>
        );
      case "lamp":
        return (
          <group>
            <mesh position={[0, 0.75, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 1.5, 12]} />
              <meshStandardMaterial color="#3a3a3a" />
            </mesh>
            <mesh position={[0, 1.55, 0]}>
              <coneGeometry args={[0.22, 0.3, 20, 1, true]} />
              <meshStandardMaterial color={color} side={THREE.DoubleSide} />
            </mesh>
            <pointLight position={[0, 1.45, 0]} intensity={6} distance={5} color="#ffd9a0" />
          </group>
        );
      case "tv":
        return (
          <group>
            <mesh position={[0, spec.height / 2 + 0.5, 0]} castShadow>
              <boxGeometry args={[spec.width, spec.height, spec.depth]} />
              <meshStandardMaterial color={color} roughness={0.3} metalness={0.3} />
            </mesh>
            <mesh position={[0, spec.height / 2 + 0.5, spec.depth / 2 + 0.005]}>
              <planeGeometry args={[spec.width - 0.05, spec.height - 0.05]} />
              <meshStandardMaterial color="#0f1b26" emissive="#12303f" emissiveIntensity={0.5} />
            </mesh>
          </group>
        );
      case "chair":
        return (
          <group>
            <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[spec.width, 0.08, spec.depth]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.72, -spec.depth / 2 + 0.05]} castShadow>
              <boxGeometry args={[spec.width, 0.5, 0.07]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      default:
        return (
          <mesh position={[0, spec.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[spec.width, spec.height, spec.depth]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        );
    }
  };

  return (
    <group
      position={[item.x, 0, item.z]}
      rotation={[0, rot, 0]}
      onClick={(e) => {
        if (!onSelect) return;
        e.stopPropagation();
        onSelect(item.id);
      }}
    >
      {body()}
      {selected && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(spec.width, spec.depth) / 2 + 0.05, Math.max(spec.width, spec.depth) / 2 + 0.14, 40]} />
          <meshBasicMaterial color="#f2a13c" />
        </mesh>
      )}
    </group>
  );
}

export function RoomScene({
  plan,
  design,
  photos,
  showCeiling = true,
  selectedId,
  onSelect,
}: {
  plan: FloorPlan;
  design: Design;
  photos?: Partial<Record<string, string>> | undefined;
  showCeiling?: boolean | undefined;
  selectedId?: string | null | undefined;
  onSelect?: ((id: string) => void) | undefined;
}) {
  const lightTone =
    design.lighting === "warm" ? "#ffd7a8" : design.lighting === "cool" ? "#cfe1ff" : "#ffffff";
  const ambient = design.lighting === "cool" ? 0.75 : 0.6;

  return (
    <group>
      <ambientLight intensity={ambient} color={lightTone} />
      <hemisphereLight args={[lightTone, "#3a3a3a", 0.5]} />
      <directionalLight
        position={[plan.widthM / 2, plan.heightM * 2.2, -plan.lengthM]}
        intensity={1.1}
        color={lightTone}
        castShadow
      />
      <pointLight
        position={[plan.widthM / 2, plan.heightM - 0.25, plan.lengthM / 2]}
        intensity={design.lighting === "warm" ? 22 : 16}
        distance={Math.max(plan.widthM, plan.lengthM) * 2.4}
        color={lightTone}
        castShadow
      />

      {/* Floor */}
      <mesh
        position={[plan.widthM / 2, 0, plan.lengthM / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[plan.widthM, plan.lengthM]} />
        {photos?.["floor"] ? (
          <SurfaceTexturedMaterial url={photos["floor"]} />
        ) : (
          <meshStandardMaterial color={design.floorColor} roughness={0.75} />
        )}
      </mesh>

      {/* Ceiling — rendered only if showCeiling is true */}
      {showCeiling && (
        <mesh
          position={[plan.widthM / 2, plan.heightM, plan.lengthM / 2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[plan.widthM, plan.lengthM]} />
          {photos?.["ceiling"] ? (
            <SurfaceTexturedMaterial url={photos["ceiling"]} />
          ) : (
            <meshStandardMaterial color="#f4f2ee" roughness={1} />
          )}
        </mesh>
      )}

      {plan.walls.map((wall) => (
        <WallMesh
          key={wall.id}
          wall={wall}
          openings={plan.openings.filter((o) => o.wallId === wall.id)}
          color={design.wallColor}
          photoUrl={photos?.[wall.id]}
        />
      ))}

      {plan.openings.map((o) => {
        const wall = plan.walls.find((w) => w.id === o.wallId);
        if (!wall) return null;
        return <OpeningInsert key={o.id} wall={wall} opening={o} />;
      })}

      {design.furniture.map((item) => (
        <FurniturePiece
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
