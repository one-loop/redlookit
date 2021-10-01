const postsList = document.querySelector("#posts");
const postSection = document.querySelector('.reddit-post');
let colors = ['#3d5a80', '#98c1d9', '#e0fbfc', '#ee6c4d', '#293241'];
let initials = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

const menuButton = document.querySelector('.menu');
const sideNavBar = document.querySelector('.menu-selector')
menuButton.addEventListener('click', () => {
    sideNavBar.classList.toggle('hidden')
})

function getPosts(subreddit) {
    let section = document.createElement('section');
    section.classList.add('post')
    axios.get(`https://www.reddit.com/r/${subreddit}.json?limit=75`)
        .then(function  (response) {
            responseData = response.data.data.children;
            // console.log(responseData);
            displayPosts(responseData);
        })
        .catch(function (error) {
            console.log(error)
        })
}

function displayPosts(responses) {
    for (let response of responses) {
        // console.log(response.data.subreddit);
        // console.log(response.data.url);
        // console.log(response.data.ups);
        // console.log(response.data.title);
        // console.log('**********')
        let section = document.createElement('button');
        section.classList.add('post');

        let title = document.createElement('span');
        let titleText = response.data.title;
        title.append(titleText);
        title.classList.add('title');

        let subreddit = document.createElement('span');
        subreddit.append(response.data.subreddit_name_prefixed);
        subreddit.classList.add('subreddit');
        let upvotes = document.createElement('span');
        upvotes.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15" height="15" style="margin-bottom: 5px" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><g fill="#ffffff"><path d="M86.20156,11.25391c-1.4663,0 -2.93278,0.57002 -4.05364,1.69089l-40.53646,40.53646c-1.09507,1.09507 -1.67969,2.56298 -1.67969,4.05364c0,0.7396 0.12739,1.48386 0.42552,2.19479c0.88293,2.14427 2.99155,3.53854 5.30781,3.53854h23.33646v86c0,6.33533 5.13133,11.46667 11.46667,11.46667h11.46667c6.33533,0 11.46667,-5.13133 11.46667,-11.46667v-86h23.33646c2.31627,0 4.41368,-1.39427 5.29661,-3.53854c0.8944,-2.14427 0.39676,-4.60297 -1.24297,-6.24844l-40.53646,-40.53646c-1.12087,-1.12087 -2.58735,-1.69089 -4.05365,-1.69089z"></path></g></g></svg>'
        upvotes.append(`${response.data.score.toLocaleString()}`);
        upvotes.innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15" height="15" style="margin-bottom: 5px; transform: rotate(180deg)" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><g fill="#ffffff"><path d="M86.20156,11.25391c-1.4663,0 -2.93278,0.57002 -4.05364,1.69089l-40.53646,40.53646c-1.09507,1.09507 -1.67969,2.56298 -1.67969,4.05364c0,0.7396 0.12739,1.48386 0.42552,2.19479c0.88293,2.14427 2.99155,3.53854 5.30781,3.53854h23.33646v86c0,6.33533 5.13133,11.46667 11.46667,11.46667h11.46667c6.33533,0 11.46667,-5.13133 11.46667,-11.46667v-86h23.33646c2.31627,0 4.41368,-1.39427 5.29661,-3.53854c0.8944,-2.14427 0.39676,-4.60297 -1.24297,-6.24844l-40.53646,-40.53646c-1.12087,-1.12087 -2.58735,-1.69089 -4.05365,-1.69089z"></path></g></g></svg>'
        upvotes.classList.add('post-data');
        let profile = document.createElement('span');
        profile.classList.add('profile');
        let ppInitials = initials[Math.floor(Math.random() * initials.length)] + initials[Math.floor(Math.random() * initials.length)];
        let ppColor = colors[Math.floor(Math.random() * colors.length)];
        profile.style.backgroundColor = ppColor;
        profile.append(ppInitials);
        section.append(profile, title, subreddit, upvotes);
        // section.id = response.data.url;

        section.addEventListener('click', () => {
            console.log(`GETTING: https://www.reddit.com${response.data.permalink}.json?limit=75`)
            axios.get(`https://www.reddit.com${response.data.permalink}.json?limit=75`)
                .then((response) => {
                    console.log(response);
                    // console.log(response.data[1].children[])
                    try {
                        clearPost();
                        expandPost(response);
                    } catch (e) {
                        console.log(e)
                    }
                })
                .catch((error) => {
                    console.log(error);
                })
        })
        postsList.append(section);
    }
    postsList.append("That's enough reddit for now. Get back to work!")
}

getPosts('popular');


