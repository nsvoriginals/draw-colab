import express, { Request, Response } from "express";
import { middleware } from "./middleware.js";
import jwt from "jsonwebtoken";
import { CreateUserSchema,CreateRoomSchema} from "@repo/common/types";

// @ts-ignore
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/db";

const app = express();
app.use(express.json());

app.post("/signup", async (req:Request, res:Response ) => {
  
  const data = CreateUserSchema.safeParse(req.body);

  if (!data.success) {
     res.status(400).json({
      message: "Invalid details",
      errors: data.error.errors, 
    });
  }

  try {
  
    const user = await prismaClient.user.create({
      data: data.data, 
    });


    res.json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/signin", async (req: Request, res: Response) => {
  const { name, password } = req.body;

  const user = await prismaClient.user.findFirst({
    where: { name },
  });

  if (!user || user.password !== password) {
     res.status(401).json({ message: "Invalid credentials" });
     return ;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  
  res.json({
    message: "Signin successful",
    token,
  });
});

app.post("/room", middleware, async (req, res) => {
  const parsedData=CreateRoomSchema.safeParse(req.body);
  if(!parsedData.success){
    res.json({
      message:"Incorrect inputs"
    })
    return;
  }
  //@ts-ignore
   const userId=req.userId;
   await prismaClient.room.create({
    data:{
      slug:parsedData.data.name,
      adminId:userId
    }
   })
});

app.listen(3008, () => {
  console.log("Server is running on port 3008");
});

