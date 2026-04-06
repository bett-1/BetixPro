import type { NextFunction, Request, Response } from "express";

type OwnerResolver = (
  req: Request,
) => Promise<string | null | undefined> | string | null | undefined;

export function requireOwnership(resolveOwnerId: OwnerResolver) {
  return async function ownershipMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const ownerId = await resolveOwnerId(req);
      if (!ownerId) {
        return res.status(404).json({ message: "Resource not found" });
      }

      if (ownerId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
