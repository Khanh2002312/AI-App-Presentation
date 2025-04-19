// js/offlimits.js

// —──────── STORAGE & DATA ───────—
const storageKey = 'offLimitsItems';
let offLimits   = JSON.parse(localStorage.getItem(storageKey)) || [];
const roommates  = JSON.parse(localStorage.getItem('roommates'))   || [];

// —──────── DOM REFERENCES ───────—
const listEl     = document.getElementById('offlimitsList');
const nameInput  = document.getElementById('itemName');
const noteInput  = document.getElementById('itemNote');
const ownerSelect= document.getElementById('itemOwner');
const imageInput = document.getElementById('itemImage');
const addBtn     = document.getElementById('addItem');

// —──────── MODAL REFERENCES ───────—
const zoomModal   = document.getElementById('zoomModal');
const zoomContent = document.getElementById('zoomContent');
const zoomClose   = document.getElementById('zoomClose');

// —──────── STORAGE HELPERS ───────—
function save() {
  localStorage.setItem(storageKey, JSON.stringify(offLimits));
}

// —──────── OWNER DROPDOWN ───────—
function loadOwners() {
  ownerSelect.innerHTML = '<option value="">Select roommate…</option>';
  roommates.forEach(rm => {
    ownerSelect.innerHTML += `<option value="${rm.name}">${rm.name}</option>`;
  });
}

// —──────── RENDER LIST ───────—
function render() {
  listEl.innerHTML = '';
  offLimits.forEach((it, i) => {
    const li = document.createElement('li');
    li.className = 'card flex space-x-4 items-start';
    li.style.cursor = 'pointer';

    // image thumbnail
    if (it.image) {
      const img = document.createElement('img');
      img.src = it.image;
      img.className = 'w-16 h-16 object-cover rounded';
      li.appendChild(img);
    }

    // details
    const details = document.createElement('div');
    details.innerHTML = `
      <div><strong>${it.owner}</strong>: <span class="font-semibold">${it.name}</span></div>
      ${it.note ? `<p class="text-gray-400 text-sm mt-1">${it.note}</p>` : ''}
    `;
    li.appendChild(details);

    // delete button
    const del = document.createElement('button');
    del.className = 'btn btn-danger self-start';
    del.textContent = '×';
    del.dataset.idx = i;
    del.onclick = e => {
      e.stopPropagation();       // prevent zoom
      offLimits.splice(i, 1);
      save();
      render();
    };
    li.appendChild(del);

    listEl.appendChild(li);

    // clicking card opens zoom
    li.addEventListener('click', () => openZoom(it));
  });
}

// —──────── ADD ITEM ───────—
addBtn.addEventListener('click', () => {
  const name  = nameInput.value.trim();
  const note  = noteInput.value.trim();
  const owner = ownerSelect.value;
  const file  = imageInput.files[0];

  if (!name)  return alert('Please enter an item name.');
  if (!owner) return alert('Please select an owner.');

  const addItem = imageData => {
    offLimits.push({ name, note, owner, image: imageData });
    save();
    render();
    nameInput.value = '';
    noteInput.value = '';
    ownerSelect.value = '';
    imageInput.value = '';
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = () => addItem(reader.result);
    reader.readAsDataURL(file);
  } else {
    addItem(null);
  }
});

// —──────── ZOOM MODAL ───────—
function openZoom(item) {
  zoomContent.innerHTML = `
    ${item.image
      ? `<img src="${item.image}" class="w-full h-auto mb-4 rounded-lg object-cover">`
      : ''}
    <h3 class="text-xl font-semibold mb-2">${item.owner}: ${item.name}</h3>
    ${item.note ? `<p class="text-gray-300 mb-2">${item.note}</p>` : ''}
  `;
  zoomModal.classList.remove('hidden');
}

// close handlers
zoomClose.onclick = () => zoomModal.classList.add('hidden');
zoomModal.addEventListener('click', e => {
  if (e.target === zoomModal) zoomModal.classList.add('hidden');
});

// —──────── INITIALIZATION ───────—
window.addEventListener('DOMContentLoaded', () => {
  loadOwners();
  render();
});
