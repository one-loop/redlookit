import "../styles/redlookit.css"
import "./@types/reddit-types.ts"
import { HumanFacesSideloader } from "./faces_sideloader"
import { Random, UUID, UUIDFormat } from "./random";
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

const rng = new Random();

type Permalink = string;
function showRedditLink(permalink: Permalink): boolean {
    const postMatch = permalink.match(/\/?r\/([^/]+?)\/comments\/([^/]+)/);
    if (isDebugMode()) console.log("postMatch", postMatch);

    if (postMatch !== null) {
        // The anchor points to a post
        showSubreddit(postMatch[1]);
        clearPost();
        showPost(permalink);
        return true;
    } else {
        const subMatch = permalink.match(/\/?r\/([^/]+)/);
        if (isDebugMode()) console.log("subMatch", subMatch);

        if (subMatch !== null) {
            // The anchor points to a sub
            showSubreddit(subMatch[1]);
            return true;
        } else {
            // The anchor points to something weird
            return false;
        }
    }
}

function showRedditPageOrDefault(permalink: Permalink | null) {
    if (isDebugMode()) console.log("interpreting link", permalink);
    if (permalink === null) {
        // We don't have an anchor in the URL
        showSubreddit("popular");
        if (isDebugMode()) {
            showPost(`/r/test/comments/z0yiof/formatting_test/`);
        }
    } else {
        // We have an anchor in the URL
        const itWorked = showRedditLink(permalink);
        if (itWorked === false) {
            // The anchor pointed to something we do not support
            showSubreddit("popular");
        }
    }

}

function showSubreddit(subreddit: string) {
    clearPostsList();
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

function showPost(permalink: Permalink) {
    const baseurl = removeTrailingSlash(new URL(`${redditBaseURL}${permalink}`));
    const url = `${baseurl}/.json?limit=75`;
    return axios.get(url).then((response) => {
        try {
            clearPost();
            showPostFromData(response);
        } catch (e) {
            console.error(e)
        }
    }).catch((e) => {
        console.error(e)
    });
}

function permalinkFromURLAnchor(): Permalink | null {
    // Capture the '/r/sub/...' part including the /r/
    const permalink = new URL(document.URL).hash
    if (permalink === "") {
        return null;
    }

    // Remove the starting #
    return permalink.slice(1);
}

function removeTrailingSlash(url: URL): URL {
    if (url.pathname.substr(-1) === '/') {
        url.pathname = url.pathname.slice(0,-1);
        return url;
    } else {
        return url;
    }
}

function setURLAnchor(permalink: Permalink, pushState: boolean = true): void {
    const url = removeTrailingSlash(new URL(document.URL));
    const newurl = new URL(`${url.protocol}//${url.hostname}${url.pathname}#${permalink}`);
    window.history.pushState({}, '', newurl);
}

function displayPosts(responses) {
    for (let response of responses) {
        let section: HTMLButtonElement = document.createElement('button');
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
            document.querySelector(".focused-post")?.classList.remove("focused-post");
            section.classList.add("focused-post");
            setURLAnchor(response.data.permalink);
            showPost(response.data.permalink);
        })
        postsList.append(section);
    }
    postsList.append("That's enough reddit for now. Get back to work!")
}

type CommentBuilderOptions = {indent: number, ppBuffer: HTMLImageElement[], post: Permalink};

