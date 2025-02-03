// Projektbeskrivning
const projectSummary = {
  theme: "Universitetsdatabas",
  apiChoice: "Hipolabs Universities API & REST Countries API",
  reasonForApiChoice: "Hipolabs API ger en omfattande lista över universitet globalt, och REST Countries API används för att hämta landsflaggor.",
  biggestChallenges: "Hantering av API-data, korrekt visning av landsflaggor och implementering av favoritfunktionen med Local Storage."
};

console.log("Projektbeskrivning:", projectSummary);

// main.js - Huvudfil som hanterar UI och event listeners
// Denna fil hanterar användarinteraktioner och UI-uppdateringar.
//import { fetchUniversities } from './api.js';
//import { favoriteUniversities, saveFavorites, isFavorite, toggleFavorite } from './favorites.js';
//Huvudvariabler för applikationen
let universities = [];            // Lista över hämtade universitet
let currentPage = 1;             // Nuvarande sidnummer för paginering
const pageSize = 10;            // Antal universitet per sida


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// favorites.js - Hanterar favorituniversitet
// export - Denna modul (1) hanterar favorituniversitet och sparar dem i localStorage.
let favoriteUniversities = JSON.parse(localStorage.getItem('favoriteUniversities')) || [];

//Sparar favoriter i LS 
function saveFavorites() {     //export function saveFavorites()(2)
  localStorage.setItem('favoriteUniversities', JSON.stringify(favoriteUniversities));
} 

// Kontrollerar om ett universitet finns i favoriter 
function isFavorite(universityName) {    //export function isFavorite(universityName) (3)
  return favoriteUniversities.some(fav => fav.name === universityName);
}

// Lägger till eller tar bort ett universitet från favoriter med tryck på röd circle kommer grön 
function toggleFavorite(university, circleElem) {     //export function (4)
  if (isFavorite(university.name)) {
    favoriteUniversities = favoriteUniversities.filter(fav => fav.name !== university.name);
    circleElem.classList.remove('favorite');    //ta bort från local storage som favorite

  } else {
    favoriteUniversities.push(university);
    circleElem.classList.add('favorite');    //spara i local storage som favorite
  }
  saveFavorites();
}
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//1: Lyssnar på klick på sökknappen och hämtar universitet
document.getElementById('searchBtn').addEventListener('click', async () => {
 
  const input = document.getElementById('countryInput').value.trim();
 
  if (!input) {    //kolla efter countryInput finns all..vissa hella lander
    alert("Vänligen skriv in ett land eller 'all'");
    return;
  }
//  universities = await fetchUniversities(input);
 // currentPage = 1;
 // document.getElementById('resultInfo').textContent = `Antal universitet${input === 'all' ? '' : ' i ' + input}: ${universities.length}`;
 // displayPage(currentPage);
 // createPaginationControls();
//}); 1
//api.js (Hantera API-anrop) fetchUniversities(country)

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
    console.error("Fel vid hämtning av data:", error);  //Hanterar eventuella fel vid API-anrop.
  }
});
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//2: Visar universitet per sida

function displayPage(page) {
  const container = document.getElementById('universityContainer');
  container.innerHTML = '';
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = universities.slice(startIndex, endIndex);
  
  //  behöver göra kod for att ta svenska språk också när skriva sverge funkar inte men sweden funker!!!!
  
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
    
    //t*<a href="${university.web_pages ? university.web_pages[0] : '#'}" target="_blank">Besök universitetets webbplats</a>*/
    if (university.web_pages && university.web_pages.length > 0) {
      const linkElem = document.createElement('a');
      linkElem.href = university.web_pages[0];
      linkElem.textContent = "Besök webbplats";
      linkElem.target = "_blank";
      infoDiv.appendChild(linkElem);
    }
    card.appendChild(infoDiv);
    //t

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

// Skapar navigering för paginering
function createPaginationControls() {
  const paginationDiv = document.getElementById('paginationControls');
  paginationDiv.innerHTML = '';
  const totalPages = Math.ceil(universities.length / pageSize);
  
  const prevButton = document.createElement('button');
  prevButton.textContent = "Föregående";     
  //prevButton.disabled = currentPage === 1; //Behöver lösa problem med ta bort den funkar
  
  prevButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage--;
      displayPage(currentPage);
      updatePaginationActive();
    }
  });
  paginationDiv.appendChild(prevButton);
  
  const pageSpan = document.createElement('span');
  pageSpan.textContent = `Sida ${currentPage}`;
  paginationDiv.appendChild(pageSpan);
  
  const nextButton = document.createElement('button');
  nextButton.textContent = "Nästa";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayPage(currentPage);   //Visar universitet per sida (paginering)
      updatePaginationActive();
    }
  });
  paginationDiv.appendChild(nextButton);
}
// uppdate Sida 1 till sida 2 ..... pagespan
function updatePaginationActive() {
  const totalPages = Math.ceil(universities.length / pageSize);
  const pageSpan = document.querySelector('.pagination span');
  if (pageSpan) {
    pageSpan.textContent = `Sida ${currentPage}`;
  }

}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++


