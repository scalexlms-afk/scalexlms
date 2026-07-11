import OpenAI from "openai";

export const longCatBaseUrl =
  process.env.LONGCAT_BASE_URL || "https://api.longcat.chat/openai/v1";

export const longCatModel = process.env.LONGCAT_MODEL || "LongCat-2.0";

export function createLongCatClient(): OpenAI {
  const apiKey = process.env.LONGCAT_API_KEY;

  if (!apiKey) {
    throw new Error("LONGCAT_API_KEY is not set");
  }

  return new OpenAI({
    apiKey,
    baseURL: longCatBaseUrl,
  });
}
