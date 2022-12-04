declare var axios: any

function isDebugMode(): boolean {
    // Won't support ipv6 loopbacks
    const url = new URL(document.URL);
    return url.protocol === "file:" || url.host === "localhost" || url.host === "127.0.0.1";
}

function assert(condition: boolean, msg: string = "Assertion failed"): asserts condition {
    if (!condition && isDebugMode()) {
        throw new Error(msg);
    }
}

// A query selector that throws
function strictQuerySelector<T extends Element>(selector: string): T {
    const element: T | null = document.querySelector<T>(selector);
    assert(element !== null, `Failed to find a DOM element matching selector "${selector}"`);
    return element;
}

const redditBaseURL: string = "https://www.reddit.com";
const postsList: HTMLElement = strictQuerySelector("#posts");
const postSection: HTMLElement = strictQuerySelector('section.reddit-post');
// let colors = ['#3d5a80', '#98c1d9', '#e0fbfc', '#ee6c4d', '#293241'];
let colors = ['#c24332', '#2e303f', '#63948c', '#ebe6d1', '#517c63', '#4c525f', '#371d31', '#f95950', '#023246', '#2e77ae', '#0d2137', '#ff8e2b'];
let initials = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

const menuButton: HTMLElement = strictQuerySelector('.menu');
const sideNavBar: HTMLElement = strictQuerySelector('.menu-selector')
menuButton!.addEventListener('click', () => {
    sideNavBar!.classList.toggle('hidden')
})

const facesSideloader = new HumanFacesSideloader(200); // Side-load 200 faces in the background

