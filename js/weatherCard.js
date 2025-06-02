// D'abord, ajoute ces variables globales pour stocker les options choisies
let selectedDays = 1; // nombre de jours sélectionné
let selectedOptions = {
  latitude: false,
  longitude: false,
  rainfall: false,
  wind: false,
  windDirection: false
};
// Fonction pour mettre à jour les options sélectionnées (à appeler depuis tes checkboxes)
function updateSelectedOptions() {
  selectedOptions.latitude = document.getElementById("latitude-checkbox")?.checked || false;
  selectedOptions.longitude = document.getElementById("longitude-checkbox")?.checked || false;
  selectedOptions.rainfall = document.getElementById("rainfall-checkbox")?.checked || false;
  selectedOptions.wind = document.getElementById("wind-checkbox")?.checked || false;
  selectedOptions.windDirection = document.getElementById("wind-direction-checkbox")?.checked || false;
}

// Fonction pour récupérer les coordonnées de la commune
async function fetchCommuneCoordinates(insee) {
  try {
    const response = await fetch(`https://geo.api.gouv.fr/communes/${insee}`);
    const data = await response.json();
    return {
      latitude: data.centre.coordinates[1], // lat/lng inversés dans l'API
      longitude: data.centre.coordinates[0]
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des coordonnées:", error);
    return null;
  }
}
// Fonction pour créer une carte avec Leaflet
function createMap(latitude, longitude, ville, containerId) {
  // Créer la carte
  const map = L.map(containerId).setView([latitude, longitude], 12);
  
  // Ajouter les tuiles OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  // Ajouter un marqueur
  L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup(`<b>${ville}</b><br>Lat: ${latitude.toFixed(4)}<br>Lng: ${longitude.toFixed(4)}`)
    .openPopup();
}
function createCard(data) {
  console.log("Création de la carte avec les données :", data);

  // Créer de nouvelles divs
  let weatherTmin = document.createElement("div");
  let weatherTmax = document.createElement("div");
  let weatherPrain = document.createElement("div");
  let weatherSunHours = document.createElement("div");
  // Ajouter du contenu aux div
  weatherTmin.textContent = `température minimale : ${data.forecast.tmin}°C`;
  weatherTmax.textContent = `température maximale : ${data.forecast.tmax}°C`;
  weatherPrain.textContent = `Probabilité de pluie : ${data.forecast.probarain}%`;
  weatherSunHours.textContent = `Ensoleillement journalier : ${displayHours(
    data.forecast.sun_hours
  )}`;

  // Sélectionner les sections
  let weatherSection = document.getElementById("weatherInformation");
  let requestSection = document.getElementById("cityForm");
  // Ajouter les nouvelles div à la section
  weatherSection.appendChild(weatherTmin);
  weatherSection.appendChild(weatherTmax);
  weatherSection.appendChild(weatherPrain);
  weatherSection.appendChild(weatherSunHours);

  // Ajouter un bouton de retour vers le formulaire
  let reloadButton = document.createElement("div");
  reloadButton.textContent = "Nouvelle recherche";
  reloadButton.classList.add("reloadButton");
  document.body.appendChild(reloadButton);
  // Ajouter un listener sur le bouton
  reloadButton.addEventListener("click", function () {
    location.reload();
  });

  // Gérer la visibilité des sections
  requestSection.style.display = "none";
  weatherSection.style.display = "flex";
}

function displayHours(sunHours) {
  return sunHours + (sunHours > 1 ? " heures" : " heure");
}