const GYM_EXERCISES = [
    { id: "treadmill", name: "Treadmill", detail: "5 km", icon: "fi fi-rr-running", sets: 1 },
    { id: "planks", name: "Planks", detail: "3 x 30 sec", icon: "fi fi-rr-time-quarter-past", sets: 3 },
    { id: "chins", name: "Chins", detail: "4 sets", icon: "fi fi-rr-gym", sets: 4 },
    { id: "pushups", name: "Push-ups", detail: "3 x 12", icon: "fi fi-rr-fitness", sets: 3 }
];

const gymIcons = {
    treadmill: "fi fi-rr-running",
    planks: "fi fi-rr-time-quarter-past",
    chins: "fi fi-rr-gym",
    pushups: "fi fi-rr-fitness"
};


const gymState = { started: false, finished: false, startTime: 0, elapsed: 0, timerId: null, currentIndex: 0, progress: {} };

function formatGymTime(milliseconds) {
    const total = Math.floor(milliseconds / 1000);
    return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
}
function startGymWorkout() {
    gymState.started = true;
    gymState.finished = false;
    gymState.startTime = Date.now() - gymState.elapsed;
    if (gymState.timerId) clearInterval(gymState.timerId);
    gymState.timerId = setInterval(() => {
        gymState.elapsed = Date.now() - gymState.startTime;
        const timer = document.getElementById("gymTimer");
        if (timer) timer.textContent = formatGymTime(gymState.elapsed);
    }, 250);
}
function finishGymWorkout() {
    renderGym();
}
function resetGymWorkout() {
    renderGym();
}
function getGymDone(exercise) { return gymState.progress[exercise.id] || 0; }
function isGymComplete(exercise) { return getGymDone(exercise) >= exercise.sets; }
function nextIncompleteIndex() {
    const current = GYM_EXERCISES.findIndex((exercise, index) => index >= gymState.currentIndex && !isGymComplete(exercise));
    return current >= 0 ? current : GYM_EXERCISES.findIndex((exercise) => !isGymComplete(exercise));
}
function completeGymSet(id) {
    renderGym();
}

function renderGym() {
    const list = document.getElementById("gymExerciseList");
    if (!list) return;
    document.getElementById("gymTimer").textContent = formatGymTime(gymState.elapsed);
    document.getElementById("gymFinishBtn").textContent = gymState.finished ? "Reset" : "Finish";
    const current = GYM_EXERCISES[gymState.currentIndex] || GYM_EXERCISES[0];
    document.getElementById("gymStatus").textContent = gymState.finished ? "Workout · Finished" : (gymState.started ? current.name + " · In progress" : "Workout · Ready");
    list.innerHTML = "";
    GYM_EXERCISES.forEach((exercise, index) => {
        const done = getGymDone(exercise);
        const complete = isGymComplete(exercise);
        const row = document.createElement("button");
        row.type = "button";
        row.className = "gym-ex-row" + (complete ? " is-done" : "") + (index === gymState.currentIndex && !complete && !gymState.finished ? " is-active" : "");
        const meta = complete ? "Completed" : (done > 0 ? done + " of " + exercise.sets + " sets completed" : (exercise.sets > 1 ? "Check off when done" : exercise.detail));
        row.innerHTML = "<div class='gym-ex-left'><div class='gym-ex-icon" + (complete ? " done" : "") + "'><i class='" + (complete ? "fi fi-rr-check" : exercise.icon) + "'></i></div><div class='gym-ex-text'><strong>" + exercise.name + "</strong><span>" + (complete ? exercise.detail : meta) + "</span></div></div><div class='gym-ex-right'><i class='fi fi-rr-menu-dots'></i><i class='fi fi-rr-angle-small-right'></i></div>";
        row.addEventListener("click", () => { gymState.currentIndex = index; completeGymSet(exercise.id); });
        list.appendChild(row);
    });

    const upcoming = GYM_EXERCISES.find((exercise, index) => index > gymState.currentIndex && !isGymComplete(exercise)) || GYM_EXERCISES.find((exercise) => !isGymComplete(exercise));

    document.getElementById("gymNextName").textContent = upcoming ? upcoming.name : "Done";
    document.getElementById("gymNextIcon").innerHTML = upcoming ? "<i class='" + upcoming.icon + "'></i>" : "<i class='fi fi-rr-check'></i>";
}