function displayCommentsRecursive(parentElement: HTMLElement, listing: ApiObj[],  {post, indent=0, ppBuffer=[]}: CommentBuilderOptions) {
    if (listing.length === 0) {
        return;
    }

    for (const redditObj of listing) {
        // At the end of the list reddit adds a "more" object
        if (redditObj.kind === "t1") {
            // kind being t1 assures us listing[0] is a SnooComment
            const comment: SnooComment = redditObj as SnooComment;
            const commentElement = document.createElement("div");
            if (indent > 0) {
                commentElement.classList.add('replied-comment');
            }

            parentElement.appendChild(commentElement);
            const prom: Promise<HTMLElement> = createComment(comment, {ppBuffer: ppBuffer, domNode: commentElement})

            if (comment.data.replies) {
                displayCommentsRecursive(commentElement, comment.data.replies.data.children, {
                    indent: indent + 10, 
                    ppBuffer: ppBuffer,
                    post: post
                });
            }

            if (indent === 0) {
                parentElement.appendChild(document.createElement('hr'));
            }
        } else if (redditObj.kind === "more" && post !== undefined) {
            const data = redditObj as MoreComments;
            const moreElement = document.createElement("span");
            moreElement.classList.add("btn-more");
            
            // Fetch the parent of the "more" listing
            const parentLink = `${redditBaseURL}${post}${data.data.parent_id.slice(3)}`;
            /*
                // We used to fetch the comment directly listed by the "more" listing aka data.data.id
                // But sometimes 'id' was '_' and no children were listed (despite the fact that there was several on the actual website)
                // If you go back 1 step in the tree to the parent and circle back to the children this way, however, you 
                //   get around the bug and the children get properly listed
                // Couldn't tell you why.

                // If you wish to see the behavior in action, enable this piece of code
                if (data.data.children.length === 0) {
                    if (isDebugMode()) console.log("Empty 'more' object?", redditObj);
                    moreElement.style.backgroundColor = "#ff0000";
                }
            */
            
            moreElement.addEventListener("click", () => {
                moreElement.classList.add("waiting");
                fetch(`${parentLink}.json`)
                    .catch((e) => {
                        moreElement.classList.remove("waiting");
                        console.error(e);
                    })
                    .then((response: Response) => { 
                        return response.json()
                    })
                    .catch((e) => {
                        console.error(e);
                    })
                    .then((data: ApiObj[]) => {
                        if (isDebugMode()) console.log("Got data!", parentLink, data);
                        moreElement.remove();

                        // Our type definitions aren't robust enough to go through the tree properly
                        // We just cop out. Cast as `any` and try/catch.
                        let replies: Listing<SnooComment>;
                        try {
                            replies = (data as any)[1].data.children[0].data.replies.data
                        } catch (e) {
                            return Promise.reject(e);
                        }

                        displayCommentsRecursive(parentElement, replies.children, {
                            indent: indent + 10,
                            ppBuffer: ppBuffer,
                            post: post
                        });
                        return Promise.resolve();
                    });
            });
            parentElement.appendChild(moreElement);
        }
    }
}

function displayComments(commentsData, {post}: {post: Permalink}) {
    postSection.classList.add('post-selected');
    postSection.classList.remove('deselected');

    const stableInTimeFaceBuffer = facesSideloader.getFaces().slice(0); // Stable-in-time copy of the full array
    displayCommentsRecursive(postSection, commentsData, { indent: 0, ppBuffer: stableInTimeFaceBuffer, post: post});
}

