let students = [];
let nextId = 1;

// Validates that a text field is not empty
function validateRequired(value, errorId, fieldName) {
    const errorElement = document.getElementById(errorId);
    
    // Check if the value exists and isn't empty
    if (!value || value.trim() === '') {
        errorElement.textContent = `${fieldName} is required.`;
        return false;
    }
    
    // Clear any previous error message
    errorElement.textContent = '';
    return true;
}

// Validates email format using regular expression
function validateEmail(value) {
    const errorElement = document.getElementById('err-email');
    
    // First check if email is provided
    if (!validateRequired(value, 'err-email', 'Email')) {
        return false;
    }
    
    // Email pattern: one or more characters, @, one or more characters, dot, one or more characters
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailPattern.test(value)) {
        errorElement.textContent = 'Please enter a valid email address.';
        return false;
    }
    
    // Check if email already exists
    if (students.some(student => student.email.toLowerCase() === value.toLowerCase())) {
        errorElement.textContent = 'This email is already registered.';
        return false;
    }
    
    errorElement.textContent = '';
    return true;
}

// Validates the year selection
function validateYear() {
    const errorElement = document.getElementById('err-year');
    const yearRadios = document.querySelectorAll('input[name="year"]');
    
    // Check if any radio button is selected
    const isSelected = Array.from(yearRadios).some(radio => radio.checked);
    
    if (!isSelected) {
        errorElement.textContent = 'Please select a year of study.';
        return false;
    }
    
    errorElement.textContent = '';
    return true;
}

//Validates the programme selection
function validateProgramme(value) {
    return validateRequired(value, 'err-programme', 'Programme');
}


// Validates the entire form (returns "true" only if all validations pass)
// Making use of & instead of && to see all errors instead of just the first error
function validateForm(formData) {
    let isValid = validateRequired(formData.firstName, 'err-firstName', 'First name');
    isValid = validateRequired(formData.lastName, 'err-lastName', 'Last name') & isValid;
    isValid = validateEmail(formData.email) & isValid;
    isValid = validateProgramme(formData.programme) & isValid;
    isValid = validateYear() & isValid;
    
    return isValid;
}

// Extract form data into a clean object
function getFormData() {
    const form = document.getElementById('regForm');
    const formData = new FormData(form);
    
    // Convert FormData to a regular object for easier handling
    const data = {
        id: nextId++, // Assign unique ID
        firstName: formData.get('firstName')?.trim() || '',
        lastName: formData.get('lastName')?.trim() || '',
        email: formData.get('email')?.trim() || '',
        programme: formData.get('programme') || '',
        year: formData.get('year') || '',
        interests: formData.get('interests')?.trim() || '',
        photoUrl: formData.get('photoUrl')?.trim() || ''
    };
    
    return data;
}

// Create a profile carf element for a student and adds it to the DOM
function createProfileCard(student) {

    // Create the main card container
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.setAttribute('data-student-id', student.id);
    
    // Build the card's HTML content
    card.innerHTML = `
        <div class="card-header">
            <img src="${student.photoUrl || 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&icon_names=no_photography'}" 
                 alt="Profile photo of ${student.firstName} ${student.lastName}"
                 class="profile-photo"
                 onerror="this.src='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&icon_names=no_photography'>
            <div class="card-info">
                <h3>${student.firstName} ${student.lastName}</h3>
                <p class="email">${student.email}</p>
            </div>
        </div>
        <div class="card-body">
            <div class="badges">
                <span class="badge programme">${student.programme}</span>
                <span class="badge year">Year ${student.year}</span>
            </div>
            ${student.interests ? `<p class="interests"><strong>Interests:</strong> ${student.interests}</p>` : ''}
        </div>
        <div class="card-actions">
            <button type="button" class="remove-btn" onclick="removeStudent(${student.id})" 
                    aria-label="Remove ${student.firstName} ${student.lastName}">
                Remove
            </button>
        </div>
    `;
    
    return card;
}

// Create a table row for the summary table
function createTableRow(student) {
    const row = document.createElement('tr');
    row.setAttribute('data-student-id', student.id);
    
    row.innerHTML = `
        <td>${student.firstName} ${student.lastName}</td>
        <td>${student.email}</td>
        <td>${student.programme}</td>
        <td>Year ${student.year}</td>
        <td>
            <button type="button" class="remove-btn-small" onclick="removeStudent(${student.id})"
                    aria-label="Remove ${student.firstName} ${student.lastName}">
                Remove
            </button>
        </td>
    `;
    
    return row;
}

