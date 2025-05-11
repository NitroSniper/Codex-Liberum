"use strict";
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const fetchDefaultHeaders = {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json',
}
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


async function login(formData) {
    try {
        const response = await fetch('login', {
            method: 'POST',
            headers: fetchDefaultHeaders,
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        // Checks if the response status is not ok, if there is an error an exception is thrown
        const data = await response.json();
        if (response.ok) {
            welcomeDialog.showModal();
            waitForModalClose(welcomeDialog).then(() => {
                window.location.href = '/';
            });
        } else {
            loginForm.innerHTML = _(window.render.invalidLoginForm({ reason: data.message }));
        }
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

const welcomeDialog = document.getElementById('welcomeDialog');
const registerDialog = document.getElementById('registerDialog');
const postsContainer = document.getElementById("posts");
const loginForm = document.getElementById('loginForm');
const logoutForm = document.getElementById('logoutForm');
const registerForm = document.getElementById('registerForm');
const moderatorUserList = document.getElementById('userListContainer');
const verifyButton = document.getElementById('verifyButton');
const logoutLink = document.getElementById('logoutLink');

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
    fetch('/post/create-post', {
        method: 'POST',
        headers: fetchDefaultHeaders,
        body: JSON.stringify(Object.fromEntries(formData)),
    }).then((res) => {
       if (res.ok) {
           alert("Successfully created post");
       } else {
           alert("Failed to create post");
       }
    })
}

// decorate forms
const search_form = ignore_form(populate_posts)
const login_form = ignore_form(login)
const register_form = ignore_form(register)
const verify_user_form = ignore_form(verifyUsers)
const post_form = ignore_form(post)

if (logoutLink) logoutLink.addEventListener('click', (e) => {
    e.preventDefault(); // Prevents default link behavior
    logout(); // Submits the form
});

if (postsContainer) fetch_thumbnails("", 4).then(r => {
})

if (moderatorUserList) fetchUnverifiedUsers().then(r => { })