function showPostFromData(response: ApiObj) {
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
        selftext.classList.add("usertext");
        postSection.append(selftext);
    }
    if (response.data[0].data.children[0].data.is_self === false && response.data[0].data.children[0].data.is_reddit_media_domain === false) {
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

    displayComments(comments, { post: response.data[0].data.children[0].data.permalink });
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

async function generateGnomePic(commentData: SnooComment): Promise<HTMLImageElement> {
    const gnome = document.createElement<"img">("img");
    gnome.classList.add("gnome");

    // Potential Hmirror 
    const flipSeed = await rng.random();
    const flip = flipSeed <= 0.5 ? "scaleX(-1) " : "";

    // +Random rotation between -20deg +20deg
    const mirrorSeed = await rng.random();
    const transforms = `${flip}rotate(${Math.round(mirrorSeed * 40 - 20)}deg) `;
    gnome.style.transform = transforms;
    
    const colorSeed = await rng.random();
    gnome.style.backgroundColor = colors[Math.floor(colorSeed * colors.length)];

    return gnome;
}

async function generateTextPic(commentData: SnooComment, size: number): Promise<HTMLSpanElement> {
    const textPic = document.createElement<"span">("span");

    const pseudoRand1 = await rng.random(0, initials.length-1);
    const pseudoRand2 = await rng.random(0, initials.length-1);
    const ppInitials = initials[Math.round(pseudoRand1)] + initials[Math.round(pseudoRand2)];

    textPic.style.padding = `${Math.round(0.12 * size)}px 3px 3px 3px`;
    textPic.style.fontSize = `${Math.round(size / 2.08)}px`;
    textPic.style.fontWeight = "bold";
    textPic.style.textAlign = "center";
    textPic.style.display = "inline-block";
    textPic.style.cssText += "-webkit-touch-callout: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;";

    const colorSeed = await rng.random(0, colors.length-1);
    textPic.style.backgroundColor = colors[Math.round(colorSeed)];
    
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
        try {
            ctx.drawImage(origin, 0, 0, newSize * 2, newSize * 2);
        } catch (e) {
            console.error(origin, e);
        }
        
        return canv;
    } else {
        return null;
    }
}

async function generateFacePic(commentData: SnooComment, ppBuffer: HTMLImageElement[], displaySize: number = 50): Promise<HTMLCanvasElement> {
    const imageSeed = Math.round(await rng.random(0, ppBuffer.length-1));
    const imageElement: HTMLImageElement = ppBuffer[imageSeed];

    // Purpose of copying: A single <img> tag cannot be in multiple spots at the same time
    // I did not find a way to duplicate the reference to an img tag 
    // If you use Element.appendChild with the same reference multiple times, the method will move the element around
    // Creating a new <img> tag and copying the attributes would work, but it would fetch the src again
    // The image at thispersondoesnotexist changes every second so the src points to a new picture now
    // Since the URL has a parameter and hasn't changed, then most likely, querying the URL again would
    //     hit the browser's cache. but we can't know that.
    // Solution: make a canvas and give it the single <img> reference. It makes a new one every time. It doesn't query the src.
    const canv = copyImage2Canvas(imageElement, displaySize);
    assert(canv !== null, `generateFacePic couldn't get a canvas 2D context from image #${imageSeed}, ${imageElement.src} (img.${Array.from(imageElement.classList).join(".")})`);

    canv.classList.add(`human-${imageSeed}`);
    return canv;
}

type HTMLProfilePictureElement = HTMLCanvasElement | HTMLImageElement | HTMLSpanElement;
async function createProfilePicture(commentData: SnooComment, size: number = 50, ppBuffer: HTMLImageElement[] = []): Promise<HTMLProfilePictureElement> {
    async function helper(): Promise<HTMLProfilePictureElement> {
        if (commentData.data.subreddit === "gnometalk") {
            return generateGnomePic(commentData);
        } else {
            // 0-10  => 0
            // 10-25 => Between 0 and 0.7
            // 25+   => 0.7
            // Don't replace this with a formula filled with Math.min(), 
            //    divisions and substractions, this is meant to be readable for a beginner
            const chanceForAFacePic = (() => {
                if (ppBuffer.length < 10) {
                    return 0;
                } else {
                    const baseValue = 0.7; // Max .7

                    // What percentage of progress are you between 10 and 25
                    if (ppBuffer.length >= 25) {
                        return baseValue;
                    } else {
                        return ((ppBuffer.length - 10)/15)*baseValue;
                    }
                }
            })();

            if ((await rng.random()) < chanceForAFacePic) {
                return generateFacePic(commentData, ppBuffer);
            } else {
                return generateTextPic(commentData, size);
            }
        }
    }

    const ppElem: HTMLProfilePictureElement = await helper();

    ppElem.classList.add("avatar")
    ppElem.style.marginRight = "10px";
    if (!ppElem.classList.contains("avatar-circle")) {
        ppElem.classList.add("avatar-circle");
    }
    return ppElem;
}

