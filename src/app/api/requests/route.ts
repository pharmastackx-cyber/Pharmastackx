
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import MedicineRequest from '@/models/MedicineRequest';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { sendMedicineNotFoundNotification } from '@/lib/whatsapp'; // Import the new function

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const generationConfig = {
    temperature: 0.2,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
};

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

async function runAiAnalysis(userInput: string, userName: string, notes?: string) {
    const prompt = `
    You are a highly intelligent pharmaceutical assistant AI. A user at a pharmacy website could not find the medicine they were looking for. Your task is to analyze their request, standardize it, and provide actionable insights for the pharmacy staff.

    USER'S SEARCH QUERY: "${userInput}"
    USER'S NAME: "${userName}"
    ADDITIONAL NOTES: "${notes || 'None'}"

    Please analyze this request and return ONLY a single, valid JSON object with the following structure. Do not include any other text or markdown formatting.

    **Required JSON Output Format:**
    {
      "aiStandardizedName": "string",
      "aiSuggestedIngredients": ["string"],
      "aiRequestCategory": "specific_product" | "symptom_based" | "general_inquiry" | "unknown",
      "aiUrgency": "low" | "medium" | "high",
      "aiSuggestedAlternatives": ["string"]
    }
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
            safetySettings,
        });
        const responseText = result.response.text();
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedJson);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return {
            aiStandardizedName: "AI Analysis Failed",
            aiSuggestedIngredients: [],
            aiRequestCategory: "unknown",
            aiUrgency: "low",
            aiSuggestedAlternatives: [],
        };
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { medicineName, userName, contact, notes } = body;

        if (!medicineName || !userName || !contact) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const aiData = await runAiAnalysis(medicineName, userName, notes);

        const newRequest = new MedicineRequest({
            rawMedicineName: medicineName,
            userName,
            contact,
            notes,
            status: 'pending',
            ...aiData
        });

        await newRequest.save();

        // --- Send WhatsApp Notification --- //
        // This is a fire-and-forget operation, we don't need to wait for it.
        sendMedicineNotFoundNotification(newRequest);

        return NextResponse.json({ message: 'Request submitted successfully', request: newRequest }, { status: 201 });

    } catch (error: any) {
        console.error('Error in POST /api/requests:', error);
        return NextResponse.json({ message: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}
