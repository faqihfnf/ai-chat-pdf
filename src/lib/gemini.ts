import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
// import { TaskType } from "@google/generative-ai";

export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // 768 dimensions
  //   taskType: TaskType.RETRIEVAL_DOCUMENT,
  //   title: "Document title",
  apiKey: process.env.GOOGLE_API_KEY,
});

export const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
});

export async function generateEmbeddings(text: string): Promise<number[]> {
  return await embeddings.embedQuery(text);
}
