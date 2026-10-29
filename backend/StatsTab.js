function renderStatsChart() {
    const canvas = document.getElementById("MealsChart");
    if (!canvas || typeof Chart === "undefined") return;
    const consumed = sumFoodTotals(loadFoodLog());
    if (window.statsChart) window.statsChart.destroy();
    window.statsChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: ["Kcal", "Protein", "Fat", "Carbs"],
            datasets: [{ label: "Consumed Today", data: [consumed.kcal, consumed.protein, consumed.fat, consumed.carbs], backgroundColor: ["#EDCBE3", "#CFDECB", "#EFEDA2", "#cbdeed"], borderWidth: 1, borderRadius: 10 }]
        },
        options: { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: "Todays Intake" } }, scales: { y: { display: false }, x: { display: true, grid: { display: false }, line: { display: false }, position: "top", border: { display: false } } } }
    });
}

function showInfo() {
    const consumed = sumFoodTotals(loadFoodLog());
    document.getElementById("TotalKcal").textContent = formatNumber(Math.round(consumed.kcal)) + " kcal";
    document.getElementById("TotalProtein").textContent = formatNumber(Math.round(consumed.protein)) + " g";
    document.getElementById("TotalFat").textContent = formatNumber(Math.round(consumed.fat)) + " g";
    document.getElementById("TotalCarbs").textContent = formatNumber(Math.round(consumed.carbs)) + " g";
}
