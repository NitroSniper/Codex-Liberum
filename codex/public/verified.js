window.addEventListener('DOMContentLoaded', async () => {
    try {
    // Fetch the user profile
      const res = await fetch('/profile/get-user-profile', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
      const payload = await res.json();
      console.log('Profile payload:', payload);
  
      const { isverified } = payload;
      console.log('isverified:', isverified);
  
      if (isverified) {
        document.getElementById('createPostLink').style.display = 'list-item';
      }
    } catch (err) {
      console.warn('Could not fetch user status:', err);
    }
  });
  