import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");

    if (typeof payload === "string" || !("userId" in payload)) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = payload as { userId: number };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
