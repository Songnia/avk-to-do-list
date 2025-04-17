// Éléments du DOM
const taskForm = document.getElementById('task-form');
const newTaskInput = document.getElementById('new-task-input');
const taskList = document.getElementById('task-list');
const taskItemTemplate = document.getElementById('task-item-template');

// Charger les tâches au démarrage
document.addEventListener('DOMContentLoaded', loadTasks);

// Écouteur pour l'ajout de tâche
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = newTaskInput.value.trim();
    if (taskText === '') return; // Ignorer les tâches vides

    addTaskToDOM(taskText, false);
    saveTasksToLocalStorage(); // Sauvegarder après ajout
    newTaskInput.value = '';
    newTaskInput.focus();
});

// Fonction pour charger les tâches depuis le localStorage
function loadTasks() {
    const tasks = getTasksFromLocalStorage();
    tasks.forEach(task => addTaskToDOM(task.text, task.completed));
}

// Fonction pour récupérer les tâches du localStorage
function getTasksFromLocalStorage() {
    return JSON.parse(localStorage.getItem('tasks') || '[]');
}

// Fonction pour sauvegarder TOUTES les tâches actuelles dans le localStorage
function saveTasksToLocalStorage() {
    const tasks = [];
    taskList.querySelectorAll('.task-item').forEach(item => {
        const textElement = item.querySelector('.task-text');
        // Vérifie si l'élément texte existe (pour éviter les erreurs pendant l'édition)
        if (textElement) {
          const text = textElement.textContent;
          const completed = item.classList.contains('completed');
          tasks.push({ text, completed });
        }
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Fonction pour ajouter une tâche au DOM
function addTaskToDOM(taskText, completed = false) {
    const templateContent = taskItemTemplate.content.cloneNode(true);
    const taskItem = templateContent.querySelector('.task-item');
    const taskSpan = templateContent.querySelector('.task-text');
    const completeBtn = templateContent.querySelector('.complete-btn');
    const editBtn = templateContent.querySelector('.edit-btn');
    const deleteBtn = templateContent.querySelector('.delete-btn');

    taskSpan.textContent = taskText;

    if (completed) {
        taskItem.classList.add('completed');
        completeBtn.textContent = 'Annuler';
        completeBtn.setAttribute('aria-label', 'Marquer comme non terminée');
    } else {
        completeBtn.textContent = 'Terminé';
        completeBtn.setAttribute('aria-label', 'Marquer comme terminée');
    }

    completeBtn.addEventListener('click', () => toggleCompleteTask(taskItem, completeBtn));
    editBtn.addEventListener('click', () => editTask(taskItem, taskSpan));
    deleteBtn.addEventListener('click', () => deleteTask(taskItem));

    taskList.appendChild(taskItem); // Ajouter l'élément complet
}

// Fonction pour marquer/démarquer une tâche comme complète
function toggleCompleteTask(taskItem, completeBtn) {
    taskItem.classList.toggle('completed');
    if (taskItem.classList.contains('completed')) {
        completeBtn.textContent = 'Annuler';
        completeBtn.setAttribute('aria-label', 'Marquer comme non terminée');
    } else {
        completeBtn.textContent = 'Terminé';
        completeBtn.setAttribute('aria-label', 'Marquer comme terminée');
    }
    saveTasksToLocalStorage();
}

// Fonction pour supprimer une tâche
function deleteTask(taskItem) {
    taskItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    taskItem.style.opacity = '0';
    taskItem.style.transform = 'translateX(-20px)';
    setTimeout(() => {
        taskItem.remove();
        saveTasksToLocalStorage();
    }, 300);
}

// Fonction pour passer en mode édition
function editTask(taskItem, taskSpan) {
    if (taskItem.classList.contains('editing')) return;

    taskItem.classList.add('editing');
    const currentText = taskSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'edit-input';
    input.setAttribute('aria-label', 'Modifier le texte de la tâche');

    // Remplace le span par l'input
    taskItem.insertBefore(input, taskSpan);
    taskSpan.style.display = 'none'; // Cache le texte original
    input.select(); // Sélectionne le texte pour édition facile

    // Fonction interne pour finaliser l'édition
    const finishEdit = () => {
        const newText = input.value.trim();
        taskSpan.textContent = (newText === '') ? currentText : newText; // Rétablit si vide, sinon met à jour
        taskSpan.style.display = ''; // Réaffiche le span
        input.remove(); // Supprime l'input
        taskItem.classList.remove('editing');
        saveTasksToLocalStorage(); // Sauvegarde après modification
    };

    input.addEventListener('blur', finishEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            input.blur(); // Simule le blur pour déclencher finishEdit
        }
    });
}

// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js') // Chemin relatif à la racine
            .then(registration => {
                console.log('Service Worker enregistré avec succès. Scope:', registration.scope);
            })
            .catch(error => {
                console.error('Échec de l\'enregistrement du Service Worker:', error);
            });
    });
}
