var images,
  flapNoise,
  docHeight,
  docWidth,
  cvs,
  ctx,
  pipes = [];
var birdPos;
var birdYPos;
var count = 1;
var pace = 4;
var score = 0;
var scoreTxt;
var readyToScore = true;
var pipeGap = 800;

function initPipes() {
  pipes[0] = {
    x: 500,
    cst: 180 * Math.random() + 180
  };
  for (var i = 1; i < 20; i++) {
    pipes.push({
      x: pipes[i - 1].x + 400,
      cst: 300 * Math.random() + 300
    });
  }
}

function bindEvents() {
  // Space bar
  document.body.onkeyup = function(e) {
    if (e.keyCode == 32) {
      eventBus("space");
    }
  };
}

function eventBus(event) {
  if (event === "space") {
    playFlap();
    birdJump();
  }
}

function makeBirdJumpIterator(yInit, advancement) {
  var x = advancement || 0;
  const iterator = {
    next: function updateJumpBirdIterator() {
      x++;
      y = -0.15 * Math.pow(x - 23, 2) + 80;
      birdYPos = yInit - y;
      return birdYPos;
    }
  };
  return iterator;
}

function playFlap() {
  flapNoise.play();
}

function birdJump() {
  birdPos = makeBirdJumpIterator(birdYPos);
}

function getImages() {
  function getBySrc(src) {
    var im = new Image();
    im.src = src;
    return im;
  }
  return {
    bird: getBySrc("src/bird.png"),
    birdRed: getBySrc("src/bird-red.png"),
    pipeBottom: getBySrc("src/pipe-bottom.png"),
    pipeTop: getBySrc("src/pipe-top.png"),
    bg: getBySrc("src/bg.png")
  };
}

function pw(percent) {
  return (percent * docWidth) / 100;
}
function ph(percent) {
  return (percent * docHeight) / 100;
}

function pwc(percent) {
  return (percent * cvs.width) / 100;
}

function pwh(percent) {
  return (percent * cvs.height) / 100;
}

function drawPipeCouple(pipe) {
  // Bottom
  ctx.drawImage(images.pipeBottom, pipe.x, pipe.cst, 80, 600);
  // Top
  ctx.drawImage(images.pipeTop, pipe.x, pipe.cst - pipeGap, 80, 600);
}

function updatePipes() {
  replacePipeIfNeeded();
  movePipes();

  function movePipes() {
    pipes.map(pipe => {
      pipe.x -= pace;
    });
  }

  function replacePipeIfNeeded() {
    if (pipes[0].x < -80) {
      pipes.shift();
      pipes.push({
        x: pipes[pipes.length - 1].x + 400,
        cst: 180 * Math.random() + 180
      });
      readyToScore = true;
    }
  }
}

function checkFail() {
  if (touchesBottomPipe() || touchesTopPipe() || touchesGround()) {
    alert("Fail");
  }

  function touchesBottomPipe() {
    return (
      birdYPos + 35 >= pipes[0].cst &&
      (50 + 60 >= pipes[0].x && 50 + 60 <= pipes[0].x + 80)
    );
  }

  function touchesTopPipe() {
    return (
      birdYPos <= pipes[0].cst - pipeGap &&
      (50 + 60 >= pipes[0].x && 50 + 60 <= pipes[0].x + 80)
    );
  }

  function touchesGround() {
    return birdYPos + 35 >= cvs.height;
  }
}

function checkSuccess() {
  if (readyToScore && pipes[0].x + 80 <= 50) {
    addOneSuccess();
  }
  function addOneSuccess() {
    readyToScore = false;
    score++;
    scoreTxt.textContent = "Score: " + score.toString();
  }
}

function updatePace() {
  if (count % 250 === 0) {
    count = 0;
    pace++;
  }
}

function draw() {
  updatePace();
  checkFail();
  checkSuccess();
  updatePipes();
  ctx.drawImage(images.bg, 0, 0, cvs.width, cvs.height);
  ctx.drawImage(images.bird, 50, birdPos.next(), 60, 35);
  pipes.map(pipe => {
    drawPipeCouple(pipe);
  });
  requestAnimationFrame(draw);
  count++;
}

// 210 <= x <= 390

function initGlobals() {
  docHeight = document.body.clientHeight;
  docWidth = document.body.clientWidth;
  images = getImages();
  flapNoise = new Audio("src/flap.mp3");
}

function game() {
  initGlobals();
  cvs = document.getElementById("canvas");
  cvs.width = pw(100);
  cvs.height = ph(100);
  ctx = cvs.getContext("2d");
  birdPos = makeBirdJumpIterator(200, (advancement = 23));
  scoreTxt = document.getElementById("score");
  bindEvents();
  initPipes();
  draw();
}

setTimeout(game, 300);
