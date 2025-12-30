function changeMode() {
    currentMode = document.getElementById("modeSelect").value;
    if (currentMode === "easy") startGame(10, 10, 20);
    if (currentMode === "medium") startGame(20, 20, 50);
    if (currentMode === "hard") startGame(30, 30, 100);
    if (currentMode === "extreme") startGame(50, 50, 200);
}

function restartCurrentMode() {
    changeMode();
}