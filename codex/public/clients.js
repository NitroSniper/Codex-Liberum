
function ignore_form(func) {
    return function(event) {
        event.preventDefault()
        func(new FormData(event.target));
        return false;
    }
}


async function populate_posts(formData) {
    console.log(formData);
    console.log("process");
    const render_article = doT.template(`
    {{~ it.posts :p}}
        <article>
            <header>
                <img src="https://wallpaperaccess.com/full/343619.jpg" alt="Lamp" style="width:100%">
            </header>
            <p>{{=p.body}}</p>
            <footer><small>By IDK</small></footer>
        </article>
    {{~}}
    `);
    const postsContainer = document.getElementById("posts");
    postsContainer.innerHTML = render_article({posts: [{body: 'with doT'}, {body: 'by Foo'}]});
}

const search_form = ignore_form(populate_posts)