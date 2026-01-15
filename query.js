import * as dotenv from 'dotenv';
dotenv.config();

import readlineSync from 'readline-sync';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const History = [];

// function to transform the user question into standalone question // using 2nd llm model 
async function transformQuery(question){

History.push({
    role:'user',
    parts:[{text:question}]
    })  

const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: History,
    config: {
      systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
    Only output the rewritten question and nothing else.
      `,
    },
 });
 
 History.pop()
 
 return response.text


}



async function chatting(question) {
  // convert this question into vector
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'text-embedding-004',
  });

  const queryVector = await embeddings.embedQuery(question);

  // now make connection in pinecone search in pinecone db
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

  const searchResults = await pineconeIndex.query({
    topK: 10,
    vector: queryVector,
    includeMetadata: true,
  });

  // create context for the LLM model
  const context = searchResults.matches
    .map((match) => match.metadata?.text || "")
    .join('\n\n---\n\n');

  // push user question
  History.push({
    role: 'user',
    parts: [{ text: question }]
  });

  
 let response;

try {
  response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: History,
    config: {
      systemInstruction: `You have to behave like a Data Structure and Algorithm Expert.
You will be given a context of relevant information and a user question.
Your task is to answer the user's question based ONLY on the provided context.
If the answer is not in the context, you must say "I could not find the answer in the provided document."
Keep your answers clear, concise, and educational.

Context:
${context}
`,
    },
  });   // try catch block start , used it to catch quota exceeded error
} catch (err) {
  if (err?.status === 429) {
    console.log("\n⚠️ Gemini quota exceeded / rate limit hit. Enable billing or try later.\n");
    return; // stop here, don't crash
  }
  console.log("\n❌ Error:", err.message);
  return;
}


  // push model response
  History.push({
    role: 'model',
    parts: [{ text: response.text }]
  });

  console.log("\n");
  console.log(response.text);
}

async function main() {
  const userProblem = readlineSync.question("Ask me anything--> ");
  await chatting(userProblem);
  main();
}

main();
