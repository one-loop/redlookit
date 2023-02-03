// TimedTask
// \brief Wait a number of milliseconds then executes a task
// \description
//     Allows asynchronous execution of a task after a set number of milliseconds has passed
//     Provides getRemainingTime() to keep track of how long until the task starts
//     Gets used to space out calls to https://thispersondoesnotexist.com without having to think too much about it
type Milliseconds = number;
class TimedTask {
    finishTimeMS: Milliseconds = 0;
    id: number = -1;
    constructor(callback:Function, timeToWaitMS:Milliseconds) {
        const currentTime: Milliseconds = (new Date()).getTime();
        this.finishTimeMS = currentTime + timeToWaitMS;
        this.id = setTimeout(callback, timeToWaitMS);
    }

    // Possibly negative
    getRemainingTime(): Milliseconds {
        return this.finishTimeMS - (new Date()).getTime();
    }

    cancel(): void {
        clearTimeout(this.id);
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
    faces: HTMLImageElement[] = [];
    promises: Promise<HTMLImageElement>[] = [];
    lastTask: TimedTask | null = null;
    currentID: number = 0;
    throttleMS: Milliseconds = 1000;

    constructor(sideLoadNFaces: number = 0) {
        for (let i: number = 0; i < sideLoadNFaces; i++) {
            // noinspection JSIgnoredPromiseFromCall
            this.sideLoad();
        }
    }

    getFaces(): HTMLImageElement[] {
        return this.faces;
    }

    async all(): Promise<HTMLImageElement[]> {
        return Promise.all<HTMLImageElement>(this.promises);
    }

    async sideLoad(): Promise<HTMLImageElement> {
        let timeToStart = 0; // Now

        // If one request is on the way, queue this one next
        if (this.lastTask !== null) {
            const remainingTime: number = Math.max(0, this.lastTask.getRemainingTime());
            timeToStart = remainingTime + this.throttleMS;
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
            const id = this.currentID; // Make a copy to fix the value at the start time

            this.lastTask = new TimedTask( () => {
                let ppElem = document.createElement("img");
                ppElem.src = `https://thispersondoesnotexist.com/image?cnh=${id}`;
                // If loaded
                ppElem.addEventListener("load", () => {
                    // A delay is added because the random faces change every ~second on thispersondoesnotexist
                    // ?cnh=... (cdn=clamped name hash) is added to avoid browser caching if pic is queried >1 second apart
                    // (otherwise you just bring up the same image over and over again regardless of whether it has changed or not on the back end)

                    this.faces.push(ppElem)
                    resolve(ppElem);
                }, {once: true, passive: true} /* (performance options) */);

                // If error
                ppElem.addEventListener('error', () => {
                    reject();
                }, {once: true, passive: true} /* (performance options) */);
            }, timeToStart);
        });

        this.currentID++;
        this.promises.push(prom);
        return prom;
    }
}