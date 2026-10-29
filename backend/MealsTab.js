function AppendMeals() {
    const name = document.getElementById("MealsFoodName").value.trim();
    const kcal = Number(document.getElementById("kcal").value);
    const newEntry = {
        name,
        kcal,
        protein: Number(document.getElementById("MealsFoodProtein").value) || 0,
        fat: Number(document.getElementById("MealsFoodFat").value) || 0,
        carbs: Number(document.getElementById("MealsFoodCarbs").value) || 0
    };
    window.FOOD_DB_DE.push(newEntry);
    saveCustomMeals([...loadCustomMeals(), newEntry]);
    document.getElementById("mealForm").reset();
}
