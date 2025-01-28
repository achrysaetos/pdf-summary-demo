## Getting Started

Super fast chat ui for summarizing pdf's using groq and nextjs.

## How to run locally

```bash
npm install

npm run dev
```

Now you can go to [`localhost:3000`](http://localhost:3000/) to see the app.

The Groq API key is included in the `.env.local` file to query the LLM. If you want, you can also get your own key [here](https://console.groq.com/keys)!

## Explanation of technical choices

- Nextjs: I used this framework to build the frontend and backend, because its api routes integrate seamlessly across the stack.
- PDFjs: I used this package to parse the pdf and extract the text.
- Groq: Then I sent the text to llama 3 + groq for super fast inference. This cuts down response time from a few seconds to under 1 second for uploading pdfs and querying them.

## Limitations and future work

- For super long pdfs, the LLM may not be able to process the text in a single request. I would need to implement RAG to handle this, which could be done using Langchain and a vector database. But for the vast majority of pdfs, this is not necessary because the context window is large enough nowadays. For even more accuracy and production-level work, I'd think about implementing GraphRAG to maintain relationships between data, especially if I extend the project to support uploading multiple pdfs in the future.