import { generateEmbeddings } from "./gemini";
import { pc } from "./pinecone";

export async function getFromEmbeddings(
  embeddings: number[],
  fileName: string
) {
  const index = pc
    .index(process.env.PINECONE_INDEX_NAME as string)
    .namespace(fileName);

  try {
    const queryResult = await index.query({
      vector: embeddings,
      topK: 10,
      includeValues: true,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    throw error;
  }
}

export async function getContext(query: string, fileName: string) {
  const queryEmbeddings = await generateEmbeddings(query);
  const context = await getFromEmbeddings(queryEmbeddings, fileName);

  const filteredText = context.filter(
    (match) => match.score && match.score > 0.5
  );

  const docs = filteredText.map((doc) => doc?.metadata?.text);

  return docs;
}
