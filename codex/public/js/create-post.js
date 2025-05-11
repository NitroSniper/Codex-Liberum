// document.addEventListener('DOMContentLoaded', () => {
//     const form      = document.querySelector('form');
//     const fileInput = document.getElementById('photo');
//     const urlInput  = document.getElementById('photoUrl'); 
  
//     form.addEventListener('submit', async e => {
//       e.preventDefault();
      
//       // let it empty at first
//       let photoUrl = urlInput.value || '';
//       const file = fileInput.files[0];
//       if (file) {
//         // upload uploaded file to the uploads subdomain
//         const uploadData = new FormData();
//         uploadData.append('image', file);
  
//         const respond = await fetch('https://uploads.localhost/upload', {
//           method: 'POST',
//           body: uploadData
//         });
  
//         if (!resp.ok) {
//           const err = await resp.json().catch(() => ({}));
//           return alert('Upload failed: ' + (err.error || resp.statusText));
//         }
  
//         const { url } = await resp.json();
//         photoUrl = url;

//         // put it into the hidden input in the form
//         urlInput.value = photoUrl;
//       }
  
//       // remove the file input so the main form doesn’t re-submit the blob
//       fileInput.parentNode.removeChild(fileInput);
  
//       // POST to the main server
//       form.submit();
//     });
//   });
  