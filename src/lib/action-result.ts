export type ActionResult = { success: boolean; message: string };

/** Thrown by requireAdmin; recognised here so it can be reported cleanly. */
export const UNAUTHORIZED = "Unauthorized Access";

export function failure(error: unknown, fallback: string): ActionResult {
  if (error instanceof Error && error.message === UNAUTHORIZED) {
    return { success: false, message: "You are not authorized to do that." };
  }
  return { success: false, message: fallback };
}
