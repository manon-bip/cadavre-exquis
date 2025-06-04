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

  phrases.push(texte);

  if (phrases.length >= 5) {
    db.ref("complets").push({
      id: currentId,
      phrases: phrases,
      timestamp: Date.now()
    });
    db.ref("actuel").set({
      id: Date.now(),
      phrases: []
    });
    alert("Merci ! Le texte est maintenant complet !");
  } else {
    db.ref("actuel/phrases").set(phrases);
  }

  phraseInput.value = "";
  chargerPhrases();
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
