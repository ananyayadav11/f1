/*document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggle-button');
  const hiddenRows = document.querySelectorAll('#all-rows .hidden');
  const buttonText = document.getElementById('button-text');
  const arrowIcon = document.getElementById('arrow-icon');

  toggleButton.addEventListener('click', function() {
    hiddenRows.forEach(row => {
      row.classList.toggle('hidden');
    });

    if (buttonText.textContent === 'Show all') {
      buttonText.textContent = 'Show less';
      arrowIcon.classList.add('rotate-180');
    } else {
      buttonText.textContent = 'Show all';
      arrowIcon.classList.remove('rotate-180');
    }
  });
  const searchInput = document.getElementById('driverSearch');

// Table rows
const tableRows = document.querySelectorAll('#all-rows tr');

// Driver cards
const driverCards = document.querySelectorAll('.driver-card');

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();

    // Filter table rows
    tableRows.forEach(row => {
        const driverName = row.querySelector('td:nth-child(2) span')?.textContent.toLowerCase();
        if(driverName && driverName.includes(query)){
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    // Filter driver cards
    driverCards.forEach(card => {
        const driverFullName = card.querySelector('p:nth-child(2)')?.textContent.toLowerCase();
        if(driverFullName && driverFullName.includes(query)){
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

 
});*/
const API_BASE_URL = 'http://localhost:5000/api';

const cache = {
  drivers: null,
  standings: null,
  news: null
};

const loadingState = {
  drivers: false,
  standings: false,
  news: false,
  comparison: false
};

// Show spinner only if nothing exists
function showLoading(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const existing = el.querySelectorAll('.driver-card');
  if (existing.length === 0 && !el.dataset.loaded) {
    el.innerHTML = `
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    `;
  }
}

async function fetchAPI(endpoint) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.error(`API Error (${endpoint}):`, err);
    return null;
  }
}

/* Drivers-html card */

async function loadDriverCards() {
  const driverSegment = document.getElementById('driver-segment');
  if (!driverSegment) return;

  const existingCards = driverSegment.querySelectorAll('.driver-card');

  if (existingCards.length > 0) {
    driverSegment.dataset.loaded = 'true';
    return;
  }

  if (loadingState.drivers || cache.drivers) return;

  loadingState.drivers = true;
  showLoading('driver-segment');

  const drivers = await fetchAPI('/drivers');
  if (!drivers) {
    loadingState.drivers = false;
    return;
  }

  cache.drivers = drivers;
  loadingState.drivers = false;
  renderDriverCards(drivers);
}

function renderDriverCards(drivers) {
  const driverSegment = document.getElementById('driver-segment');
  if (!driverSegment) return;

  const driverTeams = {
    'pia': { team: 'McLaren', colors: ['#ff8000', '#d96500'], img: 'oscar_piastri.png' },
    'nor': { team: 'McLaren', colors: ['#ff8000', '#d96500'], img: 'landoNorris.png' },
    'lec': { team: 'Ferrari', colors: ['#d10000', '#a00000'], img: 'charles1.png' },
    'ham': { team: 'Ferrari', colors: ['#d10000', '#a00000'], img: 'lewisHamilton.png' },
    'rus': { team: 'Mercedes', colors: ['#00C6A0', '#00665C'], img: 'georgeRussell.png' },
    'ant': { team: 'Mercedes', colors: ['#00C6A0', '#00665C'], img: 'kimiAntonelli.png' },
    'ver': { team: 'Red Bull', colors: ['#3C53D4', '#273DBE'], img: 'maxVerstappen.png' },
    'tsu': { team: 'RB', colors: ['#3C53D4', '#273DBE'], img: 'yukiTsunodza.png' }
  };

  drivers.forEach((driver, index) => {
    const teamInfo = driverTeams[driver.id];
    if (!teamInfo) return;

    const card = document.createElement('div');
    card.className = 'driver-card relative w-52 h-80 rounded-xl overflow-hidden';
    card.innerHTML = `
      <div class="absolute inset-0 bg-[repeating-linear-gradient(-45deg,_${teamInfo.colors[0]}_0px,_${teamInfo.colors[0]}_40px,_${teamInfo.colors[1]}_40px,_${teamInfo.colors[1]}_80px)]"></div>
      <img src="./f1.images/${teamInfo.img}" class="relative z-10 w-full h-3/4 object-cover">
      <div class="absolute text-white top-3 left-0 right-0 text-center z-20">
        <p class="text-lg font-semibold">${driver.firstName}</p>
        <p class="text-xl font-extrabold">${driver.lastName}</p>
      </div>
    `;

    driverSegment.appendChild(card);
  });

  driverSegment.dataset.loaded = 'true';
}

