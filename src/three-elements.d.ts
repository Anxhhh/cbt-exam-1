import { Object3DNode } from '@react-three/fiber';
import { SphereGeometry, MeshStandardMaterial, InstancedMesh, Fog, AmbientLight, PointLight, DirectionalLight } from 'three';

declare module '@react-three/fiber' {
    interface ThreeElements {
        sphereGeometry: Object3DNode<SphereGeometry, typeof SphereGeometry>;
        meshStandardMaterial: Object3DNode<MeshStandardMaterial, typeof MeshStandardMaterial>;
        instancedMesh: Object3DNode<InstancedMesh, typeof InstancedMesh>;
        fog: Object3DNode<Fog, typeof Fog>;
        ambientLight: Object3DNode<AmbientLight, typeof AmbientLight>;
        pointLight: Object3DNode<PointLight, typeof PointLight>;
        directionalLight: Object3DNode<DirectionalLight, typeof DirectionalLight>;
    }
}
