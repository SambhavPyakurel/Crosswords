// Default Puzzle State
const defaultPuzzle = {
  size: 5,
  solution: [
    ['J', 'A', 'M', '#', '#'],
    ['O', 'N', 'I', 'O', 'N'],
    ['#', 'R', 'I', 'C', 'E'],
    ['J', 'U', 'I', 'C', 'E'],
    ['#', '#', 'T', 'E', 'A']
  ],
  clues: {
    across: {
      1: "Fruit spread on toast",
      4: "Layered root vegetable that makes you cry",
      6: "Grain in paella and sushi",
      7: "Liquid squeezed from citrus or berries",
      8: "Hot steeped herbal or caffeinated drink"
    },
    down: {
      1: "Short for Japanese culinary master (or just 'Joe')",
      2: "Grain or food ingredient (alt: corn unit)",
      3: "Food made from ground grain or cocoa",
      5: "Pleasant aroma from warm baked goods"
    }
  }
};

// Load custom puzzle from Developer updates if available
const storedData = localStorage.getItem('crosswordPuzzleData');
const puzzleData = storedData ? JSON.parse(storedData) : defaultPuzzle;

let playerState = {
  grid: Array(5).fill(null).map(() => Array(5).fill('')),
  selectedRow: 0,
  selectedCol: 0,
  direction: 'across'
};

function computeGridNumbers(grid) {
  let count = 1;
  let numbering = Array(5).fill(null).map(() => Array(5).fill(null));

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (grid[r][c] === '#' || grid[r][c] === '') continue;

      const needsAcross = (c === 0 || grid[r][c - 1] === '#') && (c + 1 < 5 && grid[r][c + 1] !== '#');
      const needsDown = (r === 0 || grid[r - 1][c] === '#') && (r + 1 < 5 && grid[r + 1][c] !== '#');

      if (needsAcross || needsDown) {
        numbering[r][c] = count++;
      }
    }
  }
  return numbering;
}

function renderPlayGrid() {
  const gridEl = document.getElementById('playGrid');
  gridEl.innerHTML = '';
  const numbering = computeGridNumbers(puzzleData.solution);

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const isBlock = puzzleData.solution[r][c] === '#' || puzzleData.solution[r][c] === '';
      const cell = document.createElement('div');
      cell.className = `cell ${isBlock ? 'blocked' : ''}`;
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (!isBlock) {
        const num = numbering[r][c];
        if (num) {
          const span = document.createElement('span');
          span.className = 'cell-number';
          span.textContent = num;
          cell.appendChild(span);
        }

        const input = document.createElement('input');
        input.maxLength = 1;
        input.value = playerState.grid[r][c];
        input.dataset.row = r;
        input.dataset.col = c;

        input.addEventListener('click', () => handleCellClick(r, c));
        input.addEventListener('keydown', (e) => handleKeyDown(e, r, c));
        cell.appendChild(input);
      }
      gridEl.appendChild(cell);
    }
  }
  renderClues();
  highlightCells();
}

function handleCellClick(r, c) {
  if (playerState.selectedRow === r && playerState.selectedCol === c) {
    playerState.direction = playerState.direction === 'across' ? 'down' : 'across';
  } else {
    playerState.selectedRow = r;
    playerState.selectedCol = c;
  }
  highlightCells();
}

function handleKeyDown(e, r, c) {
  const key = e.key.toUpperCase();

  if (e.key === "Backspace") {
    e.preventDefault();
    if (playerState.grid[r][c] !== '') {
      playerState.grid[r][c] = '';
      renderPlayGridValues();
    } else {
      moveCursor(-1);
    }
    return;
  }

  if (e.key === "ArrowRight") { moveCursorExplicit(0, 1); return; }
  if (e.key === "ArrowLeft") { moveCursorExplicit(0, -1); return; }
  if (e.key === "ArrowDown") { moveCursorExplicit(1, 0); return; }
  if (e.key === "ArrowUp") { moveCursorExplicit(-1, 0); return; }

  if (/^[A-Z]$/.test(key)) {
    e.preventDefault();
    playerState.grid[r][c] = key;
    renderPlayGridValues();
    moveCursor(1);
  }
}

