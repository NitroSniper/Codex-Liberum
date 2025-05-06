document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    // Register form
    // Handle Register Form Submission - similar to login form
    if (registerForm) {
        registerForm.onsubmit = async function (event) {
            event.preventDefault();
            const formData = new FormData(event.target);

            try {
                const response = await fetch('register', {
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
});
