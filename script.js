// flags
let isAdmin = false;
let isUserLoggedIn = false;
let currentEventId = null;
let currentAdminEventFilter = null; // which event's registrations admin is viewing

const eventsKey = "eventsData";
const regsKey = "registrationsData";

// default credentials
const USER_CRED = { username: "UserName", password: "Password" };
const ADMIN_CRED = { username: "AdminName", password: "Password" };

// modals
const userLoginModal = new bootstrap.Modal(
    document.getElementById("userLoginModal")
);
const adminLoginModal = new bootstrap.Modal(
    document.getElementById("adminLoginModal")
);
const registerModal = new bootstrap.Modal(
    document.getElementById("registerModal")
);

// toggle show/hide password
function togglePassword(inputId, checkId) {
    const input = document.getElementById(inputId);
    const chk = document.getElementById(checkId);
    input.type = chk.checked ? "text" : "password";
}

// default events
const defaultEvents = [
    {
        id: 1,
        title: "Cybersecurity Workshop",
        desc: "Learn ethical hacking, penetration testing & network security fundamentals",
        date: "2025-12-28T10:00"
    },
    {
        id: 2,
        title: "Python for Data Science",
        desc: "Hands-on Pandas, NumPy, Matplotlib & basic ML algorithms",
        date: "2025-12-30T14:00"
    },
    {
        id: 3,
        title: "Web Development Bootcamp",
        desc: "HTML, CSS, JavaScript, React & deployment strategies",
        date: "2026-01-04T09:30"
    },
    {
        id: 4,
        title: "IoT Smart Home Project",
        desc: "Build home automation using Raspberry Pi & Python",
        date: "2026-01-07T11:00"
    },
    {
        id: 5,
        title: "AI/ML Hackathon",
        desc: "24-hour coding challenge with real-world datasets",
        date: "2026-01-11T09:00"
    }
];

// init events once
function initializeDefaultEvents() {
    if (!localStorage.getItem(eventsKey)) {
        localStorage.setItem(eventsKey, JSON.stringify(defaultEvents));
    }
}

function loadEvents() {
    return JSON.parse(localStorage.getItem(eventsKey)) || [];
}

function saveEvents(events) {
    localStorage.setItem(eventsKey, JSON.stringify(events));
}

// shared credentials check
function validateCredentials(type, username, password) {
    username = username.trim();
    password = password.trim();

    if (!username || !password) {
        alert("Please enter username and password");
        return false;
    }

    if (type === "admin") {
        if (username === ADMIN_CRED.username && password === ADMIN_CRED.password) {
            return true;
        }
        alert("Invalid admin name or password");
        return false;
    }

    if (username === USER_CRED.username && password === USER_CRED.password) {
        return true;
    }
    alert("Invalid user name or password");
    return false;
}

// open login modal
function openLogin(type) {
    if (type === "admin") adminLoginModal.show();
    else userLoginModal.show();
}

// USER LOGIN
function loginUser() {
    const u = document.getElementById("userName").value;
    const p = document.getElementById("userPass").value;

    if (!validateCredentials("user", u, p)) return;

    isUserLoggedIn = true;
    userLoginModal.hide();
    alert("User login successful");
    loadUserView();
}

// ADMIN LOGIN
function loginAdmin() {
    const u = document.getElementById("adminName").value;
    const p = document.getElementById("adminPass").value;

    if (!validateCredentials("admin", u, p)) return;

    isAdmin = true;
    adminLoginModal.hide();
    document.getElementById("adminSection").classList.add("active");
    document.getElementById("userSection").classList.remove("active");
    currentAdminEventFilter = null;
    loadAdminView();
    alert("Admin login successful");
}

