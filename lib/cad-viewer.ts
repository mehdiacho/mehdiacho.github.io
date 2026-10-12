import { Box3, Color, DirectionalLight, HemisphereLight, Mesh, Object3D, PerspectiveCamera, Scene, Spherical, Texture, Vector3, WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function release(root: Object3D) {
  root.traverse(object => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      for (const value of Object.values(material)) if (value instanceof Texture) value.dispose();
      material.dispose();
    }
  });
}

/** Render on camera/size changes, without a perpetual animation loop. */
export async function createCadViewer(host: HTMLElement, src: string, alt: string, signal: AbortSignal, onError: () => void) {
  const response = await fetch(src, { signal });
  if (!response.ok) throw new Error('Model unavailable');
  const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), new URL('.', new URL(src, location.href)).href);
  if (signal.aborted) { release(gltf.scene); throw new DOMException('Aborted', 'AbortError'); }
  let renderer: WebGLRenderer;
  try { renderer = new WebGLRenderer({ antialias: true }); }
  catch (error) { release(gltf.scene); throw error; }
  const scene = new Scene(); scene.background = new Color('#f4f1e8');
  const bounds = new Box3().setFromObject(gltf.scene);
  const size = bounds.getSize(new Vector3());
  gltf.scene.position.sub(bounds.getCenter(new Vector3()));
  const model = new Object3D(); model.add(gltf.scene);
  model.scale.setScalar(2 / Math.max(size.x, size.y, size.z));
  scene.add(model, new HemisphereLight(0xffffff, 0x7d8899, 2));
  const key = new DirectionalLight(0xffffff, 3); key.position.set(3, 5, 4); scene.add(key);
  const fill = new DirectionalLight(0xc4dcff, 1.2); fill.position.set(-3, 1, -2); scene.add(fill);
  const camera = new PerspectiveCamera(32, 1, .01, 100);
  const canvas = renderer.domElement;
  canvas.tabIndex = 0; canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `${alt}. Drag or use arrow keys to rotate; plus and minus to zoom; Home to reset.`);
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); host.append(canvas);
  const controls = new OrbitControls(camera, canvas);
  canvas.style.touchAction = 'pan-y';
  controls.minDistance = 1; controls.maxDistance = 12;
  controls.enableDamping = false; controls.enableZoom = false;
  let frame = 0, disposed = false;
  const draw = () => { if (!disposed && !frame) frame = requestAnimationFrame(() => { frame = 0; renderer.render(scene, camera); }); };
  const reset = () => {
    controls.target.set(0, 0, 0);
    camera.position.setFromSpherical(new Spherical(Math.min(10, 4.5 / Math.min(camera.aspect, 1)), 65 * Math.PI / 180, 35 * Math.PI / 180));
    controls.update(); draw();
  };
  const zoom = (factor: number) => {
    const offset = camera.position.clone().sub(controls.target);
    offset.setLength(Math.max(controls.minDistance, Math.min(controls.maxDistance, offset.length() * factor)));
    camera.position.copy(controls.target).add(offset); controls.update(); draw();
  };
  const keys = (event: KeyboardEvent) => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') return reset();
    if (['+','=','-'].includes(event.key)) return zoom(event.key === '-' ? 1.15 : 1 / 1.15);
    const orbit = new Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    if (event.key === 'ArrowLeft') orbit.theta -= .15;
    if (event.key === 'ArrowRight') orbit.theta += .15;
    if (event.key === 'ArrowUp') orbit.phi -= .15;
    if (event.key === 'ArrowDown') orbit.phi += .15;
    orbit.makeSafe(); camera.position.copy(controls.target).add(new Vector3().setFromSpherical(orbit)); controls.update(); draw();
  };
  const resize = () => {
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); draw();
  };
  const lost = (event: Event) => { event.preventDefault(); onError(); };
  controls.addEventListener('change', draw);
  canvas.addEventListener('keydown', keys); canvas.addEventListener('webglcontextlost', lost);
  const observer = new ResizeObserver(resize); observer.observe(host);
  resize(); reset();
  return { reset, zoom, dispose() {
    disposed = true; cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
    canvas.removeEventListener('keydown', keys); canvas.removeEventListener('webglcontextlost', lost);
    release(gltf.scene); renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
  } };
}
