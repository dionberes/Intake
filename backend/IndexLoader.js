const STORAGE_KEY = "bulkTrackerUserSettingsV1";
const FOOD_LOG_KEY = "bulkTrackerFoodLogV1";
// const FOOD_DB = window.FOOD_DB_DE || [];
let selectedFood = null;

function formatNumber(value) {
    return Number(value).toLocaleString("de-DE");
}

function setMode(mode) {
    const autoBtn = document.getElementById("autoModeBtn");
    const manualBtn = document.getElementById("manualModeBtn");
    const autoArea = document.getElementById("autoModeArea");
    const manualArea = document.getElementById("manualModeArea");

    const isAuto = mode === "auto";
    
    autoBtn.classList.toggle("active", isAuto);
    manualBtn.classList.toggle("active", !isAuto);
    autoArea.classList.toggle("hidden", !isAuto);
    manualArea.classList.toggle("hidden", isAuto);
}
//berechnet all das zeug mit nur deinem Gewicht (starke ebuka)
function calculateFromWeight(weight) {
    const kcal = Math.round(weight * 33);
    const protein = Math.round(weight * 2);
    const fat = Math.round(weight * 0.9);
    const carbs = Math.max(0, Math.round((kcal - (protein * 4 + fat * 9)) / 4));
    return { kcal, protein, fat, carbs };
}

function getSettingsFromForm() {
    const mode = document.getElementById("autoModeBtn").classList.contains("active") ? "auto" : "manual";

    if (mode === "auto") {
        const weight = Number(document.getElementById("weightInput").value);
        if (!weight || weight < 30) {
            return null;
        }
        return { mode, weight, goals: calculateFromWeight(weight) };
    }

    const kcal = Number(document.getElementById("manualKcal").value);
    const protein = Number(document.getElementById("manualProtein").value);
    const fat = Number(document.getElementById("manualFat").value);
    const carbs = Number(document.getElementById("manualCarbs").value);

    if (!kcal || !protein || !fat || !carbs) {
        return null;
    }
    //rundet alles auf. damit am ende alles aufgerundet ist nh. das ist sehr gut falls du eine zahl hast die z.b
    //12345.513123123123123123 ist und du nur 12345.0 brauchst. "Top ten Computer Science Tutorials"
    return {
        mode,
        goals: { kcal: Math.round(kcal), protein: Math.round(protein), fat: Math.round(fat), carbs: Math.round(carbs) }
    };
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
// verwandelt normale integer zu einer 1/100 zahl
function getPercent(value, goal) {
    if (!goal || goal <= 0) return 0;
    return Math.min(100, Math.round((value / goal) * 100));
}
//läd alles neu damit alles auf der UI angezeigt wird
function updateOverview(settings, foodLog) {
    if (!settings || !settings.goals) return;
    const consumed = sumFoodTotals(foodLog || []);

    const goals = settings.goals;
    const goalKcalEl = document.getElementById("goalKcal");
    const goalProteinEl = document.getElementById("goalProtein");
    const goalFatEl = document.getElementById("goalFat");
    const goalCarbsEl = document.getElementById("goalCarbs");
    const goalProteinBarEl = document.getElementById("goalProteinBar");
    const goalFatBarEl = document.getElementById("goalFatBar");
    const goalCarbsBarEl = document.getElementById("goalCarbsBar");
    const todayKcalEl = document.getElementById("todayKcalValue");
    const overValueEl = document.getElementById("overValue");

    if (goalKcalEl) goalKcalEl.textContent = formatNumber(goals.kcal) + " kcal";
    if (goalProteinEl) goalProteinEl.textContent = Math.round(consumed.protein) + " / " + goals.protein + "g";
    if (goalFatEl) goalFatEl.textContent = Math.round(consumed.fat) + " / " + goals.fat + "g";
    if (goalCarbsEl) goalCarbsEl.textContent = Math.round(consumed.carbs) + " / " + goals.carbs + "g";
    if (goalProteinBarEl) goalProteinBarEl.style.width = getPercent(consumed.protein, goals.protein) + "%";
    if (goalFatBarEl) goalFatBarEl.style.width = getPercent(consumed.fat, goals.fat) + "%";
    if (goalCarbsBarEl) goalCarbsBarEl.style.width = getPercent(consumed.carbs, goals.carbs) + "%";
    if (todayKcalEl) todayKcalEl.textContent = formatNumber(Math.round(consumed.kcal)) + " kcal";
    if (overValueEl) overValueEl.textContent = formatNumber(Math.round(goals.kcal - consumed.kcal)) + " kcal";

    const kcalProgress = document.getElementById("kcalProgress");
    if (kcalProgress) {
        kcalProgress.max = Math.max(1, goals.kcal);
        kcalProgress.value = Math.min(goals.kcal, Math.round(consumed.kcal));
    }
}

function fillForm(settings) {
    if (!settings) return;
    setMode(settings.mode || "auto");

    if (settings.mode === "auto" && settings.weight) {
        document.getElementById("weightInput").value = settings.weight;
    }
    if (settings.mode === "manual" && settings.goals) {
        document.getElementById("manualKcal").value = settings.goals.kcal || "";
        document.getElementById("manualProtein").value = settings.goals.protein || "";

        document.getElementById("manualFat").value = settings.goals.fat || "";
        document.getElementById("manualCarbs").value = settings.goals.carbs || "";
    }
}

function saveSettings() {
    const settings = getSettingsFromForm();
    if (!settings) {
        alert("Bitte alle notwendigen Felder korrekt ausfuellen.");
        return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    updateOverview(settings, loadFoodLog());
    alert("Gespeichert.");
    openHome();
}

function loadSettings() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (err) {
        return null;}
}

function loadFoodLog() {
    const raw = localStorage.getItem(FOOD_LOG_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } 
    catch (err) {
        return [];
    }
}

function saveFoodLog(items) {
    localStorage.setItem(FOOD_LOG_KEY, JSON.stringify(items));
}

function setFoodMode(mode) {
    const dbBtn = document.getElementById("foodDbModeBtn");
    const manualBtn = document.getElementById("foodManualModeBtn");
    const dbArea = document.getElementById("foodDbArea");
    const manualArea = document.getElementById("foodManualArea");
    const isDb = mode === "db";

    dbBtn.classList.toggle("active", isDb);
    manualBtn.classList.toggle("active", !isDb);
    dbArea.classList.toggle("hidden", !isDb);
    manualArea.classList.toggle("hidden", isDb);
}

function renderSearchResults(query) {
    const container = document.getElementById("foodSearchResults");
    const search = (query || "").trim().toLowerCase();
    container.innerHTML = "";

    if (!search) return;

    const matches = (window.FOOD_DB_DE || []).filter(food => food.name.toLowerCase().includes(search)).slice(0, 4);
    if (!matches.length) {
        container.innerHTML = "<p class='food-search-empty'>No results.</p>";
        return;
    }

    matches.forEach(food => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "food-result-item";
        btn.innerHTML = "<strong>" + food.name + "</strong><span>" + food.kcal + " kcal | P " + food.protein + " | F " + food.fat + " | C " + food.carbs + "</span>";
        btn.addEventListener("click", () => {
            selectedFood = food;
            renderSelectedFood();
        });
        container.appendChild(btn);
    });
}

