import { Autowired } from "../decorator/autowired";
import { UserRepository } from "../repository/user.repository";

export class UserService {
    @Autowired()
    private userRepository!: UserRepository;

    print(){
        console.log("test post");
    }
}