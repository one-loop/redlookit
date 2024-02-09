// To avoid risks of misunderstandings, we make it already explicit in the types that the code expects milliseconds.
type Milliseconds = number;
const API_URL = "https://thispersondoesnotexist.com"

// TimedTask
// \brief Wait a number of milliseconds then executes a task
// \description
//     Allows asynchronous execution of a task after a set number of milliseconds has passed
//     Provides getRemainingTime() to keep track of how long until the task starts
//     Gets used to space out calls to https://thispersondoesnotexist.com without having to think too much about it
class TimedTask {
    _finishTimeMS: Milliseconds = 0;
    _timeoutID: number = null;

    constructor(callback: (...unknown) => unknown, timeToWaitMS: Milliseconds) {
        const currentTime: Milliseconds = (new Date()).getTime();
        this._finishTimeMS = currentTime + timeToWaitMS;
        this._timeoutID = setTimeout(_ => callback(), timeToWaitMS);
    }

    // Possibly negative
    getRemainingTime(): Milliseconds {
        return this._finishTimeMS - (new Date()).getTime();
    }

    // noinspection JSUnusedGlobalSymbols
    cancel(): void {
        if (this._timeoutID) {
            clearTimeout(this._timeoutID);
        }
    }
}


// HumanFacesSideLoader
// \brief To preload pictures from https://thispersondoesnotexist.com
//     in the background & slowly build a backlog of them so that they can be instantly displayed
// \description
//     Provides: sideLoad()
//         The big strength is you can use sideLoad() in a loop, and it'll space out the queries for you
//     Provides: getFaces()
//         Access to all currently cached faces
export class HumanFacesSideLoader {
    _faces: HTMLImageElement[] = [];
    _promises: Promise<HTMLImageElement>[] = [];
    _tasks: TimedTask[] = [];
    _currentID: number = 0;
    timeBetweenRequestsMS: Milliseconds = 1000;
    timeout: Milliseconds = 3000;

    constructor(sideLoadNFaces: number = 0) {
        // This, the fact that we can just use a `for` loop, is the whole reason we went with this weird architecture
        // It's all asynchronous, the loop is non-blocking, and it makes the requests nicely queue up
        for (let i: number = 0; i < sideLoadNFaces; i++) {
            // noinspection JSIgnoredPromiseFromCall
            this.sideLoad().catch();
        }
    }

    async checkIsAPIOnline(timeout: Milliseconds = this.timeout): Promise<boolean> {
        // Query the API with fetch(), and set a timeout
        // The API does not allow Cross-Origin requests, so this query will never go through
        // But it WILL go on for 30+ seconds if the server is unreachable, and error out quickly if it is

        // If the timeout is spent, we consider the API is not available
        // If the request fails earlier, likely because of CORS, we consider the API to be available

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        return new Promise( (resolve, _) => {
            fetch(`${API_URL}?rng=${Math.random()}`, {
                "credentials": "omit",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0",
                    "Accept": "image/avif,image/webp,*/*",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Sec-Fetch-Dest": "image",
                    "Sec-Fetch-Mode": "no-cors",
                    "Sec-Fetch-Site": "cross-site",
                    "Pragma": "no-cache",
                    "Cache-Control": "no-cache"
                },
                "method": "GET",
                "mode": "cors",
                "signal": controller.signal
            }).then( _ => {
                resolve(true);
            }).catch( (error: Error) => {
                if (error.name === "AbortError") {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }).finally(() => {
                clearTimeout(id);
            });
        })
    }

    getLastTask(): TimedTask | null {
        if (this._tasks.length === 0) {
            return null;
        }

        return this._tasks[this._tasks.length-1]
    }

    getFaces(): HTMLImageElement[] {
        return this._faces;
    }

    async all(): Promise<HTMLImageElement[]> {
        return Promise.all<HTMLImageElement>(this._promises);
    }

    async sideLoad(): Promise<HTMLImageElement> {
        let timeToStart = 0; // Now

        // If one request is on the way, queue this one next
        const lastTask = this.getLastTask();
        if (lastTask !== null) {
            const remainingTime: number = Math.max(0, lastTask.getRemainingTime());
            timeToStart = remainingTime + this.timeBetweenRequestsMS;
            if (timeToStart < 0) { 
                timeToStart = 0;
            }

            // Queries always spaced out by at least 1000ms
            // If the query has 900ms left before it starts, this one starts 1900ms after
            // If the query is just running (so 0ms to go), it starts 1000ms after
            // If the query has been running for 100ms (so -100ms to go) it starts in 900ms
        }

        // This will all be executed post-return (asynchronously), once `timeToStart` amount of milliseconds have elapsed.
        const prom = new Promise<HTMLImageElement>( (resolve, reject) => {
            const id = this._currentID; // Make a local copy of the value otherwise it will have changed post-return

            const task = new TimedTask(() => {
                let ppElem = document.createElement("img");
                let timeoutTask: TimedTask;

                const onBoth = () => {
                    if (timeoutTask) {
                        timeoutTask.cancel();
                    }
                }
                const onSuccess = () => {
                    onBoth();
                    resolve(ppElem);
                    this._faces.push(ppElem)
                }
                const onError = () => {
                    onBoth();
                    ppElem.remove();
                    reject();
                }

                ppElem.src = `${API_URL}?cnh=${id}`;

                /* From now on this code is being executed while the picture is loading */



                // If loading the picture is taking too long
                timeoutTask = new TimedTask(() => {
                    // User doesn't expect his .then() callback to be entered after a timeout
                    // or his .catch() callback to be called a second time once the real request gets its error
                    ppElem.removeEventListener("load", onSuccess);
                    ppElem.removeEventListener("error", onError);

                    // Cancel the requests that are not yet on the way
                    for (const task of this._tasks) {
                        task.cancel();
                    }

                    // We assume the error state should probably be entered in the case of a timeout
                    // as if the timeout was a real network error
                    onError();
                }, this.timeout)

                // If loaded
                ppElem.addEventListener("load", onSuccess, {once: true, passive: true} /* (performance options) */);

                // If error
                ppElem.addEventListener('error', onError, {once: true, passive: true} /* (performance options) */);
            }, timeToStart);

            this._tasks.push(task);
        });

        this._currentID++;
        this._promises.push(prom);
        return prom;
    }
}