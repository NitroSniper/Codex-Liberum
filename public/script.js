
// This is for the login form and register form - can be all put in client form after checked for no clashes 

// Wait for the DOM to be fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').onsubmit = async function(event) {
        event.preventDefault();
        
        // Captures the form data
        const formData = new FormData(event.target);

        // Send data to the server - sends a POST request to the /login endpoing
        // Converts the forData to a JSON object 
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData)),
            });

            // Checks if the response status is not OK - if there is an error an exception is thrown
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Reads and parses the JSON response from the server
            const data = await response.json();
            alert(data.message); // Show message based on login result

            // Error message
        } catch (error) {
            console.error('Error during login:', error);
            alert('Error during login: ' + error.message);
        }
    };
});


// Handle Register Form Submission - similar to login form
document.getElementById('registerForm').onsubmit = async function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        alert(data.message); // Show message based on registration result
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Error during registration: ' + error.message);
    }
};
