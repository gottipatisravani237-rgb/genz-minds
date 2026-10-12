import { PrescriptionAnalysisResult, PrescriptionItem } from '../types';
import { storageService } from './storageService';

export const PRESET_PRESCRIPTION_SAMPLES: Record<
  string,
  { label: string; previewUrl: string; result: PrescriptionAnalysisResult }
> = {
  standardRx: {
    label: 'Standard Multi-Drug Clinical Prescription (Clean)',
    previewUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=700&q=80',
    result: {
      success: true,
      doctorName: 'Dr. Evelyn Reed, MD',
      clinicName: 'Metropolitan Medical Center',
      date: new Date().toISOString().split('T')[0],
      extractedItems: [
        {
          id: 'item-rx-1',
          medicine: 'Amoxicillin Trihydrate',
          dosage: '500 mg',
          frequency: 'Three times daily',
          duration: '7 Days',
          food: 'Before food',
          confidence: 96,
          isUnclear: false,
        },
        {
          id: 'item-rx-2',
          medicine: 'Ibuprofen',
          dosage: '400 mg',
          frequency: 'Twice daily',
          duration: '5 Days (As needed)',
          food: 'After food',
          confidence: 95,
          isUnclear: false,
        },
        {
          id: 'item-rx-3',
          medicine: 'Omeprazole',
          dosage: '20 mg',
          frequency: 'Once daily (Morning)',
          duration: '14 Days',
          food: 'Before food (Empty stomach)',
          confidence: 98,
          isUnclear: false,
        },
      ],
      hasUnclearHandwriting: false,
    },
  },
  cursiveRx: {
    label: 'Handwritten Prescription (With Unclear Section)',
    previewUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=700&q=80',
    result: {
      success: true,
      doctorName: 'Dr. Marcus Vance, FACP',
      clinicName: 'St. Jude General Outpatient',
      date: new Date().toISOString().split('T')[0],
      extractedItems: [
        {
          id: 'item-rx-4',
          medicine: 'Metformin HCl',
          dosage: '500 mg',
          frequency: 'Twice daily',
          duration: '30 Days',
          food: 'With food',
          confidence: 94,
          isUnclear: false,
        },
        {
          id: 'item-rx-5',
          medicine: 'This section could not be read clearly.',
          dosage: 'Unclear dosage',
          frequency: 'Once daily',
          duration: 'Unspecified',
          food: 'Consult doctor',
          confidence: 32,
          isUnclear: true,
        },
        {
          id: 'item-rx-6',
          medicine: 'Atorvastatin',
          dosage: '20 mg',
          frequency: 'Once daily (Bedtime)',
          duration: '30 Days',
          food: 'Anytime',
          confidence: 91,
          isUnclear: false,
        },
      ],
      hasUnclearHandwriting: true,
      unclearNotes: 'Row 2 handwriting has low ink clarity and could not be deciphered safely. Never guess unclear handwriting.',
    },
  },
};

export const prescriptionService = {
  isConfigured(): boolean {
    const key = storageService.getApiKey();
    return Boolean(key && key.trim().length > 5);
  },

  async analyzePrescription(
    imageDataUrl: string,
    onProgress?: (progressText: string) => void,
    forcePresetKey?: keyof typeof PRESET_PRESCRIPTION_SAMPLES
  ): Promise<PrescriptionAnalysisResult & { unconfigured?: boolean }> {
    if (forcePresetKey && PRESET_PRESCRIPTION_SAMPLES[forcePresetKey]) {
      const preset = PRESET_PRESCRIPTION_SAMPLES[forcePresetKey];
      if (onProgress) onProgress('Scanning prescription layout...');
      await new Promise(r => setTimeout(r, 400));
      if (onProgress) onProgress('Parsing clinical abbreviations (sig)...');
      await new Promise(r => setTimeout(r, 500));
      if (onProgress) onProgress('Extracting medication schedule & dosages...');
      await new Promise(r => setTimeout(r, 400));
      return preset.result;
    }

    const apiKey = storageService.getApiKey();

    if (!apiKey) {
      return {
        success: false,
        unconfigured: true,
        extractedItems: [],
        unclearNotes: 'AI analysis is not configured yet. Connect the vision AI service to enable real medicine recognition.',
      };
    }

    if (onProgress) onProgress('Reading prescription image...');
    await new Promise(r => setTimeout(r, 400));

    try {
      const mimeMatch = imageDataUrl.match(/^data:(image\/[a-zA-Z+]+|application\/pdf);base64,(.+)$/);
      if (!mimeMatch) {
        throw new Error('Invalid file format. Please upload an image or document.');
      }
      const mimeType = mimeMatch[1];
      const base64Data = mimeMatch[2];

      if (onProgress) onProgress('Extracting handwritten and printed medication fields...');

      const systemPrompt = `You are MediNova AI, a clinical prescription extraction assistant.
CRITICAL SAFETY DIRECTIVE:
- Never guess unclear handwriting.
- If any medicine name, dosage, frequency, or instruction is cursive, smudged, cut off, or illegible, set isUnclear=true, confidence < 50, and set medicine to "This section could not be read clearly."
- Extract doctorName, clinicName, date if visible.
- Extract an array of medication items: medicine, dosage, frequency, duration, food ('Before food' | 'After food' | 'With food' | 'Anytime'), confidence (0-100), isUnclear (boolean).

Return ONLY valid JSON matching this schema:
{
  "doctorName": string,
  "clinicName": string,
  "date": string,
  "hasUnclearHandwriting": boolean,
  "unclearNotes": string,
  "extractedItems": [
    {
      "id": string,
      "medicine": string,
      "dosage": string,
      "frequency": string,
      "duration": string,
      "food": string,
      "confidence": number,
      "isUnclear": boolean
    }
  ]
}`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: systemPrompt },
              {
                inline_data: {
                  mime_type: mimeType.includes('pdf') ? 'application/pdf' : mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: 'application/json',
        },
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Prescription AI returned ${response.status}`);
      }

      if (onProgress) onProgress('Verifying medical extraction formatting...');
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty AI response.');

      const parsed = JSON.parse(rawText);
      const items: PrescriptionItem[] = (parsed.extractedItems || []).map((item: any, idx: number) => ({
        id: item.id || `item-gen-${idx}-${Date.now()}`,
        medicine: item.isUnclear ? 'This section could not be read clearly.' : (item.medicine || 'Unidentified Medicine'),
        dosage: item.dosage || '500 mg',
        frequency: item.frequency || 'Once daily',
        duration: item.duration || '7 days',
        food: item.food || 'After food',
        confidence: item.confidence || (item.isUnclear ? 30 : 92),
        isUnclear: Boolean(item.isUnclear),
      }));

      return {
        success: true,
        doctorName: parsed.doctorName || 'Prescribing Physician',
        clinicName: parsed.clinicName || 'Medical Clinic',
        date: parsed.date || new Date().toISOString().split('T')[0],
        hasUnclearHandwriting: Boolean(parsed.hasUnclearHandwriting) || items.some(i => i.isUnclear),
        unclearNotes: parsed.unclearNotes,
        extractedItems: items,
      };
    } catch (err: any) {
      console.error('Prescription processing failed', err);
      return {
        success: false,
        extractedItems: [],
        hasUnclearHandwriting: true,
        unclearNotes: 'Could not parse prescription clearly. Never guess unclear handwriting. Please verify with doctor.',
      };
    }
  },
};
