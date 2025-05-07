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
    const render_article = doT.template(`
    {{~ it.posts :p}}
        <article>
            <header>
                <img src="https://wallpaperaccess.com/full/343619.jpg" alt="Lamp" style="width:100%">
            </header>
            <p>{{=p.title}}</p>
            <footer><small>By {{=p.username}}</small></footer>
        </article>
    {{~}}
    `);
    const response = await fetch('/post/get-posts?' + new URLSearchParams({
        name: name,
        amount: amount,
    }).toString())
    const posts = await response.json();
    postsContainer.innerHTML = render_article({posts: posts});
}


async function login(formData) {
    const render_invalid_form = doT.template(`
        <input type="text" name="username" placeholder="Username" aria-invalid="true" required>
        <input type="password" name="password" placeholder="Password" aria-invalid="true" required>
        <small>{{=it.reason}}</small>
        <button type="submit">Login</button>
    `)
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
            loginForm.innerHTML = render_invalid_form({reason: data.message});
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

// conditional exec once
const loginForm = document.getElementById('loginForm');
const welcomeDialog = document.getElementById('welcomeDialog');
const postsContainer = document.getElementById("posts");
if (postsContainer) {
    fetch_thumbnails("", 4).then(r => {
    })
}

const search_form = ignore_form(populate_posts)
const login_form = ignore_form(login)
