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
    postsContainer.innerHTML = window.render.indexPost({posts: posts});
}


async function login(formData) {
    try {
        const response = await fetch('login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        // Checks if the response status is not ok, if there is an error an exception is thrown
        const data = await response.json();
        if (response.ok) {
            welcomeDialog.showModal()
            waitForModalClose(welcomeDialog).then((data) => {
                    if (data.ismoderator) {
                        window.location.href = '/moderator'
                    } else {
                        window.location.href = '/';
                    }
                }
            )
        } else {
            loginForm.innerHTML = window.render.invalidLoginForm({reason: data.message});
        }
    } catch (error) {
        // ASSUMING REQUEST FAILED
        loginForm.innerHTML = render_invalid_form({reason: "Login request has failed."});
    }
}

function waitForModalClose(modal) {
    return new Promise(resolve => {
        modal.addEventListener('close', resolve, {once: true});
    });
}

const welcomeDialog = document.getElementById('welcomeDialog');
const postsContainer = document.getElementById("posts");
const loginForm = document.getElementById('loginForm');
// conditional exec once
if (postsContainer) {
    fetch_thumbnails("", 4).then(r => {
    })
}

const search_form = ignore_form(populate_posts)
const login_form = ignore_form(login)
