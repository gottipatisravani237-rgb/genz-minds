import {
  Medicine,
  Reminder,
  ReminderLog,
  UserProfile,
  AdherenceStats,
} from '../types';
import { storageService } from './storageService';

export interface ChatbotContext {
  profile: UserProfile | null;
  medicines: Medicine[];
  reminders: Reminder[];
  logs: ReminderLog[];
  adherence: AdherenceStats;
}

const MEDICAL_SAFETY_DISCLAIMER = `\n\n> ⚠️ **Clinical Safety Disclaimer:** MediNova AI provides educational and medication-management assistance. It does not replace a qualified healthcare professional. Always verify medical information with a healthcare professional before making treatment decisions.`;

export const chatbotService = {
  async processQuery(query: string, context: ChatbotContext): Promise<string> {
    const trimmed = query.trim();
    const lower = trimmed.toLowerCase();
    const apiKey = storageService.getApiKey();

    // Check if external Gemini API is available
    if (apiKey) {
      try {
        const liveDataSummary = `
USER CONTEXT:
Name: ${context.profile?.fullName || 'User'}
Age: ${context.profile?.age || 'N/A'}
Allergies: ${context.profile?.allergies?.join(', ') || 'None reported'}
Conditions: ${context.profile?.existingConditions?.join(', ') || 'None reported'}

CURRENT ACTIVE MEDICATIONS:
${context.medicines.map(m => `- ${m.name} (${m.dosage}, generic: ${m.genericName}): ${m.purpose}. Schedule: ${m.frequency}, ${m.foodInstruction}. Active ingredients: ${m.activeIngredients.join(', ')}. Warnings: ${m.warnings.join('; ')}`).join('\n') || 'No medications recorded'}

TODAY'S SCHEDULED REMINDERS:
${context.reminders.map(r => {
  const log = context.logs.find(l => l.reminderId === r.id && l.scheduledDate === new Date().toISOString().split('T')[0]);
  return `- ${r.medicineName} ${r.dosage} at ${r.time} (${r.foodInstruction}). Status today: ${log?.status || 'upcoming'}`;
}).join('\n') || 'No reminders set'}

ADHERENCE METRICS:
Today: ${context.adherence.todayPercentage}%
Weekly: ${context.adherence.weeklyPercentage}%
Taken: ${context.adherence.takenCount}, Missed: ${context.adherence.missedCount}, Skipped: ${context.adherence.skippedCount}
`;

        const systemPrompt = `You are MediNova AI, a personal healthcare and medication companion.
You have direct real-time access to the user's stored medical data:
${liveDataSummary}

CRITICAL MEDICAL SAFETY DIRECTIVES:
1. NEVER diagnose diseases.
2. NEVER prescribe medications or recommend changing dosages.
3. NEVER tell a user to double a missed dose. If they ask about missed doses, instruct them to take it as soon as remembered unless it is almost time for the next dose, and never double up.
4. When answering questions like "What should I take at 8 PM?", "What medicine is next?", "Show my adherence", or "Explain my medicines", ALWAYS refer to the user's actual stored records above.
5. Tone: Calm, supportive, empathetic, precise, and clinically sound.

Respond concisely with markdown formatting.`;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const payload = {
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\nUSER QUESTION: "${trimmed}"` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
          },
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return reply.trim() + MEDICAL_SAFETY_DISCLAIMER;
          }
        }
      } catch (e) {
        console.warn('Falling back to local intelligent context engine:', e);
      }
    }

    // Comprehensive Local Rule Engine that operates on ACTUAL STORED DATA
    await new Promise(r => setTimeout(r, 400)); // Natural response delay
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = context.logs.filter(l => l.scheduledDate === today);

    // 1. "What medicines do I take today?"
    if (
      lower.includes('take today') ||
      lower.includes('today') && lower.includes('medicine') ||
      lower.includes('schedule today')
    ) {
      if (context.reminders.length === 0) {
        return `You have no medicines scheduled for today. You can add one via the **My Medicines** or **Smart Reminders** tab.` + MEDICAL_SAFETY_DISCLAIMER;
      }

      let response = `### 📋 Your Medicine Schedule for Today\n\n`;
      context.reminders.forEach(r => {
        const log = todayLogs.find(l => l.reminderId === r.id);
        const statusBadge = log?.status === 'taken' ? '✅ Taken' : log?.status === 'skipped' ? '⏭️ Skipped' : '⏳ Upcoming';
        response += `* **${r.medicineName}** (${r.dosage}) at **${formatTimeDisplay(r.time)}** — *${formatFood(r.foodInstruction)}* [${statusBadge}]\n`;
      });
      return response + MEDICAL_SAFETY_DISCLAIMER;
    }

    // 2. "What should I take at 8 PM?" / specific time query
    const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if ((lower.includes('take at') || lower.includes('at 8') || lower.includes('8 pm') || lower.includes('8:00')) && timeMatch) {
      let hour = parseInt(timeMatch[1], 10);
      const isPm = timeMatch[3] === 'pm' || lower.includes('pm') || lower.includes('evening');
      const isAm = timeMatch[3] === 'am' || lower.includes('am') || lower.includes('morning');

      if (isPm && hour < 12) hour += 12;
      if (isAm && hour === 12) hour = 0;

      const targetHourStr = hour.toString().padStart(2, '0');
      
      const matchingReminders = context.reminders.filter(r => {
        const rHour = r.time.split(':')[0];
        return rHour === targetHourStr;
      });

      if (matchingReminders.length > 0) {
        let resp = `### ⏰ Scheduled at ${formatTimeDisplay(`${targetHourStr}:00`)}\n\n`;
        matchingReminders.forEach(r => {
          const log = todayLogs.find(l => l.reminderId === r.id);
          resp += `You have **${r.medicineName}** (${r.dosage}) scheduled at **${formatTimeDisplay(r.time)}** (*${formatFood(r.foodInstruction)}*).\n`;
          if (log?.status === 'taken') {
            resp += `Status: You have already marked this dose as **Taken** today.\n`;
          } else {
            resp += `Status: Currently **${log?.status || 'Upcoming'}**.\n`;
          }
        });
        return resp + MEDICAL_SAFETY_DISCLAIMER;
      } else {
        return `You have no medications scheduled specifically around ${formatTimeDisplay(`${targetHourStr}:00`)} in your saved reminders.\n\nYour active reminders are:\n` +
          context.reminders.map(r => `• ${r.medicineName} (${r.dosage}) at ${formatTimeDisplay(r.time)}`).join('\n') +
          MEDICAL_SAFETY_DISCLAIMER;
      }
    }

    // 3. "What medicine is next?"
    if (lower.includes('what is next') || lower.includes('medicine is next') || lower.includes('next dose') || lower.includes('next medicine')) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const sorted = [...context.reminders].sort((a, b) => {
        const [aH, aM] = a.time.split(':').map(Number);
        const [bH, bM] = b.time.split(':').map(Number);
        return aH * 60 + aM - (bH * 60 + bM);
      });

      const upcoming = sorted.find(r => {
        const [h, m] = r.time.split(':').map(Number);
        const remMinutes = h * 60 + m;
        const log = todayLogs.find(l => l.reminderId === r.id);
        return remMinutes >= currentMinutes && log?.status !== 'taken';
      }) || sorted[0];

      if (!upcoming) {
        return `You do not have any reminders set right now. Set one in the **Smart Reminders** page.` + MEDICAL_SAFETY_DISCLAIMER;
      }

      return `### ⏭️ Next Scheduled Medication\n\nYour next dose is **${upcoming.medicineName}** (${upcoming.dosage}) at **${formatTimeDisplay(upcoming.time)}** (${formatFood(upcoming.foodInstruction)}).\n\nMake sure to adhere to the dietary instructions.` + MEDICAL_SAFETY_DISCLAIMER;
    }

    // 4. "Did I take my medicine?"
    if (lower.includes('did i take') || lower.includes('have i taken') || lower.includes('taken today')) {
      const takenList = todayLogs.filter(l => l.status === 'taken');
      const pendingList = context.reminders.filter(r => {
        const log = todayLogs.find(l => l.reminderId === r.id);
        return !log || log.status === 'upcoming';
      });

      let res = `### 💊 Today's Medication Status\n\n`;
      if (takenList.length > 0) {
        res += `**Doses Taken Today:**\n`;
        takenList.forEach(t => {
          res += `• ✅ ${t.medicineName} (${t.dosage}) — Recorded at ${t.scheduledTime}\n`;
        });
      } else {
        res += `You haven't recorded any taken doses yet today.\n`;
      }

      if (pendingList.length > 0) {
        res += `\n**Remaining for Today:**\n`;
        pendingList.forEach(p => {
          res += `• ⏳ ${p.medicineName} (${p.dosage}) at ${formatTimeDisplay(p.time)}\n`;
        });
      }
      return res + MEDICAL_SAFETY_DISCLAIMER;
    }

    // 5. "Show my adherence"
    if (lower.includes('adherence') || lower.includes('compliance') || lower.includes('percentage') || lower.includes('score')) {
      return `### 📊 Your Medication Adherence\n\n* **Today's Adherence:** **${context.adherence.todayPercentage}%**\n* **Weekly Adherence:** **${context.adherence.weeklyPercentage}%**\n* **Completed Doses:** ${context.adherence.takenCount} taken, ${context.adherence.skippedCount} skipped, ${context.adherence.missedCount} missed.\n\nConsistent adherence is key to treatment efficacy! Use the Test Alarm to verify your reminder notifications anytime.` + MEDICAL_SAFETY_DISCLAIMER;
    }

    // 6. "Explain my medicines" / specific medicine details
    if (lower.includes('explain my medicines') || lower.includes('my medicines') || lower.includes('what are my meds')) {
      if (context.medicines.length === 0) {
        return `You have no medicines added yet. You can scan medicine packaging using **Medi Scan** or add one manually in **My Medicines**.` + MEDICAL_SAFETY_DISCLAIMER;
      }
      let res = `### 🩺 Your Current Medicines Overview\n\n`;
      context.medicines.forEach(m => {
        res += `#### 💊 ${m.name} (${m.dosage})\n`;
        res += `* **Generic Name:** ${m.genericName}\n`;
        res += `* **Purpose:** ${m.purpose}\n`;
        res += `* **Instructions:** ${m.frequency}, ${formatFood(m.foodInstruction)}\n`;
        if (m.precautions.length > 0) {
          res += `* **Precautions:** ${m.precautions[0]}\n`;
        }
        res += `\n`;
      });
      return res + MEDICAL_SAFETY_DISCLAIMER;
    }

    // 7. "Explain my prescription"
    if (lower.includes('prescription') || lower.includes('rx')) {
      return `### 📄 Prescription Guidance\n\nPrescriptions in MediNova AI are scanned and verified under **Pres Scan**. We automatically extract the drug name, dosage, frequency, and duration.\n\n*All extracted items require your verification before entering your schedule.* If any handwriting is unclear, MediNova AI explicitly flags it to ensure you never guess a prescription.` + MEDICAL_SAFETY_DISCLAIMER;
    }

    // 8. Missed dose question
    if (lower.includes('missed') || lower.includes('forgot to take')) {
      return `### ⚠️ What to do if you missed a dose\n\n* As a standard clinical guideline, take the missed dose as soon as you remember.\n* **NEVER take a double dose** to make up for a missed one.\n* If it is already close to the time of your next scheduled dose, skip the missed dose and resume your regular schedule.\n* Consult your doctor or pharmacist if you missed an antibiotic or specialized therapy.` + MEDICAL_SAFETY_DISCLAIMER;
    }

    // Default intelligent companion response
    return `Hello! As **MediNova AI**, I am connected to your health profile for **${context.profile?.fullName || 'you'}**.\n\nYou currently have **${context.medicines.length} active medications** and **${context.reminders.length} scheduled reminders**.\n\nFeel free to ask me:\n- *"What medicines do I take today?"*\n- *"What should I take at 8 PM?"*\n- *"What medicine is next?"*\n- *"Show my adherence"*\n- *"Explain my medicines"*` + MEDICAL_SAFETY_DISCLAIMER;
  },
};

function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

function formatFood(instruction: string): string {
  switch (instruction) {
    case 'before_food':
      return 'Before food';
    case 'after_food':
      return 'After food';
    case 'with_food':
      return 'With food';
    default:
      return 'Anytime';
  }
}
