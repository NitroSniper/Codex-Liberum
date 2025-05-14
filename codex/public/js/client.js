"use strict";
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const fetchDefaultHeaders = {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json',
}

const welcomeDialog = document.getElementById('welcomeDialog');
const registerDialog = document.getElementById('registerDialog');
const postsContainer = document.getElementById("posts");
const loginForm = document.getElementById('loginForm');
const logoutForm = document.getElementById('logoutForm');
const registerForm = document.getElementById('registerForm');
const moderatorUserList = document.getElementById('userListContainer');
const setup2faContainer = document.getElementById('setup2faContainer');
const verify2faContainer = document.getElementById('verify2faContainer');
const setupBlock = document.getElementById('setup2faFormBlock');
const verifyBlock = document.getElementById('verify2faFormBlock');
const verifyButton = document.getElementById('verifyButton');
const logoutLink = document.getElementById('logoutLink');
const moderatorPostList = document.getElementById('postListContainer');
const blog = document.getElementById('blog');



function ignore_form(func) {
    return function (event) {
        event.preventDefault()
        func(new FormData(event.target));
        return false;
    }
}

async function populate_posts(formData) {
    const name = formData.get("query");
    await fetch_thumbnails(name, 4)
}
const _ = (html) => DOMPurify.sanitize(html);

async function fetch_thumbnails(name, amount) {
    const response = await fetch('/post/get-posts?' + new URLSearchParams({
        name: name,
        amount: amount,
    }).toString(), {
        headers: fetchDefaultHeaders
    })
    const posts = await response.json();
    postsContainer.innerHTML = _(window.render.indexPost({ posts: posts }));
}
async function fetch_blog() {
    const response = await fetch('/post/get-posts?' + new URLSearchParams({
        name: document.title,
        amount: 1,
    }).toString(), {
        headers: fetchDefaultHeaders
    })
    const post = await response.json();
    blog.innerHTML = _(post[0].content);
}

async function fetch_thumbnails(name, amount) {
    const response = await fetch('/post/get-posts?' + new URLSearchParams({
        name: name,
        amount: amount,
    }).toString(), {
        headers: fetchDefaultHeaders
    })
    const posts = await response.json();
    postsContainer.innerHTML = _(window.render.indexPost({ posts: posts }));
}


