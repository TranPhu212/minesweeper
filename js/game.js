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

        if (timeLimit > 0) {
            timeLeft = timeLimit;
            document.getElementById("timeLeft").innerText = timeLeft;
            intervalCountdown = setInterval(() => {
                timeLeft--;
                document.getElementById("timeLeft").innerText = timeLeft;
                if (timeLeft <= 0) {
                    endGame(false, true);
                }
            }, 1000);
        }

        placeMines(i, j);
    }

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
        waveFloodOpen(i, j);
    }

    checkWin();
}

function waveFloodOpen(startI, startJ) {
    const queue = [];
    const visited = new Set();

    queue.push({i: startI, j: startJ, dist: 0});
    visited.add(`${startI},${startJ}`);

    let delay = 0;
    const baseDelay = 20;

    while (queue.length > 0) {
        const {i, j} = queue.shift();
        const cell = board[i][j];

        setTimeout(() => {
            if (cell.open) return;
            cell.open = true;
            cell.el.classList.add("open", "shake-light");

            if (cell.count > 0) {
                cell.el.innerText = cell.count;
                cell.el.dataset.n = cell.count;
            }
        }, delay);

        if (cell.count === 0) {
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x === 0 && y === 0) continue;
                    const ni = i + x;
                    const nj = j + y;
                    const key = `${ni},${nj}`;
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && !visited.has(key) &&
                        !board[ni][nj].flag && !board[ni][nj].mine) {
                        visited.add(key);
                        queue.push({i: ni, j: nj});
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

function endGame(win, timeOut = false) {
    gameOver = true;
    clearInterval(interval);
    if (intervalCountdown) clearInterval(intervalCountdown);

    if (!win) {
        const wrapper = document.querySelector(".board-wrapper");
        wrapper.classList.add("screen-shake");
        setTimeout(() => wrapper.classList.remove("screen-shake"), 5000); // Lâu hơn cho sequence

        // SEQUENCE: 1. Rung màn hình → 2. Nổ bom → 3. Wrong flags (sau 500ms)
        explodeUnflaggedMines();
        setTimeout(markWrongFlags, mines * 200 + 500); // Chờ sau khi bom nổ hết
    }

    const delay = win ? 200 : (mines * 200 + 1000); // Delay cho alert (sau sequence)
    setTimeout(() => {
        if (timeOut) {
            alert("Time out! Bạn đã thua! 💥");
        } else {
            alert(win ? "Bạn thắng! 🎉" : "Bạn thua! 💥");
        }
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
        // CHẬM HƠN: 200ms giữa mỗi quả bom (50 mìn ~10s drama)
        setTimeout(() => {
            cell.el.innerText = "💣";
            cell.el.classList.add("open", "mine", "explode");
        }, index * 200); // Tăng từ 100ms → 200ms
    });
}

function markWrongFlags() {
    // Animation wrong flags: Chạy chậm từng ô (100ms/ô) cho drama
    let wrongFlags = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = board[i][j];
            if (cell.flag && !cell.mine) {
                wrongFlags.push(cell);
            }
        }
    }
    wrongFlags.sort(() => Math.random() - 0.5);

    wrongFlags.forEach((cell, index) => {
        setTimeout(() => {
            if (cell.removeTimeout) {
                clearTimeout(cell.removeTimeout);
                delete cell.removeTimeout;
            }
            cell.flag = false;
            cell.el.classList.remove("flag");
            void cell.el.offsetWidth;
            cell.el.classList.add("wrong-flag"); // Trigger ❌ animation
        }, index * 100);
    });
}