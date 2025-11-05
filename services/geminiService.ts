import { GoogleGenAI, Type } from "@google/genai";

export const simplifyText = async (text: string): Promise<string> => {
  if (!text.trim()) {
    return "";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Your task is to simplify the following text. Your goal is to make it easy to understand for people with reading difficulties like dyslexia or ADHD, while meticulously preserving the original meaning and all key information.

Here are the rules:
1.  **Preserve Meaning:** Do not change the core message or facts. The simplified text should be a faithful representation of the original.
2.  **Use Simple Language:** Replace complex words and jargon with common, everyday vocabulary.
3.  **Use Short Sentences:** Break down long, complex sentences into shorter, simpler ones.
4.  **Use Active Voice:** Prefer active voice over passive voice for clarity.
5.  **Be Direct:** Do not add any introductory or concluding phrases like "Here is the simplified text:". Just provide the simplified content.

Example:
Original: "The forthcoming meteorological event is projected to manifest as substantial precipitation, potentially causing disruptions to transportation infrastructure and necessitating precautionary measures by the citizenry."
Simplified: "It is going to rain a lot soon. This could cause problems for traffic and travel. People should be prepared."

Now, simplify this text:
---
${text}
---`,
      config: {
        temperature: 0.2,
      }
    });

    const resultText = response.text;
    if (!resultText) {
        throw new Error("The simplification service returned an empty response. This may be due to the content of the input text.");
    }
    
    return resultText.trim();

  } catch (error) {
    console.error("Gemini Service Error:", error);

    if (error instanceof Error) {
      const lowerCaseError = error.message.toLowerCase();
      
      if (
        lowerCaseError.includes("api key not valid") ||
        lowerCaseError.includes("requested entity was not found") ||
        lowerCaseError.includes("api key") ||
        lowerCaseError.includes("permission denied") ||
        lowerCaseError.includes("process is not defined")
      ) {
          throw new Error("The API key is invalid or missing. Please ensure it is configured correctly.");
      }

      if (lowerCaseError.includes("rate limit")) {
        throw new Error("The service is experiencing high traffic. Please wait a moment before trying again.");
      }
      if (lowerCaseError.includes("fetch") || lowerCaseError.includes("network")) {
        throw new Error("Could not connect to the simplification service. Please check your internet connection and try again.");
      }
      if (lowerCaseError.includes("candidate was blocked") || lowerCaseError.includes("empty response")) {
         throw new Error("The request was blocked or returned an empty result, possibly due to the content of the input text. Please revise your text and try again.");
      }
    }
    
    throw new Error("An unexpected error occurred. Please try again later.");
  }
};

export const summarizeText = async (text: string): Promise<string> => {
  if (!text.trim()) {
    return "";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following text. The summary should be concise, easy to understand, and capture all the main points while preserving the core meaning of the original content. Do not add any introductory or concluding phrases.

Example:
Original: "The company's quarterly report indicated a 15% increase in revenue, largely driven by the successful launch of its new product line in the European market. However, profits were slightly down due to increased marketing expenditure and supply chain costs."
Summary: "The company's revenue grew by 15% because of a new product in Europe, but profits fell because of higher marketing and shipping costs."

Now, summarize this text:
---
${text}
---`,
      config: {
        temperature: 0.2,
      }
    });

    const resultText = response.text;
    if (!resultText) {
        throw new Error("The summarization service returned an empty response.");
    }
    
    return resultText.trim();

  } catch (error) {
    console.error("Gemini Service Error (Summarize):", error);

    if (error instanceof Error) {
      const lowerCaseError = error.message.toLowerCase();
      
      if (
        lowerCaseError.includes("api key not valid") ||
        lowerCaseError.includes("requested entity was not found") ||
        lowerCaseError.includes("api key") ||
        lowerCaseError.includes("permission denied") ||
        lowerCaseError.includes("process is not defined")
      ) {
          throw new Error("The API key is invalid or missing. Please ensure it is configured correctly.");
      }

      if (lowerCaseError.includes("rate limit")) {
        throw new Error("The service is experiencing high traffic. Please wait a moment before trying again.");
      }
      if (lowerCaseError.includes("fetch") || lowerCaseError.includes("network")) {
        throw new Error("Could not connect to the summarization service. Please check your internet connection and try again.");
      }
      if (lowerCaseError.includes("candidate was blocked") || lowerCaseError.includes("empty response")) {
         throw new Error("The request was blocked or returned an empty result, possibly due to the content of the input text. Please revise your text and try again.");
      }
    }
    
    throw new Error("An unexpected error occurred during summarization. Please try again later.");
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text.trim()) {
    return "";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following text to ${targetLanguage}. Provide only the translated text, without any additional explanations or introductory phrases.\n\nText to translate:\n---\n${text}\n---`,
      config: {
        temperature: 0.2,
      }
    });

    const resultText = response.text;
    if (!resultText) {
        throw new Error("The translation service returned an empty response.");
    }
    
    return resultText.trim();

  } catch (error) {
    console.error("Gemini Service Error (Translate):", error);

    if (error instanceof Error) {
      const lowerCaseError = error.message.toLowerCase();
      
      if (
        lowerCaseError.includes("api key not valid") ||
        lowerCaseError.includes("requested entity was not found") ||
        lowerCaseError.includes("api key") ||
        lowerCaseError.includes("permission denied") ||
        lowerCaseError.includes("process is not defined")
      ) {
          throw new Error("The API key is invalid or missing. Please ensure it is configured correctly.");
      }

      if (lowerCaseError.includes("rate limit")) {
        throw new Error("The service is experiencing high traffic. Please wait a moment before trying again.");
      }
      if (lowerCaseError.includes("fetch") || lowerCaseError.includes("network")) {
        throw new Error("Could not connect to the translation service. Please check your internet connection and try again.");
      }
      if (lowerCaseError.includes("candidate was blocked") || lowerCaseError.includes("empty response")) {
         throw new Error("The request was blocked or returned an empty result, possibly due to the content of the input text. Please revise your text and try again.");
      }
    }
    
    throw new Error("An unexpected error occurred during translation. Please try again later.");
  }
};

export const interpretSignLanguage = async (base64Image: string): Promise<string> => {
  if (!base64Image) {
    throw new Error("No image data provided for interpretation.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart = {
      text: 'Interpret the American Sign Language (ASL) gesture in this image. Provide only the text translation. Be concise and focus on the most likely interpretation.'
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    
    const resultText = response.text;
    if (!resultText) {
        throw new Error("The interpretation service returned an empty response. The sign may not be clear.");
    }
    
    return resultText.trim();

  } catch (error) {
    console.error("Gemini Service Error (Interpret Sign):", error);

    if (error instanceof Error) {
      const lowerCaseError = error.message.toLowerCase();
      
      if (
        lowerCaseError.includes("api key not valid") ||
        lowerCaseError.includes("requested entity was not found") ||
        lowerCaseError.includes("api key") ||
        lowerCaseError.includes("permission denied") ||
        lowerCaseError.includes("process is not defined")
      ) {
          throw new Error("The API key is invalid or missing. Please ensure it is configured correctly.");
      }

      if (lowerCaseError.includes("rate limit")) {
        throw new Error("The service is experiencing high traffic. Please wait a moment before trying again.");
      }
      if (lowerCaseError.includes("fetch") || lowerCaseError.includes("network")) {
        throw new Error("Could not connect to the interpretation service. Please check your internet connection.");
      }
      if (lowerCaseError.includes("candidate was blocked") || lowerCaseError.includes("empty response")) {
         throw new Error("The request was blocked, possibly due to image content. Ensure the image is clear and appropriate.");
      }
    }
    
    throw new Error("An unexpected error occurred during interpretation. Please try again.");
  }
};

export const textToSign = async (text: string): Promise<{ word: string; visual: string; }[]> => {
  if (!text.trim()) {
    return [];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `For each word in the following text, provide a single, representative emoji that could represent its sign. If a word has no direct emoji equivalent (like articles, prepositions), use '❓'. Provide only a valid JSON array of objects, where each object has a "word" and "visual" property.

      Example:
      Input: "I need help with my car"
      Output:
      [
          {"word": "I", "visual": "👤"},
          {"word": "need", "visual": "🙏"},
          {"word": "help", "visual": "🤝"},
          {"word": "with", "visual": "❓"},
          {"word": "my", "visual": "❓"},
          {"word": "car", "visual": "🚗"}
      ]

      Now, process this text:
      ---
      ${text}
      ---`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: {
                type: Type.STRING,
                description: "The original word from the input text."
              },
              visual: {
                type: Type.STRING,
                description: "The single emoji representing the word."
              }
            },
            required: ["word", "visual"]
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("The text-to-sign service returned an empty response.");
    }
    
    // The model should return a valid JSON string based on the schema.
    const signs = JSON.parse(resultText);
    return signs;
  } catch (error) {
    console.error("Gemini Service Error (Text to Sign):", error);

    if (error instanceof Error) {
      const lowerCaseError = error.message.toLowerCase();
      
      if (
        lowerCaseError.includes("api key not valid") ||
        lowerCaseError.includes("requested entity was not found") ||
        lowerCaseError.includes("api key") ||
        lowerCaseError.includes("permission denied") ||
        lowerCaseError.includes("process is not defined")
      ) {
          throw new Error("The API key is invalid or missing. Please ensure it is configured correctly.");
      }

      if (lowerCaseError.includes("rate limit")) {
        throw new Error("The service is experiencing high traffic. Please wait a moment before trying again.");
      }
      if (lowerCaseError.includes("fetch") || lowerCaseError.includes("network")) {
        throw new Error("Could not connect to the translation service. Please check your internet connection and try again.");
      }
      if (lowerCaseError.includes("candidate was blocked") || lowerCaseError.includes("empty response")) {
         throw new Error("The request was blocked or returned an empty result, possibly due to the content of the input text. Please revise your text and try again.");
      }
    }
    
    throw new Error("An unexpected error occurred during text-to-sign translation. Please try again later.");
  }
};

export const getConversationResponse = async (chatHistory: { sender: 'user' | 'partner'; text: string }[]): Promise<string> => {
  if (chatHistory.length === 0) {
    return "Hello! Let's start our conversation.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const formattedHistory = chatHistory
      .map(msg => `${msg.sender === 'user' ? 'User (who is signing)' : 'Partner (who is typing)'}: ${msg.text}`)
      .join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are the "Partner" in a text-based conversation with a user who communicates with sign language. Their signs are interpreted into text for you to read. Your role is to provide a natural, conversational, and helpful response. Keep your responses friendly and concise (1-2 sentences).

      Here is the conversation so far:
      ---
      ${formattedHistory}
      ---
      Partner (who is typing):`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 80,
        stopSequences: ['User (who is signing):'],
      }
    });

    const resultText = response.text;
    if (!resultText) {
        throw new Error("The AI partner returned an empty response.");
    }
    
    return resultText.trim();

  } catch (error) {
    console.error("Gemini Service Error (Conversation):", error);

    if (error instanceof Error) {
      const lowerCaseError = error.message.toLowerCase();
      
      if (
        lowerCaseError.includes("api key not valid") ||
        lowerCaseError.includes("requested entity was not found") ||
        lowerCaseError.includes("api key") ||
        lowerCaseError.includes("permission denied") ||
        lowerCaseError.includes("process is not defined")
      ) {
          throw new Error("The API key is invalid or missing. Please ensure it is configured correctly.");
      }

      if (lowerCaseError.includes("rate limit")) {
        throw new Error("The service is experiencing high traffic. Please wait a moment before trying again.");
      }
      if (lowerCaseError.includes("fetch") || lowerCaseError.includes("network")) {
        throw new Error("Could not connect to the AI partner service. Please check your internet connection.");
      }
      if (lowerCaseError.includes("candidate was blocked") || lowerCaseError.includes("empty response")) {
         throw new Error("The AI partner's response was blocked. Please try sending a different message.");
      }
    }
    
    throw new Error("An unexpected error occurred with the AI partner. Please try again later.");
  }
};
