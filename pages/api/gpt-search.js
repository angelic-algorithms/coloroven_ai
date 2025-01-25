import { Configuration, OpenAI } from 'openai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    try {
      const { query, colors } = req.body;
  
      // Validate input
      if (!query || !colors || !Array.isArray(colors) || colors.length === 0) {
        return res.status(400).json({ error: 'Invalid input. Query and colors are required.' });
      }
  
      // Initialize OpenAI with API key
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: false,
      });
  
      const prompt = `Search for items related to colors: ${colors.join(', ')}.\nUser query: ${query}`;
  
      // Make request to OpenAI's chat completion API
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      });
  
      res.status(200).json({ response: response.choices[0].message.content });
    } catch (error) {
      console.error('Error calling OpenAI API:', error.message || error);
      res.status(500).json({ error: 'Error fetching response from AI' });
    }
  }
  
