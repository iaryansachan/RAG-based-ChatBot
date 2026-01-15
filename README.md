# DSA-PDF-RAG-Assistant 🤖📚

A **Retrieval-Augmented Generation (RAG)** chatbot built on an **LLM**.  
It retrieves relevant context from a **DSA PDF document** and generates accurate, domain-specific answers.  
Currently optimized for **Data Structures & Algorithms**, but can be easily customized for any document or knowledge base.

---

## 🚀 Features
- ✅ Load and parse PDF document
- ✅ Chunking using LangChain Text Splitter
- ✅ Embeddings using **Google Gemini (text-embedding-004)**
- ✅ Vector storage + similarity search using **Pinecone**
- ✅ Ask questions in CLI and get answers using **Gemini LLM**
- ✅ Easy to customize for any domain (just replace PDF)

---

## 🛠 Tech Stack
- **LangChain**
- **Google Gemini API**
- **Pinecone Vector Database**
- **pdf-parse / LangChain PDFLoader**
- **dotenv**

---

## 📂 Project Structure
```bash
DSA-Model/
│── index.js        # Indexing pipeline: PDF -> chunks -> embeddings -> Pinecone
│── query.js        # Chat/query pipeline: question -> Pinecone search -> Gemini answer
│── dsa.pdf         # Input document
│── .env.example    # Sample env file
│── package.json
│── README.md
