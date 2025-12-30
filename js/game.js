function openCell(i, j) {
    if (gameOver) return;

    const cell = board[i][j];
    if (cell.open || cell.flag) return;

    if (firstClick) {
        firstClick = false;
        interval = setInterval(() => {
            timer++;
            document.getElementById("time").innerText = timer;
        }, 1000);
        placeMines(i, j);
    }

    // Mở ô click NGAY + anim flip/shake
    cell.open = true;
    cell.el.classList.add("open", "shake-light");

    if (cell.mine) {
        cell.el.innerText = "💣";
        cell.el.classList.add("mine", "explode");
        endGame(false);
        return;
    }

    if (cell.count > 0) {
        cell.el.innerText = cell.count;
        cell.el.dataset.n = cell.count;
    } else {
        // WAVE LAN TỎA: Delay tăng dần từ tâm (ô click)
        waveFloodOpen(i, j);
    }

    checkWin();
}

// WAVE FLOOD OPEN: Lan tỏa từ từ với delay theo khoảng cách Manhattan (wave thật)
function waveFloodOpen(startI, startJ) {
    const queue = [];
    const visited = new Set();
    const startKey = `${startI},${startJ}`;

    queue.push({i: startI, j: startJ, dist: 0});
    visited.add(startKey);

    let delay = 0;
    const baseDelay = 20;  // Tốc độ wave (20ms/ô → mượt, điều chỉnh nếu muốn nhanh/chậm)

    while (queue.length > 0) {
        const {i, j, dist} = queue.shift();
        const cell = board[i][j];

        // Mở ô với delay theo khoảng cách (wave lan ra)
        setTimeout(() => {
            if (cell.open) return;  // Đề phòng overlap
            cell.open = true;
            cell.el.classList.add("open", "shake-light");

            if (cell.count > 0) {
                cell.el.innerText = cell.count;
                cell.el.dataset.n = cell.count;
            }
        }, delay);

        // Thêm lân cận nếu ô 0
        if (cell.count === 0) {
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x === 0 && y === 0) continue;
                    const ni = i + x;
                    const nj = j + y;
                    const nKey = `${ni},${nj}`;

                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols &&
                        !visited.has(nKey) && !board[ni][nj].flag && !board[ni][nj].mine) {
                        visited.add(nKey);
                        queue.push({i: ni, j: nj, dist: dist + 1});
                    }
                }
            }
        }

        delay += baseDelay;
    }

    setTimeout(checkWin, delay + 50);
}

function toggleFlag(i, j) {
    if (gameOver) return;

    const cell = board[i][j];
    if (cell.open) return;

    if (cell.el.classList.contains("flag-removing")) {
        if (cell.removeTimeout) clearTimeout(cell.removeTimeout);
        cell.flag = false;
        cell.el.innerText = "";
        cell.el.classList.remove("flag", "flag-removing");
        delete cell.removeTimeout;
        flagsLeft++;
        document.getElementById("flags").innerText = flagsLeft;
        return;
    }

    if (!cell.flag && flagsLeft === 0) return;

    if (cell.removeTimeout) {
        clearTimeout(cell.removeTimeout);
        delete cell.removeTimeout;
    }

    if (!cell.flag) {
        cell.flag = true;
        cell.el.innerText = "";
        cell.el.classList.remove("flag");
        void cell.el.offsetWidth;
        cell.el.classList.add("flag");
        flagsLeft--;
    } else {
        cell.el.classList.add("flag-removing");
        cell.removeTimeout = setTimeout(() => {
            cell.flag = false;
            cell.el.innerText = "";
            cell.el.classList.remove("flag", "flag-removing");
            delete cell.removeTimeout;
        }, 250);
        flagsLeft++;
    }

    document.getElementById("flags").innerText = flagsLeft;
}

function endGame(win) {
    gameOver = true;
    clearInterval(interval);

    if (!win) {
        const wrapper = document.querySelector(".board-wrapper");
        wrapper.classList.add("screen-shake");
        setTimeout(() => wrapper.classList.remove("screen-shake"), 3000);

        explodeUnflaggedMines();
        markWrongFlags();
    }

    const delay = win ? 200 : mines * 100 + 1200;
    setTimeout(() => {
        alert(win ? "You won! 🎉" : "You lost! 💥");
        restartCurrentMode();
    }, delay);
}

function checkWin() {
    let opened = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j].open) opened++;
        }
    }
    if (opened === rows * cols - mines) {
        endGame(true);
    }
}

function explodeUnflaggedMines() {
    let unflaggedMines = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = board[i][j];
            if (cell.mine && !cell.flag && !cell.open) {
                unflaggedMines.push(cell);
            }
        }
    }
    unflaggedMines.sort(() => Math.random() - 0.5);

    unflaggedMines.forEach((cell, index) => {
        setTimeout(() => {
            cell.el.innerText = "💣";
            cell.el.classList.add("open", "mine", "explode");
        }, index * 100);
    });
}

function markWrongFlags() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = board[i][j];
            if (cell.flag && !cell.mine) {
                if (cell.removeTimeout) {
                    clearTimeout(cell.removeTimeout);
                    delete cell.removeTimeout;
                }
                cell.flag = false;
                cell.el.classList.remove("flag");
                void cell.el.offsetWidth;
                cell.el.classList.add("wrong-flag");
            }
        }
    }
}