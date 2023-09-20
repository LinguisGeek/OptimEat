firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
        // L'utilisateur n'est pas connecté, redirigez-le vers la page de connexion
        window.location.href = "login.html";
    }
});
const db = firebase.firestore();
/*ALL FUNCTIONS HERE*/
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


    function highlightSearchTerms(cellText) {
    searchTerms.forEach(term => {
        const regex = new RegExp(`(${term})`, 'ig');
        cellText = cellText.replace(regex, '<span class="highlighted">$1</span>');
    });
    return cellText;
}

function displaySheetData(data) {
    const table = document.getElementById('sheetTable');
    table.innerHTML = '';

    data = data.filter(row => row.some(cell => cell && cell.trim()));

    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');

        if (rowIndex !== 0) {
            tr.style.cursor = "pointer";
            tr.classList.add('shadow-effect');
            tr.onclick = function() {
                const recipeName = row[0];
                const ingredients = row[1];
                const sourceName = row[2];
                const pageNumber = row[3];

                const modalContent = document.getElementById('modalContent');
                modalContent.querySelector('h1').textContent = recipeName;

                const modalOverlay = document.getElementById("modalOverlay");



// Lors de l'affichage de la modale :
rowModal.style.display = "block";
modalOverlay.style.display = "block";

// Lors de la fermeture de la modale :
rowModal.style.display = "none";
modalOverlay.style.display = "none";

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

function refreshDisplay() {
        let filteredData = allData.filter(item => {
            return searchTerms.every(term => 
                Object.values(item).some(cell => cell.toLowerCase().includes(term.toLowerCase()))
            );
        });
        displaySheetData(filteredData);
    }

   function fetchFirestoreData() {
    const db = firebase.firestore();
    db.collection("recipes").get().then((querySnapshot) => {
        allData = [];
        querySnapshot.forEach((doc) => {
            let docData = doc.data();
            docData.id = doc.id;  // Ajoutez cette ligne pour stocker l'ID du document avec les données
            console.log("Doc ID:", doc.id);  // Affichez l'ID du document dans la console
            allData.push(docData);
        });
        displaySheetData(allData);
    })
    .catch(error => {
        console.error("Erreur lors de la récupération des données :", error);
    });
}

    function displaySheetData(data) {
    const table = document.getElementById('sheetTable');
    table.innerHTML = '';

    // Création de l'en-tête du tableau
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ["Recette", "Ingrédients", "Source", "Page"].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

const tbody = document.createElement('tbody');
data.forEach(item => {
    const tr = document.createElement('tr');
    ["Recette", "Ingrédients", "Source", "Page"].forEach(key => {
        const td = document.createElement('td');
        if (key === "Ingrédients") {
            // Mettre en surbrillance les ingrédients correspondants
            let cellContent = item[key];
            searchTerms.forEach(term => {
                const regex = new RegExp(`(${term})`, 'ig');
                cellContent = cellContent.replace(regex, '<span class="highlighted-ingredient">$1</span>');
            });
            td.innerHTML = cellContent;
        } else {
            td.textContent = item[key];
        }
        tr.appendChild(td);
    });

    // Ajout du bouton de suppression pour chaque ligne
    const deleteTd = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'X';
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('data-id', item.id); // Assurez-vous que chaque document dans Firestore a un champ 'id'
    deleteTd.appendChild(deleteBtn);
    tr.appendChild(deleteTd);

    tbody.appendChild(tr);
});
table.appendChild(tbody);

}

 function handleUserInput() {
        var userInput = document.querySelector('#searchInput').value.trim();

        if (userInput) { 
            var ingredients = userInput.split(/[\s,]+/).filter(Boolean); 

            ingredients.forEach(function(ingredient) {
                ingredient = ingredient.toLowerCase().trim();
                if (!searchTerms.includes(ingredient)) {
                    searchTerms.push(ingredient);
                    addIngredient(ingredient);
                    refreshDisplay();
                }
            });
            document.querySelector('#searchInput').value = '';  // Clear input after processing

        } else {
            alert("Veuillez entrer au moins un ingrédient.");
        }
    }

function ajouterRecette(recette) {
  db.collection("recipes").add(recette)
    .then((docRef) => {
      console.log("Document écrit avec l'ID: ", docRef.id);
      // Supprimez l'appel à afficherRecetteDansTableau ici
    })
    .catch((error) => {
      console.error("Erreur d'ajout de document: ", error);
    });
}

db.collection("recipes").onSnapshot((snapshot) => { 
    snapshot.docChanges().forEach((change) => {
        console.log("Modification détectée:", change.type, "Doc ID:", change.doc.id);
        
        if (change.type === "added") {
            afficherRecetteDansTableau(change.doc.data(), change.doc.id); 
            // Mettez à jour allData pour inclure le nouvel élément
            allData.push(change.doc.data());
        } else if (change.type === "removed") {
            // Trouvez la ligne correspondant à l'ID du document supprimé et supprimez-la
            const elementToRemove = document.querySelector(`tr[data-id="${change.doc.id}"]`);
            if (elementToRemove) {
                elementToRemove.remove();
                // Mettez à jour allData pour retirer l'élément supprimé
                allData = allData.filter(item => item.id !== change.doc.id);
            } else {
                console.log("Élément non trouvé pour l'ID:", change.doc.id);
            }
        }
        // Vous pouvez également ajouter un traitement pour "modified" si nécessaire
    });
});




function afficherRecetteDansTableau(recette, docId) {
    // Créez une nouvelle ligne pour la recette
    const tr = document.createElement('tr');

    console.log("Setting docId for tr:", docId);
    tr.setAttribute('data-id', docId);
    console.log("After setting data-id:", tr.getAttribute('data-id'));

    // Remplissez la ligne avec les données de la recette
    ["Recette", "Ingrédients", "Source", "Page"].forEach(key => {
        const td = document.createElement('td');
        td.textContent = recette[key];
        tr.appendChild(td);
    });

    // Stockez l'ID du document dans un attribut data-id de la ligne
    console.log("Setting docId for tr:", docId);   
    tr.setAttribute('data-id', docId);

    // Ajoutez cette ligne au tableau
    const table = document.getElementById('sheetTable');
    table.appendChild(tr);
}



function supprimerRecette(docId, trElement) {
    db.collection('recipes').doc(docId).delete().then(() => {
        console.log("Recette supprimée avec succès !");
        // Supprimez la ligne du tableau
        trElement.remove(); 
    }).catch((error) => {
        console.error("Erreur lors de la suppression de la recette: ", error);
    });
}

 let searchTerms = [];
 let allData = [];
document.addEventListener("DOMContentLoaded", function() {
    //This is triggered every time the DOM of the page is modified
    
   

    document.getElementById('searchInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });

    document.getElementById('searchInput').addEventListener('input', function() {
        refreshDisplay();
    });




document.getElementById('logoutButton').addEventListener('click', function() {
    firebase.auth().signOut().then(function() {
        // Déconnexion réussie.
        // Redirigez l'utilisateur vers la page de connexion ou effectuez d'autres actions appropriées.
        window.location.href = "login.html";
    }).catch(function(error) {
        // Une erreur s'est produite lors de la déconnexion.
        console.error('Erreur lors de la déconnexion:', error);
    });
});


    // Récupération de la modale et du bouton de fermeture
const rowModal = document.getElementById("rowModal");
const closeBtn = document.getElementsByClassName("close")[0];

// Affichage de la modale lorsque vous cliquez sur une ligne
document.getElementById('sheetTable').addEventListener('click', function(event) {
    // Si l'élément cliqué est le bouton "X" ou se trouve dans la colonne du bouton "X", ne rien faire
    if (event.target.classList.contains('delete-btn') || event.target.closest('td').classList.contains('delete-column')) {
        return;
    }

    const tr = event.target.closest('tr');
    if (tr) {
        const rowData = document.getElementById('rowData');
        rowData.innerHTML = ''; // Vider le contenu précédent
        const titles = ["Recette:", "Ingrédients:", "Source:", "Page:"];
        Array.from(tr.children).forEach((td, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${titles[index]}</strong> ${td.textContent}`;
            rowData.appendChild(li);
        });
        rowModal.style.display = "block";
    }
});


// Fermeture de la modale lorsque vous cliquez sur le bouton "x"
closeBtn.onclick = function() {
    rowModal.style.display = "none";
}

// Fermeture de la modale lorsque vous cliquez en dehors de celle-ci
window.onclick = function(event) {
    if (event.target == rowModal) {
        rowModal.style.display = "none";
    }
}


    document.querySelector('#searchButton').addEventListener('click', function() {
        handleUserInput();
    });

   

// Obtenir la modale de la recette
var recipeModal = document.getElementById('recipeModalContainer');

// Obtenir le bouton qui ouvre la modale
var openRecipeModalBtn = document.getElementById('openRecipeModalBtn');

// Obtenir le bouton <span> qui ferme la modale
var closeRecipeModalBtn = document.getElementById('closeRecipeModalBtn');

// Ouvrir la modale
openRecipeModalBtn.onclick = function() {
    recipeModal.style.display = "block";
}

// Fermer la modale
closeRecipeModalBtn.onclick = function() {
    recipeModal.style.display = "none";
}

// Fermer la modale si l'utilisateur clique en dehors de celle-ci
window.onclick = function(event) {
    if (event.target == recipeModal) {
        recipeModal.style.display = "none";
    }
}




    // Écouteur d'événements pour le formulaire de recette
    var recipeFormElement = document.getElementById('recipeForm');
    if (recipeFormElement)
    {
       console.log('formulaire: ', recipeFormElement);
       recipeFormElement.addEventListener('submit', function(event) {
       event.preventDefault(); // Empêche le rechargement de la page

       console.log("Le formulaire est soumis"); // Votre nouveau code


        // Récupération des valeurs du formulaire
        const recipeName = document.getElementById('recipeName').value;
        const ingredients = document.getElementById('ingredients').value;
        const source = document.getElementById('source').value;
        const page = document.getElementById('page').value;

        // Création de l'objet recette
        const newRecipe = {
            Recette: recipeName,
            Ingrédients: ingredients,
            Source: source,
            Page: page
        };

        // Ajout de la nouvelle recette à Firestore
        ajouterRecette(newRecipe);

        // Fermeture de la modale et réinitialisation du formulaire
        document.getElementById('recipeModalContainer').style.display = "none";
        event.target.reset();
    });

    } //End of if (getElementById('recipeForm'))

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
        const btn = e.target;
        const docId = btn.getAttribute('data-id');
        
        // Affichez le modal
        const deleteModal = document.getElementById('deleteConfirmationModal');
        deleteModal.style.display = "block";

        // Écoutez l'événement de confirmation
        document.getElementById('confirmDelete').onclick = function() {
            if (docId) {
                supprimerRecette(docId, e.target);
            } else {
                console.error("L'ID du document est manquant ou invalide depuis le bouton.");
            }
            
            // Fermez le modal
            deleteModal.style.display = "none";
        };

        // Écoutez l'événement d'annulation
        document.getElementById('cancelDelete').onclick = function() {
            deleteModal.style.display = "none";
        };

        // Écoutez l'événement de fermeture du modal
        document.getElementById('deleteModalClose').onclick = function() {
            deleteModal.style.display = "none";
        };
    }
});





var userAgent = navigator.userAgent || navigator.vendor || window.opera;

if (/windows phone/i.test(userAgent)) {
    // C'est un Windows Phone
} else if (/android/i.test(userAgent)) {
    // C'est un Android
} else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    // C'est un iOS (iPhone, iPad, iPod)
} else {
    // C'est probablement un ordinateur
}
if (/android/i.test(userAgent)) {
    document.body.classList.add('android-device');
} else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    document.body.classList.add('ios-device');
} else {
    document.body.classList.add('desktop-device');
}

    fetchFirestoreData();
}); //End of DOMCOntentLoaded
