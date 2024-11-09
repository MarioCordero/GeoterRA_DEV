// Function to toggle between "Editar" and "Guardar"
function toggleEdit() {
    const editButton = document.getElementById('edit-btn');

    let initialuserName = localStorage.getItem('initialuserName');
    let initialuserEmail = localStorage.getItem('initialEmail');
    let initialuserPhone = localStorage.getItem('initialPhone');
    
    // Store initial values for comparison later
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userPhone = document.getElementById('user-phone');


    // If the button is in "Editar" mode, make fields editable
    if (editButton.textContent === 'Editar') {
        editButton.textContent = 'Guardar';
        editButton.classList.add('edit-mode');  // Button turns green
        
        // Enable editing of fields
        userName.contentEditable = true;
        userEmail.contentEditable = true;
        userPhone.contentEditable = true;

        // Add event listener to validate when the user types
        userName.addEventListener('input', enableSaveButton);
        userEmail.addEventListener('input', enableSaveButton);
        userPhone.addEventListener('input', enableSaveButton);
    } else {
        // If the button is "Guardar", check for changes
        const currentName = userName.textContent;
        const currentEmail = userEmail.textContent;
        const currentPhone = userPhone.textContent;

        // If there are no changes, disable the save button and don't show the modal
        if (currentName === initialuserName && currentEmail === initialuserEmail && currentPhone === initialuserPhone) {
            // No changes, don't show the modal
            alert('No hay cambios para guardar.');
            editButton.textContent = 'Editar';
            editButton.classList.remove('edit-mode');  // Reset button to original state
            userName.contentEditable = false;
            userEmail.contentEditable = false;
            userPhone.contentEditable = false;
            return;
        }else{

        }

        // If the button is "Guardar", ask for password confirmation
        editButton.textContent = 'Editar';
        editButton.classList.remove('edit-mode');  // Reset button to original state
        
        // Show confirmation modal
        document.getElementById('confirmation-modal').style.display = 'flex';
        
    }
}

// Function to enable/disable the "Guardar" button based on form completion
function enableSaveButton() {
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userPhone = document.getElementById('user-phone');
    const saveButton = document.getElementById('edit-btn');

    // Reset any previous highlighting
    userName.classList.remove('empty-field');
    userEmail.classList.remove('empty-field');
    userPhone.classList.remove('empty-field');

    let fieldsAreEmpty = false;

    // Check which fields are empty and highlight them
    if (!userName.textContent) {
        userName.classList.add('empty-field');
        fieldsAreEmpty = true;
    }
    if (!userEmail.textContent) {
        userEmail.classList.add('empty-field');
        fieldsAreEmpty = true;
    }
    if (!userPhone.textContent) {
        userPhone.classList.add('empty-field');
        fieldsAreEmpty = true;
    }

    // Check if all fields are filled
    if (userName.textContent && userEmail.textContent && userPhone.textContent) {
        saveButton.disabled = false; // Enable save button if all fields are filled
    } else {
        saveButton.disabled = true; // Disable save button if any field is empty
    }

}

// Function to close the modal
function closeModal() {
    document.getElementById('confirmation-modal').style.display = 'none';
}

// Function to handle the password confirmation
function confirmEdit() {
    const password = document.getElementById('user-password').value;
    
    if (password === 'correctPassword') {  // Replace with actual password validation logic
        // Save changes (this can be handled by updating the server or local storage)
        alert('Datos guardados correctamente');
        
        // Disable editing again and hide the modal
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userPhone = document.getElementById('user-phone');
        
        userName.contentEditable = false;
        userEmail.contentEditable = false;
        userPhone.contentEditable = false;
        
        closeModal();
    } else {
        alert('Contraseña incorrecta');
    }
}