const STORAGE_KEY = "userSettings1";
const FOOD_LOG_KEY = "foodLog1";
const CUSTOM_MEALS_KEY = "myCustomMeals";

function readStoredJson(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (error) { return fallback; }
}

function loadSettings() { return readStoredJson(STORAGE_KEY, null); }
function saveSettingsData(settings) { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }
function loadFoodLog() {
    const foodLog = readStoredJson(FOOD_LOG_KEY, []);
    return Array.isArray(foodLog) ? foodLog : [];
}
function saveFoodLog(items) { localStorage.setItem(FOOD_LOG_KEY, JSON.stringify(items)); }
function loadCustomMeals() {
    const meals = readStoredJson(CUSTOM_MEALS_KEY, []);
    return Array.isArray(meals) ? meals : [];
}
function saveCustomMeals(meals) { localStorage.setItem(CUSTOM_MEALS_KEY, JSON.stringify(meals)); }

window.FOOD_DB_DE = [...(window.FOOD_DB_DE || []), ...loadCustomMeals()];
