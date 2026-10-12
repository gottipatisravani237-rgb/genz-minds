import React, { useState, useEffect } from 'react';
import {
  History,
  FileText,
  Receipt,
  Pill,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { healthApi } from '../../services/healthApi';

export const HealthTimelinePage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const [docs, prescriptions, appts] = await Promise.all([
          healthApi.getDocuments().catch(() => []),
          healthApi.getPrescriptions().catch(() => []),
          healthApi.getAppointments().catch(() => []),
        ]);

        const combined: any[] = [];

        docs.forEach((d) => {
          combined.push({
            id: `doc-${d.id}`,
            date: d.upload_timestamp,
            title: `Medical Document Upload: ${d.original_filename}`,
            category: 'Document',
            description: `Document processed via OCR & indexed into pgvector RAG (${d.document_type}).`,
            icon: FileText,
            color: '#00D084',
          });
        });

        prescriptions.forEach((p) => {
          combined.push({
            id: `rx-${p.id}`,
            date: p.created_at,
            title: `Prescription Confirmed: ${p.doctor_name || 'Attending Physician'}`,
            category: 'Prescription',
            description: `${p.medicines?.length || 0} medication(s) verified and converted to schedule.`,
            icon: Receipt,
            color: '#21E6C1',
          });
        });

        appts.forEach((a) => {
          combined.push({
            id: `appt-${a.id}`,
            date: a.appointment_date,
            title: `Telehealth Consultation: ${a.doctor_name}`,
            category: 'Appointment',
            description: `${a.doctor_specialty} consultation confirmed for ${a.start_time}. Ref: ${a.booking_reference}`,
            icon: CalendarCheck,
            color: '#FFB547',
          });
        });

        // Add historical clinical milestone
        combined.push({
          id: 'initial-setup',
          date: '2026-10-10T09:00:00Z',
          title: 'MediNova Clinical Health Profile Created',
          category: 'Account',
          description: 'Emergency contact and baseline metabolic profile configured.',
          icon: CheckCircle2,
          color: '#00D084',
        });

        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEvents(combined);
      } catch (e) {
        console.warn('Error fetching timeline:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
          <History className="w-6 h-6 text-[#00D084]" />
          Longitudinal Health Timeline
        </h1>
        <p className="text-xs text-[#9BAAB6] mt-1">
          Chronological audit trail of medical records, lab findings, confirmed prescriptions, and consultations.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#9BAAB6] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#00D084]" />
          <span>Assembling health timeline...</span>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-[#203039] space-y-8">
          {events.map((evt, idx) => {
            const Icon = evt.icon;
            return (
              <div key={evt.id || idx} className="relative group">
                {/* Node circle */}
                <div
                  className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full border-2 border-[#05090D] flex items-center justify-center"
                  style={{ backgroundColor: evt.color }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#05090D]" />
                </div>

                {/* Event Card */}
                <div className="glass-card-interactive p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: evt.color }} />
                      <span className="text-sm font-bold text-[#F4F7FA]">{evt.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#111F28] text-[#9BAAB6] border border-[#203039]">
                      {new Date(evt.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#9BAAB6] leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
