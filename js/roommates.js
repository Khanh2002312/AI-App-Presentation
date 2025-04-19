
const roommatesDiv   = document.getElementById('roommates');
const addRoommateBtn = document.getElementById('addRoommate');
const calendarDiv    = document.getElementById('calendar');

function renderProfileCard({ name, email, phone }) {
  const profileSection = document.querySelector('.form');
  const profileCard    = document.createElement('div');
  profileCard.className = 'card bg-gray-800 p-4 rounded-lg shadow-md mt-4';
  profileCard.innerHTML = `
    <h3 class="text-lg font-semibold">${name}</h3>
    <p class="text-gray-400">📧 ${email}</p>
    <p class="text-gray-400">📞 ${phone}</p>
    <button id="editProfile" class="btn btn-secondary mt-4">Edit Profile</button>
  `;

  profileSection.style.display = 'none';
  const heading = profileSection.parentElement.querySelector('h2');
  heading.insertAdjacentElement('afterend', profileCard);

  document.getElementById('editProfile').addEventListener('click', () => {
    profileCard.remove();
    profileSection.style.display = 'block';
  });
}

document.getElementById('saveProfile').addEventListener('click', () => {
  const name  = document.getElementById('profileName').value.trim();
  const email = document.getElementById('profileEmail').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();

  if (!name || !email || !phone) {
    return alert('Please fill out all fields before saving.');
  }

  // 1) Save your profile
  const profile = { name, email, phone };
  localStorage.setItem('profile', JSON.stringify(profile));

  // 2) Sync it into roommates[0], preserving any existing expenses
  const existingExpenses = roommates[0]?.expenses || [];
  roommates[0] = { ...profile, expenses: existingExpenses };
  saveData();

  renderProfileCard(profile);
});

function renderRoommates() {
  if (!roommatesDiv) return;
  roommatesDiv.innerHTML = '';

  roommates.slice(1).forEach((rm, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3 class="text-lg font-semibold">${rm.name || 'Unnamed Roommate'}</h3>
      <p class="text-gray-400">${rm.email ? '📧 ' + rm.email : ''}</p>
      <p class="text-gray-400">${rm.phone ? '📞 ' + rm.phone : ''}</p>
      <div class="mt-4 flex space-x-2">
        <button class="btn btn-secondary edit-btn" data-index="${idx}">Edit</button>
        <button class="btn btn-danger remove-btn" data-index="${idx}">Remove</button>
      </div>
    `;
    roommatesDiv.appendChild(card);
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => editRoommate(parseInt(e.currentTarget.dataset.index)));
  });
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => removeRoommate(parseInt(e.currentTarget.dataset.index)));
  });
}

function addRoommate() {
  const name  = document.getElementById('newRoommateName')?.value.trim();
  const email = document.getElementById('newRoommateEmail')?.value.trim();
  const phone = document.getElementById('newRoommatePhone')?.value.trim();

  if (!name) {
    return alert('Please enter a name for the roommate.');
  }
  if (roommates.length >= 10) {
    return alert('Maximum 10 roommates allowed.');
  }

  roommates.push({ name, email, phone, expenses: [] });
  saveData();
  renderRoommates();

  document.getElementById('newRoommateName').value  = '';
  document.getElementById('newRoommateEmail').value = '';
  document.getElementById('newRoommatePhone').value = '';
}

function editRoommate(index) {
  const rm = roommates[index + 1];
  document.getElementById('newRoommateName').value  = rm.name;
  document.getElementById('newRoommateEmail').value = rm.email;
  document.getElementById('newRoommatePhone').value = rm.phone;

  // remove old entry so Save (addRoommate) re‑adds it
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

  // collect all expenses with “person” = each roommate name (or your name)
  const savedProfile = JSON.parse(localStorage.getItem('profile'));
  const youName      = savedProfile?.name || 'You';

  const allExpenses = roommates.flatMap(rm =>
    (rm.expenses || []).map(ex => ({
      ...ex,
      paid:   ex.paidAmount >= ex.amount,
      person: rm.name || youName
    }))
  ).filter(ex => ex.dueDate);

  allExpenses.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (!allExpenses.length) {
    calendarDiv.innerHTML = `<div class="calendar-placeholder">No upcoming expenses.</div>`;
    return;
  }

  let currentDate = '';
  allExpenses.forEach(ex => {
    if (ex.dueDate !== currentDate) {
      currentDate = ex.dueDate;
      const header = document.createElement('div');
      header.className = 'calendar-date';
      header.textContent = new Date(currentDate).toDateString();
      calendarDiv.appendChild(header);
    }
    const item = document.createElement('div');
    item.className = 'calendar-item';
    item.innerHTML = `
      <span class="calendar-description">📝 ${ex.description} <small>(${ex.person})</small></span>
      <span class="calendar-amount">$${ex.amount.toFixed(2)} ${ex.paid ? '✅' : '❗'}</span>
    `;
    calendarDiv.appendChild(item);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('profile');
  if (saved) {
    const { name, email, phone } = JSON.parse(saved);

    document.getElementById('profileName').value  = name;
    document.getElementById('profileEmail').value = email;
    document.getElementById('profilePhone').value = phone;

    const existingExpenses = roommates[0]?.expenses || [];
    roommates[0] = { name, email, phone, expenses: existingExpenses };
    saveData();

    renderProfileCard({ name, email, phone });
  }

  if (!roommates.length) {
    const profile = collectUserProfile();
    roommates.push(profile);
    saveData();
  }

  renderRoommates();
  addRoommateBtn?.addEventListener('click', addRoommate);
  renderCalendar();
});
