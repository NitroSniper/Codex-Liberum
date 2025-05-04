document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    // Login form
    if (loginForm) {
        loginForm.onsubmit = async function (event) {
            event.preventDefault();

            // Captures the form data
            const formData = new FormData(event.target);

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(formData)),
                });

                // Checks if the response status is not ok, if there is an error an exception is thrown
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                // Parse JSON from the server
                const data = await response.json();
                alert(data.message);

                // Redirect based on user role
                if (data.ismoderator) {
                    window.location.href = '/moderator';
                } else {
                    window.location.href = '/dashboard';
                }

                // Error message
            } catch (error) {
                console.error('Error during login:', error);
                alert('Error during login: ' + error.message);
            }
        };
    }
});
