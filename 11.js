document.addEventListener('DOMContentLoaded', function() {
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

 



});
