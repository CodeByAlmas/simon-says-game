// Game sequences
let gameSeq = [];
let userSeq = [];

// Color buttons used
let btns = ["red", "yellow", "green", "purple"];

// Game state trackers
let started = false;
let level = 0;
let playerName = "";

// Load high scores from localStorage
let highScores = JSON.parse(localStorage.getItem("simonHighScores")) || {};

// DOM references
const levelTitle = document.getElementById("level-title");
const playerNameDisplay = document.getElementById("player-name");
const scoreList = document.getElementById("score-list");

// Sound assets for color buttons and game-over feedback
const sounds = {
  red: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"),
  yellow: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"),
  green: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"),
  purple: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"),
  wrong: new Audio("https://www.soundjay.com/button/sounds/button-10.mp3")
};

// Start game on any keypress
document.addEventListener("keydown", () => {
  if (!started) {
    askPlayerName();
  }
});

// Button: Change current player
document.getElementById("change-player").addEventListener("click", askPlayerName);

// Button: Reset all saved scores
document.getElementById("reset-scores").addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all high scores?")) {
    localStorage.removeItem("simonHighScores");
    highScores = {};
    updateScoreboard();
  }
});

// Ask for user name and start game
function askPlayerName() {
  const name = prompt("Enter your name:")?.trim();
  if (!name) return;

  playerName = name;
  playerNameDisplay.innerText = `Player: ${playerName}`;
  started = true;
  level = 0;
  levelUp();
  updateScoreboard();
}

// Increase difficulty by generating next sequence
function levelUp() {
  userSeq = [];
  level++;
  levelTitle.innerText = `Level ${level}`;

  const randIdx = Math.floor(Math.random() * 4);
  const randColor = btns[randIdx];
  const randBtn = document.getElementById(randColor);
  gameSeq.push(randColor);

  setTimeout(() => playFlash(randBtn, randColor), 500);
}

// Animate and play sound for computer flash
function playFlash(btn, color) {
  btn.classList.add("flash");
  sounds[color].play();
  setTimeout(() => btn.classList.remove("flash"), 300);
}

// Animate and play sound for user press
function userFlash(btn, color) {
  btn.classList.add("userFlash");
  sounds[color].play();
  setTimeout(() => btn.classList.remove("userFlash"), 300);
}

// Check user's input against game pattern
function checkAns(idx) {
  if (userSeq[idx] === gameSeq[idx]) {
    if (userSeq.length === gameSeq.length) {
      setTimeout(levelUp, 800);
    }
  } else {
    // Wrong answer
    sounds.wrong.play();
    document.body.style.backgroundColor = "red";
    setTimeout(() => document.body.style.backgroundColor = "#121212", 200);

    levelTitle.innerHTML = `Game Over! Score: <b>${level}</b><br>Press Any Key to Restart`;

    updateHighScores();
    reset();
  }
}

// Handle user click on buttons
function handleBtnClick(e) {
  if (!started) return;

  const btn = e.target;
  const color = btn.id;
  userSeq.push(color);
  userFlash(btn, color);
  checkAns(userSeq.length - 1);
}

// Attach event listeners to all buttons
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", handleBtnClick);
});

// Reset game state
function reset() {
  gameSeq = [];
  userSeq = [];
  level = 0;
  started = false;
}

// Update high score if current level is higher
function updateHighScores() {
  if (!playerName) return;

  const prevHigh = highScores[playerName] || 0;
  if (level > prevHigh) {
    highScores[playerName] = level;
    localStorage.setItem("simonHighScores", JSON.stringify(highScores));
  }

  updateScoreboard();
}

// Populate the scoreboard with top players
function updateScoreboard() {
  scoreList.innerHTML = "";

  const sortedScores = Object.entries(highScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 scores

  for (let [name, score] of sortedScores) {
    const li = document.createElement("li");
    li.textContent = `${name}: ${score}`;
    scoreList.appendChild(li);
  }
}
