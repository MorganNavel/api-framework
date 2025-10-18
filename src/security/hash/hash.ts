import { sha256 } from "./sha"

type HashAlgo = "sha256"
export function hash(value: string, algo: HashAlgo){
    switch(algo) {
        case "sha256": 
            return sha256(value);
    }

}

