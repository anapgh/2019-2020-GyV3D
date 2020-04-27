console.log('Ejecutando el js...');

var stepX = 0.15;
var stepY = 0.25;
var sizeBall = 1;
//-- variable de velocidad
var v_SpeedBall = 1;
var v_Max = 1.5;
var v_Min = 0.75;
//-- variable Angulo
var a_AngleBall = 1;
//-- Variables longitud
var longUser = 3;
var longCpu = 3;
//-- Limites izquierdo y derecho
var maxLeftBorder = -7;
var maxRightBorder = 7;
//-- Point counter
var counterUser = 0;
var counterCpu = 0;
var counterText = 'CPU: 0 - USER: 0';
//-- variable startGame
var startGame = false;
//-- inicial position x
var pos_CpuX = 0;
var pos_UserX = 0;
//-- texturas
var tex_floor;


function init() {
  var scene = new THREE.Scene();
  var sceneWidth = window.innerWidth - 20;
  var sceneHeight = window.innerHeight - 20;

  var camera = new THREE.PerspectiveCamera(90, sceneWidth / sceneHeight, 0.01, 100);
  camera.position.set(0, -10, 15);
  camera.lookAt(scene.position);

  var renderer = new THREE.WebGLRenderer({
    antialias : true
  });
  renderer.shadowMap.enabled = true;
  renderer.setSize(sceneWidth, sceneHeight);
  document.body.appendChild(renderer.domElement);

  var light = getLight();
  var leftBorder = getBorder("left", 1, 20, 2, maxLeftBorder, 0, 0);
  var rightBorder = getBorder("right", 1, 20, 2, maxRightBorder, 0, 0);
  var cpu = getBorder("top", longCpu, 1, 2, 0, 10, 0);
  var user = getBorder("down", longUser, 1, 2, 0, -9.5, 0);
  var ball = getBall();
  var floor = getFloor("Floor");

  scene.add(light);
  scene.add(leftBorder);
  scene.add(rightBorder);
  scene.add(cpu);
  scene.add(user);
  scene.add(ball);
  scene.add(floor);

  var borders = [ leftBorder, rightBorder, cpu, user];

//-- USER
  window.onkeydown = (e) => {
    e.preventDefault();
    switch (e.key) {
      case 'ArrowLeft':
        if(user.position.x > -5){
          user.position.x -= 0.35;
        }
        break;
      case 'ArrowRight':
        if(user.position.x < 5){
          user.position.x += 0.35;
        }
        break;
      case ' ':
        startGame = true;
        readTexture(scene);
        break;
      default:
        break;
    }
  }

  animate(ball, borders, renderer, scene, camera);
  getText('counter', scene);
}

function animate(ball, borders, renderer, scene, camera) {
  cpu = borders[2];
  user = borders[3];
  checkCollision(ball, borders, cpu, user);
  getPointCounter(ball, scene);
  // Actualizo posicion bola ball
  moveBall(ball);
  // Actualizo posicion de la raqueta cpu
  moveCpu(cpu, ball);

  renderer.render(scene, camera);

  requestAnimationFrame(function() {
    animate(ball, borders, renderer, scene, camera);
  });
}

function readTexture(scene){
  var object1 = scene.getObjectByName('Floor');

  if (object1){
    scene.remove(object1);
  }

  tex_floor = document.querySelector('input[name="Floor"]:checked').value;
  floor = getFloor("Floor");
  scene.add(floor);
}

function getLight() {
  var light = new THREE.DirectionalLight();
  light.position.set(4, 4, 4);
  light.castShadow = true;
  light.shadow.camera.near = 0;
  light.shadow.camera.far = 16;
  light.shadow.camera.left = -8;
  light.shadow.camera.right = 5;
  light.shadow.camera.top = 10;
  light.shadow.camera.bottom = -10;
  light.shadow.mapSize.width = 4096;
  light.shadow.mapSize.height = 4096;
  return light;
}

function getBall() {
  var geometry = new THREE.SphereGeometry(sizeBall, 20, 20);
  var mesh = new THREE.Mesh(geometry, getMaterial('Ball'));
  mesh.position.z = 1;
  mesh.castShadow = true;
  mesh.name = "ball";

  return mesh;
}

function moveBall(ball){
  if(startGame){
   ball.position.x += stepX * a_AngleBall * v_SpeedBall;
   ball.position.y += stepY * v_SpeedBall;
 }
}

function getFloor(name) {
  var geometry = new THREE.PlaneGeometry(15, 20);
  var mesh = new THREE.Mesh(geometry, getMaterial(name));
  mesh.receiveShadow = true;

  return mesh;
}

function getBorder(name, x, y, z, posX, posY, posZ) {
  var geometry = new THREE.BoxGeometry(x, y, z);
  var mesh = new THREE.Mesh(geometry, getMaterial('Border'));
  mesh.receiveShadow = true;
  mesh.position.set(posX, posY, posZ);
  mesh.name = name;

  return mesh;
}

