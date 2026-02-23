import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  private ai: GoogleGenAI;

  constructor(private config: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.config.get<string>('GEMINI_API_KEY'),
    });
  }

  async extractTasks(notes: string, userList: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Anda adalah sistem ekstraksi RACI Matrix dari notulensi rapat Direksi.

        TUGAS:
        1. Identifikasi setiap kalimat yang mengandung tindakan (action item).
        2. Setiap action item menjadi 1 object JSON.
        3. Tentukan RACI untuk setiap action item.

        ATURAN PENENTUAN ACCOUNTABLE:
        - Jika disebut secara eksplisit (misal: "marketing", "operasional"), cocokkan dengan division pada REFERENSI UNIT.
        - Jika disebut "seluruh", gunakan null sebagai accountable.
        - Jika disebut lebih dari satu unit, pilih unit utama sebagai accountable dan sisanya sebagai responsible.
        - Jangan menebak ID jika tidak ada kecocokan jelas.

        ATURAN KHUSUS:
        - "SL" → cocokkan ke user dengan role/unit yang sesuai jika ada.
        - "Marketing" → cocokkan ke division yang mengandung kata "Marketing".
        - "Operasional" → cocokkan ke division yang mengandung kata "Operation".
        - "Procurement" → cocokkan ke division Procurement.
        - "Komite Medis" → jika tidak ada di referensi, gunakan null.

        REFERENSI UNIT (Division - Name - Username - ID):
        ${userList}

        NOTULENSI:
        ${notes}

        Output HARUS berupa JSON ARRAY sesuai schema.
        `,
      // contents: `
      //   Ekstrak daftar penugasan dengan format RACI Matrix dari notulensi rapat BOD TelkoMedika.

      //   ATURAN RACI:
      //   - Accountable (A): Hanya 1 unit.
      //   - Responsible (R): Unit eksekutor.
      //   - Consulted (C): Unit pemberi masukan.
      //   - Informed (I): Unit yang diberi info.

      //   WAJIB gunakan ID yang tersedia pada REFERENSI UNIT.
      //   Jangan buat ID baru.

      //   REFERENSI UNIT:
      //   ${userList}

      //   NOTULENSI:
      //   ${notes}
      // `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              accountableId: { type: Type.NUMBER },
              responsibleIds: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
              },
              consultedIds: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
              },
              informedIds: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
              },
              priority: { type: Type.STRING },
              meetingDate: { type: Type.STRING },
              dueDate: { type: Type.STRING },
            },
            required: ['title', 'accountableId', 'dueDate'],
          },
        },
      },
    });

    try {
      console.log('RAW GEMINI RESPONSE:', response.text);

      const result = JSON.parse(response.text || '[]');

      return result.map((task: any) => ({
        ...task,
        accountableId: Number(task.accountableId),
        responsibleIds: (task.responsibleIds || []).map(Number),
        consultedIds: (task.consultedIds || []).map(Number),
        informedIds: (task.informedIds || []).map(Number),
        priority: (task.priority || 'MEDIUM').toUpperCase(),
      }));
    } catch (error) {
      console.error('Gemini parse error:', error);
      console.log('RAW RESPONSE:', response.text);
      throw error;
    }
  }
}
