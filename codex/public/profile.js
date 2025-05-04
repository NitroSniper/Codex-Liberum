document.addEventListener('DOMContentLoaded', () => {
    // Fetch the user profile
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
