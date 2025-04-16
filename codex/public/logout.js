//This was created to test the session token expiry 
//For the logoutbtn 
document.addEventListener('DOMContentLoaded', async () => {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(data.message);
                    window.location.href = '/login';
                } else {
                    alert('Logout failed.');
                }
            } catch (error) {
                console.error('Logout error:', error);
                alert('Error during logout');
            }
        });
    }

    //Checks session token
    try {
        const response = await fetch('/profile/get-user-profile', {
            credentials: 'include',
            cache: 'no-store'
        });

        console.log('Status code:', response.status);

        if (response.status === 401) {
            alert('Session expired. Redirecting to login...');
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
            return;
        }

        if (!response.ok) {
            throw new Error(`Unexpected error: ${response.status}`);
        }

        const data = await response.json();
        console.log('User profile:', data);


    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        alert('Session check failed. Redirecting...');
        window.location.href = '/login';
    }
});
