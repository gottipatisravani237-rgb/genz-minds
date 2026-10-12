import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileText,
  Calendar,
  Building,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { healthApi, ReportAnalysis } from '../../services/healthApi';

export const ReportAnalyzerPage: React.FC = () => {
  const [reports, setReports] = useState<ReportAnalysis[]>([]);
  const [activeReport, setActiveReport] = useState<ReportAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await healthApi.getReports();
        setReports(data);
        if (data.length > 0) {
          setActiveReport(data[0]);
        }
      } catch (e) {
        console.warn('Error fetching reports:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
          <FileBarChart2 className="w-6 h-6 text-[#00D084]" />
          Laboratory Report Analyzer
        </h1>
        <p className="text-xs text-[#9BAAB6] mt-1">
          Structured lab test extraction against reference ranges. Generates plain-language interpretations and clinician follow-up questions.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-[#9BAAB6] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#00D084]" />
          <span>Analyzing laboratory data...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-panel-dark rounded-3xl p-12 text-center text-xs text-[#9BAAB6] space-y-3">
          <FileText className="w-10 h-10 text-[#203039] mx-auto" />
          <p className="text-sm font-bold text-[#F4F7FA]">No Analyzed Laboratory Reports</p>
          <p>Upload a blood test or comprehensive metabolic panel in the Document Scanner to view analysis here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Report Header Card */}
          {activeReport && (
            <div className="glass-panel-dark rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#203039] gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-[#F4F7FA]">{activeReport.report_type}</span>
                    <span className="px-2 py-0.5 rounded bg-[#00D084]/15 text-[#00D084] text-[10px] font-bold border border-[#00D084]/30">
                      Analyzed
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#9BAAB6] mt-1">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-[#00D084]" />
                      {activeReport.laboratory_name || 'MediNova Pathology'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#21E6C1]" />
                      {activeReport.report_date || 'Recent Report'}
                    </span>
                  </div>
                </div>

                {reports.length > 1 && (
                  <select
                    value={activeReport.id}
                    onChange={(e) => {
                      const found = reports.find(r => r.id === e.target.value);
                      if (found) setActiveReport(found);
                    }}
                    className="bg-[#111F28] border border-[#203039] text-[#F4F7FA] px-3 py-1.5 rounded-xl text-xs outline-none"
                  >
                    {reports.map(r => (
                      <option key={r.id} value={r.id}>{r.report_type}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* 1. Overall Summary & Plain-Language Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#111F28] border border-[#203039] space-y-2">
                  <span className="text-xs font-bold text-[#F4F7FA] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#00D084]" />
                    Clinical Summary
                  </span>
                  <p className="text-xs text-[#9BAAB6] leading-relaxed">
                    {activeReport.overall_summary}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#111F28] border border-[#203039] space-y-2">
                  <span className="text-xs font-bold text-[#F4F7FA] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#21E6C1]" />
                    Plain-Language Explanation
                  </span>
                  <p className="text-xs text-[#9BAAB6] leading-relaxed">
                    {activeReport.plain_language_explanation || activeReport.overall_summary}
                  </p>
                </div>
              </div>

              {/* 2. Structured Test Results Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#F4F7FA]">Extracted Laboratory Parameters</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#203039] text-[#9BAAB6] text-[10px] uppercase font-bold">
                        <th className="pb-3">Test Name</th>
                        <th className="pb-3">Result</th>
                        <th className="pb-3">Unit</th>
                        <th className="pb-3">Reference Range</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#203039]/50">
                      {activeReport.key_findings.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#111F28]/50 transition">
                          <td className="py-3 font-semibold text-[#F4F7FA]">{item.test_name}</td>
                          <td className="py-3 font-mono font-bold text-[#F4F7FA]">{item.result_value}</td>
                          <td className="py-3 text-[#9BAAB6]">{item.unit}</td>
                          <td className="py-3 text-[#9BAAB6]">{item.reference_range}</td>
                          <td className="py-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.is_out_of_range
                                ? 'bg-[#FFB547]/15 text-[#FFB547] border border-[#FFB547]/30'
                                : 'bg-[#00D084]/15 text-[#00D084] border border-[#00D084]/30'
                            }`}>
                              {item.status || (item.is_out_of_range ? 'Abnormal' : 'Normal')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Questions to Ask Your Doctor */}
              {activeReport.questions_for_doctor?.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#080E13] border border-[#203039] space-y-3">
                  <span className="text-xs font-bold text-[#00D084] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#00D084]" />
                    Recommended Questions for Your Doctor
                  </span>
                  <ul className="space-y-2">
                    {activeReport.questions_for_doctor.map((q, qIdx) => (
                      <li key={qIdx} className="text-xs text-[#9BAAB6] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] mt-1.5 flex-shrink-0" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4. Historical Comparison */}
              {activeReport.historical_comparison && (
                <div className="p-4 rounded-xl bg-[#111F28] border border-[#203039] flex items-center justify-between text-xs text-[#9BAAB6]">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#00D084]" />
                    <span>Historical Comparison:</span>
                    <strong className="text-[#F4F7FA]">
                      {activeReport.historical_comparison.trend || 'Trend stable'}
                    </strong>
                  </div>
                  <span className="text-[10px] text-[#9BAAB6]">
                    Prior date: {activeReport.historical_comparison.previous_date || 'N/A'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
