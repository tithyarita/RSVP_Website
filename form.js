import { db, collection, addDoc } from './db.js';   
    // Initialize Firebase Firestore
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
    import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';            

    const form = document.getElementById('rsvpForm');

    form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const attendance = form.attendance.value;
    const firstName = document.getElementById('fname').value.trim();
    const lastName = document.getElementById('lname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phoneNum').value.trim();
    const eventId = document.getElementById('event').value;
    const adults = parseInt(document.getElementById('adults').value) || 0;
    const children = parseInt(document.getElementById('children').value) || 0;
    const message = document.getElementById('message').value.trim();
    const fullName = `${firstName} ${lastName}`;

    try {
      const userDocRef = await addDoc(collection(db, "User_info"), {
        attendance,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        event: eventId,
        adults,
        children,
        message,
        submittedAt: new Date()
      });

      await addDoc(collection(db, eventId), {
        userId: userDocRef.id,
        user_name: fullName,
        event: eventId,
        submittedAt: new Date()
      });

      if (attendance === "can attend") {
        await addDoc(collection(db, "user attend"), {
          userId: userDocRef.id,
          user_name: fullName,
          email,
          phone,
          event: eventId,
          submittedAt: new Date()
        });
      } else {
        await addDoc(collection(db, "user cannot attend"), {
          userId: userDocRef.id,
          user_name: fullName,
          email,
          phone,
          event: eventId,
          submittedAt: new Date()
        });
      }

      alert("✅ RSVP submitted successfully!");
      form.reset();

    } catch (error) {
      console.error("🔥 DEBUG ERROR:", error); ;

      alert("❌ Error submitting RSVP. Please try again.");
    }
  });