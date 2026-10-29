const addButton = document.getElementById("addBtn");

function formatNumber(value) {
    return Number(value).toLocaleString("de-DE");
}

function sumFoodTotals(foodLog) {
    return foodLog.reduce((acc, item) => {
        acc.kcal += Number(item.kcal) || 0;
        acc.protein += Number(item.protein) || 0;
        acc.fat += Number(item.fat) || 0;
        acc.carbs += Number(item.carbs) || 0;
        return acc;
    }, { kcal: 0, protein: 0, fat: 0, carbs: 0 });
}

function hideAllTabs() {
    ["overviewTab", "addTab", "StatsTab", "gymTab"].forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.classList.add("hidden");
    });
}

function setAddButtonVisibility(isVisible) {
    addButton.style.border = "none";
    addButton.style.outline = "none";
}

function addBtnStyle() {
    const addButton = document.getElementById("addBtn");
    addButton.style.backgroundColor = "#2c2c2e";
    addButton.querySelector("i").style.color = "#ffffff";
}

function openAdd() {
    hideAllTabs();
    setAddButtonVisibility(true);
    document.getElementById("addTab").classList.remove("hidden");
    document.getElementById("AppendTab").classList.remove("is-open");
    document.getElementById("openAddFoodTab").setAttribute("aria-expanded", "false");
    renderFoodLog();
    document.getElementById("gymBtn").innerHTML = '<i class="fi fi-rr-gym"></i>';
    document.getElementById("userBtn").innerHTML = '<i class="fi fi-rr-croissant"></i>';
    addButton.style.backgroundColor = "#f0f0f0";
    addButton.querySelector("i").style.color = "#000";
    addButton.style.outline = "2px solid #f2f2f2";
    addButton.style.outlineOffset = "3px";
}

function openMeals() {
    document.getElementById("AppendTab").classList.add("is-open");
    document.getElementById("openAddFoodTab").setAttribute("aria-expanded", "true");
}

function openOverview() {
    hideAllTabs();
    setAddButtonVisibility(false);
    document.getElementById("overviewTab").classList.remove("hidden");
    document.getElementById("gymBtn").innerHTML = '<i class="fi fi-rr-gym"></i>';
    document.getElementById("userBtn").innerHTML = '<i class="fi fi-sr-croissant"></i>';
    renderStatsChart();
    closeAllPopups();
    addBtnStyle();
}

function openGym() {
    hideAllTabs();
    setAddButtonVisibility(false);
    document.getElementById("gymTab").classList.remove("hidden");
    document.getElementById("gymBtn").innerHTML = '<i class="fi fi-sr-gym"></i>';
    document.getElementById("userBtn").innerHTML = '<i class="fi fi-rr-croissant"></i>';
    addBtnStyle();
    if (!gymState.started) startGymWorkout();
    renderGym();
}

function openHome() {
    openOverview();
}

function initializeApp() {
    const settings = loadSettings();
    const foodLog = loadFoodLog();
    if (settings) {
        fillForm(settings);
        updateOverview(settings, foodLog);
    } else {
        setMode("auto");
    }
    setFoodMode("db");
    renderFoodLog();
    showInfo();
    openOverview();
}
function closeAppendFrame(){
    document.getElementById("AppendTab").classList.remove("is-open");
    document.getElementById("openAddFoodTab").setAttribute("aria-expanded", "false");
}
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("autoModeBtn").addEventListener("click", () => setMode("auto"));
    document.getElementById("manualModeBtn").addEventListener("click", () => setMode("manual"));
    document.getElementById("saveUserBtn").addEventListener("click", saveSettings);
    document.getElementById("foodDbModeBtn").addEventListener("click", () => setFoodMode("db"));
    document.getElementById("foodManualModeBtn").addEventListener("click", () => setFoodMode("manual"));
    document.getElementById("openAddFoodTab").addEventListener("click", openMeals);
    document.getElementById("appendTabClose").addEventListener("click", closeAppendFrame);
    document.getElementById("foodSearchInput").addEventListener("input", (event) => renderSearchResults(event.target.value));
    document.getElementById("foodAmountInput").addEventListener("input", renderSelectedFood);
    document.getElementById("saveFoodBtn").addEventListener("click", addFoodEntry);
    document.getElementById("saveFoodBtn").addEventListener("click", openOverview);
    document.getElementById("clearFoodsBtn").addEventListener("click", clearFoods);
    document.getElementById("lowerFrame").addEventListener("click", openOverview);
    document.getElementById("gymFinishBtn").addEventListener("click", () => gymState.finished ? (resetGymWorkout(), startGymWorkout()) : finishGymWorkout());
    document.getElementById("gymNextBtn").addEventListener("click", goGymNext);
    initializeApp();
});

initializeApp();