/* Standings*/

async function loadStandings() {
  const tableBody = document.getElementById('all-rows');
  if (!tableBody || loadingState.standings) return;

  loadingState.standings = true;

  const standings = await fetchAPI('/standings');
  if (!standings) {
    loadingState.standings = false;
    return;
  }

  cache.standings = standings;
  loadingState.standings = false;
  renderStandings(standings);
}

function renderStandings(standings) {
  const tableBody = document.getElementById('all-rows');
  if (!tableBody) return;

  // driver image mapping
  const driverImages = {
    // FastF1 codes (3-letter)
    'pia': 'oscar_piastri.png',
    'nor': 'landoNorris.png',
    'ver': 'maxVerstappen.png',
    'rus': 'georgeRussell.png',
    'lec': 'charles2new.png',
    'ham': 'lewisHamilton.png',
    'ant': 'kimiAntonelli.png',
    'tsu': 'yukiTsunodza.png',
    'alb': 'alexanderAlbon.png',
    'per': 'sergioPerez.png',
    'sai': 'carlosSainz.png',
    'alo': 'fernandoAlonso.png',
    'str': 'lanceStroll.png',
    'gas': 'pierreGasly.png',
    'oco': 'estebanOcon.png',
    'hul': 'nicoHulkenberg.png',
    'mag': 'kevinMagnussen.png',
    'bot': 'valtteriBottas.png',
    'zhou': 'zhouGuanyu.png',
    'ric': 'danielRicciardo.png',
    'law': 'liamLawson.png',
    'col': 'jackDoohan.png',
    'bea': 'oliverBearman.png',
    // Full names as fallback
    'piastri': 'oscar_piastri.png',
    'norris': 'landoNorris.png',
    'ver': 'maxVerstappen.png',
    'russell': 'georgeRussell.png',
    'leclerc': 'charles2new.png',
    'hamilton': 'lewisHamilton.png',
    'antonelli': 'kimiAntonelli.png',
    'tsunoda': 'yukiTsunodza.png',
    'albon': 'alexanderAlbon.png'
  };

  // flag mapping
  const flagMap = {
    'Australian': 'australia.webp',
    'British': 'ukflag.webp',
    'Dutch': 'netherlandsflag.webp',
    'Monegasque': 'monaco flag.webp',
    'Italian': 'italy.webp',
    'Japanese': 'japan.webp',
    'Spanish': 'spain.webp',
    'German': 'germany.webp',
    'Thai': 'thailand.webp',
    'Mexican': 'mexico.webp',
    'French': 'france.webp',
    'Finnish': 'finland.webp',
    'Chinese': 'china.webp',
    'Canadian': 'canada.webp',
    'Danish': 'denmark.webp',
    'American': 'usa.webp',
    'Australian': 'australia.webp'
  };

  //table rows
  tableBody.innerHTML = '';

  standings.forEach((standing, index) => {
    const row = document.createElement('tr');
    row.className = `border-b border-gray-800 ${index >= 6 ? 'hidden' : ''}`;

    const driverIdLower = standing.driverId.toLowerCase();
    const flagSrc = flagMap[standing.nationality] || 'default.webp';
    const driverImg = driverImages[driverIdLower] || 'default.png';

    row.innerHTML = `
      <td class="px-4 py-4 font-bold">${standing.position}</td>

      <td class="px-4 py-4">
        <div class="flex items-center space-x-2">
          <img src="./f1.images/${driverImg}"
               class="w-8 h-8 rounded-full object-cover border-2 border-gray-700"
               onerror="this.src='./f1.images/default.png'; this.onerror=null;">
          <span>${standing.firstName} ${standing.lastName}</span>
        </div>
      </td>

      <td class="px-4 py-3">
        <div class="flex items-center space-x-2">
          <img src="./f1.images/${flagSrc}"
               class="w-8 h-8 rounded-full object-cover border-2 border-gray-700"
               onerror="this.src='./f1.images/default.webp'; this.onerror=null;">
          <span>${standing.nationality}</span>
        </div>
      </td>

      <td class="px-4 py-3">${standing.team}</td>
      <td class="px-3 py-3 font-bold">${standing.points}</td>
    `;

    tableBody.appendChild(row);
  });

  tableBody.dataset.loaded = 'true';
}

