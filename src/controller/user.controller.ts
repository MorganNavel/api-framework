import { Autowired } from "../decorator/autowired";
import { Controller, Get, Post } from "../decorator/controller";
import { HttpRequest } from "../request";
import { HttpResponse } from "../response";
import { UserService } from "../service/user.service";

@Controller("/user")
export class UserController {
    @Autowired()
    private userService!: UserService;

    @Get("/")
    getUser(req: HttpRequest, res: HttpResponse){
        res.status(200).json(
            {
                user: {
                    id: 1,
                    name: "Morgan",
                    age: 22
                }
            }
        );
    }



    @Post("/:id")
    createUser(req: HttpRequest, res: HttpResponse){
        const { name } = req.body;
        
        res.status(200).json({
            id: 1,
            name
        });
    }
}