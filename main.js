const ROWS = 10;
const COLS = 10;
const MINES = 15;

let board = [];
let revealed = [];
let flagged = [];
let gameOver = false;

const gameBoard = document.getElementById('gameBoard');
const statusDiv = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');

function initGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  revealed = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  flagged = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  gameOver = false;
  statusDiv.textContent = '';

  // Place mines
  let minesPlaced = 0;
  while (minesPlaced < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (board[r][c] !== 'M') {
      board[r][c] = 'M';
      minesPlaced++;
    }
  }

  // Calculate numbers
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === 'M') continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === 'M') {
            count++;
          }
        }
      }
      board[r][c] = count;
    }
  }

  renderBoard();
}

function renderBoard() {
  gameBoard.innerHTML = '';
  gameBoard.style.gridTemplateColumns = `repeat(${COLS}, 32px)`;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (revealed[r][c]) {
        cell.classList.add('revealed');
        if (board[r][c] === 'M') {
          cell.classList.add('mine');
          cell.textContent = '💣';
        } else if (board[r][c] > 0) {
          cell.textContent = board[r][c];
        }
      } else if (flagged[r][c]) {
        cell.classList.add('flagged');
        cell.textContent = '🚩';
      }

      cell.addEventListener('click', onCellClick);
      cell.addEventListener('contextmenu', onCellRightClick);

      gameBoard.appendChild(cell);
    }
  }
}

function onCellClick(e) {
  if (gameOver) return;
  const r = parseInt(e.currentTarget.dataset.row);
  const c = parseInt(e.currentTarget.dataset.col);
  if (flagged[r][c] || revealed[r][c]) return;

  if (board[r][c] === 'M') {
    revealed[r][c] = true;
    gameOver = true;
    revealAllMines();
    statusDiv.textContent = '游戏失败！💥';
  } else {
    revealCell(r, c);
    if (checkWin()) {
      gameOver = true;
      statusDiv.textContent = '恭喜你，胜利！🎉';
    }
  }
  renderBoard();
}

function onCellRightClick(e) {
  e.preventDefault();
  if (gameOver) return;
  const r = parseInt(e.currentTarget.dataset.row);
  const c = parseInt(e.currentTarget.dataset.col);
  if (revealed[r][c]) return;
  flagged[r][c] = !flagged[r][c];
  renderBoard();
}

function revealCell(r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS || revealed[r][c] || flagged[r][c]) return;
  revealed[r][c] = true;
  if (board[r][c] === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr !== 0 || dc !== 0) {
          revealCell(r + dr, c + dc);
        }
      }
    }
  }
}

function revealAllMines() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === 'M') {
        revealed[r][c] = true;
      }
    }
  }
}

function checkWin() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== 'M' && !revealed[r][c]) {
        return false;
      }
    }
  }
  return true;
}

restartBtn.onclick = initGame;

window.onload = initGame;