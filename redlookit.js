const postsList = document.querySelector("#posts");
const postSection = document.querySelector('.reddit-post');
// let colors = ['#3d5a80', '#98c1d9', '#e0fbfc', '#ee6c4d', '#293241'];
let colors = ['#c24332', '#2e303f', '#63948c', '#ebe6d1', '#517c63', '#4c525f', '#371d31', '#f95950', '#023246', '#2e77ae', '#0d2137', '#ff8e2b'];
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
            // console.log(error)
        })
}

function displayPosts(responses) {
    for (let response of responses) {
        let section = document.createElement('button');
        section.classList.add('post');

        let title = document.createElement('span');
        let titleText = response.data.title;
        title.append(titleText);
        section.title = response.data.title;
        title.classList.add('title');

        let subreddit = document.createElement('span');
        subreddit.append(response.data.subreddit_name_prefixed);
        subreddit.classList.add('subreddit');
        let upvotes = document.createElement('span');

        upvotes.innerHTML = '<svg width="18" height="18" style="margin-right: 5px;" viewBox="0 0 94 97" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M88.1395 48.8394C84.9395 46.0394 60.4728 18.0061 48.6395 4.33939C46.6395 3.53939 45.1395 4.33939 44.6395 4.83939L4.63948 49.3394C2.1394 53.3394 7.63948 52.8394 9.63948 52.8394H29.1395V88.8394C29.1395 92.0394 32.1395 93.1727 33.6395 93.3394H58.1395C63.3395 93.3394 64.3062 90.3394 64.1395 88.8394V52.3394H87.1395C88.8061 52.0061 91.3395 51.6394 88.1395 48.8394Z" stroke="#818384" stroke-width="7"/></svg>'
        upvotes.append(`${response.data.score.toLocaleString()}`);
        upvotes.innerHTML += '<svg width="18" height="18" style="transform: rotate(180deg); margin-left: 5px" viewBox="0 0 94 97" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M88.1395 48.8394C84.9395 46.0394 60.4728 18.0061 48.6395 4.33939C46.6395 3.53939 45.1395 4.33939 44.6395 4.83939L4.63948 49.3394C2.1394 53.3394 7.63948 52.8394 9.63948 52.8394H29.1395V88.8394C29.1395 92.0394 32.1395 93.1727 33.6395 93.3394H58.1395C63.3395 93.3394 64.3062 90.3394 64.1395 88.8394V52.3394H87.1395C88.8061 52.0061 91.3395 51.6394 88.1395 48.8394Z" stroke="#818384" stroke-width="7"/></svg>'
        upvotes.classList.add('post-data');
        let profile = document.createElement('span');
        profile.classList.add('profile');
        let ppInitials = initials[Math.floor(Math.random() * initials.length)] + initials[Math.floor(Math.random() * initials.length)];
        let ppColor = colors[Math.floor(Math.random() * colors.length)];
        if (ppColor === '#ebe6d1' || ppColor === '#ebe6d1') {
            profile.style.color = 'black';
        }
        profile.style.backgroundColor = ppColor;
        profile.append(ppInitials);
        section.append(profile, title, subreddit, upvotes);
        // section.id = response.data.url;

        section.addEventListener('click', () => {
            console.log(`GETTING: https://www.reddit.com${response.data.permalink}.json?limit=75`)
            axios.get(`https://www.reddit.com${response.data.permalink}.json?limit=75`)
                .then((response) => {
                    // console.log(response.data[1].children[])
                    try {
                        clearPost();
                        expandPost(response);
                    } catch (e) {
                        // console.log(e)
                    }
                })
                .catch((error) => {
                    // console.log(error);
                })
        })
        postsList.append(section);
    }
    postsList.append("That's enough reddit for now. Get back to work!")
}

getPosts('popular');


