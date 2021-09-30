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
        upvotes.append(`Upvotes: ${response.data.score}`);
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
    let title = document.createElement('h5');
    title.append(response.data[0].data.children[0].data.title);
    title.classList.add('post-section-title');
    postSection.append(title);
    if (response.data[0].data.children[0].data.post_hint === 'image') {
        let image = document.createElement('img');
        image.src = response.data[0].data.children[0].data.url_overridden_by_dest;
        image.classList.add('post-image');
        postSection.append(image);
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
const subredditSection = document.querySelector('.subreddits-section')

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
