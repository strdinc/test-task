// Создание сцены
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("three-canvas") });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// CSS2DRenderer для текстовых меток
const labelRenderer = new THREE.CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// Камеры (вращение, приближение)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
camera.position.set(5, 5, 10);
controls.update();

// Сетка
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

// Плоскость XY
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.2, transparent: true });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Оси
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Текстовые метки для осей
function createAxisLabel(text, position, color = 'white') {
  const label = document.createElement('div');
  label.textContent = text;
  label.style.color = color;
  label.style.fontSize = '16px';
  label.style.fontFamily = 'Arial, sans-serif';
  label.style.userSelect = 'none';
  const labelObject = new THREE.CSS2DObject(label);
  labelObject.position.set(position.x, position.y, position.z);
  return labelObject;
}

// Добавляем метки для осей
scene.add(createAxisLabel('X', new THREE.Vector3(6, 0, 0), 'red'));
scene.add(createAxisLabel('Y', new THREE.Vector3(0, 6, 0), 'green'));
scene.add(createAxisLabel('Z', new THREE.Vector3(0, 0, 6), 'blue'));

// Точки A и B
const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
const materialA = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const materialB = new THREE.MeshBasicMaterial({ color: 0x0000ff });

const pointA = new THREE.Mesh(sphereGeometry, materialA);
const pointB = new THREE.Mesh(sphereGeometry, materialB);
scene.add(pointA);
scene.add(pointB);

// Исходные координаты
pointA.position.set(1, 1, 1);
pointB.position.set(4, 4, 4);

// Линия между точками
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 5 });
const lineGeometry = new THREE.BufferGeometry();
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

// Линия, параллельная оси Y (на плоскости XY)
const yLineMaterial = new THREE.LineBasicMaterial({ color: 0xffa500, linewidth: 5 });
const yLineGeometry = new THREE.BufferGeometry();
const yLine = new THREE.Line(yLineGeometry, yLineMaterial);
scene.add(yLine);

// Проекция точки B на плоскость XY
const projectionMaterial = new THREE.LineBasicMaterial({ color: 0xffa500, linewidth: 5 });
const projectionGeometry = new THREE.BufferGeometry();
const projectionLine = new THREE.Line(projectionGeometry, projectionMaterial);
scene.add(projectionLine);

// Линия, параллельная оси X (на плоскости XZ)
const xLineMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 5 });
const xLineGeometry = new THREE.BufferGeometry();
const xLine = new THREE.Line(xLineGeometry, xLineMaterial);
scene.add(xLine);

// Проекция точки B на плоскость XZ
const projectionXZMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 5 });
const projectionXZGeometry = new THREE.BufferGeometry();
const projectionXZLine = new THREE.Line(projectionXZGeometry, projectionXZMaterial);
scene.add(projectionXZLine);

// Дуга для угла наклона
const arcMaterial = new THREE.LineBasicMaterial({ color: 0xffa500, linewidth: 5 });
let arc = null;

// Дуга для азимута
const azimuthArcMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 5 });
let azimuthArc = null;

// Transform Controls
const transformControlsA = new THREE.TransformControls(camera, renderer.domElement);
const transformControlsB = new THREE.TransformControls(camera, renderer.domElement);
transformControlsA.attach(pointA);
transformControlsB.attach(pointB);
scene.add(transformControlsA);
scene.add(transformControlsB);

// Изначально скрываем контроллеры
transformControlsA.visible = false;
transformControlsB.visible = false;

// Отключение контроллеров, когда они не видны
function updateTransformControls() {
  transformControlsA.enabled = transformControlsA.visible;
  transformControlsB.enabled = transformControlsB.visible;
}

// Обработчик кликов
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  // Получаем координаты мыши
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Определяем объекты, пересекаемые лучом
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([pointA, pointB]);

  if (intersects.length > 0) {
    const clickedPoint = intersects[0].object;

    // Скрываем контроллеры
    transformControlsA.visible = false;
    transformControlsB.visible = false;

    // Показываем контроллер для выбранной точки
    if (clickedPoint === pointA) {
      transformControlsA.visible = true;
    } else if (clickedPoint === pointB) {
      transformControlsB.visible = true;
    }
  } else {
    transformControlsA.visible = false;
    transformControlsB.visible = false;
  }

  updateTransformControls();
}

window.addEventListener('click', onMouseClick);

