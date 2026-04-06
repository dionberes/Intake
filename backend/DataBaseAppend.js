if (!window.FOOD_DB_DE) {
    window.FOOD_DB_DE = [];
}

const customData = JSON.parse(localStorage.getItem("myCustomMeals")) || [];

window.FOOD_DB_DE = [...window.FOOD_DB_DE, ...customData];

function AppendMeals() {
    const n = document.getElementById("MealsFoodName").value;
    const k = parseInt(document.getElementById("kcal").value);
    const p = parseInt(document.getElementById("MealsFoodProtein").value) || 0;
    const f = parseInt(document.getElementById("MealsFoodFat").value) || 0;
    const c = parseInt(document.getElementById("MealsFoodCarbs").value) || 0;

    if (!n || isNaN(k)) {
        alert("Bitte gib einen Namen und die Kalorien an!");
        return;
    }

    const newEntry = {
        name: n,
        kcal: k,
        protein: p,
        fat: f,
        carbs: c
    };

    window.FOOD_DB_DE.push(newEntry);

    const currentSaved = JSON.parse(localStorage.getItem("myCustomMeals")) || [];
    currentSaved.push(newEntry);
    localStorage.setItem("myCustomMeals", JSON.stringify(currentSaved));

    console.log("Neu hinzugefügt:", newEntry);
    alert(n + " wurde gespeichert!");
    document.getElementById("mealForm").reset();
}