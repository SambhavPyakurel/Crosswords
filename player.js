let puzzleData = null;

let playerState = {
  grid: [],
  selectedRow: 0,
  selectedCol: 0,
  direction: 'across'
};

async function initPlayer() {
  try {
    const res = await fetch(`puzzle.json?t=${Date.now()}`);
    if (!res.ok) throw new Error("Could not load puzzle data");
    puzzleData = await res.json();

    playerState.grid = makeEmptyGrid(getPuzzleSize());
    selectFirstPlayableCell();
    renderPlayGrid();
  } catch (err) {
    console.error("Failed to load puzzle:", err);
    document.getElementById('statusMessage').textContent = "Failed to load puzzle.";
  }
}

function getPuzzleSize() {
  return puzzleData.size || puzzleData.solution.length;
}

function makeEmptyGrid(size) {
  return Array(size).fill(null).map(() => Array(size).fill(''));
}

function isBlock(grid, r, c) {
  return grid[r][c] === '#' || grid[r][c] === '';
}

function isPlayableCell(r, c) {
  const size = getPuzzleSize();
  return r >= 0 && r < size && c >= 0 && c < size && !isBlock(puzzleData.solution, r, c);
}

function selectFirstPlayableCell() {
  const size = getPuzzleSize();

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isPlayableCell(r, c)) {
        playerState.selectedRow = r;
        playerState.selectedCol = c;
        return;
      }
    }
  }
}

function computeGridNumbers(grid) {
  let count = 1;
  const size = grid.length;
  const numbering = Array(size).fill(null).map(() => Array(size).fill(null));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isBlock(grid, r, c)) continue;

      const needsAcross = (c === 0 || grid[r][c - 1] === '#') && (c + 1 < size && grid[r][c + 1] !== '#');
      const needsDown = (r === 0 || grid[r - 1][c] === '#') && (r + 1 < size && grid[r + 1][c] !== '#');

      if (needsAcross || needsDown) {
        numbering[r][c] = count++;
      }
    }
  }
  return numbering;
}

function renderPlayGrid() {
  const gridEl = document.getElementById('playGrid');
  const size = getPuzzleSize();
  gridEl.innerHTML = '';
  gridEl.style.setProperty('--grid-size', size);
  const numbering = computeGridNumbers(puzzleData.solution);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const blocked = isBlock(puzzleData.solution, r, c);
      const cell = document.createElement('div');
      cell.className = `cell ${blocked ? 'blocked' : ''}`;
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (!blocked) {
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

  if (e.key === "ArrowRight") {
    e.preventDefault();
    moveCursorExplicit(0, 1);
    return;
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    moveCursorExplicit(0, -1);
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    playerState.direction = 'down';
    moveCursorExplicit(1, 0);
    return;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    playerState.direction = 'down';
    moveCursorExplicit(-1, 0);
    return;
  }

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

  if (isPlayableCell(r, c)) {
    playerState.selectedRow = r;
    playerState.selectedCol = c;
    highlightCells();
    focusCell(r, c);
  }
}

function moveCursorExplicit(dr, dc) {
  const r = playerState.selectedRow + dr;
  const c = playerState.selectedCol + dc;

  if (isPlayableCell(r, c)) {
    playerState.selectedRow = r;
    playerState.selectedCol = c;
    if (dc !== 0) playerState.direction = 'across';
    if (dr !== 0) playerState.direction = 'down';
    highlightCells();
    focusCell(r, c);
  }
}

function focusCell(r, c) {
  const input = document.querySelector(`#playGrid .cell[data-row='${r}'][data-col='${c}'] input`);
  if (input) input.focus();
}

function renderPlayGridValues() {
  const size = getPuzzleSize();

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const input = document.querySelector(`#playGrid .cell[data-row='${r}'][data-col='${c}'] input`);
      if (input) input.value = playerState.grid[r][c];
    }
  }
}

function getCurrentWordCells() {
  const cells = [];
  const size = getPuzzleSize();
  const { selectedRow: sr, selectedCol: sc, direction } = playerState;
  let r = sr;
  let c = sc;

  while (direction === 'across' && c > 0 && isPlayableCell(r, c - 1)) c--;
  while (direction === 'down' && r > 0 && isPlayableCell(r - 1, c)) r--;

  while (r < size && c < size && isPlayableCell(r, c)) {
    cells.push([r, c]);
    if (direction === 'across') c++;
    else r++;
  }

  return cells;
}

function highlightCells() {
  document.querySelectorAll('#playGrid .cell').forEach((cell) => {
    cell.classList.remove('highlighted', 'focused');
  });

  for (const [r, c] of getCurrentWordCells()) {
    const cell = document.querySelector(`#playGrid .cell[data-row='${r}'][data-col='${c}']`);
    if (cell) cell.classList.add('highlighted');
  }

  const focused = document.querySelector(
    `#playGrid .cell[data-row='${playerState.selectedRow}'][data-col='${playerState.selectedCol}']`
  );
  if (focused) focused.classList.add('focused');
}

function renderClues() {
  const acrossContainer = document.getElementById('acrossClues');
  const downContainer = document.getElementById('downClues');
  acrossContainer.innerHTML = '';
  downContainer.innerHTML = '';

  for (const [num, clue] of Object.entries(puzzleData.clues.across)) {
    acrossContainer.appendChild(createClueItem(num, clue));
  }

  for (const [num, clue] of Object.entries(puzzleData.clues.down)) {
    downContainer.appendChild(createClueItem(num, clue));
  }
}

function createClueItem(num, clue) {
  const item = document.createElement('div');
  const number = document.createElement('strong');
  const text = document.createTextNode(` ${clue}`);

  item.className = 'clue-item';
  number.textContent = `${num}.`;
  item.appendChild(number);
  item.appendChild(text);
  return item;
}

function checkPuzzle() {
  let allCorrect = true;
  let complete = true;
  const size = getPuzzleSize();
  const msg = document.getElementById('statusMessage');

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (puzzleData.solution[r][c] === '#') continue;
      const val = playerState.grid[r][c];
      if (!val) complete = false;
      if (val !== puzzleData.solution[r][c]) allCorrect = false;
    }
  }

  if (complete && allCorrect) {
    msg.style.color = "var(--correct)";
    msg.textContent = "Congratulations! You solved the 8x8 crossword.";
  } else if (!complete && allCorrect) {
    msg.style.color = "var(--primary)";
    msg.textContent = "Looking good so far. Keep going.";
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
  playerState.grid = makeEmptyGrid(getPuzzleSize());
  renderPlayGridValues();
  document.getElementById('statusMessage').textContent = "";
}

initPlayer();
