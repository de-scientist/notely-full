// FIX 1: Imports are now pulled directly from the main 'langchain' package 
// or from specialized sub-packages (e.g., '@langchain/openai')
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai"; 
import { MemoryVectorStore } from "langchain/vectorstores/memory";
// ^ NOTE: The MemoryVectorStore import path often remains similar, but the others are updated.

// --- Initialization ---

// FIX 2: Ensure the OpenAIEmbeddings constructor is called with API key if needed
// The default constructor often relies on the OPENAI_API_KEY environment variable.
const embeddings = new OpenAIEmbeddings();

export const vectorStore = new MemoryVectorStore(embeddings);

// --- Core Logic ---

export async function addDocsToStore(content: string) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
    });

    const docs = await splitter.createDocuments([content]);
    await vectorStore.addDocuments(docs);
}