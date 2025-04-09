// Uppdatera klocka och datum exakt
function updateFixedDateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });

    document.getElementById('fixed-date-time').textContent = `${date}, ${time}`;
}

// Kör funktionen direkt och uppdatera varje sekund
updateFixedDateTime();
setInterval(updateFixedDateTime, 1000);

// Spara och ladda rubriken
const titleElement = document.getElementById('title');
titleElement.textContent = localStorage.getItem('dashboardTitle') || 'John Doe Dashboard';
titleElement.addEventListener('input', () => {
    localStorage.setItem('dashboardTitle', titleElement.textContent);
});

// Hantering modal för att fixa länkar 
const addLinkButton = document.getElementById('add-link-btn');
const modal = document.getElementById('add-link-modal');
const closeModalButton = document.getElementById('close-modal-btn');
const modalLinkForm = document.getElementById('modal-link-form');
const modalLinkTitle = document.getElementById('modal-link-title');
const modalLinkUrl = document.getElementById('modal-link-url');
const linkList = document.getElementById('link-list');

// Visa modalen
addLinkButton.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Stäng modalen
closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Spara ny länk till LocalStorage via modalen
modalLinkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const linkTitle = modalLinkTitle.value;
    const linkUrl = modalLinkUrl.value;

    if (linkTitle && linkUrl) {
        const links = JSON.parse(localStorage.getItem('savedLinks')) || [];
        links.push({ title: linkTitle, url: linkUrl });
        localStorage.setItem('savedLinks', JSON.stringify(links));

        modal.style.display = 'none'; 
        modalLinkForm.reset(); 
        loadLinks(); 
    }
});

// Ladda länkar från LocalStorage
function loadLinks() {
    const links = JSON.parse(localStorage.getItem('savedLinks')) || [];
    linkList.innerHTML = ''; // Rensa befintliga länkar

    // Lägg till användarens länkar från LocalStorage
    links.forEach(link => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${link.url}" target="_blank">${link.title}</a> 
                        <button data-url="${link.url}" class="delete-btn">Ta bort</button>`;
        linkList.appendChild(li);
    });
}

// Radering av länk LocalStorage
linkList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const urlToDelete = e.target.dataset.url;
        const links = JSON.parse(localStorage.getItem('savedLinks')) || [];
        const updatedLinks = links.filter(link => link.url !== urlToDelete);
        localStorage.setItem('savedLinks', JSON.stringify(updatedLinks));
        loadLinks();
    }
});

// Initial laddning av länkar
loadLinks();

// Hämta random bakgrund med unsplash api 
const accessKey = 'fpxtxtQJKIkpM0DkuTX0SZuyEE8vCOIuNfpxo5IH7jQ'; // access key
document.getElementById('background-btn').addEventListener('click', () => {
    fetch(`https://api.unsplash.com/photos/random?client_id=${accessKey}&orientation=landscape`)
        .then((response) => response.json())
        .then((data) => {
            const imageUrl = data.urls.full; // hämta url
            document.body.style.backgroundImage = `url(${imageUrl})`; // sätter som bakgrund
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';

            // Spara bakgrundsbilden i LocalStorage
            localStorage.setItem('backgroundImage', imageUrl);
        })
        .catch((error) => console.error('Fetch error:', error));
});

// Ladda sparad bakgrundsbild från LocalStorage vid refresh
const savedBackgroundImage = localStorage.getItem('backgroundImage');
if (savedBackgroundImage) {
    document.body.style.backgroundImage = `url(${savedBackgroundImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
}

const API_KEY = "e60f8ce9f6a99cef8c3e45d7e0051f5e";
const BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";
const weatherList = document.getElementById('weather-list');
const weatherError = document.getElementById('weather-error');

// Funktion för att hämta väderdata
function fetchWeather(latitude, longitude) {
    const url = `${BASE_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Rensa gammal väderdata
            weatherList.innerHTML = '';
            weatherError.textContent = ''; 

            // Visa väder för tre dagar
            const intervals = [0, 8, 16]; // idag imorgon övermorgon
            intervals.forEach(index => {
                const weather = data.list[index];
                const date = new Date(weather.dt * 1000);
                const dayName = date.toLocaleDateString('sv-SE', { weekday: 'long' });
                const temp = Math.round(weather.main.temp);
                const description = weather.weather[0].description;
                const icon = `https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`;

                const li = document.createElement('li');
                li.innerHTML = `
                    <img src="${icon}" alt="${description}" />
                    <span>${dayName}: ${temp}°C, ${description}</span>
                `;
                weatherList.appendChild(li);
            });
        })
        .catch(error => {
            weatherError.textContent = 'Kunde inte hämta väderdata. Försök igen senare.';
            console.error('Väder API fel:', error);
        });
}

// hämtar användarens position
navigator.geolocation.getCurrentPosition((position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    fetchWeather(latitude, longitude);
}, (error) => {
    console.error('Geolocation error:', error);
    weatherError.textContent = 'Kunde inte hämta din plats.';
});

// Hantera sparning och laddning av anteckningar
const notesArea = document.getElementById('notes-area');

// Ladda sparade anteckningar från LocalStorage
notesArea.value = localStorage.getItem('savedNotes') || '';

// Spara anteckningar i LocalStorage varje gång ändringar görs
notesArea.addEventListener('input', () => {
    localStorage.setItem('savedNotes', notesArea.value);
});

const STOCK_API_KEY = "861MID8JKPKC8C6R"; 
const STOCK_API_URL = "https://www.alphavantage.co/query";
const stocksList = document.getElementById("stocks-list");
const stocksError = document.getElementById("stocks-error");

const currencyPairs = [
    { from: "EUR", to: "SEK" }, // Euro till SEK
    { from: "USD", to: "SEK" }  // Dollar till SEK
];

// Funktion för att hämta valutakurser
function fetchExchangeRates() {
    const url = `${STOCK_API_URL}?function=CURRENCY_EXCHANGE_RATE&apikey=${STOCK_API_KEY}`;

    currencyPairs.forEach(pair => {
        const currencyUrl = `${url}&from_currency=${pair.from}&to_currency=${pair.to}`;
        
        fetch(currencyUrl)
            .then(response => response.json())
            .then(data => {
                console.log(`API Response for ${pair.from}/${pair.to}:`, data);
                
                const exchangeRate = data["Realtime Currency Exchange Rate"];
                if (exchangeRate) {
                    const rate = parseFloat(exchangeRate["5. Exchange Rate"]).toFixed(2); // Avrunda till två decimaler
                    const li = document.createElement("li");
                    li.textContent = `1 ${pair.from} = ${rate} ${pair.to}`;
                    stocksList.appendChild(li);
                } else {
                    throw new Error("Fel i API-svar");
                }
            })
            .catch(error => {
                console.error("Fel vid hämtning av valutakurser:", error);
                stocksError.textContent = "Kunde inte hämta valutakurser. Försök igen senare.";
            });
    });
}


// Kör funktionen när sidan laddas
fetchExchangeRates();