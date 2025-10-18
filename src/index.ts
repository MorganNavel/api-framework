import { JWTManager } from "./security/jwt";

// App.run();
const token = JWTManager.signJWT({
    user: {
        firstname: "Jhon",
        lastname: "Doe",
        age: 22    
    },
    role: "admin"
}, "secret", { ttl: 0 });

console.log(token);
const res = JWTManager.verifyJWT(token, "secret");
console.log(res.valid ? 'Token is valid': res.error);
if(res.valid) console.log(res.payload);
