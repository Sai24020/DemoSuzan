let universities = [];
let currentPage = 1;
const pageSize = 10;
let favoriteUniversities = JSON.parse(localStorage.getItem('favoriteUniversities')) || [];

function saveFavorites() {
  localStorage.setItem('favoriteUniversities', JSON.stringify(favoriteUniversities));
}

function isFavorite(universityName) {
  return favoriteUniversities.some(fav => fav.name === universityName);
}

function toggleFavorite(university, circleElem) {
  if (isFavorite(university.name)) {
    favoriteUniversities = favoriteUniversities.filter(fav => fav.name !== university.name);
    circleElem.classList.remove('favorite');
  } else {
    favoriteUniversities.push(university);
    circleElem.classList.add('favorite');//spara i local storage som favurete
  }
  saveFavorites();
}

document.getElementById('searchBtn').addEventListener('click', async () => {
 
  const input = document.getElementById('countryInput').value.trim();
 //kolla efter countryInput finns all..vissa hella lander
  if (!input) {
    alert("Vänligen skriv in ett land eller 'all'");
    return;
  }

  const isAll = input.toLowerCase() === 'all';
  const apiUrl = isAll 
                   ? `http://universities.hipolabs.com/search` 
                   : `http://universities.hipolabs.com/search?country=${encodeURIComponent(input)}`;

 // flagEndpoint = `https://restcountries.com/v3.1/name/${query}` eller https://github.com/mledoze/countries/tree/master/data/swe.svg ???

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let data = await response.json();
    universities = data.map(univ => ({
      ...univ,
      year_built: Math.floor(Math.random() * (2000 - 1850 + 1)) + 1850
    }));
    
    currentPage = 1;
    document.getElementById('resultInfo').textContent = `Antal universitet${isAll ? '' : ' i ' + input}: ${universities.length}`;
    displayPage(currentPage);
    createPaginationControls();
  } catch (error) {
    console.error("Fel vid hämtning av data:", error);
  }
});

function displayPage(page) {
  const container = document.getElementById('universityContainer');
  container.innerHTML = '';
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = universities.slice(startIndex, endIndex);
  
  if (pageItems.length === 0) {
    container.innerHTML = '<p>Inga universitet hittades.</p>';
    return;
  }
  
  pageItems.forEach(university => {
    const card = document.createElement('div');
    card.className = 'university-card';
    
    const flagImg = document.createElement('img');
    flagImg.className = 'country-flag';
    flagImg.src = `https://restcountries.com/v3.1/name/png/${encodeURIComponent(university.country)}`;
    flagImg.alt = `${university.country} flagga`;
    card.appendChild(flagImg);
  
    const infoDiv = document.createElement('article');
    infoDiv.className = 'university-info';
    const nameElem = document.createElement('h3');
    nameElem.textContent = university.name;
    infoDiv.appendChild(nameElem);
    const yearElem = document.createElement('p');
    yearElem.textContent = `Grundat år: ${university.year_built}`;
    infoDiv.appendChild(yearElem);
    
    /*<a href="${university.web_pages ? university.web_pages[0] : '#'}" target="_blank">Besök universitetets webbplats</a>*/
    if (university.web_pages && university.web_pages.length > 0) {
      const linkElem = document.createElement('a');
      linkElem.href = university.web_pages[0];
      linkElem.textContent = "Besök webbplats";
      linkElem.target = "_blank";
      infoDiv.appendChild(linkElem);
    }
    card.appendChild(infoDiv);
    
    const favCircle = document.createElement('div');
    favCircle.className = 'favorite-circle';
    if (isFavorite(university.name)) {
      favCircle.classList.add('favorite');
    }
    favCircle.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleFavorite(university, favCircle);
    });
    card.appendChild(favCircle);
    
    container.appendChild(card);
  });
}

function createPaginationControls() {
  const paginationDiv = document.getElementById('paginationControls');
  paginationDiv.innerHTML = '';
  const totalPages = Math.ceil(universities.length / pageSize);
  
  const prevButton = document.createElement('button');
  prevButton.textContent = "Prev";               //Behöver lösa problem
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayPage(currentPage);
      updatePaginationActive();
    }
  });
  paginationDiv.appendChild(prevButton);
  
  const pageSpan = document.createElement('span');
  pageSpan.textContent = `Page ${currentPage}`;
  paginationDiv.appendChild(pageSpan);
  
  const nextButton = document.createElement('button');
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayPage(currentPage);
      updatePaginationActive();
    }
  });
  paginationDiv.appendChild(nextButton);
}

