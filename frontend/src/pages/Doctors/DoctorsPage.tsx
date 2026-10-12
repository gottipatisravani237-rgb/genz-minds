import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Star,
  MapPin,
  Globe,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  Search,
  Loader2,
} from 'lucide-react';
import { healthApi, Doctor } from '../../services/healthApi';

export const DoctorsPage: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('2026-10-20');
  const [startTime, setStartTime] = useState('10:00');
  const [consultationType, setConsultationType] = useState('video');
  const [symptomsNotes, setSymptomsNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await healthApi.getDoctors(selectedSpecialty);
      setDoctors(data);
    } catch (e) {
      console.warn('Error fetching doctors:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoctor) return;
    try {
      setBookingLoading(true);
      setBookingError(null);
      const res = await healthApi.bookAppointment({
        doctor_id: bookingDoctor.id,
        appointment_date: appointmentDate,
        start_time: startTime,
        consultation_type: consultationType,
        symptoms_notes: symptomsNotes,
      });
      setBookingSuccess(`Appointment confirmed! Booking Reference: ${res.booking_reference}`);
      setTimeout(() => {
        setBookingDoctor(null);
        setBookingSuccess(null);
        if (onNavigateTab) onNavigateTab('appointments');
      }, 1500);
    } catch (err: any) {
      setBookingError(err.message || 'Booking conflict encountered.');
    } finally {
      setBookingLoading(false);
    }
  };

  const specialties = ['All Specialties', 'Cardiology', 'Endocrinology', 'Pulmonology', 'Internal Medicine'];

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
          <Stethoscope className="w-6 h-6 text-[#00D084]" />
          Doctor Discovery & Telehealth Consultation
        </h1>
        <p className="text-xs text-[#9BAAB6] mt-1">
          Connect with verified specialists. Conflict-free appointment booking with integrated medical report handoff.
        </p>
      </div>

      {/* Filter and Specialty Tabs */}
      <div className="glass-panel-dark rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(s === 'All Specialties' ? '' : s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                (selectedSpecialty === s || (!selectedSpecialty && s === 'All Specialties'))
                  ? 'bg-[#00D084] text-[#05090D] shadow-md shadow-[#00D084]/20'
                  : 'bg-[#111F28] text-[#9BAAB6] hover:text-[#F4F7FA] border border-[#203039]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-[#9BAAB6] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor or clinic..."
            className="w-full bg-[#111F28] border border-[#203039] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#F4F7FA] outline-none focus:border-[#00D084]"
          />
        </div>
      </div>

      {/* Doctor Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#9BAAB6] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#00D084]" />
          <span>Loading verified clinicians...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="glass-card-interactive p-6 rounded-3xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D084] to-[#21E6C1] flex items-center justify-center text-[#05090D] font-black text-sm shadow-md shadow-[#00D084]/20">
                      {doc.name.split(' ')[1]?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F4F7FA]">{doc.name}</h3>
                      <p className="text-xs text-[#00D084] font-semibold">{doc.specialty}</p>
                      <p className="text-[10px] text-[#9BAAB6]">{doc.qualification} • {doc.experience_years} yrs exp</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FFB547]/15 text-[#FFB547] text-xs font-bold border border-[#FFB547]/30">
                    <Star className="w-3.5 h-3.5 fill-[#FFB547]" />
                    <span>{doc.rating}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#9BAAB6] pt-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00D084]" />
                    <span>{doc.hospital_clinic}, {doc.location}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#21E6C1]" />
                    <span>Languages: {doc.languages.join(', ')}</span>
                  </p>
                </div>

                {doc.bio && (
                  <p className="text-[11px] text-[#9BAAB6] leading-relaxed pt-1 border-t border-[#203039]">
                    {doc.bio}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#203039] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#9BAAB6] block">Consultation Fee</span>
                  <span className="text-sm font-bold text-[#F4F7FA]">{doc.consultation_fee}</span>
                </div>
                <button
                  onClick={() => {
                    setBookingDoctor(doc);
                    setBookingSuccess(null);
                    setBookingError(null);
                  }}
                  className="btn-emerald text-xs !py-2 !px-4"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4">
            <h2 className="text-base font-bold text-[#F4F7FA]">
              Book Slot with {bookingDoctor.name}
            </h2>
            <p className="text-xs text-[#00D084]">
              {bookingDoctor.specialty} • {bookingDoctor.hospital_clinic}
            </p>

            <form onSubmit={handleBook} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9BAAB6] block mb-1">Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#9BAAB6] block mb-1">Slot Time</label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#9BAAB6] block mb-1">Consultation Channel</label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value)}
                  className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
                >
                  <option value="video">Secure HD Video Call (Recommended)</option>
                  <option value="in_person">In-Person Clinic Visit</option>
                  <option value="audio">Voice Telehealth Call</option>
                </select>
              </div>

              <div>
                <label className="text-[#9BAAB6] block mb-1">Symptoms or Review Notes</label>
                <textarea
                  rows={2}
                  value={symptomsNotes}
                  onChange={(e) => setSymptomsNotes(e.target.value)}
                  placeholder="e.g. Follow-up for metabolic panel and glucose reading."
                  className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none resize-none"
                />
              </div>

              {bookingError && (
                <div className="p-3 rounded-xl bg-[#FF5C68]/15 border border-[#FF5C68]/30 text-[#FF5C68] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {bookingSuccess && (
                <div className="p-3 rounded-xl bg-[#00D084]/15 border border-[#00D084]/30 text-[#00D084] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{bookingSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setBookingDoctor(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#9BAAB6] hover:text-[#F4F7FA] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="btn-emerald text-xs !py-2 !px-5"
                >
                  {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Booking</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
