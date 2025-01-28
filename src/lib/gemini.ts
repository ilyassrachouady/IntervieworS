import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export interface InterviewQuestion {
  id: string;
  question: string;
  context?: string;
  expectedTopics?: string[];
}

export interface FeedbackResponse {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

const systemPrompt = `You are an expert technical interviewer. Generate challenging but fair interview questions and provide detailed feedback on candidate responses.`;

export async function generateQuestions(role: string, topics: string[]): Promise<InterviewQuestion[]> {
  const prompt = `${systemPrompt}
Generate 5 technical interview questions for a ${role} position, focusing on: ${topics.join(', ')}.
Format the response as a JSON array with objects containing:
- id: unique string
- question: the interview question
- context: additional context or hints
- expectedTopics: array of key topics this tests

Make questions challenging but realistic for the role.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

export async function analyzeResponse(
  question: InterviewQuestion,
  answer: string
): Promise<FeedbackResponse> {
  const prompt = `${systemPrompt}
Analyze this candidate response to the following technical interview question:

Question: ${question.question}
Expected topics: ${question.expectedTopics?.join(', ')}
Candidate's answer: ${answer}

Provide feedback in JSON format with:
- score: number from 0-100
- feedback: detailed explanation
- strengths: array of strong points
- improvements: array of areas to improve`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}