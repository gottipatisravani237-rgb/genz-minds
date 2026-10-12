import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Video,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
  Loader2,
} from 'lucide-react';
import { healthApi, Appointment } from '../../services/healthApi';

export const AppointmentsPage: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await healthApi.getAppointments();
      setAppointments(data);
    } catch (e) {
      console.warn('Error fetching appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await healthApi.cancelAppointment(id);
      fetchAppointments();
    } catch (e: any) {
      alert(e.message || 'Cancellation failed');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-[#00D084]" />
            Scheduled Telehealth Appointments
          </h1>
          <p className="text-xs text-[#9BAAB6] mt-1">
            Confirmed doctor consultations, video call links, and booking references.
          </p>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('doctors')}
            className="btn-emerald text-xs !py-2.5 !px-4 self-start sm:self-auto"
          >
            <span>Book New Appointment</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#9BAAB6] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#00D084]" />
          <span>Loading appointments...</span>
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass-panel-dark rounded-3xl p-12 text-center text-xs text-[#9BAAB6] space-y-3">
          <CalendarCheck className="w-8 h-8 text-[#203039] mx-auto" />
          <p className="text-sm font-bold text-[#F4F7FA]">No Scheduled Appointments</p>
          <p>Book a consultation with a specialist cardiologist, endocrinologist, or pulmonologist.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="glass-card-interactive p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#00D084]/15 border border-[#00D084]/30 flex items-center justify-center text-[#00D084]">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F4F7FA]">{appt.doctor_name || 'Dr. Specialist'}</h3>
                    <p className="text-xs text-[#00D084] font-semibold">{appt.doctor_specialty || 'Clinical Consultation'}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00D084]/15 text-[#00D084] border border-[#00D084]/30">
                    {appt.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#9BAAB6] pt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#21E6C1]" />
                    <span>{appt.appointment_date} at {appt.start_time} - {appt.end_time}</span>
                  </span>
                  <span className="font-mono text-[11px] text-[#00D084] bg-[#0D171F] px-2 py-0.5 rounded border border-[#203039]">
                    Ref: {appt.booking_reference}
                  </span>
                </div>

                {appt.symptoms_notes && (
                  <p className="text-[11px] text-[#9BAAB6] italic pt-1">
                    "{appt.symptoms_notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {appt.meeting_link && appt.status === 'confirmed' && (
                  <a
                    href={appt.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-emerald text-xs !py-2 !px-4 flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Video Room</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {appt.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancel(appt.id)}
                    className="p-2 rounded-xl text-[#9BAAB6] hover:text-[#FF5C68] hover:bg-[#FF5C68]/10 transition"
                    title="Cancel Appointment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
