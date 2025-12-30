function startGame(r, c, m) {
    rows = r;
    cols = c;
    mines = m;
    flagsLeft = m;
    timer = 0;

    // Countdown setup
    const checkbox = document.getElementById("countdownCheckbox");
    if (checkbox && checkbox.checked) {
        timeLimit = parseInt(document.getElementById("timeLimitSelect").value) * 60;
        timeLeft = timeLimit;
        document.getElementById("timeLeft").innerText = timeLeft;
    } else {
        timeLimit = 0;
        timeLeft = 0;
        if (document.getElementById("timeLeft")) {
            document.getElementById("timeLeft").innerText = "--";
        }
    }

    gameOver = false;
    firstClick = true;

    clearInterval(interval);
    if (intervalCountdown) clearInterval(intervalCountdown);

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

            // Desktop
            cell.onclick = () => openCell(i, j);
            cell.oncontextmenu = e => {
                e.preventDefault();
                toggleFlag(i, j);
            };

            // Mobile touch
            cell.addEventListener("touchstart", (e) => {
                e.preventDefault();
                if (firstClick) {
                    // First tap: Mở luôn (đào)
                    openCell(i, j);
                } else {
                    // Từ lần 2: Sổ bubbles
                    showMobileOptions(i, j, e.touches[0]);
                }
            });

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

// MOBILE BUBBLES
let flagBubble, digBubble, overlay;

function showMobileOptions(i, j, touch) {
    if (!flagBubble) {
        // Create once
        flagBubble = document.createElement("div");
        flagBubble.innerHTML = "🚩";
        flagBubble.classList.add("bubble", "bubble-flag");
        document.body.appendChild(flagBubble);

        digBubble = document.createElement("div");
        digBubble.innerHTML = "⛏️";
        digBubble.classList.add("bubble", "bubble-dig");
        document.body.appendChild(digBubble);

        overlay = document.createElement("div");
        overlay.classList.add("bubble-overlay");
        document.body.appendChild(overlay);
    }

    const rect = board[i][j].el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Bên trái: Cắm cờ 🚩
    flagBubble.style.left = `${centerX - rect.width - 20}px`; // Trái ô
    flagBubble.style.top = `${centerY - 25}px`;
    flagBubble.style.display = "block";
    flagBubble.classList.add("show");
    flagBubble.onclick = (e) => {
        e.stopPropagation();
        toggleFlag(i, j);
        hideMobileOptions();
    };

    // Phía trên: Đào ⛏️
    digBubble.style.left = `${centerX - 25}px`;
    digBubble.style.top = `${centerY - rect.height - 20}px`; // Trên ô
    digBubble.style.display = "block";
    digBubble.classList.add("show");
    digBubble.onclick = (e) => {
        e.stopPropagation();
        openCell(i, j);
        hideMobileOptions();
    };

    overlay.style.display = "block";
    overlay.onclick = hideMobileOptions;
}

function hideMobileOptions() {
    if (flagBubble) {
        flagBubble.style.display = "none";
        flagBubble.classList.remove("show");
    }
    if (digBubble) {
        digBubble.style.display = "none";
        digBubble.classList.remove("show");
    }
    if (overlay) overlay.style.display = "none";
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