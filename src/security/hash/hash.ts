import { sha256, sha256_bytes } from "./sha"

export type HashAlgo = "sha256"
export function hash(value: string, algo: HashAlgo){
    switch(algo) {
        case "sha256": 
            return sha256(value);
    }
}
interface HMAC_Init {
    secret: string;
    msg: string;
    algo: HashAlgo;
}
interface HMAC_Config {
    secret: string;
    msg: string;
    hash: (input: string) => Uint8Array;
    blockSize: number
}

export function HMAC_hash_ext({ msg, secret, algo } : HMAC_Init) {
    switch(algo) {
        case "sha256" :
            return HMAC_hash({ 
                secret, 
                msg, 
                blockSize: 64, 
                hash: sha256_bytes
            });
        default:
            throw Error(`Hashing algorithm <${algo}> not implemented`);
    }

}


export function HMAC_hash({
    secret, 
    msg, 
    blockSize, 
    hash
} : HMAC_Config ){
    let s = str2bytes(secret);
    let K: Uint8Array = s.length > blockSize ? hash(secret) : s;
    if(K.length < blockSize){
        const padded = new Uint8Array(blockSize); // Init to blockSize (with 0)
        padded.set(K); // Add value of K with padded 0's
        K = padded;
    }

    let opad: Uint8Array = new Uint8Array(blockSize);
    let ipad: Uint8Array = new Uint8Array(blockSize);
    for (let i = 0; i < blockSize; i++) {
        opad[i] = K[i] ^ 0x5c;
        ipad[i] = K[i] ^ 0x36;
    }
    // inner = H((K' xor ipad) || msg)
    const innerMessage = new Uint8Array(ipad.length + str2bytes(msg).length);
    innerMessage.set(ipad);
    innerMessage.set(str2bytes(msg), ipad.length);

    const innerHash = hash(bytes2str(innerMessage));

    // outer = H((K' xor opad) || inner)
    const outerMessage = new Uint8Array(opad.length + innerHash.length);
    outerMessage.set(opad);
    outerMessage.set(innerHash, opad.length);

    return bytes2str(hash(bytes2str(outerMessage)));
}

export function str2bytes(str: string){
    return new TextEncoder().encode(str);
}
export function bytes2str(bytes: Uint8Array): string{
    return new TextDecoder().decode(bytes)
}
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}
export function hex2bytes(hex: string){
    let bytes : number[] = [];
    for(let i = 0; i<hex.length;i+=2){
        bytes.push(parseInt(hex.slice(i, i + 2), 16));
    }
}

export class Base64 {
    static readonly LUT = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    static str2base64(input: string){
        let res = "";
        let bitCount = 0;
        let bits = 0;
        for(let i = 0; i<input.length; i++){
            bits = ( bits << 8 ) | input.charCodeAt(i);
            bitCount += 8;
            while(bitCount > 6){
                bitCount -= 6;
                const code = (bits >> bitCount) & 0x3F;
                res += Base64.LUT[code];
            }
        }
        if (bitCount > 0) {
            const code = (bits << (6 - bitCount)) & 0x3F;
            res += Base64.LUT[code];
        }
        while(res.length % 4 !== 0) res += "=";
        return res;
    }
    static base64ToStr(input: string): string {
        let bits = 0;
        let bitCount = 0;
        let res = "";

        // Supprimer le padding '='
        input = input.replace(/=+$/, "");

        for (let i = 0; i < input.length; i++) {
            const val = Base64.LUT.indexOf(input[i]);
            if (val === -1) throw new Error("Base64 invalide");

            bits = (bits << 6) | val;
            bitCount += 6;

            if (bitCount >= 8) {
                bitCount -= 8;
                const charCode = (bits >> bitCount) & 0xFF;
                res += String.fromCharCode(charCode);
            }
        }

        return res;
    }
    static bytesToBase64(bytes: Uint8Array): string {
        let res = "";
        let bitCount = 0;
        let bits = 0;

        for (let i = 0; i < bytes.length; i++) {
            bits = (bits << 8) | bytes[i];
            bitCount += 8;

            while (bitCount >= 6) {
                bitCount -= 6;
                const code = (bits >> bitCount) & 0x3F;
                res += Base64.LUT[code];
            }
        }

        if (bitCount > 0) {
            const code = (bits << (6 - bitCount)) & 0x3F;
            res += Base64.LUT[code];
        }

        while (res.length % 4 !== 0) res += "=";
        return res;
    }
    static base64ToBytes(base64: string): Uint8Array {
        base64 = base64.replace(/=+$/, ""); // enlever le padding
        const bytes: number[] = [];
        let bits = 0;
        let bitCount = 0;

        for (let i = 0; i < base64.length; i++) {
            const val = Base64.LUT.indexOf(base64[i]);
            if (val === -1) throw new Error("Base64 invalide");

            bits = (bits << 6) | val;
            bitCount += 6;

            if (bitCount >= 8) {
                bitCount -= 8;
                bytes.push((bits >> bitCount) & 0xFF);
            }
        }

        return new Uint8Array(bytes);
    }

    static toBase64URL(str: string) : string {
        return this.str2base64(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
}