// Отключение вращения сцены при перемещении точек
function addTransformListeners(control) {
  control.addEventListener("dragging-changed", (event) => {
    controls.enabled = !event.value;
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

  // Вектор AB
  const AB = new THREE.Vector3(bx - ax, by - ay, bz - az);

  // Проекция вектора AB на плоскость XY
  const AB_XY = new THREE.Vector3(bx - ax, by - ay, 0);

  // Угол наклона к плоскости XY
  const cosTheta = AB.dot(AB_XY) / (AB.length() * AB_XY.length());
  const tiltAngle = Math.acos(cosTheta) * (180 / Math.PI);

  // Азимут
  const azimuth = Math.atan2(AB.z, AB.x) * (180 / Math.PI);

  // Обновляем HTML
  document.getElementById("coordsA").innerText = `x:${ax}, y:${ay}, z:${az}`;
  document.getElementById("coordsB").innerText = `x:${bx}, y:${by}, z:${bz}`;
  document.getElementById("angle").innerText = tiltAngle.toFixed(2);
  document.getElementById("azimuth").innerText = azimuth.toFixed(2);

  // Проекция точки B на плоскость XY
  const projectionB = new THREE.Vector3(bx, by, az);

  // Обновляем линию проекции
  const projectionPositions = new Float32Array([
    pointA.position.x, pointA.position.y, pointA.position.z,
    projectionB.x, projectionB.y, projectionB.z
  ]);
  projectionLine.geometry.setAttribute("position", new THREE.BufferAttribute(projectionPositions, 3));

  // Линия, параллельная оси Y (на плоскости XY)
  const yLinePositions = new Float32Array([
    pointA.position.x, pointA.position.y, pointA.position.z,
    pointA.position.x, projectionB.y, pointA.position.z
  ]);
  yLine.geometry.setAttribute("position", new THREE.BufferAttribute(yLinePositions, 3));

  // Проекция точки B на плоскость XZ
  const projectionXZ = new THREE.Vector3(bx, ay, bz);

  // Обновляем линию проекции на плоскость XZ
  const projectionXZPositions = new Float32Array([
    pointA.position.x, pointA.position.y, pointA.position.z,
    projectionXZ.x, projectionXZ.y, projectionXZ.z
  ]);
  projectionXZLine.geometry.setAttribute("position", new THREE.BufferAttribute(projectionXZPositions, 3));

  // Линия, параллельная оси X (на плоскости XZ)
  const xLinePositions = new Float32Array([
    pointA.position.x, pointA.position.y, pointA.position.z,
    projectionXZ.x, pointA.position.y, pointA.position.z
  ]);
  xLine.geometry.setAttribute("position", new THREE.BufferAttribute(xLinePositions, 3));

  // Дуга для угла наклона (между линией, параллельной Y, и проекцией)
  if (arc) scene.remove(arc);

  const arcPoints = [];
  const radius = 1; // Радиус дуги
  const startAngle = Math.PI / 2; // Начинаем с направления вдоль оси Y
  const endAngle = startAngle - Math.atan2(projectionB.x - pointA.position.x, projectionB.y - pointA.position.y);

  for (let i = 0; i <= 20; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / 20);
    const x = pointA.position.x + Math.cos(angle) * radius;
    const y = pointA.position.y + Math.sin(angle) * radius;
    const z = pointA.position.z;
    arcPoints.push(new THREE.Vector3(x, y, z));
  }

  const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
  arc = new THREE.Line(arcGeometry, arcMaterial);
  scene.add(arc);

  // Дуга для азимута (между линией, параллельной X, и проекцией на плоскость XZ)
  if (azimuthArc) scene.remove(azimuthArc);

  const azimuthArcPoints = [];
  const azimuthRadius = 1;
  const azimuthStartAngle = 0;
  const azimuthEndAngle = Math.atan2(projectionXZ.z - pointA.position.z, projectionXZ.x - pointA.position.x);

  for (let i = 0; i <= 20; i++) {
    const angle = azimuthStartAngle + (azimuthEndAngle - azimuthStartAngle) * (i / 20);
    const x = pointA.position.x + Math.cos(angle) * azimuthRadius;
    const y = pointA.position.y;
    const z = pointA.position.z + Math.sin(angle) * azimuthRadius;
    azimuthArcPoints.push(new THREE.Vector3(x, y, z));
  }

  const azimuthArcGeometry = new THREE.BufferGeometry().setFromPoints(azimuthArcPoints);
  azimuthArc = new THREE.Line(azimuthArcGeometry, azimuthArcMaterial);
  scene.add(azimuthArc);
}

// Анимация
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();

updateLine();
calculateAngles();
