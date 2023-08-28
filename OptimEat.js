document.addEventListener("DOMContentLoaded", function() {
    let allData = [];
    let searchTerms = [];

    document.getElementById('searchInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            let term = this.value.trim().toLowerCase();
            if (term && !searchTerms.includes(term)) {
                searchTerms.push(term);
                addIngredient(term);
                this.value = '';
                refreshDisplay();
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
                searchTerms.splice(index, 1);
            }
            ul.removeChild(li);
            refreshDisplay();
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

        data = data.filter(row => row.some(cell => cell && cell.trim()));

        const highlightSearchTerms = (cellText) => {
            searchTerms.forEach(term => {
                const regex = new RegExp(`(${term})`, 'ig');
                cellText = cellText.replace(regex, '<span class="highlighted">$1</span>');
            });
            return cellText;
        }

        data.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');

            if (rowIndex !== 0) {
                tr.style.cursor = "pointer";
                tr.classList.add('shadow-effect');
                tr.onclick = function() {
                    const recipeName = row[0];
                    const ingredients = row.slice(1, -2).join(', ');
                    const sourceName = row[row.length - 2];
                    const pageNumber = row[row.length - 1];

                    const modalContent = document.getElementById('modalContent');
                    modalContent.querySelector('h1').textContent = recipeName;

                    const ingredientsList = modalContent.querySelector('.ingredients-list');
                    ingredientsList.innerHTML = '';
                    ingredients.split(', ').forEach(ingredient => {
                        const li = document.createElement('li');
                        li.textContent = ingredient;
                        ingredientsList.appendChild(li);
                    });

                    const sourceDetails = modalContent.querySelector('.source-details');
                    sourceDetails.querySelector('p:nth-child(1)').textContent = `Source: ${sourceName}`;
                    sourceDetails.querySelector('p:nth-child(2)').textContent = `Page: ${pageNumber}`;

                    modal.style.display = "block";
                };
            }

            row.forEach(cell => {
                const td = document.createElement(rowIndex === 0 ? 'th' : 'td');
                td.innerHTML = highlightSearchTerms(cell);
                tr.appendChild(td);
            });

            table.appendChild(tr);
        });
    }

    const modal = document.getElementById("myModal");
    const span = document.getElementsByClassName("close")[0];

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

document.getElementById('downloadBtn').addEventListener('click', function() {
    html2canvas(document.getElementById('modalContent')).then(function(canvas) {
        let link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = 'liste_de_course.png';
        link.click();
    });
});

    fetchSheetData();
});