function updatePaginationActive() {
  const totalPages = Math.ceil(universities.length / pageSize);
  const pageSpan = document.querySelector('.pagination span');
  if (pageSpan) {
    pageSpan.textContent = `Page ${currentPage}`;
  }
}

document.getElementById('navFav').addEventListener('click', () => {
  document.getElementById('favoritesSection').classList.add('active-section');
  document.getElementById('homeSection').classList.remove('active-section');
  displayFavorites();
});

document.getElementById('clearFavBtn').addEventListener('click', () => {
  favoriteUniversities = [];
  saveFavorites();
  displayFavorites();
});

document.getElementById('backHomeBtn').addEventListener('click', () => {
  document.getElementById('favoritesSection').classList.remove('active-section');
  document.getElementById('homeSection').classList.add('active-section');
});

function displayFavorites() {
  const container = document.getElementById('favoritesContainer');
  const countrySelect = document.getElementById('countrySelect');
  const countryInfo = document.getElementById('countryInfo');
  container.innerHTML = '';
  countrySelect.innerHTML = '<option value="">Alla länder</option>';
  
  if (favoriteUniversities.length === 0) {
    container.innerHTML = '<p>Inga favorituniversitet ännu.</p>';
    countryInfo.innerHTML = '';
    return;
  }

  // Group favorites by country
  const countryCount = favoriteUniversities.reduce((acc, university) => {
    acc[university.country] = (acc[university.country] || 0) + 1;
    return acc;
  }, {});

  // Populate country select options
  Object.keys(countryCount).forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = `${country} (${countryCount[country]})`;
    countrySelect.appendChild(option);
  });

  // Display universities for selected country
  countrySelect.addEventListener('change', () => {
    const selectedCountry = countrySelect.value;
    displayUniversitiesByCountry(selectedCountry);
  });

  displayUniversitiesByCountry('');

  function displayUniversitiesByCountry(selectedCountry) {
    const filteredUniversities = selectedCountry ? favoriteUniversities.filter(u => u.country === selectedCountry) : favoriteUniversities;
    container.innerHTML = '';
    if (filteredUniversities.length === 0) {
      container.innerHTML = '<p>Inga universitet för det här landet.</p>';
    } else {
      filteredUniversities.forEach(university => {
        const card = document.createElement('div');
        card.className = 'university-card';
        
        const flagImg = document.createElement('img');
        flagImg.className = 'country-flag';
        flagImg.src = `https://countryflagsapi.com/png/${encodeURIComponent(university.country)}`;
        flagImg.alt = `${university.country} flagga`;
        card.appendChild(flagImg);
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'university-info';
        const nameElem = document.createElement('h3');
        nameElem.textContent = university.name;
        infoDiv.appendChild(nameElem);
        const yearElem = document.createElement('p');
        yearElem.textContent = `Grundat år: ${university.year_built}`;
        infoDiv.appendChild(yearElem);
        if (university.web_pages && university.web_pages.length > 0) {
          const linkElem = document.createElement('a');
          linkElem.href = university.web_pages[0];
          linkElem.textContent = "Besök webbplats på universitet";
          linkElem.target = "_blank";
          infoDiv.appendChild(linkElem);
        }
        card.appendChild(infoDiv);
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Ta bort';
        removeBtn.className = 'remove-btn';
        removeBtn.addEventListener('click', () => {
          favoriteUniversities = favoriteUniversities.filter(fav => fav.name !== university.name);
          saveFavorites();
          displayFavorites();
        });
        card.appendChild(removeBtn);
        
        container.appendChild(card);
      });
    }
    const count = filteredUniversities.length;
    countryInfo.textContent = count === 0 ? '' : `Antal universitet i det valda landet: ${count}`;
  }
}

const currentDate = document.getElementById('currentDate');
currentDate.textContent = new Date().toLocaleDateString();

// Projektbeskrivning
const projectSummary = {
  theme: "Universitetsdatabas",
  apiChoice: "Hipolabs Universities API & REST Countries API",
  reasonForApiChoice: "Hipolabs API ger en omfattande lista över universitet globalt, och REST Countries API används för att hämta landsflaggor.",
  biggestChallenges: "Hantering av API-data, korrekt visning av landsflaggor och implementering av favoritfunktionen med Local Storage."
};

console.log("Projektbeskrivning:", projectSummary);