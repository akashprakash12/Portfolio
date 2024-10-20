/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 butterfly.glb --transform 
Files: butterfly.glb [2.06MB] > C:\Users\HP\OneDrive\Desktop\potfolio\portfolio\public\butterfly-transformed.glb [195.68KB] (91%)
Author: assetfactory (https://sketchfab.com/assetfactory)
License: SKETCHFAB Standard (https://sketchfab.com/licenses)
Source: https://sketchfab.com/3d-models/butterfly-87ef5cea7e2f4557a28503f5b96646cd
Title: Butterfly
*/

import React from 'react'
import { useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

export function Model(props) {
  const group = React.useRef()
  const { scene, animations } = useGLTF('/butterfly.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, group)
  return (
    <group ref={group} {...props} dispose={null} rotation={[ Math.PI,0, 0]} position={[0,3,5]}>
      <group name="Sketchfab_Scene">
        <primitive object={nodes._rootJoint} />
        <skinnedMesh name="Object_15" geometry={nodes.Object_15.geometry} material={materials.Butterfly} skeleton={nodes.Object_15.skeleton} rotation={[Math.PI, 0, 0]} scale={0.498} />
        <skinnedMesh name="Object_17" geometry={nodes.Object_17.geometry} material={materials.Butterfly} skeleton={nodes.Object_17.skeleton} rotation={[Math.PI, 0, 0]} scale={0.498} />
        <skinnedMesh name="Object_19" geometry={nodes.Object_19.geometry} material={materials.Butterfly} skeleton={nodes.Object_19.skeleton} rotation={[Math.PI, 0, 0]} scale={0.498} />
        <skinnedMesh name="Object_21" geometry={nodes.Object_21.geometry} material={materials.Butterfly} skeleton={nodes.Object_21.skeleton} rotation={[Math.PI, 0, 0]} scale={0.498} />
        <skinnedMesh name="Object_23" geometry={nodes.Object_23.geometry} material={materials.Butterfly} skeleton={nodes.Object_23.skeleton} rotation={[Math.PI, 0, 0]} scale={0.498} />
        <skinnedMesh name="Object_25" geometry={nodes.Object_25.geometry} material={materials.Butterfly} skeleton={nodes.Object_25.skeleton} rotation={[Math.PI, 0, 0]} scale={0.498} />
        <skinnedMesh name="Object_27" geometry={nodes.Object_27.geometry} material={materials.Butterfly} skeleton={nodes.Object_27.skeleton} rotation={[Math.PI, 0, 0]} scale={0.498} />
      </group>
    </group>
  )
}

useGLTF.preload('/butterfly.glb')
