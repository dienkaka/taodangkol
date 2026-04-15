import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface PoseVariation {
  id: number;
  label: string;
  imageUrl?: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}

export const POSE_LABELS = [
  "Góc nghiêng thanh lịch",
  "Tạo dáng chính diện",
  "Góc nhìn từ trên xuống",
  "Tạo dáng ngồi thời thượng",
  "Góc nhìn từ dưới lên (quyền lực)",
  "Tạo dáng chuyển động (walking)"
];

export async function generatePoseVariation(
  base64Image: string,
  mimeType: string,
  poseDescription: string
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Dựa trên người mẫu trong ảnh này, hãy tạo ra một bức ảnh mới với tư thế: ${poseDescription}. 
            Yêu cầu: 
            1. Giữ nguyên đặc điểm khuôn mặt, vóc dáng và trang phục của người mẫu.
            2. Bối cảnh nên đồng nhất với ảnh gốc hoặc là một studio chuyên nghiệp.
            3. Ánh sáng và màu sắc phải mang tính thời trang cao cấp.
            4. Chỉ trả về hình ảnh mới.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("Không tìm thấy hình ảnh trong phản hồi từ AI");
  } catch (error) {
    console.error("Lỗi khi tạo dáng:", error);
    throw error;
  }
}
