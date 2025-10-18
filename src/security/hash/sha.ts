
export function sha256(input: string, toUpperCase = false) { 
    return rstr2hex(rstr_sha256(str2rstr_utf8(input)), toUpperCase); 
}

function rstr_sha256(input: string)
{
  return binb2rstr(sha256_aux(rstr2binb(input), input.length * 8));
}

export function sha256_bytes(input: string): Uint8Array {
  const bytes = str2rstr_utf8(input).split("").map(c => c.charCodeAt(0));
  const words = rstr2binb(String.fromCharCode(...bytes));
  const hashWords = sha256_aux(words, bytes.length * 8);

  const output = new Uint8Array(32); // SHA-256 = 32 octets
  for (let i = 0; i < 8; i++) {
    output[i * 4] = (hashWords[i] >>> 24) & 0xff;
    output[i * 4 + 1] = (hashWords[i] >>> 16) & 0xff;
    output[i * 4 + 2] = (hashWords[i] >>> 8) & 0xff;
    output[i * 4 + 3] = hashWords[i] & 0xff;
  }

  return output;
}

/*
 * Convert a raw string to an array of big-endian words
 * Characters >255 have their high-byte silently ignored.
 */
function rstr2binb(input: string) : number[] {
    let output = Array(input.length >> 2);
    for(let i = 0; i < output.length; i++)
        output[i] = 0;
    for(let i = 0; i < input.length * 8; i += 8)
        output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
    return output;
}
/*
 * Convert an array of big-endian words to a string
 */
function binb2rstr(input: number[])
{
  var output = "";
  for(var i = 0; i < input.length * 32; i += 8)
    output += String.fromCharCode((input[i>>5] >>> (24 - i % 32)) & 0xFF);
  return output;
}

function str2rstr_utf8(input: string){
    let res = "";
    let i = -1;
    while(++i < input.length){
        let code = input.charCodeAt(i);
        let nextCode = i+1 < input.length ? input.charCodeAt(i+1) : 0;
        if(0xD800 <= code && code <= 0xDBFF && 0xDC00 <= nextCode && nextCode <= 0xDFFF){ // utf-16 pairs
            code = 0x10000 + ((code & 0x03FF) << 10) + (nextCode & 0x03FF);
            i++;
        }
        /* Encode output as utf-8 */
        if(code <= 0x7F)
            res += String.fromCharCode(code);
        else if(code <= 0x7FF)
            res += String.fromCharCode(0xC0 | ((code >>> 6 )    & 0x1F),
                                            0x80 | ( code         & 0x3F));
        else if(code <= 0xFFFF)
            res += String.fromCharCode(0xE0 | ((code >>> 12)    & 0x0F),
                                            0x80 | ((code >>> 6 ) & 0x3F),
                                            0x80 | ( code         & 0x3F));
        else if(code <= 0x1FFFFF)
            res += String.fromCharCode(0xF0 | ((code >>> 18)    & 0x07),
                                            0x80 | ((code >>> 12) & 0x3F),
                                            0x80 | ((code >>> 6 ) & 0x3F),
                                            0x80 | ( code         & 0x3F));
    }
    return res;
}

function str_16_2bin(input: string): bigint {
    let res = 0n;
    for(let i = 0; i<input.length;i++){
        let code = input.charCodeAt(i);
        if (0xD800 <= code && code <= 0xDBFF && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (0xDC00 <= low && low <= 0xDFFF) {
                code = ((code - 0xD800) << 10) + (low - 0xDC00) + 0x10000;
                i++;
            }
        }
        res =(res << 16n) | BigInt(code);
    }
    return res;
}
function str_32_2bin(input: string): bigint {
    let res = 0n;
    for(const char of input){
        res = (res << 32n) | BigInt(char.codePointAt(0)!);
    }
    return res;
}
function rstr2hex(input: string, toUpperCase = false){
    var hex_LUT = toUpperCase ? "0123456789ABCDEF" : "0123456789abcdef";
    var output = "";
    var x;
    for(let i = 0; i < input.length; i++){
        x = input.charCodeAt(i);
        /*
        * x = 1100 1010
        * x >> 4 = 1100 (shift of 4 bits)
        * (x >> 4) & 0xF = 0000 1100
        */
        output += hex_LUT.charAt((x >>> 4) & 0xF) + hex_LUT.charAt(x  & 0xF);   
    }
    return output;
}


const sha256_K = new Array
(
  1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993,
  -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
  1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
  264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
  -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
  113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
  1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885,
  -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
  430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
  1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872,
  -1866530822, -1538233109, -1090935817, -965641998
);


const sha256_Ch = (x: number, y: number, z: number) : number =>  (x & y) ^ (~x & z);
const sha256_Maj = (x: number, y: number, z: number) : number => (x & y) ^ (x & z) ^ (y & z);
const sha256_Rot = (X: number, n: number): number => ((X >>> n) | (X << (32 - n)));
const sha256_Shift = (X: number, n: number) => X >>> n;

const sha256_Sigma0256 = (X: number) => sha256_Rot(X,2) ^ sha256_Rot(X,13) ^ sha256_Rot(X,22); // Σ0
const sha256_Sigma1256 = (X: number) => sha256_Rot(X,6) ^ sha256_Rot(X,11) ^ sha256_Rot(X,25); // Σ1

const sha256_sigma0256 = (X: number) => sha256_Rot(X,7) ^ sha256_Rot(X,18) ^ sha256_Shift(X,3); // σ0
const sha256_sigma1256 = (X: number) => sha256_Rot(X,17) ^ sha256_Rot(X,19) ^ sha256_Shift(X,10); // σ1

function safe_add (x: number, y: number) : number {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

function toUint32(x: number): number {
    return x >>> 0; // force la conversion en unsigned 32-bit
}

/**
 * 
 * @param m array containing words of 32 bits
 * @param l 
 * @returns 
 */
function sha256_aux(m: number[], l: number): number[] {
    let H = new Array(1779033703, -1150833019, 1013904242, -1521486534,
                       1359893119, -1694144372, 528734635, 1541459225);
    // Add a bit then fill with 0 until I get 64 bits left
    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >> 9) << 4) + 15] = l;
    let W = new Array(64);
    let a, b, c, d, e, f, g, h;
    let T1, T2;
    for(let i = 0; i < m.length;i+=16){
        a = H[0];
        b = H[1];
        c = H[2];
        d = H[3];
        e = H[4];
        f = H[5];
        g = H[6];
        h = H[7];


        for(let j = 0; j<64;j++){
            if(j<16) W[j] = m[j+i];
            else W[j] = safe_add(safe_add(safe_add(sha256_sigma1256(W[j - 2]), W[j - 7]),
                                            sha256_sigma0256(W[j - 15])), W[j - 16]);
            T1 = safe_add(safe_add(safe_add(safe_add(h, sha256_Sigma1256(e)), 
                                            sha256_Ch(e, f, g)), sha256_K[j]), W[j]);

            T2 = safe_add(sha256_Sigma0256(a), sha256_Maj(a,b,c));
            h = g;
            g = f;
            f = e;
            e = safe_add(d, T1);
            d = c;
            c = b;
            b = a;
            a = safe_add(T1, T2); 
        }
        
        H[0] = safe_add(a, H[0]);
        H[1] = safe_add(b, H[1]);
        H[2] = safe_add(c, H[2]);
        H[3] = safe_add(d, H[3]);
        H[4] = safe_add(e, H[4]);
        H[5] = safe_add(f, H[5]);
        H[6] = safe_add(g, H[6]);
        H[7] = safe_add(h, H[7]);   
    }

    return H
}







    
    
