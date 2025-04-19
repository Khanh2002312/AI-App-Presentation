document.addEventListener('DOMContentLoaded', () => {
 
  const STORAGE_KEY  = 'roomieChores';
  const PROFILE_KEY  = 'profile';
  const SERVICE_ID   = 'service_3umqn5p';   // ← your EmailJS Service ID
  const TEMPLATE_ID  = 'template_dovzvx7';  // ← your EmailJS Template ID
  
  let chores    = JSON.parse(localStorage.getItem(STORAGE_KEY))    || [];
  let roommates = JSON.parse(localStorage.getItem('roommates'))   || [];
  let profile   = JSON.parse(localStorage.getItem(PROFILE_KEY))   || {};

  const descInput     = document.getElementById('choreDesc');
  const dateInput     = document.getElementById('choreDate');
  const assignSelect  = document.getElementById('choreAssigned');
  const addBtn        = document.getElementById('addChore');
  const listDiv       = document.getElementById('choresList');
  const statusDiv     = document.getElementById('emailStatus');

  const manualBtn     = document.getElementById('manualSendBtn');
  const selectorDiv   = document.getElementById('send-selector');
  const sendToSelect  = document.getElementById('sendToSelect');
  const confirmBtn    = document.getElementById('confirmSendBtn');
  const cancelBtn     = document.getElementById('cancelSendBtn');

  function saveChores() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chores));
  }

  function parseYMD(s) {
    const [y,m,d] = s.split('-').map(n => +n);
    return new Date(y, m-1, d);
  }

  function loadRoommatesForAdd() {
    assignSelect.innerHTML = '<option value="">Assign to…</option>';
    if (profile.name) {
      assignSelect.innerHTML += `<option>${profile.name}</option>`;
    }
    roommates.forEach(r => {
      if (r.name !== profile.name) {
        assignSelect.innerHTML += `<option>${r.name}</option>`;
      }
    });
  }

  function loadRoommatesForSend() {
    sendToSelect.innerHTML = '<option value="">Select roommate…</option>';
    if (profile.name) {
      sendToSelect.innerHTML += `<option value="${profile.name}">${profile.name}</option>`;
    }
    roommates.forEach(r => {
      if (r.name !== profile.name) {
        sendToSelect.innerHTML += `<option value="${r.name}">${r.name}</option>`;
      }
    });
  }

  function renderChores() {
    listDiv.innerHTML = '';
    const upcoming = chores
      .map((c,i) => ({ chore: c, idx: i }))
      .sort((a,b) => parseYMD(a.chore.date) - parseYMD(b.chore.date));

    let lastDate = '';
    for (let { chore, idx } of upcoming) {
      if (chore.date !== lastDate) {
        lastDate = chore.date;
        const hdr = document.createElement('div');
        hdr.className = 'calendar-date';
        hdr.textContent = parseYMD(lastDate).toLocaleDateString(undefined,{
          year:'numeric', month:'long', day:'numeric'
        });
        listDiv.appendChild(hdr);
      }
      const card = document.createElement('div');
      card.className = 'card flex justify-between items-center';
      card.innerHTML = `
        <span>${chore.desc} <small>(${chore.assigned})</small></span>
        <button class="btn btn-danger" data-idx="${idx}">&times;</button>
      `;
      listDiv.appendChild(card);
    }

    listDiv.querySelectorAll('button.btn-danger').forEach(btn => {
      btn.addEventListener('click', e => {
        const i = +e.currentTarget.dataset.idx;
        chores.splice(i,1);
        saveChores();
        renderChores();
      });
    });
  }

  function sendEmail(chore, toEmail, toName) {
    return emailjs.send(
      SERVICE_ID, TEMPLATE_ID, {
        to_name:    toName,
        to_email:   toEmail,
        chore_desc: chore.desc,
        due_date:   parseYMD(chore.date).toLocaleDateString(undefined,{
          year:'numeric', month:'long', day:'numeric'
        })
      }
    )
    .then(res => {
      statusDiv.innerHTML += `✅ Sent to <strong>${toName}</strong>: "${chore.desc}"<br/>`;
    })
    .catch(err => {
      statusDiv.innerHTML += `❌ Failed for <strong>${toName}</strong>: "${chore.desc}"<br/>`;
      console.error(err);
    });
  }

  async function sendAllForPerson(name) {
    statusDiv.innerHTML = '';
    // find all chores assigned to “name”
    const tasks = chores
      .map((c,i) => ({ chore:c, idx:i }))
      .filter(x => x.chore.assigned === name);

    if (!tasks.length) {
      statusDiv.textContent = `⚠️ ${name} has no chores.`;
      return;
    }

    for (let { chore, idx } of tasks) {
      // find email
      const rm = roommates.find(r => r.name === name);
      const email = rm?.email || (profile.name===name && profile.email);
      if (!email) {
        statusDiv.innerHTML += `⚠️ No email for <strong>${name}</strong><br/>`;
        continue;
      }
      await sendEmail(chore, email, name);
      chores[idx].reminderSent = true;
    }
    saveChores();
  }

  addBtn.addEventListener('click', () => {
    const desc = descInput.value.trim();
    const date = dateInput.value;
    const who  = assignSelect.value;
    if (!desc || !date || !who) return alert('Please fill all fields.');
    chores.push({ desc, date, assigned: who });
    saveChores(); renderChores();
    descInput.value=''; dateInput.value=''; assignSelect.value='';
  });

  manualBtn.addEventListener('click', () => {
    loadRoommatesForSend();
    manualBtn.classList.add('hidden');
    selectorDiv.classList.remove('hidden');
  });

  confirmBtn.addEventListener('click', () => {
    const who = sendToSelect.value;
    if (!who) return alert('Please select a roommate.');
    selectorDiv.classList.add('hidden');
    manualBtn.classList.remove('hidden');
    sendAllForPerson(who);
  });

  cancelBtn.addEventListener('click', () => {
    selectorDiv.classList.add('hidden');
    manualBtn.classList.remove('hidden');
  });

  loadRoommatesForAdd();
  renderChores();
});
