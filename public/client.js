document.addEventListener("DOMContentLoaded", function() {
    fetchPosts();
    document.getElementById("search").addEventListener("input", searchPosts);
  });
  
  async function fetchPosts() {
    try {
      const response = await fetch("/get-posts");
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.status);
      }
      const posts = await response.json();
      displayPosts(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }
  
  function displayPosts(posts) {
    const postsContainer = document.getElementById("posts");
    postsContainer.innerHTML = "";
  
    posts.forEach(post => {
      // Create container and elements 
      // not using directly injecting HTML
      const postDiv = document.createElement("div");
      postDiv.classList.add("post");
  
      // Use textContent to avoid injection
      const titleElem = document.createElement("h3");
      titleElem.textContent = post.title;
  
      const infoElem = document.createElement("small");
      infoElem.textContent = `Category: ${post.category} | Posted on: ${new Date(post.dateTime).toLocaleString()}`;
  
      const contentElem = document.createElement("p");
      contentElem.textContent = post.content;
  
      postDiv.appendChild(titleElem);
      postDiv.appendChild(infoElem);
      postDiv.appendChild(contentElem);
      postsContainer.appendChild(postDiv);
    });
  }
  
  function searchPosts() {
    const query = document.getElementById("search").value.toLowerCase();
    const postElements = document.querySelectorAll(".post");
    postElements.forEach(post => {
      const title = post.querySelector("h3").textContent.toLowerCase();
      post.style.display = title.includes(query) ? "block" : "none";
    });
  }