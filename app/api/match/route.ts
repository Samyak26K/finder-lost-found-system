import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { Item, ItemType, MatchSuggestion } from '@/types';

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
  }

  let body: { targetItem?: Item; candidates?: Item[] };
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { targetItem, candidates } = body;
  if (!targetItem || !Array.isArray(candidates)) {
    return NextResponse.json({ error: 'targetItem and candidates are required' }, { status: 400 });
  }

  if (candidates.length === 0) {
    return NextResponse.json([]);
  }

  const ai = new GoogleGenAI({ apiKey });

  const targetType = targetItem.type;
  const candidateType = targetType === ItemType.LOST ? ItemType.FOUND : ItemType.LOST;
  const relevantCandidates = candidates.filter(c => c.type === candidateType);

  if (relevantCandidates.length === 0) {
    return NextResponse.json([]);
  }

  const prompt = `
    You are an intelligent Lost & Found matching agent.
    
    Target Item (${targetItem.type}):
    Title: ${targetItem.title}
    Description: ${targetItem.description}
    Category: ${targetItem.category}
    Location: ${targetItem.location}
    Date: ${targetItem.date}

    Candidate Items (${candidateType}):
    ${JSON.stringify(relevantCandidates.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      location: c.location,
      date: c.date
    })))}

    Analyze the Target Item against the Candidate Items. 
    Look for semantic similarities (e.g., "MacBook" matches "Apple Laptop", "Library" matches "Study Room").
    Return a JSON array of matches that have a confidence score > 0.5.
    
    Output strictly valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              candidateId: { type: Type.STRING },
              confidence: { type: Type.NUMBER, description: "Between 0 and 1" },
              reasoning: { type: Type.STRING }
            },
            required: ["candidateId", "confidence", "reasoning"]
          }
        }
      }
    });

    const resultText = response.text || "[]";
    const rawMatches = JSON.parse(resultText);

    const matches: MatchSuggestion[] = rawMatches.map((m: any) => ({
      lostItemId: targetType === ItemType.LOST ? targetItem.id : m.candidateId,
      foundItemId: targetType === ItemType.FOUND ? targetItem.id : m.candidateId,
      confidence: m.confidence,
      reasoning: m.reasoning
    })).sort((a: MatchSuggestion, b: MatchSuggestion) => b.confidence - a.confidence);

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Gemini Matching Error:", error);
    return NextResponse.json({ error: 'Gemini Matching Error' }, { status: 500 });
  }
}

