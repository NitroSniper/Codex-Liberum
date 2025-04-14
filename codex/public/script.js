document.addEventListener('DOMContentLoaded', function () {

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

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

    // REGISTER FORM
    // Handle Register Form Submission - similar to login form
    if (registerForm) {
        registerForm.onsubmit = async function (event) {
            event.preventDefault();
            const formData = new FormData(event.target);

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(formData)),
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                alert(data.message);

                // Optional: Redirect after registration
                // window.location.href = '/login';

            } catch (error) {
                console.error('Error during registration:', error);
                alert('Error during registration: ' + error.message);
            }
        };
    }

    //FETCH USER PROFILE
    async function fetchUserProfile() {
        const response = await fetch('/profile/get-user-profile');
    
        if (response.status === 401) {
            // Session expired or not logged in
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';  // Redirect to login page if session is expired
            }
        } else {
            const data = await response.json();
            console.log(data);
        }
    }
    
    // Call this function after page load or when needed
    fetchUserProfile();
    setInterval(fetchUserProfile, 30000); // Check every 30 seconds
    
});