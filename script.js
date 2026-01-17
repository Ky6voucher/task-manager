let currentUser = "";
let currentFilter = "all";

/* ===== LOGIN PAGE ===== */
function login() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;

    if (!u || !p) {
        document.getElementById("msg").innerText = "Isi username & password!";
        return;
    }

    localStorage.setItem("user", u);
    window.location.href = "dashboard.html";
}

/* ===== AUTH CHECK ===== */
window.onload = () => {
    if (location.pathname.includes("dashboard")) {
        const user = localStorage.getItem("user");
        if (!user) {
            window.location.href = "index.html";
            return;
        }
        currentUser = user;
        document.getElementById("userTitle").innerText =
            "Task Manager - " + currentUser;

        loadTasks();
        setInterval(checkReminder, 60000);
    }
};

/* ===== LOGOUT ===== */
function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

/* ===== STORAGE ===== */
function getTasks() {
    return JSON.parse(localStorage.getItem("tasks_" + currentUser)) || [];
}

function saveTasks(tasks) {
    localStorage.setItem("tasks_" + currentUser, JSON.stringify(tasks));
}

/* ===== TASK ===== */
function addTask() {
    if (!taskTitle.value || !taskDeadline.value) return;

    const tasks = getTasks();
    tasks.push({
        title: taskTitle.value,
        desc: taskDesc.value,
        deadline: taskDeadline.value,
        priority: taskPriority.value,
        category: taskCategory.value,
        done: false,
        reminded: false
    });

    saveTasks(tasks);
    taskTitle.value = taskDesc.value = taskCategory.value = "";
    loadTasks();
}

function loadTasks() {
    const tasks = getTasks();
    taskList.innerHTML = "";

    let filtered = tasks.filter(t => {
        if (currentFilter === "done") return t.done;
        if (currentFilter === "pending") return !t.done;
        if (currentFilter === "high") return t.priority === "High";
        return true;
    });

    let done = 0;
    filtered.forEach((t, i) => {
        if (t.done) done++;

        const li = document.createElement("li");
        li.className = `${t.priority.toLowerCase()} ${t.done ? "done" : ""}`;

        li.innerHTML = `
            <strong>${t.title}</strong> (${t.category})
            <br>${t.desc}
            <br>⏰ ${t.deadline}
            <br>
            <button onclick="toggleDone(${i})">✔</button>
            <button onclick="deleteTask(${i})">🗑</button>
        `;
        taskList.appendChild(li);
    });

    updateStats(tasks);
}

function toggleDone(i) {
    const tasks = getTasks();
    tasks[i].done = !tasks[i].done;
    saveTasks(tasks);
    loadTasks();
}

function deleteTask(i) {
    const tasks = getTasks();
    tasks.splice(i, 1);
    saveTasks(tasks);
    loadTasks();
}

/* ===== FILTER & SORT ===== */
function setFilter(f) {
    currentFilter = f;
    loadTasks();
}

function sortTask(type) {
    const tasks = getTasks();
    const rank = { High: 1, Medium: 2, Low: 3 };

    if (type === "priority") {
        tasks.sort((a, b) => rank[a.priority] - rank[b.priority]);
    } else {
        tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    saveTasks(tasks);
    loadTasks();
}

/* ===== STATS ===== */
function updateStats(tasks) {
    const done = tasks.filter(t => t.done).length;
    totalTask.innerText = "Total: " + tasks.length;
    doneTask.innerText = "Selesai: " + done;
    pendingTask.innerText = "Belum: " + (tasks.length - done);
    progressBar.style.width =
        tasks.length ? (done / tasks.length) * 100 + "%" : "0%";
}

/* ===== REMINDER ===== */
function checkReminder() {
    const tasks = getTasks();
    const now = new Date();

    tasks.forEach(t => {
        if (!t.done && !t.reminded && new Date(t.deadline) <= now) {
            alert(`⏰ Deadline!\n${t.title}`);
            t.reminded = true;
        }
    });

    saveTasks(tasks);
}
