import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import logger from '../utils/logger';

export const getAISuggestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, language } = req.body;

    if (!code || code.trim().length < 5) {
      res.json({ suggestion: '' });
      return;
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || '',
    });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 150,
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: `You are a code completion assistant.
STRICT RULES:
- Only write what comes AFTER the last character of the given code
- NEVER repeat any code that already exists
- NEVER repeat function signatures or variable declarations
- Just complete the body or next logical lines
- Maximum 8 lines
- No markdown, no backticks, no explanations
- If code looks complete already, return empty string`,
        },
        {
          role: 'user',
          content: `Language: ${language}

Code to complete (write ONLY what comes after this):
${code}`,
        },
      ],
    });

    const suggestion = completion.choices[0]?.message?.content?.trim() || '';

    const cleaned = suggestion
      .replace(/^```[\w]*\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    res.json({ suggestion: cleaned });
  } catch (error: any) {
    logger.error(`AI suggestion error: ${error.message}`);
    res.status(500).json({ suggestion: '', error: error.message });
  }
};