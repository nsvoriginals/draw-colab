import express, { Request, Response } from "express";
import { middleware } from "./middleware.js";
import jwt from "jsonwebtoken";
import { CreateUserSchema } from "@repo/common/types";
// @ts-ignore
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/db";

const app = express();
app.use(express.json());

app.post("/signup", async (req, res ) => {
  // Validate the request body using Zod schema
  const data = CreateUserSchema.safeParse(req.body);

  // If validation fails, send an error response
  if (!data.success) {
    return res.status(400).json({
      message: "Invalid details",
      errors: data.error.errors, // Optional: Include validation errors
    });
  }

  try {
    // Create a new user in the database
    const user = await prismaClient.user.create({
      data: data.data, // Use the validated data
    });

    // Send a success response
    res.json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    // Handle database errors
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/signin", middleware, async (req, res) => {
  const userId = 123;
  const token = jwt.sign(
    { userId },
    JWT_SECRET
  );
  res.json({
    message: "signin",
    token,
  });
});

app.post("/room", middleware, async (req, res) => {
  res.json({ message: "room" });
});

app.listen(3008, () => {
  console.log("Server is running on port 3008");
});

