let roommates = JSON.parse(localStorage.getItem("roommates")) || [];

function collectUserProfile() {
  const name = document.getElementById('profileName')?.value.trim();
  const email = document.getElementById('profileEmail')?.value.trim();
  const phone = document.getElementById('profilePhone')?.value.trim();
  return {
    name: name || 'You',
    email,
    phone,
    expenses: roommates[0]?.expenses || []
  };
}

function saveData() {
  localStorage.setItem('roommates', JSON.stringify(roommates));
}

function getTotal(expenses) {
  return expenses.reduce((sum, ex) => sum + (ex.amount || 0), 0);
}

function getUnpaidTotal(expenses) {
  return expenses.reduce((sum, ex) => sum + (ex.amount - (ex.paidAmount || 0)), 0);
}

function getNextDueDate(expenses) {
  const futureExpenses = expenses.filter(ex => ex.dueDate && new Date(ex.dueDate) >= new Date());
  if (!futureExpenses.length) return 'None';
  futureExpenses.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  return futureExpenses[0].dueDate;
}