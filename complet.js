const container = document.getElementById("textes-complets");

db.ref("complets").on("value", snapshot => {
  container.innerHTML = "";
  const data = snapshot.val();
  if (data) {
    Object.values(data)
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach(entry => {
        const bloc = document.createElement("div");
        bloc.className = "bloc-texte";

        // Ajout des phrases (sans numérotation)
        entry.phrases.forEach(phrase => {
          const p = document.createElement("p");
          p.textContent = phrase;
          bloc.appendChild(p);
        });

        // Ajout de la date au format JJ/MM/AA à HH:MM
        if (entry.timestamp) {
          const date = new Date(entry.timestamp);
          const jj = String(date.getDate()).padStart(2, "0");
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const aa = String(date.getFullYear()).slice(-2);
          const hh = String(date.getHours()).padStart(2, "0");
          const min = String(date.getMinutes()).padStart(2, "0");

          const timeP = document.createElement("p");
          timeP.className = "date-texte";
          timeP.textContent = `le ${jj}/${mm}/${aa} à ${hh}:${min}`;
          bloc.appendChild(timeP);
        }

        container.appendChild(bloc);
      });
  }
});

document.getElementById("generate-pdf-btn").addEventListener("click", () => {
  const pdfUrl = "pdf/edition.pdf";

  const printWindow = window.open(pdfUrl, "_blank");
  if (printWindow) {
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
    };
  } else {
    alert("Le navigateur a bloqué la fenêtre. Autorisez les pop-ups.");
  }
});
