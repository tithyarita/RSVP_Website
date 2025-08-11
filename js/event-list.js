import { app, db, collection, getDocs, getDoc, doc } from './db.js';

        const upcomingEvents = document.getElementById('upcomingEvents');
        const processingEvents = document.getElementById('processingEvents');
        const pastEvents = document.getElementById('pastEvents');
        const formPreview = document.getElementById('formPreview');

        function getEventStatus(startDateStr, endDateStr) {
            const today = new Date();
            today.setHours(0,0,0,0);
            const startDate = new Date(startDateStr);
            startDate.setHours(0,0,0,0);
            const endDate = new Date(endDateStr);
            endDate.setHours(0,0,0,0);

            if (today < startDate) {
                return 'upcoming';
            } else if (today >= startDate && today <= endDate) {
                return 'processing';
            } else {
                return 'past';
            }
        }

        // Show events from localStorage instantly
        function showEventsFromLocalStorage() {
            upcomingEvents.innerHTML = '';
            processingEvents.innerHTML = '';
            pastEvents.innerHTML = '';

            const allEvents = JSON.parse(localStorage.getItem('allEvents') || '[]');
            allEvents.forEach(data => {
                const div = document.createElement('div');
                div.className = 'event-card';
                div.innerHTML = `
                    <h3>${data.name}</h3>
                    <p>Start Date: ${data.startDate}</p>
                    <p>End Date: ${data.endDate}</p>
                    <a href="detail.html?id=${data.id}">
                        <button>View Detail</button>
                    </a>
                    <a href="edit-event.html?id=${data.id}">
                        <button class="edit-btn" data-id="${data.id}">Edit</button>
                    </a>
                    <button class="remove-btn" data-id="${data.id}">Remove</button>
                `;
                const status = getEventStatus(data.startDate, data.endDate);
                if (status === 'upcoming') {
                    upcomingEvents.appendChild(div);
                } else if (status === 'processing') {
                    processingEvents.appendChild(div);
                } else {
                    pastEvents.appendChild(div);
                }
            });
        }

        // Count events for all, today, and tomorrow
        function countEvents() {
            const allEvents = JSON.parse(localStorage.getItem('allEvents') || '[]');
            let allCount = allEvents.length;
            let todayCount = 0;
            let tomorrowCount = 0;

            const today = new Date();
            today.setHours(0,0,0,0);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            allEvents.forEach(event => {
                const startDate = new Date(event.startDate);
                startDate.setHours(0,0,0,0);
                if (startDate.getTime() === today.getTime()) {
                    todayCount++;
                }
                if (startDate.getTime() === tomorrow.getTime()) {
                    tomorrowCount++;
                }
            });

            document.getElementById('all-event-count').textContent = `All Event: ${allCount || 0}`;
            document.getElementById('today-event-count').textContent = `Today Event: ${todayCount || 0}`;
            document.getElementById('tomorrow-event-count').textContent = `Tomorrow Event: ${tomorrowCount || 0}`;
        }

        // Fetch events from Firebase and update localStorage and UI
        async function fetchEvents() {
            const querySnapshot = await getDocs(collection(db, "events"));
            const allEvents = [];
            querySnapshot.forEach(docSnap => {
                const data = docSnap.data();
                allEvents.push({ id: docSnap.id, ...data });
            });
            localStorage.setItem('allEvents', JSON.stringify(allEvents));
            showEventsFromLocalStorage();
            countEvents();
        }

        // Show instantly from cache, then update from Firebase in background
        showEventsFromLocalStorage();
        countEvents();
        fetchEvents();

        // Event detail preview logic (unchanged)
        window.viewDetail = async function (id) {
            const docRef = doc(db, "events", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const event = docSnap.data();
                formPreview.innerHTML = `
                    <h2>${event.name}</h2>
                    <hr>
                `;

                event.fields.forEach(field => {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'form-field';

                    // Label
                    const label = document.createElement('label');
                    label.textContent = field.label;
                    wrapper.appendChild(label);

                    // Field types
                    if (field.type === 'text' || field.type === 'email') {
                        const input = document.createElement('input');
                        input.type = field.type;
                        input.placeholder = `Enter your ${field.label}`;
                        wrapper.appendChild(input);
                    } else if (field.type === 'dropdown') {
                        const select = document.createElement('select');
                        const placeholderOption = document.createElement('option');
                        placeholderOption.textContent = "Please select";
                        placeholderOption.disabled = true;
                        placeholderOption.selected = true;
                        select.appendChild(placeholderOption);
                        (Array.isArray(field.options) ? field.options : String(field.options).split(',').map(opt => opt.trim()).filter(Boolean)).forEach(opt => {
                            const option = document.createElement('option');
                            option.value = opt;
                            option.textContent = opt;
                            select.appendChild(option);
                        });
                        wrapper.appendChild(select);
                    } else if (field.type === 'radio') {
                        const radioGroup = document.createElement('div');
                        radioGroup.className = 'radio-group';
                        (Array.isArray(field.options) ? field.options : String(field.options).split(',').map(opt => opt.trim()).filter(Boolean)).forEach(opt => {
                            const radioLabel = document.createElement('label');
                            const radio = document.createElement('input');
                            radio.type = "radio";
                            radio.name = field.label;
                            radio.value = opt;
                            radioLabel.appendChild(radio);
                            radioLabel.appendChild(document.createTextNode(" " + opt));
                            radioGroup.appendChild(radioLabel);
                        });
                        wrapper.appendChild(radioGroup);
                    }

                    formPreview.appendChild(wrapper);
                });
            }
        }

        // Remove and edit logic (unchanged, but call fetchEvents after update/delete)
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const eventId = e.target.getAttribute('data-id');
                if (confirm("Are you sure you want to delete this event?")) {
                    await import("https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js")
                        .then(({ deleteDoc, doc }) => deleteDoc(doc(db, "events", eventId)));
                    fetchEvents();
                }
            } else if (e.target.classList.contains('edit-btn')) {
                const eventId = e.target.getAttribute('data-id');
                const docRef = doc(db, "events", eventId);
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) return alert("Event not found!");

                const event = docSnap.data();
                // Edit event name, start date, end date
                const newName = prompt("Edit event name:", event.name);
                const newStart = prompt("Edit start date (YYYY-MM-DD):", event.startDate);
                const newEnd = prompt("Edit end date (YYYY-MM-DD):", event.endDate);

                // Edit existing form fields
                let newFields = [];
                for (let i = 0; i < event.fields.length; i++) {
                    const field = event.fields[i];
                    const newLabel = prompt(`Edit label for field ${i + 1} (${field.type}):`, field.label);
                    let newOptions = field.options;
                    if (field.type === 'dropdown' || field.type === 'radio') {
                        newOptions = prompt(`Edit options for field ${i + 1} (comma-separated):`, Array.isArray(field.options) ? field.options.join(', ') : field.options);
                        newOptions = newOptions.split(',').map(opt => opt.trim()).filter(Boolean);
                    }
                    newFields.push({
                        type: field.type,
                        label: newLabel,
                        options: (field.type === 'dropdown' || field.type === 'radio') ? newOptions : []
                    });
                }

                // Add more fields
                let addMore = confirm("Do you want to add more fields?");
                while (addMore) {
                    const type = prompt("Field type? (text, email, dropdown, radio)");
                    if (!type || !["text", "email", "dropdown", "radio"].includes(type)) break;
                    const label = prompt("Field label?");
                    let options = [];
                    if (type === "dropdown" || type === "radio") {
                        const opts = prompt("Options (comma-separated)?");
                        options = opts ? opts.split(',').map(opt => opt.trim()).filter(Boolean) : [];
                    }
                    newFields.push({ type, label, options });
                    addMore = confirm("Add another field?");
                }

                if (newName && newStart && newEnd && newFields.length > 0) {
                    await import("https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js")
                        .then(({ updateDoc }) => updateDoc(docRef, {
                            name: newName,
                            startDate: newStart,
                            endDate: newEnd,
                            fields: newFields
                        }));
                    fetchEvents();
                }
            }
        });