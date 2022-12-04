// Proportionally map a point from a range [a,b[ to a new range [c,d[ (linear cross product)
function map(current: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
    return ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

// Binds a number between a lower bound and a higher bound
function clamp(input: number, min: number, max: number): number {
    // if (i < min) min
    // if (i > max) max
    // else i
    return Math.min(Math.max(input, min), max);
}


type CharsetSequence = {
    n: number,
    charset: "alpha" | "alphanumerical",
}
type UUIDFormat = CharsetSequence[];
type UUID = string;



// Random Number Generator that always generates the same numbers in the same order for a given seed
// Uses the browser's crypto lib. SHA-1 based. Limited to 8 bits of entropy (although could be fixable)
class Random {
    seed: string | undefined;
    hash: number[] | undefined;
    i: number = 0;
    salt: number = 0;
    
    static alphabets = {
        alphanumerical: "abcdefghijklmnopqrstuvwxyz0123456789",
        alpha: "abcdefghijklmnopqrstuvwxyz"
    };

    constructor() {   
    }

    async randomUUID(format: (UUIDFormat | undefined) = undefined): Promise<UUID> {
        if (format === undefined) {
            format = [
                { n: 8, charset: "alphanumerical" },
                { n: 4, charset: "alphanumerical" },
                { n: 4, charset: "alphanumerical" },
                { n: 4, charset: "alphanumerical" },
                { n: 12, charset: "alphanumerical" }
            ];
        }
        // Generate uuids with format ehd0wgw2-g11e-xgiq-nc9m-h2kva3tmrzpl by default
        
        let result = "";
        for (let i = 0; i < format.length; i++) {
            const length = format[i].n;
            // Choose alphabet
            const characters = Random.alphabets[format[i].charset];

            // Generate characters
            for (let j = 0; j < length; j++) {
                let rand = await this.random(0, characters.length-1);
                result += characters.charAt(Math.round(rand));
            }
            result += "-";
        }
        return Promise.resolve(result.slice(0, -1)) as Promise<UUID>;
    }

    async setSeed(seed: string): Promise<void> {
        const encoder = new TextEncoder();
        const data = encoder.encode(seed);
        const hash = await crypto.subtle.digest('SHA-1', data);
        this.hash = Array.from(new Uint8Array(hash));
        this.seed = seed;
        this.i = 0;
        this.salt = 0;

        return Promise.resolve();
    }

    async random(min: number = 0, max: number = 1): Promise<number> {
        if (this.hash === undefined) {
            return Promise.reject(new Error("Seed is blank. Have you called setSeed() before random()?"));
        }

        if (max-min > 255) {
            return Promise.reject(new Error("This random number generator cannot comfortably produce numbers for ranges greater than 8 bits of entropy (ranges containing >256 numbers)"));
        }
        
        if (this.i >= this.hash.length) {
            this.i = 0;
            this.salt++;
            await this.setSeed(this.seed + this.salt.toString());
        }

        return Promise.resolve(map(this.hash[this.i++], 0, 255, min, max));
    }
}