function renderSelectedFood() {
    const card = document.getElementById("selectedFoodCard");
    const amount = Number(document.getElementById("foodAmountInput").value) || 1;
    if (!selectedFood) {
        card.innerHTML = "<p>Kein Food ausgewaehlt.</p>";
        return;
    }

    const kcal = Math.round(selectedFood.kcal * amount);
    const protein = Math.round(selectedFood.protein * amount);
    const fat = Math.round(selectedFood.fat * amount);
    const carbs = Math.round(selectedFood.carbs * amount);
    card.innerHTML = "<h4>" + selectedFood.name + "</h4><p>" + kcal + " kcal | P " + protein + " | F " + fat + " | C " + carbs + "</p>";
}

function getFoodEntryFromForm() {
    const isDbMode = document.getElementById("foodDbModeBtn").classList.contains("active");
    if (isDbMode) {
        if (!selectedFood) return null;
        const amount = Number(document.getElementById("foodAmountInput").value);
        if (!amount || amount <= 0) return null;
        return {
            id: Date.now(),
            name: selectedFood.name,
            kcal: Math.round(selectedFood.kcal * amount),
            protein: Math.round(selectedFood.protein * amount),
            fat: Math.round(selectedFood.fat * amount),
            carbs: Math.round(selectedFood.carbs * amount)
        };
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
    list.innerHTML = "";
    if (!log.length) {
        list.innerHTML = "<p class='food-search-empty'>Nothing yet added.</p>";
        return;
    }

    log.slice().reverse().forEach(item => {
        const row = document.createElement("div");
        row.className = "food-log-item";
        row.id = "food-log-item"
        row.innerHTML = "<div><h4>" + item.name + "</h4><p>" + item.kcal + " kcal | P " + item.protein + " | F " + item.fat + " | C " + item.carbs + "</p></div><button type='button' class='del-btn' style='background-color: transparent; border: none;' data-id='" + item.id + "'><i class='fi fi-tr-circle-xmark'></i></button>";
        row.querySelector("button").addEventListener("click", () => removeFood(item.id));
        list.appendChild(row);
    });
    showInfo();
}

function addFoodEntry() {
    const entry = getFoodEntryFromForm();
    if (!entry) {
        alert("Falsche Essens Daten.");
        return;
    }
    const log = loadFoodLog();
    log.push(entry);
    saveFoodLog(log);
    renderFoodLog();
    const settings = loadSettings();
    if (settings) updateOverview(settings, log);
    openHome();
}

function removeFood(id) {
    const log = loadFoodLog().filter(item => item.id !== id);
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

function openHome() {
    document.getElementById("overviewTab").classList.remove("hidden");
    document.getElementById("userTab").classList.add("hidden");
    document.getElementById("addTab").classList.add("hidden");
    document.getElementById("AppendTab").classList.add("hidden");
    document.getElementById("StatsTab").classList.add("hidden");
}

function openUser() {
    document.getElementById("overviewTab").classList.add("hidden");
    document.getElementById("userTab").classList.remove("hidden");
    document.getElementById("addTab").classList.add("hidden");
    document.getElementById("AppendTab").classList.add("hidden");
    document.getElementById("StatsTab").classList.add("hidden");
}

function openAdd() {
    document.getElementById("overviewTab").classList.add("hidden");
    document.getElementById("userTab").classList.add("hidden");
    document.getElementById("addTab").classList.remove("hidden");
    document.getElementById("AppendTab").classList.add("hidden");
    document.getElementById("StatsTab").classList.add("hidden");
    renderFoodLog();
}

function openMeals() {
    document.getElementById("overviewTab").classList.add("hidden");
    document.getElementById("userTab").classList.add("hidden");
    document.getElementById("addTab").classList.add("hidden");
    document.getElementById("AppendTab").classList.remove("hidden");
    document.getElementById("StatsTab").classList.add("hidden");
}
function openStats() {
    document.getElementById("overviewTab").classList.add("hidden");
    document.getElementById("userTab").classList.add("hidden");
    document.getElementById("addTab").classList.add("hidden");
    document.getElementById("AppendTab").classList.add("hidden");
    document.getElementById("StatsTab").classList.remove("hidden");

    renderStatsChart();
}

function renderStatsChart() {
    const foodLog = loadFoodLog();
    const consumed = sumFoodTotals(foodLog);

    const ctx = document.getElementById('MealsChart');
    if (window.statsChart) {
        window.statsChart.destroy();
    }
    window.statsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Kcal', 'Protein', 'Fat', 'Carbs'],
            datasets: [{
                label: 'Consumed Today',
                data: [consumed.kcal, consumed.protein, consumed.fat, consumed.carbs],
                backgroundColor: [
                    '#EDCBE3',
                    '#CFDECB',
                    '#EFEDA2',
                    '#cbdeed'
                ],
                borderWidth: 1,
                borderRadius: 10,

            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Todays Intake'
                }
            },
            scales: {
                y: {
                    display: false,
                },
                x: {
                    display: true,
                    grid: {
                        display: false,
                    },
                    line: {
                        display: false,
                    },
                    position: "top",
                    border: {display: false,}
                }
            },
        }
    });
}

