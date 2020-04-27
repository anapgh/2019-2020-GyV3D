console.log('Ejecutando el js...');

//-- Ball
var stepX = 0.15;
var stepY = 0.25;
var sizeBall = 1;
//-- Speed
var v_SpeedBall = 1;
var v_Max = 1.5;
var v_Min = 0.75;
//-- Angle
var a_AngleBall = 1;
//-- Length
var longUser = 3;
var longCpu = 3;
//-- Left and right limits
var maxLeftBorder = -7;
var maxRightBorder = 7;
//-- Point counter
var counterUser = 0;
var counterCpu = 0;
var counterText = 'CPU: 0 - USER: 0';
//-- Start the game
var startGame = false;
//-- Initial position x of the cpu and user
var pos_CpuX = 0;
var pos_UserX = 0;
//-- Floor texture
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

  // Load the background texture
  var texture = THREE.ImageUtils.loadTexture('publico3.jpg');
  var backgroundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 2, 0),
      new THREE.MeshBasicMaterial({
          map: texture
      }));

  backgroundMesh.material.depthTest = false;
  backgroundMesh.material.depthWrite = false;

  // Create your background scene
  var backgroundScene = new THREE.Scene();
  var backgroundCamera = new THREE.Camera();
  backgroundScene.add(backgroundCamera);
  backgroundScene.add(backgroundMesh);

  // Rendering function
  var render = function () {
      requestAnimationFrame(render);
      renderer.autoClear = false;
      renderer.clear();
      renderer.render(backgroundScene , backgroundCamera);
  };
  render();

  //-- Get objects
  var light = getLight();
  var leftBorder = getBorder("left", 1, 20, 2, maxLeftBorder, 0, 0);
  var rightBorder = getBorder("right", 1, 20, 2, maxRightBorder, 0, 0);
  var cpu = getBorder("top", longCpu, 1, 2, 0, 10, 0);
  var user = getBorder("down", longUser, 1, 2, 0, -9.5, 0);
  var ball = getBall();
  var floor = getFloor("Floor");

  //-- Add objects
  scene.add(light);
  scene.add(leftBorder);
  scene.add(rightBorder);
  scene.add(cpu);
  scene.add(user);
  scene.add(ball);
  scene.add(floor);

  var borders = [ leftBorder, rightBorder, cpu, user];

//-- Move user
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
        //-- Read new texture of floor
        readTexture(scene);
        break;
      default:
        break;
    }
  }

  animate(ball, borders, renderer, scene, camera);
  //-- Get the text with the counter
  getText('counter', scene);
}

function animate(ball, borders, renderer, scene, camera) {
  cpu = borders[2];
  user = borders[3];
  checkCollision(ball, borders, cpu, user);
  //-- Get points
  getPointCounter(ball, scene);
  //-- Update ball position
  moveBall(ball);
  //-- Update cpu position
  moveCpu(cpu, ball);

  renderer.render(scene, camera);

  requestAnimationFrame(function() {
    animate(ball, borders, renderer, scene, camera);
  });
}

//-- Read floor texture
function readTexture(scene){
  var object1 = scene.getObjectByName('Floor');

  //-- if there is already an object with that name it is deleted
  if (object1){
    scene.remove(object1);
  }
  //-- Get the texture from the html and add to scene
  tex_floor = document.querySelector('input[name="Floor"]:checked').value;
  floor = getFloor("Floor");
  scene.add(floor);
}

//-- LIGHT
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

//-- BALL
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

//-- FLOOR
function getFloor(name) {
  var geometry = new THREE.PlaneGeometry(15, 20);
  var mesh = new THREE.Mesh(geometry, getMaterial(name));
  mesh.receiveShadow = true;

  return mesh;
}

//-- BORDERS
function getBorder(name, x, y, z, posX, posY, posZ) {
  var geometry = new THREE.BoxGeometry(x, y, z);
  var mesh = new THREE.Mesh(geometry, getMaterial('Border'));
  mesh.receiveShadow = true;
  mesh.position.set(posX, posY, posZ);
  mesh.name = name;

  return mesh;
}

//-- Put texture on the borders, ball and floor
function getMaterial(name) {
  switch (name) {
    case 'Border':
      var texture = new THREE.TextureLoader().load("wood.png");
      break;
    case 'Floor':
      if(tex_floor == 'Texture1'){
        var texture = new THREE.TextureLoader().load("verde.png");
      }else if (tex_floor == 'Texture2') {
        var texture = new THREE.TextureLoader().load("azul.png");
      }else{
        var texture = new THREE.TextureLoader().load("rojo.png");
      }
      break;
    case 'Ball':
      var texture = new THREE.TextureLoader().load("tenis.jpg");
      break;
  }
  var material = new THREE.MeshPhysicalMaterial({
    map : texture
  });
  material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
  material.side = THREE.DoubleSide;

  return material;
}

//-- Get the text of the point counter
function getText(name, scene){
  var loader = new THREE.FontLoader();
  loader.load( 'Data Control_Latin.json', function ( font ) {
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
    var texture = new THREE.TextureLoader().load("tierra2.jpg")
    var material = new THREE.MeshBasicMaterial({
     map : texture
    });
    var text = new THREE.Mesh(geometry, material);
    text.name = name;
    text.position.set(-19,40,0);
    text.rotation.x = -5;
    scene.add(text);

  });
}

//-- CPU
function moveCpu(cpu, ball){
  //-- Set difficulty
  var level = document.querySelector('input[name="level"]:checked').value;
  if (level == 'Easy'){
    cpu.position.x = ball.position.x * 0.2;
  }else if (level == 'Medium') {
    cpu.position.x = ball.position.x * 0.6;
  }else if (level == 'Impossible') {
    cpu.position.x = ball.position.x;
  }
  //-- Limit movement
  if (cpu.position.x > 7){
    cpu.position.x = 7;
  }if (cpu.position.x < -7){
     cpu.position.x = -7;
  }
}


//-- Ball speed
function speedBall(user, cpu, typeBorder){
  //-- Difference between previous and current position
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

//-- Ball angle
function angleBall(user, cpu, typeBorder, ball){
  //-- Difference between position of racket and ball
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
        //-- Save the position of the CPU when it hits the bottom
        pos_CpuX = cpu.position.x;
        //-- Ball speed and angle
        speedBall(user, cpu,'down');
        angleBall(user, cpu, 'down', ball);
      }

      if (collisionResults[0].object.name == "top") {
        stepY *= -1;
        //-- Save the position of the User when it hits the bottom
        pos_UserX = user.position.x;
        //-- Ball speed and angle
        speedBall(user, cpu,'top');
        angleBall(user, cpu, 'top', ball);
      }
      break;
    }
  }
}

//-- Points Counter
function getPointCounter(ball, scene){
  //-- User counter
  if (ball.position.y < -10){
    ball.position.x = 0;
    ball.position.y = 0;
    startGame = false;
    stepY = -stepY;
    counterCpu += 1;
    counterText = (`CPU: ${counterCpu} - USER: ${counterUser}`);
    getText('counter', scene);
 }
  //-- CPU counter
  if (ball.position.y > 10){
    ball.position.x = 0;
    ball.position.y = 0;
    startGame = false;
    stepY = -stepY;
    counterUser += 1;
    counterText = (`CPU: ${counterCpu} - USER: ${counterUser}`);
    getText('counter', scene);
  }

  //-- Winners
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
