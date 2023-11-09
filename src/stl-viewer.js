import React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import pathToStl from "../assets/75.220.5.stl";
import matcapPorcelainWhite from "../assets/matcap-porcelain-white.jpg";
import worldImage from "../assets/world-environment.jpeg";
import TreeSTLLoader from "three-stl-loader";
import * as dat from "dat.gui";

const STLLoader = TreeSTLLoader(THREE);

const loader = new STLLoader();
const textureLoader = new THREE.TextureLoader();
const imageLoader = new THREE.ImageLoader();

const gui = new dat.GUI();

/**
 * https://threejs.org/examples/#webgl_lightprobe
 * https://github.com/mrdoob/three.js/blob/master/examples/webgl_lightprobe.html
 * @param {*} param0
 */

function initEnvironment({ scene, imageSrc }) {
  const sphere = new THREE.SphereGeometry(750, 64, 64);
  sphere.scale(-1, 1, 1);

  const texture = new THREE.Texture();

  const material = new THREE.MeshBasicMaterial({
    map: texture
  });

  imageLoader.load(imageSrc, (image) => {
    texture.image = image;
    texture.needsUpdate = true;
  });

  scene.add(new THREE.Mesh(sphere, material));
}

function createAnimate({ scene, camera, renderer }) {
  const triggers = [];

  function animate() {
    requestAnimationFrame(animate);

    triggers.forEach((trigger) => {
      trigger();
    });

    renderer.render(scene, camera);
  }
  function addTrigger(cb) {
    if (typeof cb === "function") triggers.push(cb);
  }
  function offTrigger(cb) {
    const triggerIndex = triggers.indexOf(cb);
    if (triggerIndex !== -1) {
      triggers.splice(triggerIndex, 1);
    }
  }

  return {
    animate,
    addTrigger,
    offTrigger
  };
}

export class StlViewer extends React.Component {
  componentDidMount() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      750,
      window.innerWidth / window.innerHeight,
      10,
      100000
    );

    loader.load(pathToStl, (geometry) => {
      const material = new THREE.MeshMatcapMaterial({
        color: 0xffffff,
        matcap: textureLoader.load(matcapPorcelainWhite)
      });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.geometry.computeVertexNormals(true);
      mesh.geometry.center();

      scene.add(mesh);

      mesh.rotation.x = -1.2;

      animate.addTrigger(() => {
        // mesh.rotation.x += 0.05;
        // mesh.rotation.y += 0.05;
      });
    });

    // initEnvironment({ scene, imageSrc: worldImage });

    const renderer = new THREE.WebGLRenderer();

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.maxDistance = 700;
    controls.minDistance = 100;

    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    /**
     * Light setup
     */
    const secondaryLight = new THREE.PointLight(0xff0000, 1, 100);
    secondaryLight.position.set(5, 5, 5);
    scene.add(secondaryLight);

    gui.add(secondaryLight.position, "y").min(-10).max(10).step(0.1);

    renderer.setSize(window.innerWidth, window.innerHeight);
    this.mount.appendChild(renderer.domElement);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", onWindowResize, false);

    const animate = createAnimate({ scene, camera, renderer });

    camera.position.z = 500;

    animate.animate();
  }
  render() {
    return <div ref={(ref) => (this.mount = ref)} />;
  }
}
