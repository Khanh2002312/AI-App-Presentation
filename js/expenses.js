
const addExpenseBtn    = document.getElementById('addExpense');
const resultsDiv       = document.getElementById('results');
const categoryFilter   = document.getElementById('categoryFilter');

function addExpense() {
  const category    = document.getElementById('category')?.value;
  const customDesc  = document.getElementById('customDescription')?.value.trim();
  const amount      = parseFloat(document.getElementById('amount')?.value);
  const dueDate     = document.getElementById('dueDate')?.value;

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

  const percentagePaid = ((paidAmount / expense.amount) * 100).toFixed(2);

  const percentageDisplay = document.createElement('div');
  percentageDisplay.className = 'text-green-500 mt-2';
  percentageDisplay.textContent = `✅ ${percentagePaid}% of this expense has been paid.`;

  const card = resultsDiv.querySelectorAll('.card')[rmIndex];
  const existing = card.querySelector('.text-green-500');
  if (existing) {
    existing.textContent = percentageDisplay.textContent;
  } else {
    card.appendChild(percentageDisplay);
  }

  saveData();
  displayResults();
}

function displayResults() {
  if (!resultsDiv) return;

  const savedProfile = JSON.parse(localStorage.getItem('profile'));
  const userName     = savedProfile?.name || "You";
  const updatedProfile = {
    ...savedProfile,
    expenses: roommates[0]?.expenses || []
  };
  roommates[0] = updatedProfile;
  saveData();

  resultsDiv.innerHTML = '';
  const filter = categoryFilter?.value || 'All';

  roommates.forEach((rm, index) => {
    const card = document.createElement('div');
    card.className = 'card';

    const nameEl = document.createElement('strong');
    nameEl.textContent = rm.name || (index === 0 ? userName : 'Unnamed Roommate');
    card.appendChild(nameEl);

    const contact = document.createElement('div');
    contact.className = 'text-gray-400';
    contact.innerHTML = `
      ${rm.email ? '📧 ' + rm.email + '<br>' : ''}
      ${rm.phone ? '📞 ' + rm.phone : ''}
    `;
    card.appendChild(contact);

    rm.expenses
      .filter(ex => filter === 'All' || ex.category === filter)
      .forEach((ex, exIndex) => {
        const line = document.createElement('div');
        line.className = 'expense-paid flex justify-between items-center space-x-2 mt-2';
        line.textContent = `${ex.description} (Due: ${ex.dueDate || "N/A"}) - $${ex.amount.toFixed(2)}`;
        // payment correction UI
        const wrapper = document.createElement('div');
        wrapper.className = 'flex items-center space-x-2';
        const input = document.createElement('input');
        input.type = 'number'; input.step = '0.01'; input.min = '0';
        input.max = ex.amount.toFixed(2);
        input.value = ex.paidAmount?.toFixed(2) || '0.00';
        input.className = 'input-field w-32';
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.textContent = 'Correct';
        btn.onclick = () => updatePayment(index, exIndex, input.value);
        wrapper.appendChild(input);
        wrapper.appendChild(btn);
        line.appendChild(wrapper);
        card.appendChild(line);
      });

    const total = document.createElement('div');
    total.className = 'total mt-4';
    total.textContent = `Total Owed: $${getTotal(rm.expenses).toFixed(2)} (Unpaid: $${getUnpaidTotal(rm.expenses).toFixed(2)})`;
    card.appendChild(total);

    resultsDiv.appendChild(card);
  });
}


const EMAILJS_SERVICE_ID  = 'service_3umqn5p';   // ← your service ID
const EMAILJS_TEMPLATE_ID = 'template_iad8gbs';  // ← your template ID

function loadSendDropdown() {
  const sel = document.getElementById('expenseSendSelect');
  sel.innerHTML = '<option value="">Select roommate…</option>';
  roommates.forEach((rm, i) => {
    if (rm.name) {
      sel.innerHTML += `<option value="${i}">${rm.name}</option>`;
    }
  });
}

async function sendExpenseReport() {
  const sel     = document.getElementById('expenseSendSelect');
  const status  = document.getElementById('expenseEmailStatus');
  const idx     = sel.value;
  if (idx === '') {
    return alert('Please select a roommate to email.');
  }
  const rm = roommates[+idx];

  if (!rm.expenses?.length) {
    status.textContent = `${rm.name} has no expenses.`;
    return;
  }
  if (!rm.email) {
    status.textContent = `No email on file for ${rm.name}.`;
    return;
  }

  let totalOwed = 0, totalPaid = 0;
  const lines = rm.expenses.map(ex => {
    totalOwed += ex.amount;
    totalPaid += ex.paidAmount || 0;
    return `• ${ex.description}: Owed $${ex.amount.toFixed(2)}, Paid $${(ex.paidAmount||0).toFixed(2)}, Due ${ex.dueDate}`;
  });
  lines.push(`\nTotal Owed: $${totalOwed.toFixed(2)}`);
  lines.push(`Total Paid: $${totalPaid.toFixed(2)}`);
  lines.push(`Unpaid: $${(totalOwed - totalPaid).toFixed(2)}`);

  status.textContent = 'Sending…';

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_name:  rm.name,
        to_email: rm.email,
        report:   lines.join('\n')
      }
    );
    status.textContent = `✅ Expense report sent to ${rm.name}!`;
  } catch (err) {
    console.error(err);
    status.textContent = `❌ Failed to send report to ${rm.name}.`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!roommates.length) {
    roommates.push(collectUserProfile());
    saveData();
  }
  displayResults();
  addExpenseBtn?.addEventListener('click', addExpense);
  categoryFilter?.addEventListener('change', displayResults);

  loadSendDropdown();
  document.getElementById('sendExpenseBtn')
          .addEventListener('click', sendExpenseReport);
});