function moveCursor(step) {
  let { selectedRow: r, selectedCol: c, direction } = playerState;
  if (direction === 'across') c += step;
  else r += step;

  if (r >= 0 && r < 5 && c >= 0 && c < 5 && puzzleData.solution[r][c] !== '#') {
    playerState.selectedRow = r;
    playerState.selectedCol = c;
    highlightCells();
    focusCell(r, c);
  }
}

function moveCursorExplicit(dr, dc) {
  let r = playerState.selectedRow + dr;
  let c = playerState.selectedCol + dc;
  if (r >= 0 && r < 5 && c >= 0 && c < 5 && puzzleData.solution[r][c] !== '#') {
    playerState.selectedRow = r;
    playerState.selectedCol = c;
    highlightCells();
    focusCell(r, c);
  }
}

function focusCell(r, c) {
  const input = document.querySelector(`#playGrid .cell[data-row='${r}'][data-col='${c}'] input`);
  if (input) input.focus();
}

function renderPlayGridValues() {
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const input = document.querySelector(`#playGrid .cell[data-row='${r}'][data-col='${c}'] input`);
      if (input) input.value = playerState.grid[r][c];
    }
  }
}

function highlightCells() {
  const { selectedRow: sr, selectedCol: sc, direction } = playerState;
  document.querySelectorAll('#playGrid .cell').forEach(c => {
    c.classList.remove('highlighted', 'focused');
  });

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (puzzleData.solution[r][c] === '#') continue;
      const cell = document.querySelector(`#playGrid .cell[data-row='${r}'][data-col='${c}']`);
      const isCurrentWord = (direction === 'across' && r === sr) || (direction === 'down' && c === sc);
      if (isCurrentWord) cell.classList.add('highlighted');
      if (r === sr && c === sc) cell.classList.add('focused');
    }
  }
}

function renderClues() {
  const acrossContainer = document.getElementById('acrossClues');
  const downContainer = document.getElementById('downClues');
  acrossContainer.innerHTML = '';
  downContainer.innerHTML = '';

  for (const [num, clue] of Object.entries(puzzleData.clues.across)) {
    const item = document.createElement('div');
    item.className = 'clue-item';
    item.innerHTML = `<strong>${num}.</strong> ${clue}`;
    acrossContainer.appendChild(item);
  }

  for (const [num, clue] of Object.entries(puzzleData.clues.down)) {
    const item = document.createElement('div');
    item.className = 'clue-item';
    item.innerHTML = `<strong>${num}.</strong> ${clue}`;
    downContainer.appendChild(item);
  }
}

function checkPuzzle() {
  let allCorrect = true;
  let complete = true;
  const msg = document.getElementById('statusMessage');

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (puzzleData.solution[r][c] === '#') continue;
      const val = playerState.grid[r][c];
      if (!val) complete = false;
      if (val !== puzzleData.solution[r][c]) allCorrect = false;
    }
  }

  if (complete && allCorrect) {
    msg.style.color = "var(--correct)";
    msg.textContent = "🎉 Congratulations! You solved the mini crossword!";
  } else if (!complete && allCorrect) {
    msg.style.color = "var(--primary)";
    msg.textContent = "Looking good so far! Keep going.";
  } else {
    msg.style.color = "var(--wrong)";
    msg.textContent = "Some letters are incorrect or missing.";
  }
}

function revealPuzzle() {
  playerState.grid = JSON.parse(JSON.stringify(puzzleData.solution));
  renderPlayGridValues();
  document.getElementById('statusMessage').textContent = "Solution revealed.";
}

function resetPlayerGrid() {
  playerState.grid = Array(5).fill(null).map(() => Array(5).fill(''));
  renderPlayGridValues();
  document.getElementById('statusMessage').textContent = "";
}

// Start game
renderPlayGrid();