/* Compare drivers */

function addComparisonFeature() {
  // Prevent duplicate
  if (document.getElementById('compareSection')) return;

  const section = document.createElement('section');
  section.id = 'compareSection';
  section.className = 'bg-[#0c0b10] py-16 px-8';

  section.innerHTML = `
    <!-- Section Header -->
    <div class="text-center mb-12">
      <h2 class="text-5xl font-extrabold font-[bungee] text-white mb-4">
        COMPARE DRIVERS
      </h2>
      <p class="text-gray-400 text-lg">
        Select two drivers to see their head-to-head statistics
      </p>
    </div>

    <!-- Comparison Form -->
    <div class="max-w-4xl mx-auto bg-[#1a1b1e] rounded-2xl p-8 shadow-2xl">
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Driver 1 -->
        <div class="space-y-3">
          <label class="text-white font-bold text-lg block">Driver 1</label>
          <select id="driver1Select"
            class="w-full p-4 rounded-lg bg-[#0c0b10] text-white border-2 border-gray-700 
                   focus:border-red-600 focus:outline-none transition text-lg">
            <option value="">Choose driver...</option>
          </select>
        </div>

        <!-- Driver 2 -->
        <div class="space-y-3">
          <label class="text-white font-bold text-lg block">Driver 2</label>
          <select id="driver2Select"
            class="w-full p-4 rounded-lg bg-[#0c0b10] text-white border-2 border-gray-700 
                   focus:border-red-600 focus:outline-none transition text-lg">
            <option value="">Choose driver...</option>
          </select>
        </div>
      </div>

      <!-- Compare Button -->
      <div class="text-center mt-8">
        <button id="compareBtn"
          class="px-12 py-4 bg-red-600 text-white font-bold text-xl rounded-lg
                 hover:bg-red-700 transform hover:scale-105 transition-all duration-200
                 shadow-lg hover:shadow-2xl">
          🏎️ COMPARE DRIVERS
        </button>
      </div>

      <!-- Status Message -->
      <p id="compareStatus" class="text-gray-400 mt-4 text-center text-sm">
        Waiting for data...
      </p>
    </div>

    <!-- Comparison Result Container -->
    <div id="comparisonResult" class="hidden max-w-4xl mx-auto mt-8"></div>
  `;

  
  const partnersSection = document.querySelector('section:has(h2:contains("OUR PARTNERS"))') 
    || document.querySelector('main').lastElementChild;
  
  if (partnersSection && partnersSection.parentNode) {
    partnersSection.parentNode.insertBefore(section, partnersSection);
  } else {
    document.querySelector('main').appendChild(section);
  }
}

function populateCompareSelects() {
  if (!cache.standings || !cache.standings.length) {
    setTimeout(populateCompareSelects, 500); // Retry
    return;
  }

  const s1 = document.getElementById('driver1Select');
  const s2 = document.getElementById('driver2Select');
  const button = document.getElementById('compareBtn');
  const status = document.getElementById('compareStatus');

  if (!s1 || !s2) return;

  s1.innerHTML = `<option value="">Choose driver...</option>`;
  s2.innerHTML = `<option value="">Choose driver...</option>`;

  cache.standings.forEach(d => {
    const opt1 = document.createElement('option');
    opt1.value = d.driverId;
    opt1.textContent = `${d.firstName} ${d.lastName} (${d.team})`;
    s1.appendChild(opt1);

    const opt2 = opt1.cloneNode(true);
    s2.appendChild(opt2);
  });

  if (status) {
    status.textContent = 'Select two drivers to compare their performance.';
    status.classList.remove('text-red-500');
    status.classList.add('text-gray-400');
  }

  // Enable button and add click handler
  if (button) {
    button.disabled = false;
    button.classList.remove('opacity-50', 'cursor-not-allowed');

    
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    newButton.addEventListener('click', () => {
      const d1 = s1.value;
      const d2 = s2.value;

      if (!d1 || !d2) {
        alert(" Please select both drivers!");
        return;
      }

      if (d1 === d2) {
        alert(" Please select two different drivers!");
        return;
      }

      compareDrivers(d1, d2);
    });
  }
}

