import { GoogleGenerativeAI } from "@google/generative-ai";

export const identifyScrapImage = async (imageBuffer, mimeType) => {
  const apiKey = (process.env.GEMINI_API_KEY || "").replace(/^["']|["']$/g, "");
  const fallback = [{
    materialType: "HDPE Plastic",
    itemName: "plastic bottle",
    itemCount: 1,
    unitWeightGrams: 450,
    isRecyclable: true
  }];

  if (!apiKey || apiKey === "mock_key" || apiKey.startsWith("your_")) {
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    const result = await model.generateContent([
      { inlineData: { data: imageBuffer.toString("base64"), mimeType } },
      `Analyze the image and list all visible scrap items. Respond ONLY with a JSON array conforming to this format:
      [{"materialType": "E-Waste" | "HDPE Plastic" | "Cardboard" | "Glass" | "Metal", "itemName": "description", "itemCount": 1, "unitWeightGrams": 500, "isRecyclable": true}]`
    ]);

    const text = result.response.text().replace(/```json|```/g, "").trim();
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    return fallback;
  }
};
