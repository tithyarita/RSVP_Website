import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
        import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyBAYWnichIFDWP4EOv3RyZFNqzyUtROCeI",
            authDomain: "rsvp-website-7541d.firebaseapp.com",
            projectId: "rsvp-website-7541d",
            storageBucket: "rsvp-website-7541d.firebasestorage.app",
            messagingSenderId: "519298669065",
            appId: "1:519298669065:web:1e43e4c598af256c2636d8",
            measurementId: "G-MWMKYXF18R"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
const formContainer = document.getElementById('formContainer');
const saveBtn = document.getElementById('saveBtn');
const addFieldBtn = document.getElementById('addFieldBtn');
let formFields = [];

function addFormRow() {
    const row = document.createElement('div');
    row.className = 'field-row';

    const select = document.createElement('select');
    select.innerHTML = `
        <option value="1">Text Input</option>
        <option value="2">Email Input</option>
        <option value="3">Dropdown List</option>
        <option value="4">Radio Buttons</option>
    `;

    const labelInput = document.createElement('input');
    labelInput.placeholder = 'Field Label';

    const optionsInput = document.createElement('input');
    optionsInput.placeholder = 'Options (comma-separated)';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-btn';
    removeBtn.onclick = () => row.remove();

    row.appendChild(select);
    row.appendChild(labelInput);
    row.appendChild(optionsInput);
    row.appendChild(removeBtn);

    formContainer.appendChild(row);
}

addFieldBtn.addEventListener('click', addFormRow);

saveBtn.addEventListener('click', async () => {
    const name = document.getElementById('eventName').value.trim();
    const startDate = document.getElementById('eventStart').value;
    const endDate = document.getElementById('eventEnd').value;

    if (!name || !startDate || !endDate) {
        alert("Please fill in all event details.");
        return;
    }

    const allRows = formContainer.querySelectorAll('.field-row');
    formFields = [];

    allRows.forEach(row => {
        const type = row.children[0].value;
        const label = row.children[1].value.trim();
        const options = row.children[2].value.trim();

        formFields.push({
            type: getFieldTypeName(type),
            label,
            options: (type === '3' || type === '4')
                ? options.split(',').map(opt => opt.trim()).filter(Boolean)
                : []
        });
    });

    const eventData = {
        name,
        startDate,
        endDate,
        fields: formFields
    };

    try {
        await addDoc(collection(db, "events"), eventData);
        alert("✅ Event saved successfully to Firebase!");
        formContainer.innerHTML = '';
        addFormRow();
    } catch (error) {
        console.error("❌ Failed to save event:", error);
        alert("❌ Failed to save event.");
    }
});

function getFieldTypeName(value) {
    return {
        '1': 'text',
        '2': 'email',
        '3': 'dropdown',
        '4': 'radio'
    }[value];
}

window.onload = () => {
    addFormRow();
};
