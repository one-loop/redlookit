const redditBaseURL = "https://www.reddit.com";
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
    axios.get(`${redditBaseURL}/r/${subreddit}.json?limit=75`)
        .then(function  (response) {
            responseData = response.data.data.children;
            // console.log(responseData);
            displayPosts(responseData);
        })
        .catch((e) => {
            console.error(e);
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
            console.log(`GETTING: ${redditBaseURL}${response.data.permalink}.json?limit=75`)
            axios.get(`${redditBaseURL}${response.data.permalink}.json?limit=75`)
                .then((response) => {
                    // console.log(response.data[1].children[])
                    try {
                        clearPost();
                        expandPost(response);
                    } catch (e) {
                        console.error(e)
                    }
                })
                .catch((e) => {
                    console.error(e)
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
        console.error(e);
    }
    
    comments = response.data[1].data.children;
    // console.log(comments)
    let author = document.createElement('span');
    author.append(`Posted by u/${response.data[0].data.children[0].data.author}`);
    author.classList.add('post-author')
    postSection.append(author);
    let title = document.createElement('h4')
    let titleLink = document.createElement('a');
    title.appendChild(titleLink);
    let titleText = response.data[0].data.children[0].data.title
    titleLink.href = `${redditBaseURL}${response.data[0].data.children[0].data.permalink}`;
    titleLink.append(titleText);
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
        console.error(e);
    }
    let postDetails = getPostDetails(response)
    postSection.append(...postDetails)
    postSection.append(document.createElement('hr'))
    // console.log(comments);
    displayComments(comments, 0);
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

function uuid(format=undefined) {
    if (format === undefined) {
        format = [
            {n:8, charset:"alphanumerical"},
            {n:4, charset:"alphanumerical"},
            {n:4, charset:"alphanumerical"},
            {n:4, charset:"alphanumerical"},
            {n:12, charset:"alphanumerical"}
        ];
    }
    // Generate uuids with format ehd0wgw2-g11e-xgiq-nc9m-h2kva3tmrzpl by default
    const alphabets = {
        alphanumerical: "abcdefghijklmnopqrstuvwxyz0123456789",
        alpha: "abcdefghijklmnopqrstuvwxyz"
    };
    let result = "";
    for (let i = 0; i < format.length; i++) {
        const length = format[i].n;
        const characters = alphabets[format[i].charset];
        for (let j = 0; j < length; j++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        result += "-";
    }
    return result.slice(0,-1);
}

function strToSumOfASCII(message) {
    let sum = 0;
    for (let i=0; i < message.length; i++) {
        sum += message.charCodeAt(i);
    }
    return sum;
}

function createComment(commentData) {
    let commentDiv = document.createElement('div')
    commentDiv.id = commentData.data.id;
    console.log(commentData);

    // Profile pic
    let author = document.createElement('div');
    let ppSize = 50;
    author.style.display = "flex";

    if (commentData.data.subreddit === "gnometalk") {
        const gnomePic = "data:image/png;base64,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L25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOmRhNjAyMThkLWNmYmMtNDFjMS05M2QzLTBkMTQ4ZDc1NzkzNyIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowYjhmOTk4YS03NDk3LTRmMjMtYWViYi1kYWYyZTYyZGJiYzIiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDphMzlkNDhiZS03NGY4LTRjMDktYmE5My1lOTZhM2JhY2NmZjUiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJXaW5kb3dzIgogICBHSU1QOlRpbWVTdGFtcD0iMTY2OTkwMDg0NzI2OTMwMyIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjMwIgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjI5N2NkYmNkLTQyZjAtNGQ1YS04ZWU5LTFkYzk1YTY5ZWQ1NSIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMi0xMi0wMVQxNDoyMDo0NyIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAg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"
        let ppElem = document.createElement("img");
        ppElem.src = gnomePic;
        ppElem.style.marginRight = "10px";
        ppElem.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        ppElem.classList.add("avatar-circle");
        // Potential Hmirror 
        const flip = Math.random() <= 0.5 ? "scaleX(-1) " : "";
        // +Random rotation between -20deg +20deg
        const transforms = `${flip}rotate(${Math.round(Math.random()*40 - 20)}deg) `;
        ppElem.style.transform = transforms;
        author.appendChild(ppElem);
    } else if (Math.random() < 0.3) {
        let ppElem = document.createElement("div");
        let ppInitials = initials[Math.floor(Math.random() * initials.length)] + initials[Math.floor(Math.random() * initials.length)];
        let ppColor = colors[Math.floor(Math.random() * colors.length)];
        let innerHTML = `<span style="background-color: ${ppColor}; width: ${ppSize}px; height: ${ppSize}px; padding: ${Math.round(0.12*ppSize)}px 3px 3px 3px; border-radius: 50%; font-weight: bold; text-align: center; font-size: ${Math.round(ppSize/2.08)}px; margin-right: 10px; -webkit-touch-callout: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; display: inline-block">${ppInitials}</span>`;
        if (ppColor === '#ebe6d1' || ppColor === '#ebe6d1') {
            let ppSize = 50;
            innerHTML = `<span style="background-color: ${ppColor}; color: black; width: ${ppSize}px; height: ${ppSize}px; padding: 3px; border-radius: 50%; font-weight: bold; text-align: center; font-size: ${Math.round(ppSize/2.08)}px; margin-right: 10px; -webkit-touch-callout: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; display: inline-block">${ppInitials}</span>`;
        }
        ppElem.innerHTML = innerHTML;
        author.appendChild(ppElem);
    } else {
        let ppElem = document.createElement("img");
        ppElem.style.height = `${ppSize}px`;
        ppElem.style.width = `${ppSize}px`;
        ppElem.style.marginRight = "10px";
        ppElem.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        ppElem.classList.add("avatar-circle");
        author.appendChild(ppElem);
        
        // A delay is added because the random faces change every ~second on thispersondoesnotexist
        const randomDelay = strToSumOfASCII(commentData.data.author) % 100; // calculate "hash" of name and make sure we don't query more than 100 different pictures
        setTimeout(() => {
            // ?cnh=... (cdn=clamped name hash) is added to avoid browser caching if pic is queried >100th of a second apart
            // (otherwise you just bring up the same image over and over again regardless of whether it has changed or not on the back end)
            ppElem.src = `https://thispersondoesnotexist.com/image?cnh=${randomDelay}`;
        }, randomDelay*100); // delay is random(0,100) tenths of a second (100 values between 0 and 10s)
    }

    // Author's name and sent date
    let authorText = document.createElement("div");
    authorText.style.display = "flex";
    authorText.style.flexDirection = "column";
    {
        // Name
        let authorName = document.createElement("span");
        const scoreLength = (""+commentData.data.score).length
        
        // We overwrite the 1st section with the comment's score
        // First section is only letters to allow that
        const domain = uuid([
            {n:8, charset:"alpha"},
            {n:4, charset:"alphanumerical"},
            {n:4, charset:"alphanumerical"},
            {n:4, charset:"alphanumerical"},
            {n:12, charset:"alphanumerical"}
        ]).slice(scoreLength);
        authorName.innerHTML = `${commentData.data.author} <${commentData.data.score}${domain}@securemail.org>`;
        authorText.append(authorName);
        
        // Sent date
        let d = new Date();
        d.setUTCSeconds(commentData.data.created_utc);
        const dateDiv = document.createElement("span");
        dateDiv.innerHTML = d.toString().slice(0,21);
        dateDiv.style.color = "#a2a2a2";
        dateDiv.style.fontSize = "0.85em";
        authorText.append(dateDiv);
    }
    author.append(authorText);

    let commentBody = document.createElement('div');
    commentBody.insertAdjacentHTML('beforeend', decodeHtml(commentData.data.body_html));

    commentDiv.append(author, commentBody);
    
    return commentDiv
}

displayCommentsRecursive = (parentElement, commentList, indent=0) => {
    for (let comment of commentList) {
        // At the end of the list reddit adds a "more" object
        if (comment.kind === "more") {
            continue;
        }

        let elem = createComment(comment)
        
        if (indent > 0) {
            elem.style.paddingLeft = 10*indent;
            elem.classList.add('replied-comment');
        }
        
        parentElement.append(elem);

        if (comment.data.replies) {
            displayCommentsRecursive(elem, comment.data.replies.data.children, indent+1);
        }

        if (indent === 0) {
            parentElement.appendChild(document.createElement('hr'));
        }
    }
}

displayComments = (commentsData) => {
    postSection.classList.add('post-selected');
    postSection.classList.remove('deselected');
    displayCommentsRecursive(postSection, commentsData);
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
    // document.cookie.subreddits.append(subreddit.value);
    subredditBtn.append('r/' + subreddit.value);
    subredditSection.append(subredditBtn);
    subreddit.value = ''; 
})

// function displaySubreddits() {
//     // display saved subreddits in cookies
//     for (let subreddit of document.cookie.subreddits) {
//         let subredditBtn = document.createElement('button');
//         subredditBtn.classList.add('subreddit', 'button');
//         subredditBtn.id = subreddit;
//         document.cookie.subreddits.append(subreddit);
//         subredditBtn.append('r/' + subreddit);
//         subredditSection.append(subredditBtn);
//     }
// }

// displaySubreddits();

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
    profilePanel.classList.remove('profile-panel-show');
    settingsPanel.classList.toggle('settings-panel-show');
})

let closeButton = document.querySelector('.close-settings');

closeButton.addEventListener('click', () => {
    settingsPanel.classList.remove('settings-panel-show');
})

const checkbox = document.querySelector('#flexSwitchCheckChecked');

checkbox.addEventListener('change', function() {
    if (checkbox.checked) {
        document.querySelector('body').classList.remove('light')
        document.querySelector('body').classList.add('dark')
    } else {
        document.querySelector('body').classList.remove('dark')
        document.querySelector('body').classList.add('light')
    }
})

let profileButton = document.querySelector('.profile-button');
let profilePanel = document.querySelector('.profile-panel');

profileButton.addEventListener('click', () => {
    settingsPanel.classList.remove('settings-panel-show');
    profilePanel.classList.toggle('profile-panel-show');
})
