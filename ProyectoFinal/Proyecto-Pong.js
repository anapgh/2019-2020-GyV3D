console.log('Ejecutando el js...');

var stepX = 0.15;
var stepY = 0.25;
var sizeBall = 1;
//-- variable de velocidad
var v_SpeedBall = 1;
var v_Max = 2;
var v_Min = 1;
//-- Variables longitud
var longUser = 3;
var longCpu = 3;
//-- Limites izquierdo y derecho
var maxLeftBorder = -7;
var maxRightBorder = 7;
//-- Point counter
var counterUser = 0;
var counterCpu = 0;
//-- variable startGame
var startGame = false;
//-- inicial position x
var pos_CpuX = 0;
var pos_UserX = 0;


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
  var floor = getFloor();

  scene.add(light);
  scene.add(leftBorder);
  scene.add(rightBorder);
  scene.add(cpu);
  scene.add(user);
  scene.add(ball);
  scene.add(floor);

  var borders = [ leftBorder, rightBorder, cpu, user];

  animate(ball, borders, renderer, scene, camera);
}

function animate(ball, borders, renderer, scene, camera) {
  cpu = borders[2];
  user = borders[3];
  checkCollision(ball, borders, cpu, user);
  getPointCounter(ball);
  // Actualizo posicion de la raqueta user
  moveUser(user);
  // Actualizo posicion bola ball
  moveBall(ball);
  // Actualizo posicion de la raqueta cpu
  moveCpu(cpu, ball);

  renderer.render(scene, camera);

  requestAnimationFrame(function() {
    animate(ball, borders, renderer, scene, camera);
  });
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
   ball.position.x += stepX * v_SpeedBall;
   ball.position.y += stepY * v_SpeedBall;
  }
}

function getFloor() {
  var geometry = new THREE.PlaneGeometry(15, 20);
  var mesh = new THREE.Mesh(geometry, getMaterial('Floor'));
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
  var floorChecked = document.querySelector('input[name="floor"]:checked');
  switch (name) {
    case 'Border':
      var texture = new THREE.TextureLoader().load("wood.png");
      break;
    case 'Floor':
      if(floorChecked == 'Textura1'){
        var texture = new THREE.TextureLoader().load("floor.jpg");
      }else if (floorChecked == 'Textura2') {
        var texture = new THREE.TextureLoader().load("wood.png");
      }else{
        var texture = new THREE.TextureLoader().load("users.jpg");
      }
      break;
    case 'Ball':
      var texture = new THREE.TextureLoader().load("ball.jpg");
      break;
    case 'Users':
      var texture = new THREE.TextureLoader().load("users.jpg");
      break;
  }
  var material = new THREE.MeshPhysicalMaterial({
    map : texture
  });
  material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
  material.map.repeat.set(4, 4);
  material.side = THREE.DoubleSide;

  return material;
}

//-- CPU
function moveCpu(cpu, ball){
  cpu.position.x = ball.position.x * 0.6;
  if (cpu.position.x > 7){
    cpu.position.x = 7;
  }if (cpu.position.x < -7){
     cpu.position.x = -7;
  }
}

//-- USER
function moveUser(user){
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
        document.getElementById("display").innerHTML = ('')
        startGame = true;
        break;
      default:
        break;
    }
  }
}

function speedBallDown(user){
  console.log('Velocidad: ' , v_SpeedBall);
  diference = Math.abs(pos_UserX - user.position.x);
  console.log('Diferencia ', diference);
  if(diference < v_Min){
    v_SpeedBall = v_Min;
  }else if (diference > v_Max) {
    v_SpeedBall = v_Max;
  }else{
    v_SpeedBall = diference;
  }
  console.log('incremento bola ', v_SpeedBall);
}

function speedBallTop(cpu){
  console.log('Velocidad: ' , v_SpeedBall);
  diference = Math.abs(pos_CpuX - cpu.position.x);
  console.log('Diferencia ', diference);
  if(diference < v_Min){
    v_SpeedBall = v_Min;
  }else if (diference > v_Max) {
    v_SpeedBall = v_Max;
  }else{
    v_SpeedBall = diference;
  }
  console.log('incremento bola ', v_SpeedBall);
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
        pos_CpuX = cpu.position.x;
        console.log('posicion actual ', pos_CpuX);
        speedBallDown(user);
      }

      if (collisionResults[0].object.name == "top") {
        stepY *= -1;
        pos_UserX = user.position.x;
        console.log('posicion actual ', pos_UserX)
        speedBallTop(cpu);
      }
      break;
    }
  }
}

function getPointCounter(ball){
  if (ball.position.y < -10){
    ball.position.x = 0;
    ball.position.y = 0;
    startGame = false;
    stepY = -stepY;
    counterCpu += 1;
 }

  if (ball.position.y > 10){
    ball.position.x = 0;
    ball.position.y = 0;
    startGame = false;
    stepY = -stepY;
    counterUser += 1;
  }

  if((counterCpu || counterUser) == 5){
    startGame = false;
    if(counterCpu == 5){
      console.log('The winner is: CPU');
      document.getElementById("display").innerHTML = (` CPU wins! ${counterCpu} - ${counterUser}. Press space to start again`);
    }else {
      console.log('The winner is: User');
      document.getElementById("display").innerHTML = (` User wins! ${counterCpu} - ${counterUser}. Press space to start again`);
    }
    counterCpu = 0;
    counterUser = 0;

  }
document.getElementById("points").innerHTML = (`CPU: ${counterCpu} - User ${counterUser}`);

}
