let gameState = {
  counting: false,
  countTime: 0,
  maxCountTime: 180, // 3秒（60幀/秒）
  gameOver: false,
  winner: null,
  gameStarted: false,  // 新增：追蹤遊戲是否已開始
  isFrozen: false,     // 新增：追蹤是否在木頭人狀態
  turningAnimation: 0  // 新增：轉身動畫計時器
};

let player1, player2;
let countText = "";
let bgColor;

function setup() {
  createCanvas(800, 400);
  bgColor = color(220);
  
  // 初始化玩家1（鬼）
  player1 = {
    x: 1400,
    y: 200,
    width: 40,
    height: 80,
    color: color(255, 0, 0),
    isGhost: true,
    facingLeft: true
  };

  // 初始化玩家2（逃跑者）
  player2 = {
    x: 100,
    y: 200,
    width: 40,
    height: 80,
    speed: 4,
    color: color(0, 0, 255),
    canMove: true,
    isMoving: false,
    lastPosition: 100 // 記錄上一幀的位置
  };
}

function draw() {
  createCanvas(windowWidth, windowHeight);
  background(bgColor);
  
  // 畫地板
  fill(100);
  rect(0, 300, width, 100);
  
  // 更新遊戲狀態
  updateGameState();
  
  // 檢查玩家移動
  if (!gameState.gameOver) {
    checkPlayerMovement();
  }
  
  // 繪製玩家
  drawPlayers();
  
  // 繪製遊戲文字
  drawGameText();
  
  // 檢查勝利條件
  checkWinCondition();
}

function updateGameState() {
  if (gameState.counting && !gameState.gameOver) {
    gameState.countTime++;
    
    let remainingTime = floor((gameState.maxCountTime - gameState.countTime) / 60);
    
    if (!gameState.gameOver) {
      let progress = gameState.countTime / gameState.maxCountTime;
      bgColor = lerpColor(color(220), color(255, 255, 0), progress);
    }
    
    if (remainingTime >= 0) {
      countText = `${remainingTime + 1}...`;
      player1.facingLeft = true;
    }
    
    if (gameState.countTime >= gameState.maxCountTime) {
      gameState.counting = false;
      gameState.isFrozen = true;
      countText = "木頭人！";
      gameState.turningAnimation = 20; // 開始轉身動畫
      if (!gameState.gameOver) {
        bgColor = color(255, 200, 200);
      }
    }
  }
  
  // 更新轉身動畫
  if (gameState.turningAnimation > 0) {
    gameState.turningAnimation--;
    if (gameState.turningAnimation === 0) {
      player1.facingLeft = false;
      checkIfPlayerMoving(); // 轉身完成後檢查玩家是否移動
    }
  }
}

function checkPlayerMovement() {
  // 只在未結束且未被凍結時允許移動
  if (!gameState.gameOver && !gameState.isFrozen) {
    player2.lastPosition = player2.x;
    
    if (keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW)) {
      // 當玩家開始移動且遊戲尚未開始倒數時，自動開始倒數
      if (!gameState.counting && !gameState.gameStarted) {
        startCounting();
      }
      
      // 移動邏輯
      if (keyIsDown(LEFT_ARROW)) {
        player2.x = max(player2.x - player2.speed, player2.width/2);
      }
      if (keyIsDown(RIGHT_ARROW)) {
        player2.x = min(player2.x + player2.speed, width - player2.width/2);
      }
    }
    
    player2.isMoving = player2.lastPosition !== player2.x;
  }
}

// 新增：開始倒數的函數
function startCounting() {
  gameState.counting = true;
  gameState.countTime = 0;
  gameState.gameStarted = true;
  countText = "3...";
  bgColor = color(220);
}

function checkIfPlayerMoving() {
  if (player2.isMoving) {
    gameState.gameOver = true;
    gameState.winner = "鬼";
    player2.color = color(150, 0, 0);
  } else {
    // 如果玩家沒有移動，1秒後重新開始
    setTimeout(() => {
      if (!gameState.gameOver) {
        gameState.counting = true;
        gameState.countTime = 0;
        gameState.isFrozen = false;  // 解除凍結狀態
        countText = "3...";
        bgColor = color(220);
      }
    }, 1000);
  }
}

function drawPlayers() {
  // 繪製鬼（根據面向和轉身動畫狀態決定外觀）
  push(); // 保存當前繪圖狀態
  
  // 計算轉身角度
  let rotationAngle = 0;
  if (gameState.turningAnimation > 0) {
    rotationAngle = map(gameState.turningAnimation, 20, 0, PI, 0);
  }
  
  // 設置鬼的旋轉中心點
  translate(player1.x + player1.width/2, player1.y + player1.height/2);
  rotate(rotationAngle);
  translate(-player1.width/2, -player1.height/2);
  
  // 繪製鬼的身體
  fill(player1.color);
  rect(0, 0, player1.width, player1.height);
  
  // 根據面向繪製臉部特徵
  if (player1.facingLeft || gameState.turningAnimation > 0) {
    // 背對時的外觀
    fill(100);
    rect(0, 10, player1.width, 20); // 後腦勺
  } else {
    // 正面的外觀
    fill(0);
    // 眼睛
    circle(10, 20, 8);
    circle(30, 20, 8);
    // 嘴巴
    rect(12, 35, 16, 5);
  }
  
  pop(); // 恢復繪圖狀態
  
  // 繪製逃跑者
  fill(player2.color);
  rect(player2.x, player2.y, player2.width, player2.height);
  fill(0);
  circle(player2.x + 10, player2.y + 20, 8);
  circle(player2.x + 30, player2.y + 20, 8);
}

function drawGameText() {
  textSize(32);
  textAlign(CENTER);
  fill(0);
  
  if (gameState.gameOver) {
    text(`${gameState.winner}獲勝！`, width/2, 50);
    textSize(20);
    text('按 R 鍵重新開始', width/2, 90);
  } else {
    if (gameState.counting) {
      text(countText, width/2, 50);
    } else if (!gameState.gameStarted) {
      textSize(20);
      text('移動開始遊戲', width/2, 50);
    }
  }
}

function checkWinCondition() {
  // 如果逃跑者到達終點
  if (player2.x >= 1350 && !gameState.gameOver) {
    gameState.gameOver = true;
    gameState.winner = "逃跑者";
    player2.color = color(0, 255, 0); // 變綠表示勝利
  }
}

function keyPressed() {
  if ((key === 'r' || key === 'R') && gameState.gameOver) {
    resetGame();
  }
}

function resetGame() {
  gameState.counting = false;
  gameState.countTime = 0;
  gameState.gameOver = false;
  gameState.winner = null;
  gameState.gameStarted = false;
  gameState.isFrozen = false;
  gameState.turningAnimation = 0; // 重置轉身動畫
  player1.facingLeft = true;
  
  player2.x = 100;
  player2.canMove = true;
  player2.color = color(0, 0, 255);
  bgColor = color(220);
  countText = "";
}