type CreateCommentOptions = {
    ppBuffer: HTMLImageElement[],
    domNode?: HTMLElement
};
async function createComment(commentData: SnooComment, options: CreateCommentOptions={ppBuffer: []}): Promise<HTMLElement> {
    if (options.domNode === undefined) {
        options.domNode = document.createElement('div');
    }
    options.domNode.id = commentData.data.id;
    options.domNode.classList.add("usertext");
    options.domNode.classList.add("comment");

    // Author parent div
    const author = document.createElement('div');
    author.classList.add("author")
    author.style.display = "flex";

    await rng.setSeed(commentData.data.author);
    
    // Placeholder pic
    const ppSize = 50; //px
    const pfpPlaceHolder = document.createElement<"span">("span");
    pfpPlaceHolder.style.width = pfpPlaceHolder.style.height = `${ppSize}px`;
    author.appendChild(pfpPlaceHolder);

    // Real Profile pic
    createProfilePicture(commentData, ppSize, options.ppBuffer).then( (generatedPfp) => {
        author.replaceChild(generatedPfp, pfpPlaceHolder);
    });

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
        
        // Email addresses are composed of uuids and hide the score within the first block
        const format: UUIDFormat = [
            { n: 8, charset: "alpha" }, // // First section is only letters to avoid ambiguity on the score
            { n: 4, charset: "alphanumerical" },
            { n: 4, charset: "alphanumerical" },
            { n: 4, charset: "alphanumerical" },
            { n: 12, charset: "alphanumerical" }
        ];
        rng.randomUUID(format).then((uuid: UUID) => {
            const slicedUUID = uuid.slice(scoreLength); // Remove a bunch of letters from the start

            // We overwrite the 1st section with the comment's score
            authorTextInfo.innerHTML = `${commentData.data.author} <${commentData.data.score}${slicedUUID}@securemail.org>`;
        })
        authorText.append(authorTextInfo);

        // Sent date
        let d = new Date(commentData.data.created_utc*1000);
        const dateDiv = document.createElement("span");
        dateDiv.classList.add("comment-posted-date")
        dateDiv.innerHTML = d.toString().slice(0,21);
        dateDiv.style.color = "#a2a2a2";
        dateDiv.style.fontSize = "0.85em";
        authorText.append(dateDiv);
    }
    author.append(authorText);

    const commentText = document.createElement('div');
    commentText.insertAdjacentHTML('beforeend', decodeHtml(commentData.data.body_html));

    options.domNode.prepend(author, commentText);
    return options.domNode
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
        if (isDebugMode()) console.log("custom sub click", subredditBtn.id);
        setURLAnchor(`/r/${subredditBtn.id}`);
        showSubreddit(subredditBtn.id);
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
        if (isDebugMode()) console.log("default sub click", subreddit.id);
        setURLAnchor(`/r/${subreddit.id}`);
        clearPost();
        showSubreddit(subreddit.id);
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
    if (isDebugMode()) console.log("inbox click", "/r/popular");
    setURLAnchor("/r/popular");
    clearPost();
    showSubreddit('popular');
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

window.addEventListener("hashchange", () => {
    clearPost();
    const permalink = permalinkFromURLAnchor();
    if (isDebugMode()) console.log(`history buttons clicked`, permalink);
    showRedditPageOrDefault(permalink);
});

let profileButton: HTMLElement = strictQuerySelector('.profile-button');
let profilePanel: HTMLElement = strictQuerySelector('.profile-panel');

profileButton.addEventListener('click', () => {
    settingsPanel.classList.remove('settings-panel-show');
    profilePanel.classList.toggle('profile-panel-show');
})

// Everything set up.
// We start actually doing things now

if (isDebugMode()) {
    // Remove loading screen
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
        loadingScreen.style.display = "none";
    }
}

const permalink = permalinkFromURLAnchor();
showRedditPageOrDefault(permalink);