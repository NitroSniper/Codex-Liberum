"use strict";
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

async function fetch_thumbnails(name, amount) {
    const response = await fetch('/post/get-posts?' + new URLSearchParams({
        name: name,
        amount: amount,
    }).toString())
    const posts = await response.json();
    postsContainer.innerHTML = window.render.indexPost({ posts: posts });
}


async function login(formData) {
    try {
        const response = await fetch('login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        // Checks if the response status is not ok, if there is an error an exception is thrown
        const data = await response.json();
        if (response.ok) {
            const isModerator = data.ismoderator;

            welcomeDialog.showModal();
            waitForModalClose(welcomeDialog).then(() => {
                if (isModerator) {
                    window.location.href = '/moderator';
                } else {
                    window.location.href = '/';
                }
            });
        }

        else {
            loginForm.innerHTML = window.render.invalidLoginForm({ reason: data.message });
        }
    } catch (error) {
        // ASSUMING REQUEST FAILED
        loginForm.innerHTML = window.render.invalidLoginForm({ reason: "Login request has failed." });
    }
}

async function register(formData) {
    try {
        const response = await fetch('register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        // Checks if the response status is not ok, if there is an error an exception is thrown
        const data = await response.json();
        if (response.ok) {
            registerDialog.showModal()
            waitForModalClose(registerDialog).then((data) => { })
        } else {
            registerForm.innerHTML = window.render.invalidRegisterForm({ reason: data.message });
        }
    } catch (error) {
        // ASSUMING REQUEST FAILED
        registerForm.innerHTML = window.render.invalidRegisterForm({ reason: "register request has failed." });
    }
}

// Verify function 
async function verify() {
    const container = document.getElementById('userListContainer');
    try {
        const res = await fetch('/auth/unverified-users');
        const users = await res.json();

        if (users.length === 0) {
            container.innerHTML = '<p>All users are verified </p>';
            return;
        }
        // Create a list of checkboxes for users
        const wrapper = document.createElement('div');
        users.forEach(user => {
            const item = document.createElement('div');
            item.innerHTML = `
                <label>
                    <input type="checkbox" value="${user.id}">
                    ${user.username}
                </label>
            `;
            wrapper.appendChild(item);
        });
        container.innerHTML = '';
        container.appendChild(wrapper);
    } catch (err) {
        container.innerHTML = '<p>Error loading users.</p>';
    }


    // Handles the verify button 
    const verifyButton = document.getElementById('verifyButton');
    if (verifyButton) {
        verifyButton.addEventListener('click', async () => {
            const checkboxes = document.querySelectorAll('#userListContainer input[type="checkbox"]:checked');
            const userIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
            if (userIds.length === 0) {
                alert('Please select at least one user to verify.');
                return;
            }
            try {
                const res = await fetch('/auth/verify-users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
        });
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
const registerForm = document.getElementById('registerForm');
// conditional exec once
if (postsContainer) {
    fetch_thumbnails("", 4).then(r => {
    })
}

// decorate forms
const search_form = ignore_form(populate_posts)
const login_form = ignore_form(login)
const register_form = ignore_form(register)

if (document.getElementById('userListContainer')) {
    verify();
}
