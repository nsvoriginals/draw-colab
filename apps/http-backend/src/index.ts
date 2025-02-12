import  express ,{Request , Response} from "express";
import { middleware } from "./middleware"
import jwt from 'jsonwebtoken'
import { CreateUserSchema } from "@repo/common/types";


const JWT_SECRET=require('@repo/backend-common')
const app=express();
app.use(express.json())
app.post("/signup", (req: Request, res: Response) => { 
    const data = CreateUserSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(400).json({
        message: "Invalid data"
      });
    }
    res.json({  
      message: JWT_SECRET
    });
  });


app.post("/signin",middleware,async (req,res)=>{
  const userId=123;
  const token=jwt.sign({
    userId
  },JWT_SECRET)
res.json({
    message:"signin"
})
})

app.post("/room",middleware,async (req,res)=>{
    res.json({message:"room"})
})



app.listen(3008,()=>{
    console.log("server is running")
})