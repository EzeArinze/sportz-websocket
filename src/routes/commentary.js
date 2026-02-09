import { Router } from "express";
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
} from "../validation/commentary.js";
import { db } from "../db/db.js";
import { commentary } from "../db/schema.js";
import { matchIdParamSchema } from "../validation/matches.js";
import { desc, eq } from "drizzle-orm";

export const commentaryRouter = Router({ mergeParams: true });
const MAX_LIMIT = 100;

commentaryRouter.get("/", async (req, res) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid match ID.", details: paramsResult.error.issues });
  }

  const queryResult = listCommentaryQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    return res.status(400).json({
      error: "Invalid commentary query parameters.",
      details: queryResult.error.issues,
    });
  }

  try {
    const { limit = 10 } = queryResult.data;
    const { id: matchId } = paramsResult.data;

    const limitValue = Math.min(limit, MAX_LIMIT);

    const commentaryList = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(limitValue);

    res.status(200).json({ commentary: commentaryList });
  } catch (error) {
    console.error("Error fetching commentary:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      message: "Failed to fetch commentary",
      error: errorMessage,
    });
  }
});

commentaryRouter.post("/", async (req, res) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid match ID.", details: paramsResult.error.issues });
  }

  const bodyResult = createCommentarySchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      error: "Invalid commentary payload.",
      details: bodyResult.error.issues,
    });
  }

  try {
    const { data } = bodyResult;
    const {
      data: { id: matchId },
    } = paramsResult;

    const [event] = await db
      .insert(commentary)
      .values({
        ...data,
        matchId: matchId,
      })
      .returning();

      if(res.app.locals.broadcastCommentary){
        res.app.locals.broadcastCommentary(event.matchId, event);
      }

    return res.status(201).json({ commentary: event });
  } catch (error) {
    console.error("Error creating commentary:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      message: "Failed to create commentary",
      error: errorMessage,
    });
  }
});
