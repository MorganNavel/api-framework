import { Autowired } from "../decorator/autowired";
import { UserRepository } from "./user.repository";

export class UserService {
    @Autowired()
    private userRepository!: UserRepository;

    print(){
        console.log("test post");
    }
}