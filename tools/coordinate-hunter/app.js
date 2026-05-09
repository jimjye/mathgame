const boardEl = document.querySelector("#board");
const formEl = document.querySelector("#guess-form");
const inputEl = document.querySelector("#guess-input");
const timeEl = document.querySelector("#time-left");
const scoreEl = document.querySelector("#score");
const remainingEl = document.querySelector("#remaining");
const messageEl = document.querySelector("#message");
const startButton = document.querySelector("#start-button");
const resetButton = document.querySelector("#reset-button");
const foundListEl = document.querySelector("#found-list");

const MIN = -5;
const MAX = 5;
const TARGET_COUNT = 10;
const ROUND_SECONDS = 60;

let targets = new Set();
let found = new Set();
let secondsLeft = ROUND_SECONDS;
let timerId = null;
let isPlaying = false;

function coordinateKey(x, y) {
  return `${x},${y}`;
}

function parseGuess(value) {
  const match = value.trim().match(/^\(?\s*(-?\d+)\s*[,，]\s*(-?\d+)\s*\)?$/);

  if (!match) {
    return null;
  }

  return {
    x: Number(match[1]),
    y: Number(match[2]),
  };
}

function buildBoard() {
  boardEl.innerHTML = "";

  for (let y = MAX; y >= MIN; y -= 1) {
    for (let x = MIN; x <= MAX; x += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.key = coordinateKey(x, y);
      cell.setAttribute("aria-label", `座標 ${x}, ${y}`);

      if (y === 0) {
        cell.classList.add("axis-x");
      }

      if (x === 0) {
        cell.classList.add("axis-y");
      }

      if (x === 0 && y === 0) {
        cell.classList.add("origin");
        cell.textContent = "0";
      } else if (x === 0) {
        cell.textContent = y;
      } else if (y === 0) {
        cell.textContent = x;
      }

      boardEl.appendChild(cell);
    }
  }
}

function generateTargets() {
  const nextTargets = new Set();

  while (nextTargets.size < TARGET_COUNT) {
    const x = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    const y = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    nextTargets.add(coordinateKey(x, y));
  }

  targets = nextTargets;
}

function setMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.className = `message${type ? ` ${type}` : ""}`;
}

function updateStats() {
  timeEl.textContent = secondsLeft;
  scoreEl.textContent = found.size;
  remainingEl.textContent = TARGET_COUNT - found.size;
}

function updateFoundList() {
  foundListEl.innerHTML = "";

  [...found].forEach((key) => {
    const item = document.createElement("li");
    item.textContent = `(${key})`;
    foundListEl.appendChild(item);
  });
}

function markHit(key) {
  const cell = boardEl.querySelector(`[data-key="${key}"]`);

  if (cell) {
    cell.classList.add("hit");
  }
}

function endGame(reason) {
  isPlaying = false;
  clearInterval(timerId);
  timerId = null;
  inputEl.disabled = true;
  startButton.disabled = false;

  if (reason === "win") {
    setMessage("滿分！你找到了全部 10 個座標。", "success");
    return;
  }

  setMessage(`時間到。你找到 ${found.size} / ${TARGET_COUNT} 個座標。`, found.size >= 7 ? "success" : "error");
}

function tick() {
  secondsLeft -= 1;
  updateStats();

  if (secondsLeft <= 0) {
    endGame("time");
  }
}

function startGame() {
  clearInterval(timerId);
  generateTargets();
  found = new Set();
  secondsLeft = ROUND_SECONDS;
  isPlaying = true;

  buildBoard();
  updateStats();
  updateFoundList();
  setMessage("遊戲開始。輸入座標，例如：2,-3。");

  inputEl.disabled = false;
  inputEl.value = "";
  inputEl.focus();
  startButton.disabled = true;

  timerId = setInterval(tick, 1000);
}

function resetGame() {
  clearInterval(timerId);
  timerId = null;
  targets = new Set();
  found = new Set();
  secondsLeft = ROUND_SECONDS;
  isPlaying = false;

  buildBoard();
  updateStats();
  updateFoundList();
  setMessage("按開始後，找出 10 個隱藏座標。");
  inputEl.value = "";
  inputEl.disabled = true;
  startButton.disabled = false;
}

function handleGuess(event) {
  event.preventDefault();

  if (!isPlaying) {
    setMessage("請先按開始。", "error");
    return;
  }

  const guess = parseGuess(inputEl.value);

  if (!guess) {
    setMessage("格式請輸入成 x,y，例如：2,-3。", "error");
    return;
  }

  if (guess.x < MIN || guess.x > MAX || guess.y < MIN || guess.y > MAX) {
    setMessage("座標範圍是 -5 到 5。", "error");
    return;
  }

  const key = coordinateKey(guess.x, guess.y);

  if (found.has(key)) {
    setMessage(`(${key}) 已經找過了。`, "error");
    inputEl.select();
    return;
  }

  if (!targets.has(key)) {
    setMessage(`(${key}) 沒有命中，換一個點試試。`);
    inputEl.select();
    return;
  }

  found.add(key);
  markHit(key);
  updateStats();
  updateFoundList();
  setMessage(`命中 (${key})！`, "success");
  inputEl.value = "";
  inputEl.focus();

  if (found.size === TARGET_COUNT) {
    endGame("win");
  }
}

formEl.addEventListener("submit", handleGuess);
startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);

resetGame();