function getPosts(subreddit) {
    let section = document.createElement('section');
    section.classList.add('post')
    axios.get(`${redditBaseURL}/r/${subreddit}.json?limit=75`)
        .then(function  (response) {
            const responseData = response.data.data.children;
            displayPosts(responseData);
        })
        .catch((e: Error) => {
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
            if (isDebugMode()) {
                console.log(`GETTING: ${redditBaseURL}${response.data.permalink}.json?limit=75`)
            }
            axios.get(`${redditBaseURL}${response.data.permalink}.json?limit=75`)
                .then((response) => {
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

type CommentBuilderOptions = {indent: number, ppBuffer: HTMLImageElement[]};

function displayCommentsRecursive(parentElement: HTMLElement, listing: ApiObj[], options: CommentBuilderOptions = { indent: 0, ppBuffer: [] }) {
    for (const redditObj of listing) {
        // At the end of the list reddit adds a "more" object
        if (redditObj.kind === "t1") {
            // t1 is for comments
            const comment: SnooComment = redditObj as SnooComment;
            let elem = createComment(comment, { ppBuffer: options.ppBuffer })

            if (options.indent > 0) {
                elem.classList.add('replied-comment');
            }

            parentElement.append(elem);

            if (comment.data.replies) {
                displayCommentsRecursive(elem, comment.data.replies.data.children, { indent: options.indent + 10, ppBuffer: options.ppBuffer });
            }

            if (options.indent === 0) {
                parentElement.appendChild(document.createElement('hr'));
            }
        }
    }
}

function displayComments(commentsData) {
    postSection.classList.add('post-selected');
    postSection.classList.remove('deselected');

    const stableInTimeFaceBuffer = facesSideloader.getFaces().slice(0); // Stable-in-time copy of the full array
    displayCommentsRecursive(postSection, commentsData, { indent: 0, ppBuffer: stableInTimeFaceBuffer });
}

function expandPost(response: ApiObj) {
    try {
        // reset scroll position when user clicks on a new post
        let redditPost: HTMLElement = strictQuerySelector('.reddit-post');
        redditPost.scrollTop = 0;
    } catch (e) { 
        console.error(e);
    }
    
    const comments = response.data[1].data.children;
    const author = document.createElement('span');
    author.append(`Posted by u/${response.data[0].data.children[0].data.author}`);
    author.classList.add('post-author')
    postSection.append(author);
    const title = document.createElement('h4')
    const titleLink = document.createElement('a');
    title.appendChild(titleLink);
    const titleText = response.data[0].data.children[0].data.title
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
        const selftext = document.createElement('div');
        selftext.innerHTML = decodeHtml(response.data[0].data.children[0].data.selftext_html);
        postSection.append(selftext);
    }
    if (response.data[0].data.children[0].data.is_reddit_media_domain === false) {
        const div = document.createElement('div');
        const thumbnail = document.createElement('img');
        const link = document.createElement('a');

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

    const redditVideo = response?.data[0]?.data?.children[0]?.data?.secure_media?.reddit_video;
    if (redditVideo !== undefined && redditVideo !== "null") {
        const video = document.createElement('video');
        video.classList.add('post-video');
        video.setAttribute('controls', '')
        const source = document.createElement('source');
        source.src = response.data[0].data.children[0].data.secure_media.reddit_video.fallback_url;
        video.appendChild(source);
        postSection.append(video);
    }
    
    const postDetails = getPostDetails(response)
    postSection.append(...postDetails)
    postSection.append(document.createElement('hr'))
    displayComments(comments);
}

function getPostDetails(response: any) {
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

type CharsetSequence = {
    n: number,
    charset: "alpha" | "alphanumerical",
}
type UUIDFormat = CharsetSequence[];
type UUID = string;
function uuid(format: (UUIDFormat | undefined) = undefined): UUID {
    if (format === undefined) {
        format = [
            {n:8, charset:"alphanumerical"},
            {n:4, charset:"alphanumerical"},
            {n:4, charset:"alphanumerical"},
            {n:4, charset:"alphanumerical"},
            {n:12, charset: "alphanumerical" }
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
    return result.slice(0,-1) as UUID;
}

function strToSumOfASCII(message: string): number {
    let sum = 0;
    for (let i=0; i < message.length; i++) {
        sum += message.charCodeAt(i);
    }
    return 10000+sum;
}

function generateGnomePic() : HTMLImageElement {
    const gnome = document.createElement<"img">("img");
    gnome.classList.add("gnome");
    gnome.src = "resources/gnome.png";
    // Potential Hmirror 
    const flip = Math.random() <= 0.5 ? "scaleX(-1) " : "";
    // +Random rotation between -20deg +20deg
    const transforms = `${flip}rotate(${Math.round(Math.random() * 40 - 20)}deg) `;
    gnome.style.transform = transforms;

    return gnome;
}

function generateTextPic(size: number) : HTMLSpanElement {
    const textPic = document.createElement<"span">("span");
    const ppInitials = initials[Math.floor(Math.random() * initials.length)] + initials[Math.floor(Math.random() * initials.length)];

    textPic.style.padding = `${Math.round(0.12 * size)}px 3px 3px 3px`;
    textPic.style.fontSize = `${Math.round(size / 2.08)}px`;
    textPic.style.fontWeight = "bold";
    textPic.style.textAlign = "center";
    textPic.style.display = "inline-block";
    textPic.style.cssText += "-webkit-touch-callout: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;";

    textPic.textContent = `${ppInitials}`;
    return textPic;
}

function copyImage2Canvas(origin: HTMLImageElement, newSize: number): HTMLCanvasElement | null {
    const canv: HTMLCanvasElement = document.createElement("canvas");
    
    // canvas will sample 4 pixels per pixel displayed then be downsized via css
    // otherwise if 1px = 1px the picture looks pixelated & jagged
    // css seems to do a small cubic interpolation when downsizing and it makes a world of difference
    canv.height = canv.width = newSize * 2; 

    canv.style.height = canv.style.width = newSize.toString();
    const ctx: CanvasRenderingContext2D | null = canv.getContext('2d');

    if (ctx !== null) {
        ctx.imageSmoothingEnabled = false;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(origin, 0, 0, newSize * 2, newSize * 2);
        return canv;
    } else {
        return null;
    }
}

function generateFacePic(commentData: SnooComment, ppBuffer: HTMLImageElement[], displaySize: number = 50): HTMLCanvasElement {
    const authorHash = strToSumOfASCII(commentData.data.author) % ppBuffer.length; // calculate "hash" of name and make it match to our array of pictures
    const imageElement: HTMLImageElement = ppBuffer[authorHash];
    
    // Purpose of copying: A single <img> tag cannot be in multiple spots at the same time
    // I did not find a way to duplicate the reference to an img tag 
    // If you use Element.appendChild with the same reference multiple times, the method will move the element around
    // Creating a new <img> tag and copying the attributes would work, but it would fetch the src again
    // The image at thispersondoesnotexist changes every second so the src points to a new picture now
    // Since the URL has a parameter and hasn't changed, then most likely, querying the URL again would
    //     hit the browser's cache. but we can't know that.
    // Solution: make a canvas and give it the single <img> reference. It makes a new one every time. It doesn't query the src.
    const canv = copyImage2Canvas(imageElement, displaySize);
    assert(canv !== null, `generateFacePic couldn't get a canvas 2D context from image #${authorHash}, ${imageElement.src} (img.${Array.from(imageElement.classList).join(".")})`);

    canv.classList.add(`human-${authorHash}`);
    return canv;
}

type HTMLProfilePictureElement = HTMLCanvasElement | HTMLImageElement | HTMLSpanElement;
function createProfilePicture(commentData: SnooComment, size: number = 50, ppBuffer: HTMLImageElement[] = []): HTMLProfilePictureElement {
    function helper(): HTMLProfilePictureElement {
        if (commentData.data.subreddit === "gnometalk") {
            return generateGnomePic();
        } else {
            if (Math.random() < 0.3) {
                return generateTextPic(size);
            } else {
                return generateFacePic(commentData, ppBuffer);
            }
        }
    }
    
    const ppElem: HTMLProfilePictureElement = helper();

    ppElem.classList.add("avatar")
    ppElem.style.marginRight = "10px";
    ppElem.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    if (!ppElem.classList.contains("avatar-circle")) {
        ppElem.classList.add("avatar-circle");
    }
    return ppElem;
}

type CreateCommentOptions = {
    ppBuffer: HTMLImageElement[]
};
function createComment(commentData: SnooComment, options: CreateCommentOptions={ppBuffer: []}) {
    const commentDiv: HTMLDivElement = document.createElement('div');
    commentDiv.id = commentData.data.id;

    // Author parent div
    const author = document.createElement('div');
    author.classList.add("author")
    author.style.display = "flex";

    // Profile pic
    const authorPfp = createProfilePicture(commentData, 50, options.ppBuffer);
    author.appendChild(authorPfp);

    // Author's name and sent date
    let authorText = document.createElement("div");
    authorText.classList.add("author-text")
    authorText.style.display = "flex";
    authorText.style.flexDirection = "column";
    {
        // Name
        let authorTextInfo = document.createElement("span");
        authorTextInfo.classList.add("username")
        authorTextInfo.classList.add("email")
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
        authorTextInfo.innerHTML = `${commentData.data.author} <${commentData.data.score}${domain}@securemail.org>`;
        authorText.append(authorTextInfo);
        
        // Sent date
        let d = new Date();
        d.setUTCSeconds(commentData.data.created_utc);
        const dateDiv = document.createElement("span");
        dateDiv.classList.add("comment-posted-date")
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

type SerializedHTML = string;
function decodeHtml(html: SerializedHTML): SerializedHTML {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function clearPost() {
    postSection.innerHTML = '';
}

function clearPostsList() {
    const posts = document.querySelector('#posts');
    if (posts !== null) {
        posts.innerHTML = '';
    }
}



const searchForm: HTMLFormElement = strictQuerySelector('form');
const subreddit: HTMLInputElement = strictQuerySelector('input');
const subredditSection: HTMLElement = strictQuerySelector('.your-subreddits')

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    let subredditBtn: HTMLButtonElement = document.createElement<"button">('button');
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

const popularSubreddits: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.popular-subreddits>button')

for (let subreddit of popularSubreddits) {
    subreddit.addEventListener('click', async (event) => {
        clearPost();
        clearPostsList();
        let posts = await getPosts(subreddit.id);
    })

}


let clicked = false;
const markAsRead: HTMLElement = strictQuerySelector('.mark-as-read-btn');
markAsRead.addEventListener('click', () => {
    if (!clicked) {
        alert('This button literally does nothing')
        clicked = true;
    }
})

const inboxButton: HTMLElement = strictQuerySelector('.inbox-button');
inboxButton.addEventListener('click', async () => {
    clearPost();
    clearPostsList();
    let posts = await getPosts('popular')
})

function isHTMLElement(obj: any): obj is HTMLElement {
    return (typeof obj === "object") && (obj as HTMLElement).style !== undefined;
}

let collapsible: NodeListOf<HTMLElement> = document.querySelectorAll(".collapsible");
for (let coll of collapsible) {
    coll.addEventListener("click", function() {
        // this.classList.toggle("active");
        let content = this?.nextElementSibling;
        if (!isHTMLElement(content)) {
            return;
        }
        
        let nextSibling = this?.firstChild?.nextSibling;
        if (!isHTMLElement(nextSibling)) {
            return;
        }
        
        if (content.style.display === "none") {
            nextSibling.classList.remove('ms-Icon--ChevronRight')
            nextSibling.classList.add('ms-Icon--ChevronDownMed')
            content.style.display = "block";
        } else {
            nextSibling.classList.remove('ms-Icon--ChevronDownMed')
            nextSibling.classList.add('ms-Icon--ChevronRight')
            content.style.display = "none";
        }
    });
}

const BORDER_SIZE = 4;
const panel: HTMLElement = strictQuerySelector(".post-sidebar");

let m_pos: number;
function resize(e: MouseEvent){
  const dx = m_pos - e.x;
  m_pos = e.x;
  panel.style.width = `${(parseInt(getComputedStyle(panel, '').width) + dx)}px`;
}

panel.addEventListener("mousedown", function(e: MouseEvent){
  if (e.offsetX < BORDER_SIZE) {
    m_pos = e.x;
    document.addEventListener("mousemove", resize, false);
  }
}, false);

document.addEventListener("mouseup", function(){
    document.removeEventListener("mousemove", resize, false);
}, false);

let settingsButton: HTMLElement = strictQuerySelector('.settings-button');
let settingsPanel: HTMLElement = strictQuerySelector('.settings-panel');

settingsButton.addEventListener('click', () => {
    profilePanel.classList.remove('profile-panel-show');
    settingsPanel.classList.toggle('settings-panel-show');
})

let closeButton: HTMLElement = strictQuerySelector('.close-settings');

closeButton.addEventListener('click', () => {
    settingsPanel.classList.remove('settings-panel-show');
})

const checkbox: HTMLInputElement = strictQuerySelector('#flexSwitchCheckChecked');
checkbox.addEventListener('change', function() {
    const body = strictQuerySelector('body');
    if (checkbox.checked) {
        body.classList.remove('light')
        body.classList.add('dark')
    } else {
        body.classList.remove('dark')
        body.classList.add('light')
    }
})

let profileButton: HTMLElement = strictQuerySelector('.profile-button');
let profilePanel: HTMLElement = strictQuerySelector('.profile-panel');

profileButton.addEventListener('click', () => {
    settingsPanel.classList.remove('settings-panel-show');
    profilePanel.classList.toggle('profile-panel-show');
})