// Hanterar visning av favoriter
// Navigerar till favoritsektionen och visar sparade favoriter.
document.getElementById('navFav').addEventListener('click', () => {
  document.getElementById('favoritesSection').classList.add('active-section');
  document.getElementById('homeSection').classList.remove('active-section');
  displayFavorites();
});

// Rensar alla favorituniversitet
// Återställer listan, sparar och uppdaterar UI.
document.getElementById('clearFavBtn').addEventListener('click', () => {
  favoriteUniversities = [];
  saveFavorites();
  displayFavorites();
});

// Går tillbaka till startsidan från favoritsektorn
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

 // Funktion för att visa favorituniversitet baserat på valt land 
  displayUniversitiesByCountry('');

  function displayUniversitiesByCountry(selectedCountry) {
// Filtrera favorituniversiteten baserat på valt land (om inget land är valt, visa alla universitet) 
    const filteredUniversities = selectedCountry ? 
    favoriteUniversities.filter(u => u.country === selectedCountry) : 
    favoriteUniversities;

    container.innerHTML = '';
// Om inga universitet matchar, visa ett meddelande
    if (filteredUniversities.length === 0) {
      container.innerHTML = '<p>Inga universitet för det här landet.</p>';
    } else {
// Skapa och visa ett kort för varje universitet i den filtrerade listan
      filteredUniversities.forEach(university => {
        const card = document.createElement('div');   // Skapa ett div-element för att representera ett universitetskort
        card.className = 'university-card';

// Skapa och visa landets flagga genom att hämta bild från en extern API    
// det funkar inte med den aAPI for countryflags !!   
        const flagImg = document.createElement('img');
        flagImg.className = 'country-flag';
        flagImg.src = `https://countryflagsapi.com/png/${encodeURIComponent(university.country)}`;
        flagImg.alt = `${university.country} flagga`;
        card.appendChild(flagImg);

        const infoDiv = document.createElement('div'); // Skapa en div för att visa universitetsinformation
        infoDiv.className = 'university-info';
        const nameElem = document.createElement('h3');
        nameElem.textContent = university.name;
        infoDiv.appendChild(nameElem);
        const yearElem = document.createElement('p');
        yearElem.textContent = `Grundat år: ${university.year_built}`;
        infoDiv.appendChild(yearElem);

 // Om universitetet har en webbplats, skapa en länk till den
        if (university.web_pages && university.web_pages.length > 0) {
          const linkElem = document.createElement('a');
          linkElem.href = university.web_pages[0];
          linkElem.textContent = "Besök webbplats på universitet";
          linkElem.target = "_blank";
          infoDiv.appendChild(linkElem);
        }
        card.appendChild(infoDiv);

// Skapa en knapp för att ta bort universitetet från favoriterna
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Ta bort';
        removeBtn.className = 'remove-btn';
        removeBtn.addEventListener('click', () => {
        // Ta bort universitetet från favoritlistan och uppdatera visningen
          favoriteUniversities = favoriteUniversities.filter(fav => fav.name !== university.name);
          saveFavorites();     // Spara ändringarna
          displayFavorites();  // Uppdatera visningen av favoriter
        });
        card.appendChild(removeBtn);

        container.appendChild(card);   // Lägg till universitetskortet i containern för visning       

      });
    }
// Uppdatera antalet universitet som visas för det valda landet
    const count = filteredUniversities.length;
    countryInfo.textContent = count === 0 ?
     '' : 
     `Antal universitet i det valda landet: ${count}`;
  }
}

// Visar aktuellt datum i UI
const currentDate = document.getElementById('currentDate');
currentDate.textContent = new Date().toLocaleDateString();

