## Getting Started

Super fast chat ui for summarizing pdf's using groq and nextjs. Deployed on Vercel: https://pdf-summary-demo-rho.vercel.app/

You can also view my demo recording walkthrough under `public/demo-recording.mp4`.

## How to run locally

```bash
npm install

npm run dev
```

Now you can go to [`localhost:3000`](http://localhost:3000/) to see the app.

To query the LLM, my Groq API key is included in `.env.local`. If you want, you can also get your own key [here](https://console.groq.com/keys)!

## Explanation of technical choices

- Nextjs: I used this framework to build the frontend and backend, because the api routes can integrate more seamlessly across the stack.
- PDFjs: I used this package to parse the pdf and extract the text.
- Groq: Then I sent the extracted text to llama 3 + groq for super fast inference. This cuts down response time from a few seconds to under 1 second for uploading pdfs and querying them, as compared to using OpenAI's API.

## Limitations and future work

- For super long pdfs, the LLM may not be able to process the text in a single request. I would need to implement RAG to handle this, which could be done using Langchain and a vector database. But for the vast majority of pdfs, this is not necessary because the context window is large enough nowadays. For more accuracy and production-level work, I'd also think about implementing GraphRAG to maintain relationships between data, especially if I extend the project to support uploading multiple pdfs in the future.
