const roommatesDiv = document.getElementById('roommates');
const addRoommateBtn = document.getElementById('addRoommate');
const calendarDiv = document.getElementById('calendar');

// Function to render the profile card
function renderProfileCard({ name, email, phone }) {
  const profileSection = document.querySelector('.form');
  const profileCard = document.createElement('div');
  profileCard.className = 'card bg-gray-800 p-4 rounded-lg shadow-md mt-4';
  profileCard.innerHTML = `
    <h3 class="text-lg font-semibold">${name}</h3>
    <p class="text-gray-400">📧 ${email}</p>
    <p class="text-gray-400">📞 ${phone}</p>
    <button id="editProfile" class="btn btn-secondary mt-4">Edit Profile</button>
  `;

  // Hide the form and append the card under the "Your Profile" heading
  profileSection.style.display = 'none';
  const profileContainer = profileSection.parentElement; // Parent container of the form
  const profileHeading = profileContainer.querySelector('h2'); // "Your Profile" heading
  profileHeading.insertAdjacentElement('afterend', profileCard); // Insert the card after the heading

  // Add functionality to edit the profile
  document.getElementById('editProfile').addEventListener('click', function () {
    profileCard.remove();
    profileSection.style.display = 'block';
  });
}

// Save profile and render the card
document.getElementById('saveProfile').addEventListener('click', function () {
  const name = document.getElementById('profileName').value;
  const email = document.getElementById('profileEmail').value;
  const phone = document.getElementById('profilePhone').value;

  if (name && email && phone) {
    const profile = { name, email, phone };
    localStorage.setItem('profile', JSON.stringify(profile));
    alert('Profile saved successfully!');
    renderProfileCard(profile);
  } else {
    alert('Please fill out all fields before saving.');
  }
});

// Load profile data and render the card on page load
window.addEventListener('DOMContentLoaded', function () {
  const savedProfile = localStorage.getItem('profile');
  if (savedProfile) {
    const { name, email, phone } = JSON.parse(savedProfile);
    document.getElementById('profileName').value = name;
    document.getElementById('profileEmail').value = email;
    document.getElementById('profilePhone').value = phone;

    // Render the profile card
    renderProfileCard({ name, email, phone });
  }
});

function renderRoommates() {
  if (!roommatesDiv) return;
  roommatesDiv.innerHTML = '';
  roommates.slice(1).forEach((rm, index) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <h3 class="text-lg font-semibold">${rm.name || 'Unnamed Roommate'}</h3>
      <p class="text-gray-400">${rm.email ? '📧 ' + rm.email : ''}</p>
      <p class="text-gray-400">${rm.phone ? '📞 ' + rm.phone : ''}</p>
      <div class="mt-4 flex space-x-2">
        <button class="btn btn-secondary edit-btn" data-index="${index}">Edit</button>
        <button class="btn btn-danger remove-btn" data-index="${index}">Remove</button>
      </div>
    `;

    roommatesDiv.appendChild(card);
  });

  // Attach event listeners for edit and remove buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => editRoommate(parseInt(e.target.dataset.index)));
  });
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => removeRoommate(parseInt(e.target.dataset.index)));
  });
}

function addRoommate() {
  const name = document.getElementById('newRoommateName')?.value.trim();
  const email = document.getElementById('newRoommateEmail')?.value.trim();
  const phone = document.getElementById('newRoommatePhone')?.value.trim();

  if (!name) {
    alert('Please enter a name for the roommate.');
    return;
  }
  if (roommates.length >= 10) {
    alert('Maximum 10 roommates allowed.');
    return;
  }

  roommates.push({ name, email, phone, expenses: [] });
  saveData();
  renderRoommates();

  // Clear form
  document.getElementById('newRoommateName').value = '';
  document.getElementById('newRoommateEmail').value = '';
  document.getElementById('newRoommatePhone').value = '';
}

function editRoommate(index) {
  const rm = roommates[index + 1];
  document.getElementById('newRoommateName').value = rm.name;
  document.getElementById('newRoommateEmail').value = rm.email;
  document.getElementById('newRoommatePhone').value = rm.phone;

  removeRoommate(index);
}

function removeRoommate(index) {
  roommates.splice(index + 1, 1);
  saveData();
  renderRoommates();
}

function renderCalendar() {
  if (!calendarDiv) return;
  calendarDiv.innerHTML = '';
  let allExpenses = [];

  // Retrieve the saved profile name from localStorage
  const savedProfile = JSON.parse(localStorage.getItem('profile'));
  const userName = savedProfile?.name || "You";

  roommates.forEach(rm => {
    rm.expenses.forEach(ex => {
      allExpenses.push({ ...ex, paid: ex.paidAmount >= ex.amount, person: rm.name || userName });
    });
  });

  allExpenses = allExpenses.filter(ex => ex.dueDate);
  allExpenses.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (allExpenses.length === 0) {
    calendarDiv.innerHTML = `<div class="calendar-placeholder">No upcoming expenses.</div>`;
    return;
  }

  let currentDate = null;

  allExpenses.forEach(ex => {
    if (ex.dueDate !== currentDate) {
      currentDate = ex.dueDate;
      const dateHeader = document.createElement('div');
      dateHeader.className = 'calendar-date';
      dateHeader.textContent = new Date(currentDate).toDateString();
      calendarDiv.appendChild(dateHeader);
    }

    const item = document.createElement('div');
    item.className = 'calendar-item';
    item.innerHTML = `
      <span class="calendar-description">📝 ${ex.description} <small>(${ex.person})</small></span>
      <span class="calendar-amount">$${ex.amount.toFixed(2)} ${ex.paid ? "✅" : "❗"}</span>
    `;
    calendarDiv.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!roommates.length) {
    roommates.push(collectUserProfile());
    saveData();
  }
  renderRoommates();
  addRoommateBtn?.addEventListener('click', addRoommate);
  renderCalendar();
});