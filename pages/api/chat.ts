import { NextApiRequest, NextApiResponse } from 'next';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { input } = req.body;
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: input,
        },
      ],
      model: "llama3-8b-8192",
    });

    res.status(200).json({ content: chatCompletion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error processing your request' });
  }
} 