// USER VIEW
function loadUserView() {
    document.getElementById("userSection").classList.add("active");

    // Show all events sorted by date (no future-only filter, so demo always works)
    const events = loadEvents()
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const container = document.getElementById("eventsList");

    if (events.length === 0) {
        container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fas fa-calendar-times fa-3x text-white-50 mb-4"></i>
          <h3 class="text-white mb-2">No events</h3>
        </div>`;
        return;
    }

    container.innerHTML = events
        .map(e => {
            const actionArea = isUserLoggedIn
                ? `<button class="btn btn-primary btn-sm"
                        onclick="showRegisterForm(${e.id}, '${e.title.replace(/'/g, "\\'")}')">
                        <i class="fas fa-user-plus me-1"></i>Join Now
                   </button>`
                : `<span class="text-muted small">Login as User to join</span>`;

            return `
      <div class="col-xl-4 col-lg-6 col-md-6 mb-4">
        <div class="event-card h-100">
          <h4 class="mb-2">${e.title}</h4>
          <div class="badge bg-primary mb-2">
            ${new Date(e.date).toLocaleDateString("en-IN")}
          </div>
          <p>${e.desc}</p>
          <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
            <small class="text-muted">
              <i class="fas fa-clock me-1"></i>
              ${new Date(e.date).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit"
              })}
            </small>
            ${actionArea}
          </div>
        </div>
      </div>`;
        })
        .join("");
}

// registration modal
function showRegisterForm(eventId, eventTitle) {
    document.getElementById("modalTitle").innerHTML =
        '<i class="fas fa-calendar me-2"></i>' + eventTitle;
    document.getElementById("regEventId").value = eventId;
    document.getElementById("regName").value = "";
    document.getElementById("regYear").value = "";
    document.getElementById("regDept").value = "";
    document.getElementById("regEmail").value = "";
    document.getElementById("regPhone").value = "";
    registerModal.show();
}

// VALIDATION FOR REGISTRATION FORM
function validateRegistrationInputs(name, dept, email, phone) {
    const nameRegex = /^[A-Za-z]{2,}\s+[A-Za-z]{2,}$/;       // "John Kumar"
    const deptRegex = /^[A-Za-z\s]{2,}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;     // must end with @gmail.com
    const phoneRegex = /^[89]\d{9}$/;                        // 10 digits, starting with 8 or 9

    if (!nameRegex.test(name)) {
        alert("Enter full name as First Last (letters only, at least 2 letters each).");
        return false;
    }
    if (!deptRegex.test(dept)) {
        alert("Enter a valid department name (only letters and spaces).");
        return false;
    }
    if (!emailRegex.test(email)) {
        alert("Enter a valid Gmail address (must end with @gmail.com).");
        return false;
    }
    if (!phoneRegex.test(phone)) {
        alert("Enter a 10-digit phone number starting with 8 or 9.");
        return false;
    }
    return true;
}

function submitRegistration() {
    const name = document.getElementById("regName").value.trim();
    const year = document.getElementById("regYear").value.trim();
    const dept = document.getElementById("regDept").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();

    if (!validateRegistrationInputs(name, dept, email, phone)) return;

    const regs = JSON.parse(localStorage.getItem(regsKey)) || [];
    regs.push({
        eventId: parseInt(document.getElementById("regEventId").value, 10),
        name,
        year,
        dept,
        email,
        phone,
        registered: new Date().toISOString()
    });
    localStorage.setItem(regsKey, JSON.stringify(regs));
    registerModal.hide();
    alert("Registration successful");
}

// ADMIN VIEW
function addOrUpdateEvent() {
    if (!isAdmin) {
        alert("Admin login required");
        return;
    }
    const title = document.getElementById("eventTitle").value.trim();
    const desc = document.getElementById("eventDesc").value.trim();
    const date = document.getElementById("eventDate").value;
    if (!title || !desc || !date) {
        alert("Fill all event fields");
        return;
    }
    const events = loadEvents();
    if (currentEventId) {
        const idx = events.findIndex(e => e.id === currentEventId);
        if (idx !== -1) {
            events[idx].title = title;
            events[idx].desc = desc;
            events[idx].date = date;
        }
        alert("Event updated");
    } else {
        events.push({ id: Date.now(), title, desc, date });
        alert("Event added");
    }
    saveEvents(events);
    currentEventId = null;
    clearEventForm();
    loadAdminView();
}

function clearEventForm() {
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDesc").value = "";
    document.getElementById("eventDate").value = "";
}

function editEvent(id) {
    const events = loadEvents();
    const e = events.find(ev => ev.id === id);
    if (!e) return;
    currentEventId = id;
    document.getElementById("eventTitle").value = e.title;
    document.getElementById("eventDesc").value = e.desc;
    document.getElementById("eventDate").value = e.date;
}

// when admin clicks "View registrations" of one event
function viewEventRegistrations(id) {
    currentAdminEventFilter = id;
    loadRegistrations();
}

function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    const events = loadEvents().filter(e => e.id !== id);
    saveEvents(events);
    if (currentAdminEventFilter === id) currentAdminEventFilter = null;
    loadAdminView();
}

function loadAdminEvents() {
    const events = loadEvents();
    const container = document.getElementById("adminEventsList");
    if (events.length === 0) {
        container.innerHTML = "<p class='text-muted'>No events</p>";
        return;
    }
    container.innerHTML = events
        .map(e => {
            return `
    <div class="event-card mb-3 p-3">
      <div class="d-flex justify-content-between align-items-start">
        <div class="me-3">
          <h5>${e.title}</h5>
          <p class="text-muted mb-1">${e.desc}</p>
          <small>${new Date(e.date).toLocaleString("en-IN")}</small>
        </div>
        <div>
          <button class="btn btn-info btn-sm me-2" onclick="viewEventRegistrations(${e.id})" title="View registrations">
            <i class="fas fa-users"></i>
          </button>
          <button class="btn btn-warning btn-sm me-2" onclick="editEvent(${e.id})" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteEvent(${e.id})" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>`;
        })
        .join("");
}

