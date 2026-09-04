let activePuzzle = {
  size: 8,
  solution: [
    ['G', 'O', '#', 'O', 'N', '#', 'I', 'T'],
    ['O', 'R', '#', 'N', 'O', '#', 'N', 'O'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['I', 'N', '#', 'O', 'N', '#', 'A', 'S'],
    ['N', 'O', '#', 'N', 'O', '#', 'N', 'O'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['T', 'O', '#', 'S', 'O', '#', 'G', 'O'],
    ['O', 'N', '#', 'I', 'F', '#', 'O', 'N']
  ],
  clues: {
    across: {
      1: "Start moving",
      3: "Switched from off",
      5: "The thing at hand",
      7: "Heraldic gold",
      8: "Opposite of yes",
      9: "Veto vote",
      10: "Inside",
      12: "Operating",
      14: "In the role of",
      16: "A refusal",
      17: "Negative answer",
      18: "Election-night vote against",
      19: "Toward",
      21: "Therefore",
      23: "Ancient board game",
      25: "Not off",
      26: "Conditional word",
      27: "About, as a topic"
    },
    down: {
      1: "Depart, as a green light says",
      2: "Heraldic word for gold",
      3: "Not off",
      4: "Opposite of yes",
      5: "Fashionable",
      6: "Toward",
      10: "Inside",
      11: "Veto vote",
      12: "Switched from off",
      13: "Refusal",
      14: "Article before a vowel sound",
      15: "Thus",
      19: "In the direction of",
      20: "Operating",
      21: "Ti's neighbor in solfege",
      22: "Belonging to",
      23: "Board game with black and white stones",
      24: "About, as a topic"
    }
  }
};

function getPuzzleSize() {
  return activePuzzle.size || activePuzzle.solution.length;
}

function isBlock(grid, r, c) {
  return grid[r][c] === '#' || grid[r][c] === '';
}

function renderBuilderGrid() {
  const gridEl = document.getElementById('builderGrid');
  const size = getPuzzleSize();
  gridEl.innerHTML = '';
  gridEl.style.setProperty('--grid-size', size);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell builder-cell';

      const input = document.createElement('input');
      input.maxLength = 1;
      input.value = activePuzzle.solution[r][c] === '#' ? '' : activePuzzle.solution[r][c];
      input.placeholder = '#';

      input.addEventListener('input', (e) => {
        activePuzzle.solution[r][c] = e.target.value.toUpperCase() || '#';
      });

      cell.appendChild(input);
      gridEl.appendChild(cell);
    }
  }
  generateClueInputs();
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

function generateClueInputs() {
  const numbering = computeGridNumbers(activePuzzle.solution);
  const acrossBox = document.getElementById('builderAcrossClues');
  const downBox = document.getElementById('builderDownClues');
  const size = getPuzzleSize();
  const nextClues = { across: {}, down: {} };

  acrossBox.innerHTML = '';
  downBox.innerHTML = '';

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const num = numbering[r][c];
      if (!num) continue;

      if ((c === 0 || activePuzzle.solution[r][c - 1] === '#') && (c + 1 < size && activePuzzle.solution[r][c + 1] !== '#')) {
        nextClues.across[num] = activePuzzle.clues.across[num] || '';
        createClueField(acrossBox, 'across', num, nextClues);
      }
      if ((r === 0 || activePuzzle.solution[r - 1][c] === '#') && (r + 1 < size && activePuzzle.solution[r + 1][c] !== '#')) {
        nextClues.down[num] = activePuzzle.clues.down[num] || '';
        createClueField(downBox, 'down', num, nextClues);
      }
    }
  }

  activePuzzle.clues = nextClues;
}

function createClueField(container, type, num, clueStore) {
  const wrapper = document.createElement('div');
  wrapper.className = 'builder-clue-field';

  const label = document.createElement('label');
  label.textContent = `${num} ${type.toUpperCase()}: `;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = clueStore[type][num];

  input.oninput = (e) => {
    clueStore[type][num] = e.target.value;
    activePuzzle.clues[type][num] = e.target.value;
  };

  wrapper.appendChild(label);
  wrapper.appendChild(input);
  container.appendChild(wrapper);
}

function downloadPuzzleJSON() {
  activePuzzle.size = getPuzzleSize();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activePuzzle, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "puzzle.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

renderBuilderGrid();