function expandPost(response) {
    try {
        // reset scroll position when user clicks on a new post
        let redditPost = document.querySelector('.reddit-post');
        redditPost.scrollTop = 0;
    } catch (e) { 
        // console.log(e) 
    }
    
    comments = response.data[1].data.children;
    // console.log(comments)
    let author = document.createElement('span');
    author.append(`Posted by u/${response.data[0].data.children[0].data.author}`);
    author.classList.add('post-author')
    postSection.append(author);
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
    if (response.data[0].data.children[0].data.selftext !== '' && !response.data[0].data.children[0].data.selftext.includes('preview')) {
        let selftext = document.createElement('div');
        selftext.innerHTML = decodeHtml(response.data[0].data.children[0].data.selftext_html);
        postSection.append(selftext);
    }
    if (response.data[0].data.children[0].data.is_reddit_media_domain === false) {
        let div = document.createElement('div');
        let thumbnail = document.createElement('img');
        let link = document.createElement('a');
        // console.log(response.data[0].data.children[0].data.thumbnail)
        thumbnail.src = response.data[0].data.children[0].data.thumbnail;
        link.href = response.data[0].data.children[0].data.url_overridden_by_dest;
        link.innerText = titleText;
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
    let postDetails = getPostDetails(response)
    postSection.append(...postDetails)
    postSection.append(document.createElement('hr'))
    // console.log(comments);
    displayComments(comments, false);
}

function getPostDetails(response) {
    let upvotes = document.createElement('span');
    upvotes.innerHTML = '<svg width="18px" height="18px" style="margin-right: 5px;" viewBox="0 0 94 97" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M88.1395 48.8394C84.9395 46.0394 60.4728 18.0061 48.6395 4.33939C46.6395 3.53939 45.1395 4.33939 44.6395 4.83939L4.63948 49.3394C2.1394 53.3394 7.63948 52.8394 9.63948 52.8394H29.1395V88.8394C29.1395 92.0394 32.1395 93.1727 33.6395 93.3394H58.1395C63.3395 93.3394 64.3062 90.3394 64.1395 88.8394V52.3394H87.1395C88.8061 52.0061 91.3395 51.6394 88.1395 48.8394Z" stroke="#818384" stroke-width="7"/></svg>'
    upvotes.append(`${response.data[0].data.children[0].data.ups.toLocaleString()}`);
    upvotes.innerHTML += '<svg width="18px" height="18px" style="transform: rotate(180deg); margin-left: 5px" viewBox="0 0 94 97" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M88.1395 48.8394C84.9395 46.0394 60.4728 18.0061 48.6395 4.33939C46.6395 3.53939 45.1395 4.33939 44.6395 4.83939L4.63948 49.3394C2.1394 53.3394 7.63948 52.8394 9.63948 52.8394H29.1395V88.8394C29.1395 92.0394 32.1395 93.1727 33.6395 93.3394H58.1395C63.3395 93.3394 64.3062 90.3394 64.1395 88.8394V52.3394H87.1395C88.8061 52.0061 91.3395 51.6394 88.1395 48.8394Z" stroke="#818384" stroke-width="7"/></svg>'
    upvotes.classList.add('post-detail-info')
    let subreddit = document.createElement('span');
    subreddit.classList.add('post-detail-info')
    subreddit.append(response.data[0].data.children[0].data.subreddit_name_prefixed);
    let numComments = document.createElement('span');
    numComments.append(`${response.data[0].data.children[0].data.num_comments.toLocaleString()} Comments`);
    numComments.classList.add('post-detail-info')
    return [upvotes, subreddit, numComments];
}


function displayComments(comments, isReply=false) {
    for (let comment of comments) {
        try {
            let commentDiv = document.createElement('div')
            let ppInitials = initials[Math.floor(Math.random() * initials.length)] + initials[Math.floor(Math.random() * initials.length)];
            let ppColor = colors[Math.floor(Math.random() * colors.length)];
            let profilePic = `<span style="background-color: ${ppColor}; width: 25px; height: 25px; padding: 3px; border-radius: 50%; font-weight: bold; text-align: center; font-size: 12px; margin-right: 10px; -webkit-touch-callout: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; display: inline-block">${ppInitials}</span>`;
            if (ppColor === '#ebe6d1' || ppColor === '#ebe6d1') {
                profilePic = `<span style="background-color: ${ppColor}; color: black; width: 25px; height: 25px; padding: 3px; border-radius: 50%; font-weight: bold; text-align: center; font-size: 12px; margin-right: 10px; -webkit-touch-callout: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; display: inline-block">${ppInitials}</span>`;
            }
            let author = document.createElement('span');
            let score = document.createElement('span');
            let commentBody = document.createElement('div');
            
            author.innerHTML = profilePic;
            author.append(`u/${comment.data.author}`);
            commentBody.insertAdjacentHTML('beforeend', decodeHtml(comment.data.body_html));
            score.innerHTML = '<svg width="18px" height="18px" style="margin-right: 5px;" viewBox="0 0 94 97" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M88.1395 48.8394C84.9395 46.0394 60.4728 18.0061 48.6395 4.33939C46.6395 3.53939 45.1395 4.33939 44.6395 4.83939L4.63948 49.3394C2.1394 53.3394 7.63948 52.8394 9.63948 52.8394H29.1395V88.8394C29.1395 92.0394 32.1395 93.1727 33.6395 93.3394H58.1395C63.3395 93.3394 64.3062 90.3394 64.1395 88.8394V52.3394H87.1395C88.8061 52.0061 91.3395 51.6394 88.1395 48.8394Z" stroke="#818384" stroke-width="7"/></svg>'
            score.append(`${comment.data.score.toLocaleString()}`);
            score.innerHTML += '<svg width="18px" height="18px" style="transform: rotate(180deg); margin-left: 5px" viewBox="0 0 94 97" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M88.1395 48.8394C84.9395 46.0394 60.4728 18.0061 48.6395 4.33939C46.6395 3.53939 45.1395 4.33939 44.6395 4.83939L4.63948 49.3394C2.1394 53.3394 7.63948 52.8394 9.63948 52.8394H29.1395V88.8394C29.1395 92.0394 32.1395 93.1727 33.6395 93.3394H58.1395C63.3395 93.3394 64.3062 90.3394 64.1395 88.8394V52.3394H87.1395C88.8061 52.0061 91.3395 51.6394 88.1395 48.8394Z" stroke="#818384" stroke-width="7"/></svg>'
            
            commentDiv.append(author, commentBody, score);

            if (isReply) {
                commentDiv.classList.add('replied-comment')
                postSection.append(commentDiv);
                postSection.classList.add('post-selected');
                postSection.classList.remove('deselected');
                if (comment.data.replies) {
                    displayComments(comment.data.replies.data.children, isReply=true)
                }
            } else {
                postSection.append(commentDiv);
                postSection.classList.add('post-selected');
                postSection.classList.remove('deselected');
                if (comment.data.replies) {
                    displayComments(comment.data.replies.data.children, isReply=true)
                }
                postSection.append(document.createElement('hr'))
            }
        }
        catch (e) {
            // console.log(e);
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


let collapsible = document.querySelectorAll(".collapsible");

for (let coll of collapsible) {
  coll.addEventListener("click", function() {
    // this.classList.toggle("active");
    let content = this.nextElementSibling;
    if (content.style.display === "none") {
        this.firstChild.nextSibling.classList.remove('ms-Icon--ChevronRight')
        this.firstChild.nextSibling.classList.add('ms-Icon--ChevronDownMed')
        content.style.display = "block";
    } else {
        this.firstChild.nextSibling.classList.remove('ms-Icon--ChevronDownMed')
        this.firstChild.nextSibling.classList.add('ms-Icon--ChevronRight')
        content.style.display = "none";
    }
  });
}

const BORDER_SIZE = 4;
const panel = document.querySelector(".post-sidebar");

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

let settingsButton = document.querySelector('.settings-button');
let settingsPanel = document.querySelector('.settings-panel');

settingsButton.addEventListener('click', () => {
    settingsPanel.classList.toggle('settings-panel-show');
})

let closeButton = document.querySelector('.close-settings');

closeButton.addEventListener('click', () => {
    console.log('clicked close button')
    settingsPanel.classList.remove('settings-panel-show');
})

const checkbox = document.querySelector('#flexSwitchCheckChecked');

checkbox.addEventListener('change', function() {
    if (checkbox.checked) {
        console.log(checkbox.checked)
        document.querySelector('body').classList.remove('light')
        document.querySelector('body').classList.add('dark')
    } else {
        document.querySelector('body').classList.remove('dark')
        document.querySelector('body').classList.add('light')
    }
})

