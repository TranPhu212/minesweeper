function startGame(r, c, m) {
    rows = r;
    cols = c;
    mines = m;
    flagsLeft = m;
    timer = 0;
    gameOver = false;
    firstClick = true;

    clearInterval(interval);
    document.getElementById("flags").innerText = flagsLeft;
    document.getElementById("time").innerText = timer;

    board = [];
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";

    const GAP = 2;
    const MAX_FRAME = Math.min(
        window.innerWidth - 30,
        window.innerHeight - 160,
        800
    );

    let cellSize = Math.floor((MAX_FRAME - GAP * (cols - 1)) / cols);
    cellSize = Math.max(14, Math.min(cellSize, 72));

    const boardSize = cellSize * cols + GAP * (cols - 1);
    boardDiv.style.width = boardSize + "px";
    boardDiv.style.height = boardSize + "px";

    const wrapper = document.querySelector(".board-wrapper");
    wrapper.style.width = boardSize + "px";
    wrapper.style.height = boardSize + "px";

    boardDiv.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.classList.add((i + j) % 2 === 0 ? "light" : "dark");

            cell.style.width = cellSize + "px";
            cell.style.height = cellSize + "px";

            cell.onclick = () => openCell(i, j);
            cell.oncontextmenu = e => {
                e.preventDefault();
                toggleFlag(i, j);
            };

            boardDiv.appendChild(cell);

            board[i][j] = {
                mine: false,
                open: false,
                flag: false,
                count: 0,
                el: cell
            };
        }
    }
}

function placeMines(safeRow, safeCol) {
    let placed = 0;
    while (placed < mines) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);

        if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;

        if (!board[r][c].mine) {
            board[r][c].mine = true;
            placed++;
        }
    }
    calculateNumbers();
}

function calculateNumbers() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j].mine) continue;

            let count = 0;
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    let ni = i + x, nj = j + y;
                    if (ni >= 0 && nj >= 0 && ni < rows && nj < cols && board[ni][nj].mine) {
                        count++;
                    }
                }
            }
            board[i][j].count = count;
        }
    }
}
