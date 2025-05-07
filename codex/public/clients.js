function ignore_form(func) {
    return function(event) {
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

const postsContainer = document.getElementById("posts");
if (postsContainer) {
    fetch_thumbnails("", 4)
}

const search_form = ignore_form(populate_posts)