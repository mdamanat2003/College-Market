import jwt from "jsonwebtoken";
import { Response } from "express";

const generateToken = (res: Response, userId: string) => {
  // .env file me JWT_SECRET zaroor hona chahiye
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || "supersecretkey", {
    expiresIn: "30d", // Token 30 din tak chalega
  });

  return token;
};

export default generateToken;