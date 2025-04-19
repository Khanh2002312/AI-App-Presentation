document.addEventListener("DOMContentLoaded", () => {
  if (!roommates.length) {
    roommates.push(collectUserProfile());
    saveData();
  }

  const dashboardDiv = document.getElementById('dashboard');
  if (!dashboardDiv) return;

  // Calculate dashboard metrics
  const totalExpenses = roommates.reduce((sum, rm) => sum + getTotal(rm.expenses), 0);
  const totalUnpaid = roommates.reduce((sum, rm) => sum + getUnpaidTotal(rm.expenses), 0);
  const nextDueDate = getNextDueDate(roommates.flatMap(rm => rm.expenses));

  // Render dashboard cards
  dashboardDiv.innerHTML = `
    <div class="card">
      <h3 class="text-lg font-semibold">Total Expenses</h3>
      <p class="text-2xl text-green-400">$${totalExpenses.toFixed(2)}</p>
    </div>
    <div class="card">
      <h3 class="text-lg font-semibold">Total Unpaid</h3>
      <p class="text-2xl text-red-400">$${totalUnpaid.toFixed(2)}</p>
    </div>
    <div class="card">
      <h3 class="text-lg font-semibold">Next Due Date</h3>
      <p class="text-2xl">${nextDueDate}</p>
    </div>
  `;
});