function getMaterial(name) {
  switch (name) {
    case 'Border':
      var texture = new THREE.TextureLoader().load("wood.png");
      break;
    case 'Floor':
      if(tex_floor == 'Textura1'){
        var texture = new THREE.TextureLoader().load("verde.png");
      }else if (tex_floor == 'Textura2') {
        var texture = new THREE.TextureLoader().load("azul.png");
      }else{
        var texture = new THREE.TextureLoader().load("rojo.png");
      }
      break;
    case 'Ball':
      var texture = new THREE.TextureLoader().load("ball.jpg");
      break;
    case 'Texto':
      var texture = new THREE.TextureLoader().load("wood.png");
  }
  var material = new THREE.MeshPhysicalMaterial({
    map : texture
  });
  material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
  material.side = THREE.DoubleSide;

  return material;
}

function getText(name, scene){
  var loader = new THREE.FontLoader();
  loader.load( 'The Heart Chakra_Regular.json', function ( font ) {
    var selectedObject = scene.getObjectByName(name);
    if(selectedObject){
      scene.remove(selectedObject);
    }
    var geometry = new THREE.TextGeometry(counterText, {
      font: font,
      size: 4,
      height: 0.5,
      curveSegments: 12,
      bevelEnabled: false,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 0.1
    });
    var texture = new THREE.TextureLoader().load("wood.png")
    var material = new THREE.MeshBasicMaterial({
    map : texture
    });
    var text = new THREE.Mesh(geometry, material);
    text.name = name;
    text.position.set(-16,30,0);
    text.rotation.x = -5;
    scene.add(text);

  });
}

//-- CPU
function moveCpu(cpu, ball){
  //-- Establezco la dificultad
  var level = document.querySelector('input[name="level"]:checked').value;
  if (level == 'Easy'){
    cpu.position.x = ball.position.x * 0.2;
  }else if (level == 'Medium') {
    cpu.position.x = ball.position.x * 0.6;
  }else if (level == 'Impossible') {
    cpu.position.x = ball.position.x;
  }
  //-- Limito el movimiento
  if (cpu.position.x > 7){
    cpu.position.x = 7;
  }if (cpu.position.x < -7){
     cpu.position.x = -7;
  }
}


//-- Velocidad de la bola
function speedBall(user, cpu, typeBorder){
  //Diferencia entre posicion anterior y actual
  if(typeBorder == 'top'){
    diference = Math.abs(pos_CpuX - cpu.position.x);
  }else if (typeBorder == 'down') {
    diference = Math.abs(pos_UserX - user.position.x);
  }
  if(diference < v_Min){
    v_SpeedBall = v_Min;
  }else if (diference > v_Max) {
    v_SpeedBall = v_Max;
  }else{
    v_SpeedBall = diference;
  }
}

//-- Angulo de la bola
function angleBall(user, cpu, typeBorder, ball){
  //Diferencia entre posicion anterior y actual
  if(typeBorder == 'top'){
    distance = Math.abs(cpu.position.x - ball.position.x);
  }else if (typeBorder == 'down') {
    distance = Math.abs(user.position.x - ball.position.x);
  }
  if(distance < v_Min){
     a_AngleBall = v_Min;
  }else if (distance > v_Max) {
     a_AngleBall = v_Max;
  }else{
     a_AngleBall = distance;
  }
}


function checkCollision(ball, borders, cpu, user) {
  var originPosition = ball.position.clone();

  for (var i = 0; i < ball.geometry.vertices.length; i++) {
    var localVertex = ball.geometry.vertices[i].clone();
    var globalVertex = localVertex.applyMatrix4(ball.matrix);
    var directionVector = globalVertex.sub(ball.position);
    var ray = new THREE.Raycaster(originPosition, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(borders);
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
      // Collision detected
      if (collisionResults[0].object.name == "left" || collisionResults[0].object.name == "right") {
        stepX *= -1;
      }
      if (collisionResults[0].object.name == "down"){
        stepY *= -1;
        //-- Guarda la posicion de la Cpu cuando da abajo
        pos_CpuX = cpu.position.x;
        //-- velocidad y angulo de la bola
        speedBall(user, cpu,'down');
        angleBall(user, cpu, 'down', ball);
      }

      if (collisionResults[0].object.name == "top") {
        stepY *= -1;
        //-- Guarda la posicion del User cuando da arriba
        pos_UserX = user.position.x;
        //-- velocidad y angulo de la bola
        speedBall(user, cpu,'top');
        angleBall(user, cpu, 'top', ball);
      }
      break;
    }
  }
}

function getPointCounter(ball, scene){
  if (ball.position.y < -10){
    ball.position.x = 0;
    ball.position.y = 0;
    startGame = false;
    stepY = -stepY;
    counterCpu += 1;
    counterText = (`CPU: ${counterCpu} - USER: ${counterUser}`);
    getText('counter', scene);
 }

  if (ball.position.y > 10){
    ball.position.x = 0;
    ball.position.y = 0;
    startGame = false;
    stepY = -stepY;
    counterUser += 1;
    counterText = (`CPU: ${counterCpu} - USER: ${counterUser}`);
    getText('counter', scene);
  }

  if((counterCpu == 5) || (counterUser == 5)){
    startGame = false;
    if(counterCpu == 5){
      counterText = (`CPU wins!\n${counterCpu} - ${counterUser}\nPress space to start again`);
      getText('counter', scene);
    }else {
      counterText = (`USER wins!\n${counterCpu} - ${counterUser}\nPress space to start again`)
      getText('counter', scene);
    }
    counterCpu = 0;
    counterUser = 0;
  }
}
