import { Base64, bytes2str, HMAC_hash_ext } from "./hash/hash";

interface JWT_Config {
    ttl?: number;
}

export class JWTManager {

    static signJWT(payload: Record<string, any>, secret: string, conf?: JWT_Config){
        const header = { alg: "HS256", typ: "JWT" };
        const headerB64 = Base64.toBase64URL(JSON.stringify(header));
        if (!payload["exp"] && conf?.ttl) {
            payload["exp"] = Math.floor(Date.now() / 1000) + conf.ttl;
        }
        
        const payloadB64 = Base64.toBase64URL(JSON.stringify(payload));
        

        const concat = `${headerB64}.${payloadB64}`;
        const sign = HMAC_hash_ext({ msg: concat, secret, algo: "sha256" });

        const signB64 = Base64.toBase64URL(sign);

        return `${concat}.${signB64}`;
    }


    static verifyJWT(token: string, secret: string){
        const parts = token.split(".");
        if(parts.length !== 3) return { valid: false, error: "Invalid token format" };
        const [headerB64, payloadB64, signB64] = parts;
        const signInput = `${headerB64}.${payloadB64}`;

        const sign = HMAC_hash_ext({ msg: signInput, secret, algo: "sha256" });
        // Check signatures
        if(Base64.toBase64URL(sign) !== signB64) return {valid: false, error: "Wrong Signature"};

        try {
            const payloadJSON = bytes2str(Base64.base64ToBytes(payloadB64));
            const payload = JSON.parse(payloadJSON);
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                return { valid: false, error: "Token Expired" };
            }
            return { valid: true, payload };
        } catch(e){
            return { valid: false, error: "Invalid payload" };
        }
    }
}