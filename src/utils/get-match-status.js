import { MATCH_STATUS } from "../validation/matches.js";

export function getMatchStatus(startTime, endTime, now = new Date()) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  // if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
  //   return null;
  // }

  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (now >= end) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
}

export async function syncMatchStatus(match, updateStatus) {
  const { startTime, endTime, status } = match;
  const currentStatus = getMatchStatus(startTime, endTime);

  if (!currentStatus) {
    return status; // If we can't determine the status, keep the existing one
  }
  if (currentStatus !== status) {
    await updateStatus(currentStatus);
    status = currentStatus; // Update the match object with the new status
  }

  return status;
}
