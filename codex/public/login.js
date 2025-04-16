document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    // LOGIN FORM
    if (loginForm) {
        loginForm.onsubmit = async function (event) {
            event.preventDefault();
            // Captures the form data
            const formData = new FormData(event.target);

            // Send data to the server - sends a POST request to the /login endpoint
            // Converts the forData to a JSON object 
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(formData)),
                });

                // Checks if the response status is not OK - if there is an error an exception is thrown
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                // Reads and parses the JSON response from the server
                const data = await response.json();
                alert(data.message);

                window.location.href = '/dashboard';

            // Error message
            } catch (error) {
                console.error('Error during login:', error);
                alert('Error during login: ' + error.message);
            }
        };
    }
});


