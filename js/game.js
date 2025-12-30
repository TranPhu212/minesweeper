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

    // Mở ô hiện tại ngay lập tức + TRIGGER ANIM
    cell.open = true;
    cell.el.classList.add("open", "shake-light");  // ← THÊM SHAKE-LIGHT

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
        openEmptyArea(i, j);
    }

    checkWin();
}

function openEmptyArea(startI, startJ) {
    const queue = [{i: startI, j: startJ}];
    const visited = new Set();

    while (queue.length > 0) {
        const {i, j} = queue.shift();
        const key = `${i},${j}`;
        if (visited.has(key)) continue;
        visited.add(key);

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                const ni = i + x;
                const nj = j + y;

                if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                    const neighbor = board[ni][nj];

                    if (!neighbor.open && !neighbor.flag && !neighbor.mine) {
                        neighbor.open = true;
                        neighbor.el.classList.add("open", "shake-light");  // ← THÊM SHAKE VÀO FLOOD

                        if (neighbor.count > 0) {
                            neighbor.el.innerText = neighbor.count;
                            neighbor.el.dataset.n = neighbor.count;
                        } else {
                            queue.push({i: ni, j: nj});
                        }
                    }
                }
            }
        }
    }
}

function toggleFlag(i, j) {
    if (gameOver) return;

    const cell = board[i][j];
    if (cell.open) return;
    if (!cell.flag && flagsLeft === 0) return;

    if (!cell.flag) {
        cell.flag = true;
        cell.el.innerText = "";
        cell.el.classList.remove("flag");
        void cell.el.offsetWidth;
        cell.el.classList.add("flag");
        flagsLeft--;
    } else {
        cell.el.classList.add("flag-removing");
        setTimeout(() => {
            cell.flag = false;
            cell.el.innerText = "";
            cell.el.classList.remove("flag", "flag-removing");
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
        setTimeout(() => wrapper.classList.remove("screen-shake"), 2500);

        explodeUnflaggedMines();
        markWrongFlags();
    }

    const delay = win ? 200 : mines * 80 + 800;

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
            if (cell.mine && !cell.flag) {
                unflaggedMines.push(cell);
            }
        }
    }
    unflaggedMines.sort(() => Math.random() - 0.5);

    unflaggedMines.forEach((cell, index) => {
        setTimeout(() => {
            cell.el.innerText = "💣";
            cell.el.classList.add("mine", "explode");
        }, index * 80);
    });
}

function markWrongFlags() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = board[i][j];
            if (cell.flag && !cell.mine) {
                cell.flag = false;
                cell.el.classList.remove("flag");
                void cell.el.offsetWidth;
                cell.el.classList.add("wrong-flag");
            }
        }
    }
}

function floodOpen(startI, startJ) {
    let queue = [{ i: startI, j: startJ }];
    let delay = 0;
    const stepDelay = 35;

    while (queue.length > 0) {
        const { i, j } = queue.shift();
        const cell = board[i][j];

        if (cell.open || cell.flag) continue;

        setTimeout(() => {
            cell.open = true;
            cell.el.classList.add("open");

            if (cell.count > 0) {
                cell.el.innerText = cell.count;
                cell.el.dataset.n = cell.count;
            }
        }, delay);

        if (cell.count === 0) {
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    let ni = i + x, nj = j + y;
                    if (ni >= 0 && nj >= 0 && ni < rows && nj < cols) {
                        const next = board[ni][nj];
                        if (!next.open && !next.mine && !next.flag) {
                            queue.push({ i: ni, j: nj });
                        }
                    }
                }
            }
        }

        delay += stepDelay;
    }

    setTimeout(checkWin, delay + 50);
}