  let allData = [];
let searchTerms = [];  // Ceci est le tableau manquant

document.getElementById('searchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        let term = this.value.trim().toLowerCase();
        if (term && !searchTerms.includes(term)) {
            searchTerms.push(term);
            addIngredient(term);
            this.value = '';
            refreshDisplay();  // Rafraîchir l'affichage après l'ajout d'un ingrédient
        }
    }
});

document.getElementById('searchInput').addEventListener('input', function() {
    refreshDisplay();
});

function addIngredient(ingredient) {
    let ul = document.getElementById('savedIngredients');
    let li = document.createElement('li');
    li.textContent = ingredient;

    let removeBtn = document.createElement('span');
    removeBtn.textContent = 'x';
    removeBtn.addEventListener('click', function() {
        let index = searchTerms.indexOf(ingredient);
        if (index > -1) {
            searchTerms.splice(index, 1);  // Supprimer l'ingrédient du tableau de termes
        }
        ul.removeChild(li);
        refreshDisplay();  // Rafraîchir l'affichage après la suppression d'un ingrédient
    });

    li.appendChild(removeBtn);
    ul.appendChild(li);
}

function refreshDisplay() {
    let filteredData = [allData[0]].concat(allData.slice(1).filter(row => {
        return searchTerms.every(term => 
            row.some(cell => cell.toLowerCase().includes(term))
        );
    }));
    displaySheetData(filteredData);
}

function fetchSheetData() {
    const sheetId = '1bNnlMbWRiIg1FquOSsb_zQf_5sHz3-PC9z12rUManXQ';
    const apiKey = 'AIzaSyBDzRAtHIvBfMd3wOEDR09UHbsQeEFJrqg';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet2?key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            allData = data.values;
            displaySheetData(allData);
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des données :", error);
        });
}

function displaySheetData(data) {
    const table = document.getElementById('sheetTable');
    table.innerHTML = '';

    data = data.filter(row => row.some(cell => cell && cell.trim())); // Filtrer les lignes vides

    const highlightSearchTerms = (cellText) => {
        searchTerms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'ig');
            cellText = cellText.replace(regex, '<span class="highlighted">$1</span>');
        });
        return cellText;
    }

    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement(rowIndex === 0 ? 'th' : 'td');
            td.innerHTML = highlightSearchTerms(cell); // Utilisez innerHTML ici pour inclure les balises HTML
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
}
        fetchSheetData();