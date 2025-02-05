// Создание сцены
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("three-canvas") });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Камеры (вращение, приближение)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
camera.position.set(5, 5, 10);
controls.update();

// Сетка
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

// Точки A и B
const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
const materialA = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const materialB = new THREE.MeshBasicMaterial({ color: 0x0000ff });

const pointA = new THREE.Mesh(sphereGeometry, materialA);
const pointB = new THREE.Mesh(sphereGeometry, materialB);
scene.add(pointA);
scene.add(pointB);

// Исходные координаты
pointA.position.set(-2, 1, 1);
pointB.position.set(3, 4, 2);

// Линия между точками
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
const lineGeometry = new THREE.BufferGeometry();
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

// Transform Controls
const transformControlsA = new THREE.TransformControls(camera, renderer.domElement);
const transformControlsB = new THREE.TransformControls(camera, renderer.domElement);
transformControlsA.attach(pointA);
transformControlsB.attach(pointB);
scene.add(transformControlsA);
scene.add(transformControlsB);

// Отключение вращения сцены при перемещении точек
function addTransformListeners(control) {
  control.addEventListener("dragging-changed", (event) => {
    controls.enabled = !event.value; // Отключаем OrbitControls во время перемещения
  });

  control.addEventListener("change", () => {
    updateLine();
    calculateAngles();
  });
}

addTransformListeners(transformControlsA);
addTransformListeners(transformControlsB);

// Обновление координат линии
function updateLine() {
  const positions = new Float32Array([
    pointA.position.x, pointA.position.y, pointA.position.z,
    pointB.position.x, pointB.position.y, pointB.position.z
  ]);
  line.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
}

// Вычисление углов и координат
function calculateAngles() {
  const ax = pointA.position.x.toFixed(2);
  const ay = pointA.position.y.toFixed(2);
  const az = pointA.position.z.toFixed(2);

  const bx = pointB.position.x.toFixed(2);
  const by = pointB.position.y.toFixed(2);
  const bz = pointB.position.z.toFixed(2);

  const dx = pointB.position.x - pointA.position.x;
  const dy = pointB.position.y - pointA.position.y;
  const dz = pointB.position.z - pointA.position.z;

  // Угол наклона к XY
  const tiltAngle = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * (180 / Math.PI);

  // Азимут
  const azimuth = Math.atan2(dz, dx) * (180 / Math.PI);

  // Обновляем HTML
  document.getElementById("coordsA").innerText = `x:${ax}, y:${ay}, z:${az}`;
  document.getElementById("coordsB").innerText = `x:${bx}, y:${by}, z:${bz}`;
  document.getElementById("angle").innerText = tiltAngle.toFixed(2);
  document.getElementById("azimuth").innerText = azimuth.toFixed(2);
}

// Анимация
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Первичный расчет
updateLine();
calculateAngles();
