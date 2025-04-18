const calendarDiv = document.getElementById('calendar');

function renderCalendar() {
  if (!calendarDiv) return;
  calendarDiv.innerHTML = '';
  let allExpenses = [];

  // Retrieve the saved profile name from localStorage
  const savedProfile = JSON.parse(localStorage.getItem('profile'));
  const userName = savedProfile?.name || "You"; // Default to "You" if no profile is saved
  console.log("Retrieved userName:", userName); // Debugging log

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
  renderCalendar();
});