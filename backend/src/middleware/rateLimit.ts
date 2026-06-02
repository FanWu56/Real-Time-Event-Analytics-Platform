import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./apiKeyAuth";

type RateLimitRecord = {
  count: number;
  windowStart: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

export function rateLimitByApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.apiKey;

  if (!apiKey) {
    res.status(500).json({
      error: "API key missing before rate limiting",
    });
    return;
  }

  const now = Date.now();
  const currentRecord = rateLimitStore.get(apiKey);

  if (!currentRecord) {
    rateLimitStore.set(apiKey, {
      count: 1,
      windowStart: now,
    });

    next();
    return;
  }

  const windowExpired = now - currentRecord.windowStart > WINDOW_MS;

  if (windowExpired) {
    rateLimitStore.set(apiKey, {
      count: 1,
      windowStart: now,
    });

    next();
    return;
  }

  if (currentRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil(
      (WINDOW_MS - (now - currentRecord.windowStart)) / 1000
    );

    res.status(429).json({
      error: "Rate limit exceeded",
      limit: MAX_REQUESTS_PER_WINDOW,
      windowSeconds: WINDOW_MS / 1000,
      retryAfterSeconds,
    });
    return;
  }

  currentRecord.count += 1;
  rateLimitStore.set(apiKey, currentRecord);

  next();
}