// admin registrations – per event with delete option
function loadRegistrations() {
    const regs = JSON.parse(localStorage.getItem(regsKey)) || [];
    const events = loadEvents();
    const container = document.getElementById("registrationsTable");

    const filteredRegs = currentAdminEventFilter
        ? regs.filter(r => r.eventId === currentAdminEventFilter)
        : [];

    if (!currentAdminEventFilter) {
        container.innerHTML =
            "<p class='text-muted'>Click the users button of an event to view its registrations.</p>";
        return;
    }

    if (filteredRegs.length === 0) {
        const ev = events.find(e => e.id === currentAdminEventFilter);
        container.innerHTML =
            `<p class='text-muted'>No registrations yet for <strong>${ev ? ev.title : "this event"}</strong>.</p>`;
        return;
    }

    const ev = events.find(e => e.id === currentAdminEventFilter);
    container.innerHTML = `
    <h5 class="mb-3">Registrations for: <strong>${ev ? ev.title : ""}</strong></h5>
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Name</th><th>Year</th><th>Dept</th>
            <th>Email</th><th>Phone</th><th>Date</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
        ${filteredRegs
            .map(r => {
                const index = regs.findIndex(
                    rr =>
                        rr.eventId === r.eventId &&
                        rr.email === r.email &&
                        rr.registered === r.registered
                );
                return `
          <tr>
            <td>${r.name}</td>
            <td>${r.year || "-"}</td>
            <td>${r.dept || "-"}</td>
            <td>${r.email}</td>
            <td>${r.phone || "-"}</td>
            <td>${new Date(r.registered).toLocaleDateString("en-IN")}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteRegistration(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
          </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`;
}

function deleteRegistration(index) {
    if (!confirm("Remove this registration?")) return;
    const regs = JSON.parse(localStorage.getItem(regsKey)) || [];
    if (index >= 0 && index < regs.length) {
        regs.splice(index, 1);
        localStorage.setItem(regsKey, JSON.stringify(regs));
        loadRegistrations();
        alert("Registration removed");
    }
}

function loadAdminView() {
    loadAdminEvents();
    loadRegistrations();
}

function exportCSV() {
    const regs = JSON.parse(localStorage.getItem(regsKey)) || [];
    const events = loadEvents();
    if (regs.length === 0) {
        alert("No registrations to export");
        return;
    }
    const rows = [
        ["Event", "Name", "Year", "Department", "Email", "Phone", "Date"],
        ...regs.map(r => {
            const e = events.find(ev => ev.id === r.eventId);
            return [
                e ? e.title : "Deleted Event",
                r.name,
                r.year || "",
                r.dept || "",
                r.email,
                r.phone || "",
                new Date(r.registered).toLocaleDateString("en-IN")
            ];
        })
    ];
    const csv = rows.map(row => row.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "registrations.csv";
    link.click();
    URL.revokeObjectURL(link.href);
}

// init
window.onload = () => {
    initializeDefaultEvents();
    loadUserView();
};
