window.onload = () => {
    document.getElementById("modeSelect").value = "easy";
    document.getElementById("modeSelect").onchange = changeMode;
    changeMode();
};