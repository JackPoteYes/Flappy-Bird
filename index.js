var images,
  flapNoise,
  docHeight,
  docWidth,
  cvs,
  ctx,
  pipes = [],
  grounds = [];
var birdPos;
var birdYPos;
var count = 1;
var pace = 5;
var score = 0;
var scoreTxt;
var readyToScore = true;
var pipeGap;
var pipeWidth;
var pipeHeight;
var birdXPos;
var birdWidth;
var birdHeight;
var pipeInterval;
var groundHeight;
var failGame = false;
var gameStarted = false;
var birdImage;

function initPipes() {
  pipes[0] = {
    x: pwc(130),
    cst: 180 * Math.random() + 180
  };
  for (var i = 1; i < 2; i++) {
    pipes.push({
      x: pipes[i - 1].x + pipeInterval,
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
    if (!gameStarted) {
      gameStarted = true;
    }
    playFlap();
    birdJump();
  } else if (event === "fail") {
    birdImage = images.birdRed;
    failGame = true;
  } else if (event === "success") {
    score++;
    readyToScore = false;
  }
}

function makeBirdJumpIterator(yInit, advancement) {
  var x = advancement || 0;
  const iterator = {
    next: function updateJumpBirdIterator() {
      x++;
      y = -0.035 * Math.pow(x - 18, 2) + 12;
      if (y <= 0 && !gameStarted) {
        x = 0;
      }
      birdYPos = yInit - phc(y);
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
    ground: getBySrc("src/ground.png"),
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

function phc(percent) {
  return (percent * cvs.height) / 100;
}

function drawPipeCouple(pipe) {
  ctx.lineWidth = 8;
  // Bottom
  ctx.drawImage(images.pipeBottom, pipe.x, pipe.cst, pipeWidth, pipeHeight);
  // Top
  ctx.drawImage(
    images.pipeTop,
    pipe.x,
    pipe.cst - pipeGap - pipeHeight,
    pipeWidth,
    pipeHeight
  );
}

function updatePipes() {
  if (gameStarted) {
    replacePipeIfNeeded();
    movePipes(pwc(0.1 * pace));
  }

  function movePipes(move) {
    pipes.map(pipe => {
      pipe.x -= move;
    });
  }

  function replacePipeIfNeeded() {
    if (pipes[0].x < -80) {
      pipes.shift();
      pipes.push({
        x: pipes[pipes.length - 1].x + pipeInterval,
        cst: 180 * Math.random() + 180
      });
      readyToScore = true;
    }
  }
}

function checkFail() {
  if (touchesBottomPipe() || touchesTopPipe() || touchesGround()) {
    eventBus("fail");
  }

  function touchesBottomPipe() {
    return (
      birdYPos + birdHeight >= pipes[0].cst &&
      (birdXPos + birdWidth >= pipes[0].x && birdXPos <= pipes[0].x + pipeWidth)
    );
  }

  function touchesTopPipe() {
    return (
      birdYPos <= pipes[0].cst - pipeGap &&
      (birdXPos + birdWidth >= pipes[0].x && birdXPos <= pipes[0].x + pipeWidth)
    );
  }

  function touchesGround() {
    return birdYPos + birdHeight >= cvs.height - groundHeight;
  }
}

function checkSuccess() {
  if (readyToScore && pipes[0].x + pipeWidth <= birdXPos) {
    eventBus("success");
  }
}

function updatePace() {
  if (!gameStarted) return;
  if (count % 250 === 0) {
    count = 0;
    pace++;
  }
}

function drawScore() {
  ctx.fillText(score.toString(), pwc(40), phc(10));
}

function draw() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  updatePace();
  checkFail();
  checkSuccess();
  updatePipes();
  ctx.drawImage(birdImage, birdXPos, birdPos.next(), birdWidth, birdHeight);
  pipes.map(pipe => {
    drawPipeCouple(pipe);
  });
  updateGrounds();
  drawScore();
  drawGrounds();
  if (!failGame) {
    requestAnimationFrame(draw);
  }
  count++;
}

function drawGrounds() {
  grounds.map(groundPosX => {
    ctx.drawImage(
      images.ground,
      groundPosX,
      cvs.height - groundHeight,
      cvs.width,
      groundHeight
    );
  });
}

function updateGrounds() {
  replaceGroundIfNeeded();
  moveGrounds(pwc(0.1 * pace));

  function moveGrounds(move) {
    for (var i = 0; i < grounds.length; i++) {
      grounds[i] -= move;
    }
  }

  function replaceGroundIfNeeded() {
    if (grounds[0] <= -cvs.width) {
      grounds.shift();
      grounds.push(grounds[grounds.length - 1] + cvs.width);
    }
  }
}

// 210 <= x <= 390

function initGlobals() {
  docHeight = document.body.clientHeight;
  docWidth = document.body.clientWidth;
  images = getImages();
  flapNoise = new Audio("src/flap.mp3");
  birdImage = images.bird;
}

function initProportions() {
  // Bird
  birdHeight = phc(6);
  birdWidth = pwc(11);
  birdXPos = pwc(5);

  // Pipes
  pipeWidth = pwc(12);
  pipeHeight = phc(100);
  pipeGap = phc(25);
  pipeInterval = pwc(60);

  // Ground
  groundHeight = phc(27);
}

function initGrounds() {
  for (var i = 0; i < 2; i++) {
    grounds.push(i * cvs.width);
  }
}

function game() {
  initGlobals();
  cvs = document.getElementById("canvas");
  cvs.width = pw(28);
  cvs.height = ph(85);
  initProportions();
  ctx = cvs.getContext("2d");
  ctx.fillStyle = "white";
  ctx.font = pwc(20).toString() + "px Monofett";
  birdPos = makeBirdJumpIterator(phc(30), (advancement = 0));
  scoreTxt = document.getElementById("score");
  bindEvents();
  initPipes();
  initGrounds();
  draw();
}

setTimeout(game, 300);
