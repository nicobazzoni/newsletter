// src/components/AIPromptBox.jsx
import React, { useState } from 'react';

export default function AIPromptBox({ onResponse }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
            content: `You are an assistant creating internal newsletter content that people *actually want to read*. 
Your job is to craft captivating, smart, and punchy content from dry updates. Think like a witty journalist-meets-storyteller. 
Avoid corporate jargon. Add charm, relevance, and human tone.

Return ONLY valid JSON like this (no markdown, no preamble):
{
 "topUpdates": "Write a paragraph (at least 200 words) that vividly describes recent updates as if reporting for an internal magazine — energetic, clear, and fun.",
  "shoutout": "string", // 50 words, heartfelt or funny kudos to a team/person
  "imageKeywords": ["string", "string"] // up to 3 creative keywords for relevant, eye-catching imagery
}

Make it feel alive. Example topics: a team rollout, new equipment, surprise donuts, promotions. You get it.`},
            { role: 'user', content: input },
          ],
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      let raw = data.choices[0].message.content;
      console.log('RAW AI OUTPUT:', raw);

      // Clean up any markdown formatting
      raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(raw);
      onResponse(parsed);
    } catch (err) {
      console.error('AI error:', err);
      alert('There was an error generating the newsletter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        rows={5}
        className="w-full p-2 border rounded"
        placeholder="Write your raw update here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        disabled={loading || !input.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Generating...' : 'Generate Newsletter with AI'}
      </button>
    </div>
  );
}