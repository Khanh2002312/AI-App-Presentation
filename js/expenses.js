const addExpenseBtn = document.getElementById('addExpense');
const resultsDiv = document.getElementById('results');
const categoryFilter = document.getElementById('categoryFilter');

function addExpense() {
  const category = document.getElementById('category')?.value;
  const customDesc = document.getElementById('customDescription')?.value.trim();
  const amount = parseFloat(document.getElementById('amount')?.value);
  const dueDate = document.getElementById('dueDate')?.value;

  if (!category) {
    alert('Please select a category.');
    return;
  }
  if (!amount || isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount greater than 0.');
    return;
  }
  if (roommates.length === 0) {
    alert('Please add at least one roommate in the Roommates page.');
    return;
  }

  const userProfile = collectUserProfile();
  roommates[0] = userProfile;

  const description = category === 'Other' && customDesc ? customDesc : category;
  const share = amount / roommates.length;

  roommates.forEach(rm => {
    rm.expenses.push({ description, category, amount: share, dueDate, paidAmount: 0 });
  });

  saveData();
  displayResults();

  document.getElementById('amount').value = '';
  document.getElementById('customDescription').value = '';
  document.getElementById('dueDate').value = '';
}

function updatePayment(rmIndex, exIndex, amount) {
  const expense = roommates[rmIndex].expenses[exIndex];
  const paidAmount = parseFloat(amount) || 0;
  if (paidAmount < 0 || paidAmount > expense.amount) {
    alert('Please enter a valid payment amount between 0 and the owed amount.');
    return;
  }
  expense.paidAmount = paidAmount;

  // Calculate the percentage paid
  const percentagePaid = ((paidAmount / expense.amount) * 100).toFixed(2);

  // Display the percentage paid
  const percentageDisplay = document.createElement('div');
  percentageDisplay.className = 'text-green-500 mt-2';
  percentageDisplay.textContent = `✅ ${percentagePaid}% of this expense has been paid.`;

  // Append the percentage display to the corresponding card
  const card = resultsDiv.querySelectorAll('.card')[rmIndex];
  const existingPercentage = card.querySelector('.text-green-500');
  if (existingPercentage) {
    existingPercentage.textContent = percentageDisplay.textContent;
  } else {
    card.appendChild(percentageDisplay);
  }

  saveData();
  displayResults();
}

function displayResults() {
  if (!resultsDiv) return;

  // Retrieve the saved profile from localStorage
  const savedProfile = JSON.parse(localStorage.getItem('profile'));
  const userName = savedProfile?.name || "You"; // Default to "You" if no profile is saved

  const updatedProfile = {
    ...savedProfile,
    expenses: roommates[0]?.expenses || []
  };
  roommates[0] = updatedProfile; // Update the first roommate with the profile data
  saveData();

  resultsDiv.innerHTML = '';

  const filter = categoryFilter?.value || 'All';
  roommates.forEach((rm, index) => {
    const card = document.createElement('div');
    card.className = 'card';

    const name = document.createElement('strong');
    name.textContent = rm.name || (index === 0 ? userName : 'Unnamed Roommate');
    card.appendChild(name);

    const contact = document.createElement('div');
    contact.className = 'text-gray-400';
    contact.innerHTML = `${rm.email ? '📧 ' + rm.email + '<br>' : ''}${rm.phone ? '📞 ' + rm.phone : ''}`;
    card.appendChild(contact);

    let hasUnpaid = false;

    rm.expenses
      .filter(ex => filter === 'All' || ex.category === filter)
      .forEach((ex, exIndex) => {
        const line = document.createElement('div');
        line.className = 'expense-paid flex justify-between items-center space-x-2 mt-2';

        const label = document.createElement('span');
        label.textContent = `${ex.description} (Due: ${ex.dueDate || "N/A"}) - $${ex.amount.toFixed(2)}`;

        // Create a wrapper div for input and button
        const inputButtonWrapper = document.createElement('div');
        inputButtonWrapper.className = 'flex items-center space-x-2';

        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        input.min = '0';
        input.max = ex.amount.toFixed(2);
        input.value = ex.paidAmount?.toFixed(2) || '0.00';
        input.className = 'input-field w-24';

        const button = document.createElement('button');
        button.textContent = 'Correct';
        button.className = 'btn btn-secondary';
        button.onclick = () => updatePayment(index, exIndex, input.value);

        // Append input and button to the wrapper div
        inputButtonWrapper.appendChild(input);
        inputButtonWrapper.appendChild(button);

        // Append label and wrapper div to the line
        line.appendChild(label);
        line.appendChild(inputButtonWrapper);
        card.appendChild(line);
      });

    const total = document.createElement('div');
    total.className = 'total mt-4';
    total.textContent = `Total Owed: $${getTotal(rm.expenses).toFixed(2)} (Unpaid: $${getUnpaidTotal(rm.expenses).toFixed(2)})`;
    card.appendChild(total);

    if (hasUnpaid) {
      const reminder = document.createElement('div');
      reminder.className = 'text-red-400 mt-2';
      reminder.textContent = "🚨 Reminder: This user has unpaid expenses!";
      card.appendChild(reminder);
    }

    resultsDiv.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!roommates.length) {
    roommates.push(collectUserProfile());
    saveData();
  }
  displayResults();
  if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', addExpense);
  } else {
    console.error('addExpense button not found in the DOM');
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', displayResults);
  }
});