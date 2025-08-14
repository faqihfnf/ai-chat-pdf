import { Pinecone } from "@pinecone-database/pinecone";
import { supabase } from "./supabase";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { generateEmbeddings } from "./gemini";
import { metadata } from "@/app/layout";

export const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

const index = pc.index(process.env.PINECONE_INDEX_NAME as string);

export async function LoadToPinecone(fileName: string) {
  try {
    //# obtain the file from the server
    const { data, error } = await supabase.storage
      .from("documents")
      .download(fileName);

    if (error) throw Error(error.message);
    const loader = new PDFLoader(data);
    const pages = await loader.load();

    //# split it into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(pages);
    //# create embeddings for each chunk
    const texts = splitDocs.map((doc) => doc.pageContent);
    const embeddings = await Promise.all(
      texts.map(async (text) => await generateEmbeddings(text))
    );
    //# create vector object
    const vectors = splitDocs.map((doc, index) => ({
      id: `${fileName}-${index}-${Date.now()}`,
      values: embeddings[index],
      metadata: {
        source: fileName,
        page: doc.metadata.page,
        text: doc.pageContent,
        chunk: index,
      },
    }));
    //# upload to pinecone
    const result = await index.namespace(fileName).upsert(vectors);
    return result;
  } catch (error) {
    console.log("Error Load To Pinecone", error);
    throw error;
  }
}
