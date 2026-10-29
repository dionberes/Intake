let selectedFood = null;

function setFoodMode(mode) {
    const isDb = mode === "db";
    document.getElementById("foodDbModeBtn").classList.toggle("active", isDb);
    document.getElementById("foodManualModeBtn").classList.toggle("active", !isDb);
    document.getElementById("foodDbArea").classList.toggle("hidden", !isDb);
    document.getElementById("foodManualArea").classList.toggle("hidden", isDb);
}

function renderSearchResults(query) {
    const container = document.getElementById("foodSearchResults");
    const search = (query || "").trim().toLowerCase();
    container.innerHTML = "";
    document.getElementById("saveFoodBtn").hidden = !search;
    if (!search) return;
    const matches = (window.FOOD_DB_DE || []).filter((food) => food.name.toLowerCase().includes(search)).slice(0, 4);
    if (!matches.length) {
        container.innerHTML = "<p class='food-search-empty'>No results.</p>";
        return;
    }
    matches.forEach((food) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "food-result-item";
        button.innerHTML = "<strong>" + food.name + "</strong><span>" + food.kcal + " kcal | P " + food.protein + " | F " + food.fat + " | C " + food.carbs + "</span>";
        button.addEventListener("click", () => { selectedFood = food; renderSelectedFood(); });
        container.appendChild(button);
    });
}

function renderSelectedFood() {
    const card = document.getElementById("selectedFoodCard");
    const amount = Number(document.getElementById("foodAmountInput").value) || 1;
    if (!selectedFood) {
        card.innerHTML = "<p>Kein Food ausgewaehlt.</p>";
        return;
    }
    card.innerHTML = "<h4>" + selectedFood.name + "</h4><p>" + Math.round(selectedFood.kcal * amount) + " kcal | P " + Math.round(selectedFood.protein * amount) + " | F " + Math.round(selectedFood.fat * amount) + " | C " + Math.round(selectedFood.carbs * amount) + "</p>";
}

function getFoodEntryFromForm() {
    const isDbMode = document.getElementById("foodDbModeBtn").classList.contains("active");
    if (isDbMode) {
        const amount = Number(document.getElementById("foodAmountInput").value);
        if (!selectedFood || !amount || amount <= 0) return null;
        return { id: Date.now(), name: selectedFood.name, kcal: Math.round(selectedFood.kcal * amount), protein: Math.round(selectedFood.protein * amount), fat: Math.round(selectedFood.fat * amount), carbs: Math.round(selectedFood.carbs * amount) };
    }
    const name = document.getElementById("manualFoodName").value.trim();
    const kcal = Number(document.getElementById("manualFoodKcal").value);
    const protein = Number(document.getElementById("manualFoodProtein").value);
    const fat = Number(document.getElementById("manualFoodFat").value);
    const carbs = Number(document.getElementById("manualFoodCarbs").value);
    if (!name || !kcal || protein < 0 || fat < 0 || carbs < 0) return null;
    return { id: Date.now(), name, kcal: Math.round(kcal), protein: Math.round(protein), fat: Math.round(fat), carbs: Math.round(carbs) };
}

function renderFoodLog() {
    const list = document.getElementById("foodLogList");
    const log = loadFoodLog();
    list.innerHTML = log.length ? "" : "<p class='food-search-empty'>Nothing yet added.</p>";
    log.slice().reverse().forEach((item) => {
        const row = document.createElement("div");
        row.className = "food-log-item";
        row.innerHTML = "<div><h4>" + item.name + "</h4><p>" + item.kcal + " kcal | P " + item.protein + " | F " + item.fat + " | C " + item.carbs + "</p></div><button type='button' class='del-btn' style='background-color: transparent; border: none;' data-id='" + item.id + "'><i class='fi fi-tr-circle-xmark'></i></button>";
        row.querySelector("button").addEventListener("click", () => removeFood(item.id));
        list.appendChild(row);
    });
    showInfo();
}

function addFoodEntry() {
    const entry = getFoodEntryFromForm();
    if (!entry) return;
    const log = loadFoodLog();
    log.push(entry);
    saveFoodLog(log);
    renderFoodLog();
    const settings = loadSettings();
    if (settings) updateOverview(settings, log);
    openOverview();
}

function removeFood(id) {
    const log = loadFoodLog().filter((item) => item.id !== id);
    saveFoodLog(log);
    renderFoodLog();
    const settings = loadSettings();
    if (settings) updateOverview(settings, log);
}

function clearFoods() {
    saveFoodLog([]);
    renderFoodLog();
    const settings = loadSettings();
    if (settings) updateOverview(settings, []);
}
