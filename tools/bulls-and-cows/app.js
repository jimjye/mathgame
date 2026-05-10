import { createScoreStore } from "./score-store.js";

const PLAYER_KEY = "mathgame.bulls-and-cows.player";
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SECRET_LENGTH = 4;

const playerCodeEl = document.querySelector("#player-code");
const attemptCountEl = document.querySelector("#attempt-count");
const elapsedTimeEl = document.querySelector("#elapsed-time");
const answerStateEl = document.querySelector("#answer-state");
const storeStateEl = document.querySelector("#store-state");
const messageEl = document.querySelector("#message");
const historyListEl = document.querySelector("#history-list");
const scoreListEl = document.querySelector("#score-list");
const formEl = document.querySelector("#guess-form");
const inputEl = document.querySelector("#guess-input");
const guessButton = document.querySelector("#guess-button");
const loginButton = document.querySelector("#login-button");
const startButton = document.querySelector("#start-button");
const revealButton = document.querySelector("#reveal-button");

let playerCode = localStorage.getItem(PLAYER_KEY) ?? "";
let secret = "";
let guesses = [];
let startedAt = 0;
let elapsedSeconds = 0;
let timerId = null;
let isPlaying = false;
let scoreStore = null;

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function generatePlayerCode() {
  let code = "P-";

  for (let index = 0; index < 6; index += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }

  return code;
}

function generateSecret() {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const secretDigits = [];

  while (secretDigits.length < SECRET_LENGTH) {
    const digit = digits.splice(randomInt(digits.length), 1)[0];
    secretDigits.push(digit);
  }

  return secretDigits.join("");
}

function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function setMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.className = `message${type ? ` ${type}` : ""}`;
}

function setPlayerCode(code) {
  playerCode = code;
  localStorage.setItem(PLAYER_KEY, code);
  playerCodeEl.textContent = code || "未登入";
}

function validateGuess(value) {
  const guess = value.trim();

  if (!/^\d{4}$/.test(guess)) {
    return "請輸入 4 位數字。";
  }

  if (guess.startsWith("0")) {
    return "第一位不能是 0。";
  }

  if (new Set(guess).size !== SECRET_LENGTH) {
    return "四個數字不能重複。";
  }

  if (guesses.some((item) => item.guess === guess)) {
    return "這組數字已經猜過。";
  }

  return "";
}

function scoreGuess(guess) {
  let a = 0;
  let b = 0;

  for (let index = 0; index < SECRET_LENGTH; index += 1) {
    if (guess[index] === secret[index]) {
      a += 1;
    } else if (secret.includes(guess[index])) {
      b += 1;
    }
  }

  return { a, b };
}

function renderHistory() {
  historyListEl.innerHTML = "";

  if (guesses.length === 0) {
    const item = document.createElement("li");
    item.innerHTML = '<span class="meta">尚未猜題</span>';
    historyListEl.appendChild(item);
    return;
  }

  guesses.forEach((entry, index) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <span class="meta">#${index + 1}</span>
      <span class="guess-number">${entry.guess}</span>
      <span class="result-pill">${entry.a}A${entry.b}B</span>
    `;
    historyListEl.appendChild(item);
  });
}

function renderScores(scores) {
  scoreListEl.innerHTML = "";

  if (scores.length === 0) {
    const item = document.createElement("li");
    item.innerHTML = '<span class="meta">尚無成績</span>';
    scoreListEl.appendChild(item);
    return;
  }

  scores.slice(0, 10).forEach((score) => {
    const item = document.createElement("li");
    const result = score.won ? `${score.attempts} 次 / ${formatTime(score.seconds)}` : "未完成";
    item.innerHTML = `
      <span>
        <strong>${score.playerCode}</strong>
        <span class="meta"> 答案 ${score.answer}</span>
      </span>
      <span class="result-pill">${result}</span>
    `;
    scoreListEl.appendChild(item);
  });
}

async function refreshScores() {
  if (!scoreStore) {
    return;
  }

  storeStateEl.textContent = scoreStore.label;
  renderScores(await scoreStore.list());
}

function updateStats() {
  attemptCountEl.textContent = guesses.length;
  elapsedTimeEl.textContent = formatTime(elapsedSeconds);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function startTimer() {
  stopTimer();
  timerId = setInterval(() => {
    elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    updateStats();
  }, 1000);
}

function setPlaying(nextState) {
  isPlaying = nextState;
  inputEl.disabled = !nextState;
  guessButton.disabled = !nextState;
  revealButton.disabled = !nextState;
}

async function saveScore(won) {
  if (!scoreStore) {
    return;
  }

  await scoreStore.save({
    playerCode,
    answer: secret,
    attempts: guesses.length,
    seconds: elapsedSeconds,
    won,
    createdAt: new Date().toISOString(),
  });
  await refreshScores();
}

async function endGame(won) {
  stopTimer();
  setPlaying(false);
  answerStateEl.textContent = `答案：${secret}`;
  await saveScore(won);

  if (won) {
    setMessage(`答對了！你用了 ${guesses.length} 次，時間 ${formatTime(elapsedSeconds)}。`, "success");
  } else {
    setMessage(`本局結束，答案是 ${secret}。`, "error");
  }
}

function startGame() {
  if (!playerCode) {
    setMessage("請先產生玩家代碼，成績才會歸到同一位玩家。", "error");
    return;
  }

  secret = generateSecret();
  guesses = [];
  startedAt = Date.now();
  elapsedSeconds = 0;
  answerStateEl.textContent = "進行中";
  renderHistory();
  updateStats();
  setPlaying(true);
  startTimer();
  inputEl.value = "";
  inputEl.focus();
  setMessage("新局開始。每次猜完後，依照 A/B 提示調整下一次答案。");
}

async function handleGuess(event) {
  event.preventDefault();

  if (!isPlaying) {
    setMessage("請先開始新局。", "error");
    return;
  }

  const guess = inputEl.value.trim();
  const validationMessage = validateGuess(guess);

  if (validationMessage) {
    setMessage(validationMessage, "error");
    inputEl.select();
    return;
  }

  const result = scoreGuess(guess);
  guesses.push({ guess, ...result });
  renderHistory();
  updateStats();
  inputEl.value = "";

  if (result.a === SECRET_LENGTH) {
    await endGame(true);
    return;
  }

  setMessage(`${guess} 是 ${result.a}A${result.b}B。`, result.a + result.b > 0 ? "success" : "");
  inputEl.focus();
}

function handleLogin() {
  setPlayerCode(generatePlayerCode());
  setMessage(`已產生玩家代碼：${playerCode}。`, "success");
}

async function init() {
  setPlayerCode(playerCode);
  scoreStore = await createScoreStore();
  storeStateEl.textContent = scoreStore.label;
  renderHistory();
  updateStats();
  await refreshScores();
}

formEl.addEventListener("submit", handleGuess);
loginButton.addEventListener("click", handleLogin);
startButton.addEventListener("click", startGame);
revealButton.addEventListener("click", () => endGame(false));

init();
