let scene, camera, renderer, controls, line, pointA, pointB;
let transformControl;

// Функция расчета угла наклона и азимута
function calculateAngleAndAzimuth(pointA, pointB) {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;
  const dz = pointB.z - pointA.z;

  // Угол наклона к плоскости XY (в градусах)
  const angleXY = Math.atan2(Math.sqrt(dx * dx + dy * dy), dz) * (180 / Math.PI);

  // Азимут (угол в плоскости XY относительно оси X)
  const azimuth = Math.atan2(dy, dx) * (180 / Math.PI);

  return {
    angle: angleXY,
    azimuth: azimuth < 0 ? azimuth + 360 : azimuth // Приводим азимут к диапазону [0, 360]
  };
}

// Настройка TransformControls
function setupTransformControls(camera, renderer, scene, objects) {
  transformControl = new THREE.TransformControls(camera, renderer.domElement);
  transformControl.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value;
  });

  scene.add(transformControl);

  // Переключение режима трансформации по нажатию клавиш
  window.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 't': // Translate
        transformControl.setMode('translate');
        break;
      case 'r': // Rotate
        transformControl.setMode('rotate');
        break;
      case 's': // Scale
        transformControl.setMode('scale');
        break;
    }
  });

  // Добавляем объекты для управления
  objects.forEach((obj) => {
    obj.addEventListener('click', () => {
      transformControl.attach(obj);
    });
  });
}

// Инициализация сцены
function init() {
  // Создаем сцену, камеру и рендерер
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  camera.position.set(5, 5, 5);
  controls.update();

  // Освещение
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 10, 10).normalize();
  scene.add(light);

  // Точки A и B
  pointA = createPoint(0, 0, 0, 0xff0000); // Красная точка
  pointB = createPoint(3, 3, 3, 0x0000ff); // Синяя точка

  // Линия между точками
  line = createLine(pointA.position, pointB.position);
  scene.add(line);

  // Настройка TransformControls
  setupTransformControls(camera, renderer, scene, [pointA, pointB]);

  // Обновление линии и расчетов при изменении позиций точек
  function updateLineAndCalculations() {
    line.geometry.vertices[0].copy(pointA.position);
    line.geometry.vertices[1].copy(pointB.position);
    line.geometry.verticesNeedUpdate = true;

    const { angle, azimuth } = calculateAngleAndAzimuth(
      pointA.position,
      pointB.position
    );

    document.getElementById('angle').innerText = angle.toFixed(2);
    document.getElementById('azimuth').innerText = azimuth.toFixed(2);
    document.getElementById('pointA-coords').innerText = `${pointA.position.x.toFixed(2)}, ${pointA.position.y.toFixed(2)}, ${pointA.position.z.toFixed(2)}`;
    document.getElementById('pointB-coords').innerText = `${pointB.position.x.toFixed(2)}, ${pointB.position.y.toFixed(2)}, ${pointB.position.z.toFixed(2)}`;
  }

  transformControl.addEventListener('objectChange', updateLineAndCalculations);
}

// Создание точки
function createPoint(x, y, z, color) {
  const geometry = new THREE.SphereGeometry(0.1, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(x, y, z);
  scene.add(sphere);
  return sphere;
}

// Создание линии
function createLine(pointA, pointB) {
  const geometry = new THREE.Geometry();
  geometry.vertices.push(pointA.clone(), pointB.clone());
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  return new THREE.Line(geometry, material);
}

// Анимация
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Запуск
init();
animate();