// Adds a new student and updates the UI
function addStudent(studentData) {
    
    // Add to our data array
    students.push(studentData);
    
    // Create and add the profile card
    const card = createProfileCard(studentData);
    const cardsContainer = document.getElementById('cards');
    
    // Hide the "no profiles" message if it exists
    const noProfilesMsg = document.getElementById('noProfiles');
    if (noProfilesMsg) {
        noProfilesMsg.style.display = 'none';
    }
    
    // Add the new card at the beginning (prepend)
    cardsContainer.insertBefore(card, cardsContainer.firstChild);
    
    // Create and add the table row
    const row = createTableRow(studentData);
    const tableBody = document.querySelector('#summary tbody');
    
    // Hide the "no data" message if it exists
    const noDataMsg = document.getElementById('noTableData');
    if (noDataMsg) {
        noDataMsg.style.display = 'none';
    }
    
    // Make sure the table is visible
    document.getElementById('summary').style.display = 'table';
    
    // Add the new row at the beginning
    tableBody.insertBefore(row, tableBody.firstChild);
    
    // Update accessibility announcement
    updateLiveRegion(`Successfully added ${studentData.firstName} ${studentData.lastName} to the system.`);
}

// Removes a student by ID and updates the UI
function removeStudent(studentId) {
    // Find the student in our data array
    const studentIndex = students.findIndex(student => student.id === studentId);
    
    if (studentIndex === -1) {
        console.error('Student not found with ID:', studentId);
        return;
    }
    
    const student = students[studentIndex];
    
    // Remove from data array
    students.splice(studentIndex, 1);
    
    // Remove the profile card from DOM
    const card = document.querySelector(`[data-student-id="${studentId}"]`);
    if (card) {
        card.remove();
    }
    
    // Remove the table row from DOM
    const row = document.querySelector(`#summary tr[data-student-id="${studentId}"]`);
    if (row) {
        row.remove();
    }
    
    // Show "no data" messages if no students remain
    if (students.length === 0) {
        document.getElementById('noProfiles').style.display = 'block';
        document.getElementById('noTableData').style.display = 'block';
        document.getElementById('summary').style.display = 'none';
    }
    
    // Update accessibility announcement
    updateLiveRegion(`Removed ${student.firstName} ${student.lastName} from the system.`);
}

// Updates the live region for screen reader users
function updateLiveRegion(message) {
    const liveRegion = document.getElementById('live');
    liveRegion.textContent = message;
    
    // Clear the message after a few seconds to avoid cluttering
    setTimeout(() => {
        liveRegion.textContent = '';
    }, 3000);
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('regForm');
    
    // Handle form submission
    form.addEventListener('submit', function(event) {
        // Always prevent the default form submission
        event.preventDefault();
        
        // Get the form data
        const formData = getFormData();
        
        // Validate the form
        if (validateForm(formData)) {
            // If validation passes, add the student
            addStudent(formData);
            
            // Reset the form for the next entry
            form.reset();
            
            // Optional: scroll to the cards section to show the new card
            document.getElementById('cards').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        } else {
            // If validation fails, announce it to screen readers
            updateLiveRegion('Please fix the errors in the form before submitting.');
        }
    });
    
    // Add real-time validation on blur (when user leaves a field)    
    document.getElementById('firstName').addEventListener('blur', function() {
        validateRequired(this.value, 'err-firstName', 'First name');
    });
    
    document.getElementById('lastName').addEventListener('blur', function() {
        validateRequired(this.value, 'err-lastName', 'Last name');
    });
    
    document.getElementById('email').addEventListener('blur', function() {
        validateEmail(this.value);
    });
    
    document.getElementById('programme').addEventListener('change', function() {
        validateProgramme(this.value);
    });
    
    // Validate year selection when any radio button changes
    const yearRadios = document.querySelectorAll('input[name="year"]');
    yearRadios.forEach(radio => {
        radio.addEventListener('change', validateYear);
    });
    
    // Initialize empty state messages
    document.getElementById('summary').style.display = 'none';
    
    console.log('Student Registration System initialized successfully!');
});