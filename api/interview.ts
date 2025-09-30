import OpenAI from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || '', 
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", 
    "X-Title": "Swipe Interview Assistant",
  },
});

const MODEL_NAME = "mistralai/mistral-7b-instruct:free";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }

  const { type, payload } = req.body;

  try {
    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'generate-question':
        systemPrompt = `You are an expert interviewer for a full stack (React/Node.js) developer role. Generate one interview question with a difficulty of '${payload.difficulty}'. Do not add any preamble, just return the raw question text.`;
        userPrompt = `Generate the question.`;
        break;

      case 'evaluate-answer':
        systemPrompt = `As an expert interviewer, evaluate an answer for a given question. Provide a score from 1 to 10 and a single sentence of feedback. Your response MUST be a valid JSON object like this: {"score": 8, "feedback": "This is a good answer."}. Do not include markdown, backticks, or any other text.`;
        userPrompt = `Question: "${payload.question}"\nAnswer: "${payload.answer}"`;
        break;
        
      case 'generate-summary':
        systemPrompt = `As an expert interviewer, create a concise, 2-3 sentence summary of the candidate's performance based on their answers. Mention their strengths and one area for improvement.`;
        userPrompt = `Here is the interview data: ${JSON.stringify(payload.fullInterview)}`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid request type' });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: type === 'evaluate-answer' ? { type: 'json_object' } : undefined,
    });

    const aiResponse = completion.choices[0].message.content;

    if (!aiResponse) {
        throw new Error("AI returned an empty response.");
    }

    if (type === 'evaluate-answer') {
        return res.status(200).json(JSON.parse(aiResponse));
    }

    return res.status(200).json({ response: aiResponse });

  } catch (error: any) {
    console.error("Error communicating with OpenRouter:", error.message);
    return res.status(500).json({ error: 'Failed to communicate with the AI model.' });
  }

}
