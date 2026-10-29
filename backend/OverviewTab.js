function calculateFromWeight(weight) {
    const kcal = Math.round(weight * 33);
    const protein = Math.round(weight * 2);
    const fat = Math.round(weight * 0.9);
    const carbs = Math.max(0, Math.round((kcal - (protein * 4 + fat * 9)) / 4));
    return { kcal, protein, fat, carbs };
}

function setMode(mode) {
    const isAuto = mode === "auto";
    document.getElementById("autoModeBtn").classList.toggle("active", isAuto);
    document.getElementById("manualModeBtn").classList.toggle("active", !isAuto);
    document.getElementById("autoModeArea").classList.toggle("hidden", !isAuto);
    document.getElementById("manualModeArea").classList.toggle("hidden", isAuto);
}

function getSettingsFromForm() {
    const mode = document.getElementById("autoModeBtn").classList.contains("active") ? "auto" : "manual";
    if (mode === "auto") {
        const weight = Number(document.getElementById("weightInput").value);
        if (!weight || weight < 30) return null;
        return { mode, weight, goals: calculateFromWeight(weight) };
    }
    const goals = {
        kcal: Number(document.getElementById("manualKcal").value),
        protein: Number(document.getElementById("manualProtein").value),
        fat: Number(document.getElementById("manualFat").value),
        carbs: Number(document.getElementById("manualCarbs").value)
    };
    if (!goals.kcal || !goals.protein || !goals.fat || !goals.carbs) return null;
    return { mode, goals };
}

function getPercent(value, goal) {
    if (!goal || goal <= 0) return 0;
    return Math.min(100, Math.round((value / goal) * 100));
}

function updateOverview(settings, foodLog) {
    if (!settings || !settings.goals) return;
    const consumed = sumFoodTotals(foodLog || []);
    const goals = settings.goals;
    document.getElementById("goalKcal").textContent = formatNumber(goals.kcal) + " kcal";
    document.getElementById("goalProtein").textContent = Math.round(consumed.protein) + " / " + goals.protein + "g";
    document.getElementById("goalFat").textContent = Math.round(consumed.fat) + " / " + goals.fat + "g";
    document.getElementById("goalCarbs").textContent = Math.round(consumed.carbs) + " / " + goals.carbs + "g";
    document.getElementById("goalProteinBar").style.width = getPercent(consumed.protein, goals.protein) + "%";
    document.getElementById("goalFatBar").style.width = getPercent(consumed.fat, goals.fat) + "%";
    document.getElementById("goalCarbsBar").style.width = getPercent(consumed.carbs, goals.carbs) + "%";
    document.getElementById("todayKcalValue").textContent = formatNumber(Math.round(consumed.kcal)) + " kcal";
    document.getElementById("overValue").textContent = formatNumber(Math.round(goals.kcal - consumed.kcal)) + " kcal";
    const progress = document.getElementById("kcalProgress");
    progress.max = Math.max(1, goals.kcal);
    progress.value = Math.min(goals.kcal, Math.round(consumed.kcal));
}

function fillForm(settings) {
    setMode(settings.mode || "auto");
    if (settings.mode === "auto" && settings.weight) document.getElementById("weightInput").value = settings.weight;
    if (settings.mode === "manual" && settings.goals) {
        document.getElementById("manualKcal").value = settings.goals.kcal || "";
        document.getElementById("manualProtein").value = settings.goals.protein || "";
        document.getElementById("manualFat").value = settings.goals.fat || "";
        document.getElementById("manualCarbs").value = settings.goals.carbs || "";
    }
}

function saveSettings() {
    const settings = getSettingsFromForm();
    if (!settings) return;
    saveSettingsData(settings);
    updateOverview(settings, loadFoodLog());
    openOverview();
}

function slideSettings() { document.getElementById("overviewSettings").style.top = "-10vh"; }
function closeAllPopups() { document.getElementById("overviewSettings").style.top = "-150vh"; }
