function changeMode() {
    currentMode = document.getElementById("modeSelect").value;

    // Mines options (3 mốc, <= half cells)
    const minesSelect = document.getElementById("minesSelect");
    minesSelect.innerHTML = '';
    let minesOptions = [];
    if (currentMode === "easy") minesOptions = [10, 15, 20];
    if (currentMode === "medium") minesOptions = [30, 40, 50];
    if (currentMode === "hard") minesOptions = [50, 75, 100];
    if (currentMode === "extreme") minesOptions = [100, 150, 200];

    minesOptions.forEach(num => {
        const opt = document.createElement("option");
        opt.value = num;
        opt.text = `${num} mìn`;
        minesSelect.add(opt);
    });
    minesSelect.value = minesOptions[minesOptions.length - 1];

    // Time options (chỉ update khi cần)
    updateTimeOptions();

    // Start game với mines mới
    startGame(getRowsCols()[0], getRowsCols()[1], minesSelect.value);
}

function getRowsCols() {
    if (currentMode === "easy") return [10, 10];
    if (currentMode === "medium") return [20, 20];
    if (currentMode === "hard") return [30, 30];
    if (currentMode === "extreme") return [50, 50];
}

function updateTimeOptions() {
    const timeSelect = document.getElementById("timeLimitSelect");
    timeSelect.innerHTML = '';
    let timeOptions = [];
    if (currentMode === "easy") timeOptions = [5, 10, 15];
    if (currentMode === "medium") timeOptions = [10, 15, 25];
    if (currentMode === "hard") timeOptions = [15, 25, 30];
    if (currentMode === "extreme") timeOptions = [30, 40, 50];

    timeOptions.forEach(min => {
        const opt = document.createElement("option");
        opt.value = min;
        opt.text = `${min} phút`;
        timeSelect.add(opt);
    });
    timeSelect.value = timeOptions[timeOptions.length - 1];
}

function restartCurrentMode() {
    changeMode();
}

// NEW: Toggle countdown panel
document.getElementById("countdownCheckbox").addEventListener("change", function() {
    const panel = document.getElementById("countdownPanel");
    if (this.checked) {
        panel.style.display = "flex";
        updateTimeOptions();  // Update options khi bật
    } else {
        panel.style.display = "none";
        timeLimit = 0;  // Tắt countdown
    }
    restartCurrentMode();  // Reset game để áp dụng
});