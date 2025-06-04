const phraseInput = document.getElementById("phrase-input");
const posterBtn = document.getElementById("poster-btn");
const dernieresPhrasesDiv = document.getElementById("dernieres-phrases");

let currentId = null;
let phrases = [];

// Fonction qui censure tous les mots sauf le dernier
const censurerPhrase = (phrase) => {
  const mots = phrase.trim().split(/\s+/);
  return mots.map((mot, index) => {
    if (index === mots.length - 1) return mot; // dernier mot visible
    return mot
      .split("")
      .map(char => /[a-zA-ZÀ-ÿ]/.test(char) ? "█" : char)
      .join("");
  }).join(" ");
};

// Affiche toutes les phrases en cours, censurées
const afficherPhrases = () => {
  dernieresPhrasesDiv.innerHTML = ""; // on vide avant de réafficher

  phrases.forEach((phrase, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "bloc-phrase";

    const p = document.createElement("p");
    const compteur = `${index + 1}/5 * `;
    p.textContent = compteur + censurerPhrase(phrase);
    p.className = "phrase-en-cours";

    wrapper.appendChild(p);

    // Ajouter un séparateur uniquement si ce n'est pas la dernière phrase
    if (index < phrases.length - 1) {
      const sep = document.createElement("p");
      sep.textContent = "----------------------------------------------------";
      sep.className = "separateur";
      wrapper.appendChild(sep);
    }

    dernieresPhrasesDiv.appendChild(wrapper);
  });
};

// Chargement du texte actuel depuis Firebase
const chargerPhrases = () => {
  db.ref("actuel").once("value", snapshot => {
    const data = snapshot.val();
    if (data) {
      currentId = data.id || Date.now();
      phrases = data.phrases || [];
      afficherPhrases();
    } else {
      currentId = Date.now();
      db.ref("actuel").set({ id: currentId, phrases: [] });
    }
  });
};

// Envoi d’une phrase
const soumettrePhrase = () => {
  const texte = phraseInput.value.trim();
  if (!texte) return;

  const actuelRef = db.ref("actuel");

  actuelRef.transaction((actuel) => {
    if (actuel) {
      if (!actuel.phrases) {
        actuel.phrases = [];
      }

      // Vérifie si le texte est déjà complet
      if (actuel.phrases.length >= 5) {
        // Crée un nouveau texte avec la phrase actuelle
        const newId = Date.now();
        db.ref("complets").push({
          id: actuel.id,
          phrases: actuel.phrases,
          timestamp: Date.now()
        });
        return {
          id: newId,
          phrases: [texte]
        };
      } else {
        // Ajoute la phrase au texte actuel
        actuel.phrases.push(texte);
        return actuel;
      }
    } else {
      // Initialise le texte avec la première phrase
      return {
        id: Date.now(),
        phrases: [texte]
      };
    }
  }, (error, committed, snapshot) => {
    if (error) {
      console.error("Transaction échouée : ", error);
    } else if (!committed) {
      console.log("Transaction non appliquée.");
    } else {
      const data = snapshot.val();
      if (data.phrases.length === 5) {
        alert("Merci ! Le texte est maintenant complet !");
      }
      phraseInput.value = "";
      chargerPhrases();
    }
  });
};

posterBtn.onclick = soumettrePhrase;

// Ajouter un écouteur d'événement pour détecter l'appui sur "Entrée"
phraseInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Empêche l'ajout d'une nouvelle ligne
    soumettrePhrase();
  }
});

chargerPhrases();
