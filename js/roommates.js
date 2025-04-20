// js/roommates.js

// Grab elements
const roommatesDiv    = document.getElementById('roommates');
const addRoommateBtn  = document.getElementById('addRoommate');
const saveProfileBtn  = document.getElementById('saveProfile');
const calendarDiv     = document.getElementById('calendar');

// Track whether we’re editing an existing roommate
let editingIndex = null;

// Load and save helpers (from common.js)
function saveData() {
  localStorage.setItem('roommates', JSON.stringify(roommates));
}

// Render the “Your Profile” card (unchanged)
function renderProfileCard({ name, email, phone }) {
  const profileSection = document.querySelector('.form');
  const card = document.createElement('div');
  card.className = 'card bg-gray-800 p-4 rounded-lg shadow-md mt-4';
  card.innerHTML = `
    <h3 class="text-lg font-semibold">${name}</h3>
    <p class="text-gray-400">📧 ${email}</p>
    <p class="text-gray-400">📞 ${phone}</p>
    <button id="editProfile" class="btn btn-secondary mt-4">Edit Profile</button>
  `;
  profileSection.style.display = 'none';
  profileSection.parentElement.querySelector('h2').after(card);

  document.getElementById('editProfile').onclick = () => {
    card.remove();
    profileSection.style.display = 'block';
  };
}

// Handle saving your profile (unchanged)
saveProfileBtn.addEventListener('click', () => {
  const name  = document.getElementById('profileName').value.trim();
  const email = document.getElementById('profileEmail').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();
  if (!name || !email || !phone) {
    return alert('Please fill out all fields before saving.');
  }
  const profile = { name, email, phone };
  localStorage.setItem('profile', JSON.stringify(profile));

  // Preserve existing roommate[0].expenses
  const existingExpenses = roommates[0]?.expenses || [];
  roommates[0] = { ...profile, expenses: existingExpenses };
  saveData();
  renderProfileCard(profile);
});

// Render the list of other roommates
function renderRoommates() {
  roommatesDiv.innerHTML = '';

  // Skip index 0 (your profile)
  roommates.slice(1).forEach((rm, idx) => {
    const realIdx = idx + 1;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3 class="text-lg font-semibold">${rm.name}</h3>
      <p class="text-gray-400">📧 ${rm.email}</p>
      <p class="text-gray-400">📞 ${rm.phone}</p>
      <div class="mt-4 flex space-x-2">
        <button class="btn btn-secondary edit-btn" data-idx="${realIdx}">Edit</button>
        <button class="btn btn-danger remove-btn" data-idx="${realIdx}">Remove</button>
      </div>
    `;
    roommatesDiv.appendChild(card);
  });

  // “Edit” buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => {
      const i = +btn.dataset.idx;
      const rm = roommates[i];
      document.getElementById('newRoommateName').value  = rm.name;
      document.getElementById('newRoommateEmail').value = rm.email;
      document.getElementById('newRoommatePhone').value = rm.phone;

      editingIndex = i;
      addRoommateBtn.textContent = 'Save';
    };
  });

  // “Remove” buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.onclick = () => {
      const i = +btn.dataset.idx;
      roommates.splice(i, 1);
      saveData();
      renderRoommates();
    };
  });
}

// Handle Add _or_ Save roommate
function handleAddOrSave() {
  const name  = document.getElementById('newRoommateName').value.trim();
  const email = document.getElementById('newRoommateEmail').value.trim();
  const phone = document.getElementById('newRoommatePhone').value.trim();
  if (!name) {
    return alert('Please enter a name for the roommate.');
  }

  if (editingIndex !== null) {
    // Update in place, preserving existing expenses
    const existingExpenses = roommates[editingIndex].expenses || [];
    roommates[editingIndex] = { name, email, phone, expenses: existingExpenses };
    editingIndex = null;
    addRoommateBtn.textContent = 'Add Roommate';
  } else {
    // Add brand‑new roommate
    roommates.push({ name, email, phone, expenses: [] });
  }

  saveData();
  renderRoommates();

  // Clear the form
  document.getElementById('newRoommateName').value  = '';
  document.getElementById('newRoommateEmail').value = '';
  document.getElementById('newRoommatePhone').value = '';
}

// Render the shared‑expenses calendar (unchanged)
function renderCalendar() {
  if (!calendarDiv) return;
  calendarDiv.innerHTML = '';

  const items = [];
  const prof = JSON.parse(localStorage.getItem('profile')) || {};
  const youName = prof.name || 'You';

  roommates.forEach(rm => {
    rm.expenses.forEach(ex => {
      items.push({
        ...ex,
        person: rm.name || youName,
        paid:   ex.paidAmount >= ex.amount
      });
    });
  });

  items
    .filter(i => i.dueDate)
    .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
    .forEach((it, idx, arr) => {
      if (idx === 0 || it.dueDate !== arr[idx-1].dueDate) {
        const hdr = document.createElement('div');
        hdr.className = 'calendar-date';
        hdr.textContent = new Date(it.dueDate).toDateString();
        calendarDiv.appendChild(hdr);
      }
      const row = document.createElement('div');
      row.className = 'calendar-item';
      row.innerHTML = `
        <span class="calendar-description">📝 ${it.description} <small>(${it.person})</small></span>
        <span class="calendar-amount">$${it.amount.toFixed(2)} ${it.paid ? '✅' : '❗'}</span>
      `;
      calendarDiv.appendChild(row);
    });

  if (!calendarDiv.innerHTML) {
    calendarDiv.innerHTML = '<div class="calendar-placeholder">No upcoming expenses.</div>';
  }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  // Ensure index 0 is always your profile
  if (!roommates.length) {
    roommates.push(collectUserProfile());
    saveData();
  } else {
    const saved = JSON.parse(localStorage.getItem('profile')) || {};
    const existingExpenses = roommates[0]?.expenses || [];
    roommates[0] = { ...saved, expenses: existingExpenses };
    saveData();
    if (saved.name) renderProfileCard(saved);
  }

  renderRoommates();
  renderCalendar();
  addRoommateBtn.onclick = handleAddOrSave;
});