async function compareDrivers(driver1Id, driver2Id) {
  const status = document.getElementById('compareStatus');
  const resultContainer = document.getElementById('comparisonResult');

  if (status) {
    status.textContent = '⏳ Comparing drivers...';
    status.classList.add('text-yellow-500');
  }

  try {
    const res = await fetch(`${API_BASE_URL}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        driver1: driver1Id, 
        driver2: driver2Id 
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    
    if (data.success) {
      renderComparison(data.data);
      if (status) {
        status.textContent = 'Comparison complete!';
        status.classList.remove('text-yellow-500');
        status.classList.add('text-green-500');
      }
    } else {
      throw new Error('Comparison failed');
    }
  } catch (e) {
    console.error("Comparison error:", e);
    if (status) {
      status.textContent = 'Error: Backend not reachable. Make sure Flask server is running.';
      status.classList.remove('text-yellow-500');
      status.classList.add('text-red-500');
    }
    
    if (resultContainer) {
      resultContainer.classList.add('hidden');
    }
  }
}

function renderComparison(data) {
  const container = document.getElementById("comparisonResult");
  if (!container) return;

  container.classList.remove('hidden');
  
  container.innerHTML = `
    <div class="bg-[#1a1b1e] rounded-2xl p-8 shadow-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h3 class="text-3xl font-bold text-white mb-2">Head-to-Head Comparison</h3>
        <p class="text-gray-400">Season 2025 Statistics</p>
      </div>

      <!-- Driver Cards -->
      <div class="grid md:grid-cols-2 gap-8 mb-8">
        <!-- Driver 1 -->
        <div class="bg-[#0c0b10] rounded-xl p-6 border-2 border-red-600">
          <h4 class="text-2xl font-bold text-white mb-4">${data.driver1.name}</h4>
          <p class="text-gray-400 mb-6">${data.driver1.team}</p>
          
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Championship Position</span>
              <span class="text-2xl font-bold text-white">${data.driver1.position || 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Total Points</span>
              <span class="text-2xl font-bold text-red-500">${data.driver1.points}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Race Wins</span>
              <span class="text-xl font-bold text-white">${data.driver1.wins}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Avg Points/Race</span>
              <span class="text-xl font-bold text-white">${data.driver1.avgPoints}</span>
            </div>
          </div>
        </div>

        <!-- Driver 2 -->
        <div class="bg-[#0c0b10] rounded-xl p-6 border-2 border-blue-600">
          <h4 class="text-2xl font-bold text-white mb-4">${data.driver2.name}</h4>
          <p class="text-gray-400 mb-6">${data.driver2.team}</p>
          
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Championship Position</span>
              <span class="text-2xl font-bold text-white">${data.driver2.position || 'N/A'}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Total Points</span>
              <span class="text-2xl font-bold text-blue-500">${data.driver2.points}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Race Wins</span>
              <span class="text-xl font-bold text-white">${data.driver2.wins}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Avg Points/Race</span>
              <span class="text-xl font-bold text-white">${data.driver2.avgPoints}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Differences Summary -->
      <div class="bg-gradient-to-r from-red-900/30 to-blue-900/30 rounded-xl p-6 text-center">
        <h4 class="text-xl font-bold text-white mb-4">Points Difference</h4>
        <p class="text-4xl font-extrabold ${data.differences.points > 0 ? 'text-red-500' : 'text-blue-500'}">
          ${Math.abs(data.differences.points)} points
        </p>
        <p class="text-gray-400 mt-2">
          ${data.driver1.name} ${data.differences.points > 0 ? 'leads' : 'trails'} by ${Math.abs(data.differences.points)} points
        </p>
      </div>
    </div>
  `;

  
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/*Search for driver in the table i.e making fropdown menu */

function initDriverSearch() {
  const input = document.getElementById('driverSearch');
  if (!input) return;

  let dropdown = document.createElement('div');
  dropdown.className = 'absolute bg-[#1a1b1e] border border-gray-700 rounded-md mt-1 w-full z-50 hidden max-h-64 overflow-y-auto';

  input.parentElement.style.position = 'relative';
  input.parentElement.appendChild(dropdown);

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    dropdown.innerHTML = '';

    const rows = document.querySelectorAll('#all-rows tr');
    if (!q || !cache.standings) {
      dropdown.classList.add('hidden');
      rows.forEach(r => (r.style.display = ''));
      return;
    }

    const matches = cache.standings.filter(d =>
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(q)
    );

    // Filter table rows
    rows.forEach(row => {
      const name = row.querySelector('td:nth-child(2) span')?.textContent.toLowerCase();
      row.style.display = name && name.includes(q) ? '' : 'none';
    });

    // Build dropdown
    matches.forEach(d => {
      const item = document.createElement('div');
      item.className = 'px-4 py-2 hover:bg-red-600 cursor-pointer text-white';
      item.textContent = `${d.firstName} ${d.lastName} - ${d.team}`;

      item.addEventListener('click', () => {
        input.value = `${d.firstName} ${d.lastName}`;
        dropdown.classList.add('hidden');

        const row = Array.from(rows).find(r =>
          r.querySelector('td:nth-child(2) span')?.textContent
            .toLowerCase()
            .includes(d.lastName.toLowerCase())
        );

        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      dropdown.appendChild(item);
    });

    dropdown.classList.toggle('hidden', matches.length === 0);
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target)) dropdown.classList.add('hidden');
  });
}



function initToggleButton() {
  const toggleButton = document.getElementById('toggle-button');
  const buttonText = document.getElementById('button-text');
  const arrowIcon = document.getElementById('arrow-icon');

  if (!toggleButton) return;

  toggleButton.addEventListener('click', () => {
    const tableBody = document.getElementById('all-rows');
    const allRows = tableBody.querySelectorAll('tr');

    allRows.forEach((row, index) => {
      if (index >= 6) {
        row.classList.toggle('hidden');
      }
    });

    if (buttonText.textContent === 'Show all') {
      buttonText.textContent = 'Show less';
      arrowIcon.classList.add('rotate-180');
    } else {
      buttonText.textContent = 'Show all';
      arrowIcon.classList.remove('rotate-180');
    }
  });
}

/*Init*/

document.addEventListener('DOMContentLoaded', async () => {
  // Prevent multiple initializations
  if (window.f1AppInitialized) return;
  window.f1AppInitialized = true;

  
  addComparisonFeature();

  try {
    // load standings from backend
    await loadStandings();
    
    // If standings loaded, populate comparison dropdowns
    if (cache.standings && cache.standings.length > 0) {
      populateCompareSelects();
    } else {
      // No backend data - show static fallback in dropdowns
      showStaticFallback();
    }
    
    // Initialize search
    initDriverSearch();
    
    // Initialize toggle button
    initToggleButton();
    
    // Load driver cards (keeps HTML cards if they exist)
    await loadDriverCards();
    
  } catch (e) {
    console.error("Initialization error:", e);
    // Show static fallback on error
    showStaticFallback();
  }
});

/* STATIC FALLBACK (No Backend)*/

function showStaticFallback() {
  const s1 = document.getElementById('driver1Select');
  const s2 = document.getElementById('driver2Select');
  const status = document.getElementById('compareStatus');
  const button = document.getElementById('compareBtn');

  // Static driver list for demo purposes
  const staticDrivers = [
    { id: 'piastri', name: 'Oscar Piastri', team: 'McLaren' },
    { id: 'norris', name: 'Lando Norris', team: 'McLaren' },
    { id: 'verstappen', name: 'Max Verstappen', team: 'Red Bull Racing' },
    { id: 'hamilton', name: 'Lewis Hamilton', team: 'Ferrari' },
    { id: 'leclerc', name: 'Charles Leclerc', team: 'Ferrari' },
    { id: 'russell', name: 'George Russell', team: 'Mercedes' },
    { id: 'antonelli', name: 'Kimi Antonelli', team: 'Mercedes' },
    { id: 'albon', name: 'Alexander Albon', team: 'Williams' }
  ];

  if (s1 && s2) {
    s1.innerHTML = `<option value="">Choose driver...</option>`;
    s2.innerHTML = `<option value="">Choose driver...</option>`;

    staticDrivers.forEach(d => {
      const opt1 = document.createElement('option');
      opt1.value = d.id;
      opt1.textContent = `${d.name} (${d.team})`;
      s1.appendChild(opt1);

      const opt2 = opt1.cloneNode(true);
      s2.appendChild(opt2);
    });
  }

  if (status) {
    status.textContent = 'Backend offline ';
    status.classList.add('text-yellow-500');
  }

  if (button) {
    button.disabled = false;
    button.classList.remove('opacity-50', 'cursor-not-allowed');

    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    newButton.addEventListener('click', () => {
      const status = document.getElementById('compareStatus');
      if (status) {
        status.textContent = 'Flask server required. Run: python app.py';
        status.classList.remove('text-yellow-500');
        status.classList.add('text-red-500');
      }
      alert('Backend Required!\n\nTo use comparison:\n1. Open terminal\n2. Run: python app.py\n3. Refresh page');
    });
  }
}
// ============================================
// ML PREDICTION FUNCTIONALITY
// ============================================

// Add event listener when page loads
document.addEventListener('DOMContentLoaded', function() {
    const predictBtn = document.getElementById('predictBtn');
    if (predictBtn) {
        predictBtn.addEventListener('click', fetchPredictions);
    }
});

async function fetchPredictions() {
    const predictBtn = document.getElementById('predictBtn');
    const predictStatus = document.getElementById('predictStatus');
    const predictionResult = document.getElementById('predictionResult');
    const predictionsList = document.getElementById('predictionsList');

    try {
        // Show loading state
        predictBtn.disabled = true;
        predictBtn.textContent = '⏳ GENERATING PREDICTIONS...';
        predictStatus.textContent = 'Running ML model...';
        predictStatus.className = 'text-blue-500 text-sm mt-4';

        // Fetch predictions from API
        const response = await fetch('http://127.0.0.1:5000/api/predict-podium');
        
        if (!response.ok) {
            throw new Error('Failed to fetch predictions');
        }

        const result = await response.json();

        if (result.success) {
            displayPredictions(result.data);
            predictionResult.classList.remove('hidden');
            predictStatus.textContent = '';
            predictStatus.className = 'text-green-500 text-sm mt-4';
        } else {
            throw new Error(result.error || 'Prediction failed');
        }

    } catch (error) {
        console.error('Prediction error:', error);
        predictStatus.textContent = '❌ Error: Make sure Flask server is running';
        predictStatus.className = 'text-red-500 text-sm mt-4';
        predictionResult.classList.add('hidden');
    } finally {
        // Reset button
        predictBtn.disabled = false;
        predictBtn.textContent = '🎯 PREDICT NEXT RACE PODIUM';
    }
}

function displayPredictions(predictions) {
    const predictionsList = document.getElementById('predictionsList');
    
    if (!predictions || predictions.length === 0) {
        predictionsList.innerHTML = '<p class="text-gray-400 text-center p-4 text-sm">No predictions available</p>';
        return;
    }

    let html = '';
    
    // Show ALL drivers, not just top 10
    predictions.forEach((prediction, index) => {
        const rankBg = index < 3 ? 'bg-gray-800' : '';
        const probabilityColor = prediction.podiumProbability > 60 ? 'text-green-400' : 
                                 prediction.podiumProbability > 35 ? 'text-yellow-400' : 'text-gray-400';
        
        // Medal emojis for top 3
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        
        html += `
            <div class="grid grid-cols-12 gap-4 p-3 hover:bg-[#1a1b1f] transition ${rankBg}">
                <div class="col-span-1 text-center text-gray-400 text-sm font-medium">
                    ${medal || (index + 1)}
                </div>
                <div class="col-span-5">
                    <p class="text-white text-sm font-medium">${prediction.driver}</p>
                </div>
                <div class="col-span-3">
                    <p class="text-gray-400 text-xs">${prediction.team}</p>
                </div>
                <div class="col-span-3 text-right">
                    <span class="text-base font-bold ${probabilityColor}">${prediction.podiumProbability}%</span>
                </div>
            </div>
        `;
    });
    
    predictionsList.innerHTML = html;
}