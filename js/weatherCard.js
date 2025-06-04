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
async function createCard(data) {
  console.log("Création de la carte avec les données :", data);
  
  // Sélectionner les sections
  let weatherSection = document.getElementById("weatherInformation");
  let requestSection = document.getElementById("cityForm");

  // Vider la section météo
  weatherSection.innerHTML = "";
  
  // Récupérer les coordonnées si nécessaire (pour la carte)
  let coordinates = null;
  const showLatitude = document.getElementById("latitude-checkbox").checked;
  const showLongitude = document.getElementById("longitude-checkbox").checked;

  if (showLatitude || showLongitude) {
    coordinates = await fetchCommuneCoordinates(data.commune);
  }
  
  // Ajouter les nouvelles div à la section
  weatherSection.appendChild(weatherTmin);
  weatherSection.appendChild(weatherTmax);
  weatherSection.appendChild(weatherPrain);
  weatherSection.appendChild(weatherSunHours);

  //Créer une carte pour chaque jour
  data.forecasts.forEach((dayData, index) => {
    const forecast = dayData.forecast;
    
    // Créer une carte pour ce jour
    let dayCard = document.createElement("div");
    dayCard.classList.add("weather-day-card");
    
    // Titre du jour
    let dayTitle = document.createElement("div");
    dayTitle.classList.add("weather-day-title");
    
    if (index === 0) {
      dayTitle.textContent = `Aujourd'hui - ${data.ville}`;
    } else if (index === 1) {
      dayTitle.textContent = `Demain - ${data.ville}`;
    } else {
      const date = new Date();
      date.setDate(date.getDate() + index);
      dayTitle.textContent = `${date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} - ${data.ville}`;
    }
    
    dayCard.appendChild(dayTitle);

    // Informations météo de base
    let weatherTmin = document.createElement("div");
    let weatherTmax = document.createElement("div");
    let weatherPrain = document.createElement("div");
    let weatherSunHours = document.createElement("div");
    
    weatherTmin.textContent = `Température minimale : ${forecast.tmin}°C`;
    weatherTmax.textContent = `Température maximale : ${forecast.tmax}°C`;
    weatherPrain.textContent = `Probabilité de pluie : ${forecast.probarain}%`;
    weatherSunHours.textContent = `Ensoleillement journalier : ${displayHours(forecast.sun_hours)}`;

    dayCard.appendChild(weatherTmin);
    dayCard.appendChild(weatherTmax);
    dayCard.appendChild(weatherPrain);
    dayCard.appendChild(weatherSunHours);

  //Ajouter les informations optionnelles
    if (showLatitude && coordinates) {
      let latitudeDiv = document.createElement("div");
      latitudeDiv.textContent = `Latitude : ${coordinates.latitude.toFixed(4)}`;
      dayCard.appendChild(latitudeDiv);
    }

    if (showLongitude && coordinates) {
      let longitudeDiv = document.createElement("div");
      longitudeDiv.textContent = `Longitude : ${coordinates.longitude.toFixed(4)}`;
      dayCard.appendChild(longitudeDiv);
    }

    if (document.getElementById("rainfall-checkbox").checked) {
      let rainfallDiv = document.createElement("div");
      rainfallDiv.textContent = `Cumul de pluie : ${forecast.rr1 || 0} mm`;
      dayCard.appendChild(rainfallDiv);
    }

    if (document.getElementById("wind-checkbox").checked) {
      let windDiv = document.createElement("div");
      windDiv.textContent = `Vent moyen : ${forecast.wind10m || 0} km/h`;
      dayCard.appendChild(windDiv);
    }

    if (document.getElementById("wind-direction-checkbox").checked) {
      let windDirDiv = document.createElement("div");
      windDirDiv.textContent = `Direction du vent : ${forecast.dirwind10m || 0}°`;
      dayCard.appendChild(windDirDiv);
    }
  });
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
