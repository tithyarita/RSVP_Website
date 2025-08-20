import { app, db, collection, getDocs, getDoc, doc } from '../js/db.js';
let responses = [];
let events = [];
const eventId = new URLSearchParams(window.location.search).get('id');
let currentEditId = null;

// --- Load cached data from localStorage ---
function loadFromLocalStorage() {
    const cachedResponses = localStorage.getItem('cachedResponses');
    const cachedEvents = localStorage.getItem('cachedEvents');

    if (cachedResponses) {
        try { responses = JSON.parse(cachedResponses); } catch {}
    }
    if (cachedEvents) {
        try { events = JSON.parse(cachedEvents); } catch {}
    }

    renderEvent();
    renderResponses();
}

// --- Render event info ---
function renderEvent() {
    const card = document.getElementById('event-info');
    if (!eventId) return card.innerHTML = "<h2>No Event Selected</h2>";

    const event = events.find(e => e.id === eventId);
    if (event) {
        const start = event.startDate?.toDate ? event.startDate.toDate().toLocaleDateString() : event.startDate || "N/A";
        const end = event.endDate?.toDate ? event.endDate.toDate().toLocaleDateString() : event.endDate || "N/A";
        card.innerHTML = `
          <h2>${event.name}</h2>
          <p>Start Date: ${start}</p>
          <p>End Date: ${end}</p>
        `;
    } else {
        card.innerHTML = "<h2>Loading event...</h2>";
    }
}

// --- Render responses ---
function renderResponses() {
    const table = document.getElementById('response-table');
    while (table.rows.length > 1) table.deleteRow(1);

    const filteredResponses = responses.filter(r => r.eventId === eventId);

    filteredResponses.forEach(r => {
        const row = table.insertRow();
        row.insertCell().textContent = r.answers?.["Email"] || '';
        row.insertCell().textContent = r.answers?.["First Name"] || '';
        row.insertCell().textContent = r.answers?.["Last Name"] || '';
        row.insertCell().textContent = r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '';

        const actionsCell = row.insertCell();
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => openModal(r.id);
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteUser(r.id);
        actionsCell.append(editBtn, deleteBtn);
    });

    document.getElementById('response-count').textContent = `${filteredResponses.length} Responses`;
}

// --- Load data from Firebase ---
async function fetchFromFirebase() {
    // Fetch events
    const eventSnap = await getDocs(collection(db, "events"));
    events = [];
    eventSnap.forEach(docSnap => events.push({ id: docSnap.id, ...docSnap.data() }));
    localStorage.setItem('cachedEvents', JSON.stringify(events));
    renderEvent();

    // Fetch responses
    const responseSnap = await getDocs(collection(db, "responses"));
    responses = [];
    responseSnap.forEach(docSnap => responses.push({ id: docSnap.id, ...docSnap.data() }));
    localStorage.setItem('cachedResponses', JSON.stringify(responses));
    renderResponses();
}

// --- Modal ---
document.getElementById('addUserBtn').onclick = () => openModal();
document.getElementById('cancelBtn').onclick = () => document.getElementById('userModal').style.display = 'none';

function openModal(id = null) {
    currentEditId = id;
    const modal = document.getElementById('userModal');
    modal.style.display = 'flex';
    if (id) {
        const user = responses.find(u => u.id === id);
        document.getElementById('modalTitle').textContent = 'Edit User';
        document.getElementById('emailInput').value = user.answers?.["Email"] || '';
        document.getElementById('firstNameInput').value = user.answers?.["First Name"] || '';
        document.getElementById('lastNameInput').value = user.answers?.["Last Name"] || '';
    } else {
        document.getElementById('modalTitle').textContent = 'Add User';
        document.getElementById('emailInput').value = '';
        document.getElementById('firstNameInput').value = '';
        document.getElementById('lastNameInput').value = '';
    }
}

// --- Save user ---
document.getElementById('saveUserBtn').onclick = async () => {
    const email = document.getElementById('emailInput').value.trim();
    const firstName = document.getElementById('firstNameInput').value.trim();
    const lastName = document.getElementById('lastNameInput').value.trim();
    if (!email) return alert("Email is required");

    const userData = {
        answers: { Email: email, "First Name": firstName, "Last Name": lastName },
        submittedAt: new Date().toISOString(),
        eventId
    };

    if (currentEditId) {
        await setDoc(doc(db, "responses", currentEditId), userData);
    } else {
        const newDoc = doc(collection(db, "responses"));
        await setDoc(newDoc, userData);
    }

    // Update cache immediately
    loadFromLocalStorage();
    fetchFromFirebase(); // Refresh from Firebase
    document.getElementById('userModal').style.display = 'none';
}

// --- Delete user ---
async function deleteUser(id) {
    if (!confirm("Are you sure to delete this user?")) return;
    await deleteDoc(doc(db, "responses", id));
    // Update cache immediately
    loadFromLocalStorage();
    fetchFromFirebase();
}

// --- Initialize ---
loadFromLocalStorage(); // show cached data immediately
fetchFromFirebase(); // fetch fresh data in background
