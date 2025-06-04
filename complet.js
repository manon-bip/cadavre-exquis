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

        // Ajout de la date si présente
        if (entry.timestamp) {
          const date = new Date(entry.timestamp);
          const dateStr = date.toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const timeStr = date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const timeP = document.createElement("p");
          timeP.className = "date-texte";
          timeP.textContent = `Le ${dateStr} à ${timeStr}`;
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