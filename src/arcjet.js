import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const ARCJET_KEY = process.env.ARCJET_KEY;
const ARCJET_MODE = process.env.ARCJET_MODE === "DRY_RUN" ? "DRY_RUN" : "LIVE";
if (!ARCJET_KEY)
  throw new Error("ARCJET_KEY is required in environment variables");

const httpArcjet = ARCJET_KEY
  ? arcjet({
      key: ARCJET_KEY,
      rules: [
        shield({ mode: ARCJET_MODE }),

        detectBot({
          mode: ARCJET_MODE,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),

        slidingWindow({
          mode: ARCJET_MODE,
          interval: "10s",
          max: 50,
        }),
      ],
    })
  : null;

const wsArcjet = ARCJET_KEY
  ? arcjet({
      key: ARCJET_KEY,
      rules: [
        shield({ mode: ARCJET_MODE }),

        detectBot({
          mode: ARCJET_MODE,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),

        slidingWindow({
          mode: ARCJET_MODE,
          interval: "2s",
          max: 5,
        }),
      ],
    })
  : null;

export function securityMiddleware() {
  return async (req, res, next) => {
    if (!httpArcjet) return next();

    try {
      const decision = await httpArcjet.protect(req);

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          res.status(429).json({ error: "Too many requests" });
        }
        return res.status(403).json({ error: "Access denied / forbidden" });
      }
    } catch (error) {
      console.error("Error in Arcjet middleware:", error);
      res.status(503).json({ error: "Internal Server Error" });
    }

    next();
  };
}

export { httpArcjet, wsArcjet };