function expandPost(response) {
    comments = response.data[1].data.children;
    // console.log(comments)
    let title = document.createElement('h4');
    let titleText = response.data[0].data.children[0].data.title
    title.append(titleText);
    title.classList.add('post-section-title');
    postSection.append(title);
    if (response.data[0].data.children[0].data.post_hint === 'image') {
        let image = document.createElement('img');
        image.src = response.data[0].data.children[0].data.url_overridden_by_dest;
        image.classList.add('post-image');
        postSection.append(image);
    } 
    // if (response.data[0].data.children[0].data.url_overridden_by_dest !== '') {
    if (response.data[0].data.children[0].data.is_reddit_media_domain === false) {
        let div = document.createElement('div');
        let thumbnail = document.createElement('img');
        let link = document.createElement('a');
        console.log(response.data[0].data.children[0].data.thumbnail)
        thumbnail.src = response.data[0].data.children[0].data.thumbnail;
        link.href = response.data[0].data.children[0].data.url_overridden_by_dest;
        link.innerText = titleText;
        link.innerText += '\n' + response.data[0].data.children[0].data.url_overridden_by_dest;
        link.target = "_blank";
        link.classList.add('post-link');
        div.append(thumbnail);
        div.append(link);
        div.classList.add('post-link-container')
        postSection.append(div);
    }
    try { 
        if (response.data[0].data.children[0].data.secure_media.reddit_video !== 'null') {
            let video = document.createElement('video');
            video.classList.add('post-video');
            video.setAttribute('controls', '')
            let source = document.createElement('source');
            source.src = response.data[0].data.children[0].data.secure_media.reddit_video.fallback_url;
            video.appendChild(source);
            postSection.append(video);
        }
    } catch (e) {
        
    }
    postSection.append(document.createElement('hr'))
    // console.log(comments);
    displayComments(comments);
}

function displayComments(comments) {
    for (let comment of comments) {
        try {
            let author = document.createElement('span');
            let score = document.createElement('span');
            let commentBody = document.createElement('div');
            author.append(`u/${comment.data.author}`);
            commentBody.insertAdjacentHTML('beforeend', decodeHtml(comment.data.body_html));
            // commentBody.insertAdjacentHTML("beforeend", comment.data.body_html);
            score.append(`👆 ${comment.data.score}\n`);
            postSection.append(score, author, commentBody);
            postSection.classList.add('post-selected');
            postSection.classList.remove('deselected');
            if (!comment.data.replies) {
                displayComments(comment.data.replies.data.children)
            }
            postSection.append(document.createElement('hr'))
        }
        catch (e) {
            console.log(e);
        }
    }
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function clearPost() {
    postSection.innerHTML = '';
}

function clearPostsList() {
    document.querySelector('#posts').innerHTML  = '';
}

const searchForm = document.querySelector('form');
const subreddit = document.querySelector('input');
const subredditSection = document.querySelector('.your-subreddits')

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    // console.log(subreddit.value);
    let subredditBtn = document.createElement('button');
    subredditBtn.classList.add('subreddit', 'button');
    subredditBtn.id = subreddit.value;
    subredditBtn.addEventListener('click', async (event) => {
        clearPost();
        clearPostsList();
        let posts = await getPosts(subredditBtn.id);
    })
    subredditBtn.append('r/' + subreddit.value);
    subredditSection.append(subredditBtn);
    subreddit.value = ''; 
})

const popularSubreddits = document.querySelectorAll('.popular-subreddits>button')

for (let subreddit of popularSubreddits) {
    subreddit.addEventListener('click', async (event) => {
        clearPost();
        clearPostsList();
        let posts = await getPosts(subreddit.id);
    })

}


let clicked = false;
const markAsRead = document.querySelector('.mark-as-read-btn');
markAsRead.addEventListener('click', () => {
    if (!clicked) {
        alert('This button literally does nothing')
        clicked = true;
    }
})

const inboxButton = document.querySelector('.inbox-button');
inboxButton.addEventListener('click', async () => {
    clearPost();
    clearPostsList();
    let posts = await getPosts('popular')
})


var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}

const BORDER_SIZE = 4;
const panel = document.getElementById(".post-sidebar");

let m_pos;
function resize(e){
  const dx = m_pos - e.x;
  m_pos = e.x;
  panel.style.width = (parseInt(getComputedStyle(panel, '').width) + dx) + "px";
}

panel.addEventListener("mousedown", function(e){
  if (e.offsetX < BORDER_SIZE) {
    m_pos = e.x;
    document.addEventListener("mousemove", resize, false);
  }
}, false);

document.addEventListener("mouseup", function(){
    document.removeEventListener("mousemove", resize, false);
}, false);