function showInfo() {
    const foodLog = loadFoodLog();
    const consumed = sumFoodTotals(foodLog);

    const KcalLabel = document.getElementById("TotalKcal");
    const ProteinLabel = document.getElementById("TotalProtein");
    const FatLabel = document.getElementById("TotalFat");
    const CarbsLabel = document.getElementById("TotalCarbs");


    KcalLabel.textContent = formatNumber(Math.round(consumed.kcal)) + " kcal";
    ProteinLabel.textContent = formatNumber(Math.round(consumed.protein)) + " g";
    FatLabel.textContent = formatNumber(Math.round(consumed.fat)) + " g";
    CarbsLabel.textContent = formatNumber(Math.round(consumed.carbs)) + " g";
}
// zeigt eine "quote" an
function showRandomQuote() {
    const quotes = [
        "Are you already feeling fit?",
        "Already feeling Hungry?",
        "What do you want to do now?",
        "Hungry or just bored? Drink some water.",
        "Does your workout know you're here?",
        "Who pays for an Tracking App? Just build one.",
        "Focus. The fridge isn't the solution.",
        "Push, Pull, Skip?",];
    
    const quoteLabel = document.getElementById("Quote-D");
    
    if (quoteLabel) {
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteLabel.innerText = quote;
    }
}       


document.getElementById("autoModeBtn").addEventListener("click", () => setMode("auto"));
document.getElementById("manualModeBtn").addEventListener("click", () => setMode("manual"));
document.getElementById("saveUserBtn").addEventListener("click", saveSettings);
document.getElementById("foodDbModeBtn").addEventListener("click", () => setFoodMode("db"));
document.getElementById("foodManualModeBtn").addEventListener("click", () => setFoodMode("manual"));
document.getElementById("foodSearchInput").addEventListener("input", (event) => renderSearchResults(event.target.value));
document.getElementById("foodAmountInput").addEventListener("input", renderSelectedFood);
document.getElementById("saveFoodBtn").addEventListener("click", addFoodEntry);
document.getElementById("clearFoodsBtn").addEventListener("click", clearFoods);

const initialSettings = loadSettings();
const initialFoodLog = loadFoodLog();
if (initialSettings) {
    fillForm(initialSettings);
    updateOverview(initialSettings, initialFoodLog);
} else {
    setMode("auto");
}
setFoodMode("db");
renderFoodLog();
showInfo();
