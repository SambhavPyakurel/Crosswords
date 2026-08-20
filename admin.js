let activePuzzle = {
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

function renderBuilderGrid() {
  const gridEl = document.getElementById('builderGrid');
  gridEl.innerHTML = '';

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
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

function generateClueInputs() {
  const numbering = computeGridNumbers(activePuzzle.solution);
  const acrossBox = document.getElementById('builderAcrossClues');
  const downBox = document.getElementById('builderDownClues');
  acrossBox.innerHTML = '';
  downBox.innerHTML = '';

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const num = numbering[r][c];
      if (!num) continue;

      if ((c === 0 || activePuzzle.solution[r][c - 1] === '#') && (c + 1 < 5 && activePuzzle.solution[r][c + 1] !== '#')) {
        createClueField(acrossBox, 'across', num);
      }
      if ((r === 0 || activePuzzle.solution[r - 1][c] === '#') && (r + 1 < 5 && activePuzzle.solution[r + 1][c] !== '#')) {
        createClueField(downBox, 'down', num);
      }
    }
  }
}

function createClueField(container, type, num) {
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '0.6rem';

  const label = document.createElement('label');
  label.style.fontWeight = 'bold';
  label.style.fontSize = '0.85rem';
  label.textContent = `${num} ${type.toUpperCase()}: `;

  const input = document.createElement('input');
  input.type = 'text';
  input.style.width = '100%';
  input.style.padding = '0.35rem';
  input.style.border = '1px solid #cbd5e1';
  input.style.borderRadius = '4px';
  input.value = activePuzzle.clues[type] && activePuzzle.clues[type][num] ? activePuzzle.clues[type][num] : '';

  input.oninput = (e) => {
    if (!activePuzzle.clues[type]) activePuzzle.clues[type] = {};
    activePuzzle.clues[type][num] = e.target.value;
  };

  wrapper.appendChild(label);
  wrapper.appendChild(input);
  container.appendChild(wrapper);
}

function downloadPuzzleJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activePuzzle, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "puzzle.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

renderBuilderGrid();