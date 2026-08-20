// Hashed passcode for 'admin123'
// Hashed passcode for 'admin123'
const DEV_AUTH_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa82280f1a82e3a0a";

let activePuzzle = {
  size: 5,
  solution: [
    ['J', 'A', 'M', '#', '#'],
    ['O', 'N', 'I', 'O', 'N'],
    ['#', 'R', 'I', 'C', 'E'],
    ['J', 'U', 'I', 'C', 'E'],
    ['#', '#', 'T', 'E', 'A']
  ],
  clues: { across: {}, down: {} }
};

// Reliable SHA-256 Utility
async function sha256(str) {
  const msgBuffer = new TextEncoder().encode(str.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleAuth(e) {
  e.preventDefault();
  const inputEl = document.getElementById('devPassword');
  const errEl = document.getElementById('authError');
  const val = inputEl.value;

  try {
    const hash = await sha256(val);

    if (hash === DEV_AUTH_HASH) {
      errEl.style.display = 'none';
      sessionStorage.setItem('devLoggedIn', 'true');
      initWorkspace();
    } else {
      errEl.style.display = 'block';
    }
  } catch (err) {
    console.error("Auth error:", err);
    errEl.textContent = "Browser cryptography error. Try another browser.";
    errEl.style.display = 'block';
  }
}

async function handleAuth(e) {
  e.preventDefault();
  const val = document.getElementById('devPassword').value;
  const hash = await sha256(val);

  if (hash === DEV_AUTH_HASH) {
    sessionStorage.setItem('devLoggedIn', 'true');
    initWorkspace();
  } else {
    document.getElementById('authError').style.display = 'block';
  }
}

function logout() {
  sessionStorage.removeItem('devLoggedIn');
  window.location.reload();
}

function initWorkspace() {
  document.getElementById('authGate').style.display = 'none';
  document.getElementById('devWorkspace').style.display = 'block';

  const stored = localStorage.getItem('crosswordPuzzleData');
  if (stored) activePuzzle = JSON.parse(stored);

  renderBuilderGrid();
}

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

function saveAndPublish() {
  localStorage.setItem('crosswordPuzzleData', JSON.stringify(activePuzzle));
  alert('Crossword successfully published! Open or refresh index.html to play.');
}

function restoreDefaults() {
  localStorage.removeItem('crosswordPuzzleData');
  window.location.reload();
}

// Session Check
if (sessionStorage.getItem('devLoggedIn') === 'true') {
  initWorkspace();
}