async function login(formData) {
    try {
        const response = await fetch('login', {
            method: 'POST',
            headers: fetchDefaultHeaders,
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        // Checks if the response status is not ok, if there is an error an exemption is thrown
        const data = await response.json();
        if (data.redirectTo) { // If the server included a redirectTo, follow it
            window.location.href = data.redirectTo;
            return;
        }
        if (response.ok) {
            welcomeDialog.showModal();
            waitForModalClose(welcomeDialog).then(() => {
                window.location.href = '/'; // If no redirct - go to index page
            });
        } else {
            loginForm.innerHTML = _(window.render.invalidLoginForm({ reason: data.message }));
        }
        loginForm.innerHTML = _(window.render.invalidLoginForm({ reason: data.message }));
    } catch (error) {
        loginForm.innerHTML = _(window.render.invalidLoginForm({ reason: "Login request has failed." }));
    }
}

async function register(formData) {
    try {
        const response = await fetch('register', {
            method: 'POST',
            headers: fetchDefaultHeaders,
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        // Checks if the response status is not ok, if there is an error an exception is thrown
        const data = await response.json();
        if (response.ok) {
            registerDialog.showModal()
            waitForModalClose(registerDialog).then(() => {
                window.location.href = '/';
            })
        } else {
            registerForm.innerHTML = _(window.render.invalidRegisterForm({ reason: data.message }));
        }
    } catch (error) {
        // ASSUMING REQUEST FAILED
        registerForm.innerHTML = _(window.render.invalidRegisterForm({ reason: "register request has failed." }));
    }
}

async function setup2FAForm(formData) {
    try {
        const response = await fetch('/auth/setup-2fa', {
            method: 'POST',
            headers: fetchDefaultHeaders,
            body: JSON.stringify({ token: formData.get('token') }),
        });

        // Follow redirect on success
        if (!response.url.endsWith('/auth/setup-2fa')) {
            window.location.href = response.url;
            return;
        }

        // On error, extract server-rendered error message
        const html = await response.text();
        const documentFragment = new DOMParser().parseFromString(html, 'text/html'); // takes an HTML string and produces a document object
        const errorElementText = documentFragment // error message 
            .querySelector('#setup2faFormBlock p')
            ?.textContent
            .trim() || 'Invalid code';

        setup2faFormBlock.innerHTML = _(window.render.invalidSetup2faForm({ csrf: csrfToken, secret: window.qrSecret, qrImage: window.qrImage, reason: errorElementText }));

    } catch (error) {
        // if request failed
        setup2faFormBlock.innerHTML = _(window.render.invalidSetup2faForm({ csrf: csrfToken, secret: window.qrSecret, qrImage: window.qrImage, reason: error.message || 'Request failed.' }));
        alert(error.message || 'Request failed.');
    }
}


// Verify-2FA handler
async function verify2FAForm(formData) {
    try {
        const response = await fetch('/auth/verify-2fa', {
            method: 'POST',
            headers: fetchDefaultHeaders,
            body: JSON.stringify({ token: formData.get('token') }),
        });

        // Follow redirect on success
        if (!response.url.endsWith('/auth/verify-2fa')) {
            window.location.href = response.url;
            return;
        }

        // On error, extract server-rendered error message
        const html = await response.text();
        const documentFragment = new DOMParser().parseFromString(html, 'text/html');
        const errorElementText = documentFragment
            .querySelector('#verify2faFormBlock p')
            ?.textContent
            .trim() || 'Invalid code';

        verify2faFormBlock.innerHTML = _(window.render.invalidVerify2faForm({ csrf: csrfToken, reason: errorElementText }));
    } catch (error) {
        // if request failed
        verify2faFormBlock.innerHTML = _(window.render.invalidVerify2faForm({ csrf: csrfToken, reason: error.message || 'Request failed.' }));
        alert(error.message || 'Request failed.');
    }
}

// Wire up the form submits
if (setupBlock) {
    setupBlock.addEventListener('submit', event => {
        if (event.target.id === 'setup2faForm') {
            event.preventDefault();
            setup2FAForm(new FormData(event.target));
        }
    });
}

if (verifyBlock) {
    verifyBlock.addEventListener('submit', event => {
        if (event.target.id === 'verify2faForm') {
            event.preventDefault();
            verify2FAForm(new FormData(event.target));
        }
    });
}

// Verify function
async function fetchUnverifiedUsers() {
    const res = await fetch('/moderator/unverified-users', {
        headers: fetchDefaultHeaders,
    });
    const users = await res.json();
    moderatorUserList.innerHTML = _(window.render.moderatorUserList({ unverifiedUsers: users, length: users.length }));
}

async function verifyUsers(formData) {
    const userIds = Array.from(formData.keys());
    if (userIds.length === 0) {
        alert('Please select at least one user to verify.');
        return;
    }
    try {
        const res = await fetch('/moderator/verify-users', {
            method: 'POST',
            headers: fetchDefaultHeaders,
            body: JSON.stringify({ userIds })
        });
        if (res.ok) {
            alert('Users verified successfully!');
            location.reload();
        } else {
            const data = await res.json();
            alert('Failed: ' + data.message);
        }
    } catch (err) {
        alert('Server error.');
    }
}

function waitForModalClose(modal) {
    return new Promise(resolve => {
        modal.addEventListener('close', resolve, { once: true });
    });
}

// conditional actions
function logout() {
    fetch('/auth/logout', {
        method: 'POST',
        headers: fetchDefaultHeaders,
    }).then(z => {
        window.location.reload();
    });
}

// for the create post
function post(formData) {
    console.log(Object.fromEntries(formData));
    const imageHeader = { ...fetchDefaultHeaders };
    delete imageHeader['Content-Type'];
    fetch('/post/create-post', {
        method: 'POST',
        headers: imageHeader,
        body: formData,
    }).then((res) => {
        if (res.ok) {
            alert("Successfully created post");
            window.location.href = '/';
        } else {
            alert("Failed to create post");
        }
    })
}

// for delete post
async function fetchPosts() {
    const res = await fetch('/moderator/posts', {
        headers: fetchDefaultHeaders,
    });
    if (!res.ok) throw new Error(await res.text());

    const posts = await res.json();               
    console.log('POSTS JSON:', posts);            
    moderatorPostList.innerHTML = _(
        window.render.moderatorPostList({ posts: posts, length: posts.length })
    );
}

async function deletePosts(formData) {
    // map with post id
    const postIds = Array.from(formData.keys()).map(id => Number(id));
    if (postIds.length === 0) {
        alert('Please select at least one post to delete.');
        return;
    }
    // confirm
    if (!confirm('Want to delete the selected posts?')) return; 

    try {
        const res = await fetch('/moderator/delete-posts', {
            method: 'POST',
            headers: fetchDefaultHeaders,
            body: JSON.stringify({ postIds })
        });
        if (res.ok) {
            alert('Posts deleted!');
            return location.reload();
        }
        const data = await res.json();
        alert('Failed: ' + data.message);
    } catch (err) {
        console.error(err);
        alert('Server error.');
    }
}

// decorate forms
const search_form = ignore_form(populate_posts)
const login_form = ignore_form(login)
const register_form = ignore_form(register)
const verify_user_form = ignore_form(verifyUsers)
const post_form = ignore_form(post)
const setup2fa_form = ignore_form(setup2FAForm);
const verify2fa_form = ignore_form(verify2FAForm);
const delete_posts_form = ignore_form(deletePosts);

if (moderatorPostList) {
    moderatorPostList.addEventListener('submit', delete_posts_form);
    fetchPosts().then(r => {})
}

if (setup2faContainer) setup2faContainer.addEventListener('submit', setup2fa_form);
if (verify2faContainer) verify2faContainer.addEventListener('submit', verify2fa_form);

if (logoutLink) logoutLink.addEventListener('click', (e) => {
    e.preventDefault(); // Prevents default link behavior
    logout(); // Submits the form
});

if (postsContainer) fetch_thumbnails("", 4).then(r => {
})
if (blog) fetch_blog().then(r => {}).then(r => {})

if (moderatorUserList) fetchUnverifiedUsers().then(r => { })


