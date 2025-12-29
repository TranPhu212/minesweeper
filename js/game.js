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

    cell.open = true;
    cell.el.classList.add("open");

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
        let delay = 40;
        let step = 1;

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                let ni = i + x, nj = j + y;
                if (ni >= 0 && nj >= 0 && ni < rows && nj < cols) {
                    openCellAnimated(ni, nj, step * delay);
                    step++;
                }
            }
        }
    }

    checkWin();
}

function toggleFlag(i, j) {
    if (gameOver) return;

    const cell = board[i][j];
    if (cell.open) return;

    if (!cell.flag && flagsLeft === 0) return;

    if (!cell.flag) {
        cell.flag = true;
        cell.el.innerText = "🚩";
        cell.el.classList.add("flag");
        flagsLeft--;
    } else {
        cell.el.classList.add("flag-removing");

        setTimeout(() => {
            cell.flag = false;
            cell.el.innerText = "";
            cell.el.classList.remove("flag", "flag-removing");
        }, 350);

        flagsLeft++;
    }

    document.getElementById("flags").innerText = flagsLeft;
}

function endGame(win) {
    gameOver = true;
    clearInterval(interval);

    if (!win) {
        explodeMinesSequential();
    }

    const delay = win ? 200 : mines * 60 + 300;

    setTimeout(() => {
        alert(win ? "🎉 Bạn đã thắng!" : "💥 Bạn đã thua!");
        restartCurrentMode();
    }, delay);
}


function checkWin() {
    let opened = board.flat().filter(c => c.open).length;
    if (opened === rows * cols - mines) {
        endGame(true);
    }
}

function openCellAnimated(i, j, delay = 0) {
    setTimeout(() => {
        openCell(i, j);
    }, delay);
}

function explodeMinesSequential() {
    let minesList = [];

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j].mine) {
                minesList.push(board[i][j]);
            }
        }
    }

    // Shuffle nhẹ cho cảm giác tự nhiên
    minesList.sort(() => Math.random() - 0.5);

    minesList.forEach((cell, index) => {
        setTimeout(() => {
            cell.el.innerText = "💣";
            cell.el.classList.add("mine", "explode");
        }, index * 60); // ⏱ delay mỗi quả
    });
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
                        if (!next.open && !next.mine) {
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
