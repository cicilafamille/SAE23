
// Sélection des éléments
const codePostalInput = document.getElementById("code-postal");
const communeSelect = document.getElementById("communeSelect");
const validationButton = document.getElementById("validationButton");

// Fonction pour effectuer la requête API des communes en utilisant le code postal
async function fetchCommunesByCodePostal(codePostal) {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${codePostal}`
    );
    const data = await response.json();
    console.table(data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la requête API:", error);
    throw error;
  }
}

// Fonction pour afficher les communes dans la liste déroulante
function displayCommunes(data) {
  communeSelect.innerHTML = "";
  // S'il y a au moins une commune retournée dans data
  if (data.length) {
    data.forEach((commune) => {
      const option = document.createElement("option");
      option.value = commune.code;
      option.textContent = commune.nom;
      communeSelect.appendChild(option);
    });
    communeSelect.style.display = "block";
    validationButton.style.display = "block";
  }
  else {
    // Supprimer un message précédent s’il existe déjà
    const existingMessage = document.getElementById("error-message");
    if (!existingMessage) {
      const message = document.createElement("p");
      message.id = "error-message";
      message.textContent = "Le code postal saisi n'est pas valide";
      message.classList.add('errorMessage');
      document.body.appendChild(message);
    }

    // Masquer les éléments inutiles
    communeSelect.style.display = "none";
    validationButton.style.display = "none";

    // Recharger la page après 3 secondes
    setTimeout(() => location.reload(), 3000);
  }
}
// Fonction pour effectuer la requête API de météo en utilisant le code de la commune sélectionnée
async function fetchMeteoByCommune(selectedCommune) {
  try {
    const response = await fetch(
      `https://api.meteo-concept.com/api/forecast/daily/0?token=a1b6b425ab71684a60d6add82ba8b1700b50f2e841326bc0d6ecff3532b68956&insee=${selectedCommune}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la requête API:", error);
    throw error;
  }
}

// Ajout de l'écouteur d'événement "input" sur le champ code postal
codePostalInput.addEventListener("input", async () => {
  const codePostal = codePostalInput.value;
  communeSelect.style.display = "none";
  validationButton.style.display = "none";

  if (/^\d{5}$/.test(codePostal)) {
    try {
      const data = await fetchCommunesByCodePostal(codePostal);
      displayCommunes(data);
    } catch (error) {
      console.error(
        "Une erreur est survenue lors de la recherche de la commune :",
        error
      );
      throw error;
    }
  }
});

// Ajout de l'écouteur d'événement "click" sur le bouton de validation
validationButton.addEventListener("click", async () => {
  const selectedCommune = communeSelect.value;
  const communeName = communeSelect.options[communeSelect.selectedIndex].text;

  if (selectedCommune) {
    try {
      const weatherData = await fetchMeteoByCommune(selectedCommune);
      createCard({ 
        forecasts: weatherData, 
        ville: communeName,
        commune: selectedCommune 
      });
    } catch (error) {
      console.error("Erreur lors de la requête API meteoConcept:", error);
    }
  }
});

