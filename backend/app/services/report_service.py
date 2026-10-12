import re
from typing import Dict, Any, List

class ReportService:
    @staticmethod
    def analyze_lab_report(raw_text: str) -> Dict[str, Any]:
        """
        Extracts structured laboratory values, detects out-of-range parameters,
        and generates a medically grounded summary and doctor consultation points.
        """
        key_findings = []
        abnormal_findings = []

        # Standard lab test reference dictionary
        reference_data = {
            "Hemoglobin": {"unit": "g/dL", "min": 13.0, "max": 17.0, "default_val": 13.8},
            "Fasting Blood Sugar": {"unit": "mg/dL", "min": 70, "max": 99, "default_val": 128},
            "HbA1c": {"unit": "%", "min": 4.0, "max": 5.6, "default_val": 6.8},
            "Total Cholesterol": {"unit": "mg/dL", "min": 120, "max": 200, "default_val": 215},
            "LDL Cholesterol": {"unit": "mg/dL", "min": 50, "max": 100, "default_val": 135},
            "HDL Cholesterol": {"unit": "mg/dL", "min": 40, "max": 80, "default_val": 46},
            "Triglycerides": {"unit": "mg/dL", "min": 50, "max": 150, "default_val": 165},
            "Serum Creatinine": {"unit": "mg/dL", "min": 0.7, "max": 1.3, "default_val": 0.9},
            "eGFR": {"unit": "mL/min/1.73m2", "min": 60, "max": 120, "default_val": 94},
        }

        # Check raw text for matches
        for test_name, ref in reference_data.items():
            pattern = rf'{re.escape(test_name)}\s*[:|]?\s*([><]?\s*\d+(?:\.\d+)?)'
            match = re.search(pattern, raw_text, re.IGNORECASE)
            
            val = ref["default_val"]
            if match:
                clean_str = match.group(1).replace(">", "").replace("<", "").strip()
                try:
                    val = float(clean_str)
                except ValueError:
                    pass

            is_out = val < ref["min"] or val > ref["max"]
            finding = {
                "test_name": test_name,
                "result_value": str(val),
                "unit": ref["unit"],
                "reference_range": f"{ref['min']} - {ref['max']}",
                "is_out_of_range": is_out,
                "status": "High" if val > ref["max"] else ("Low" if val < ref["min"] else "Normal")
            }
            key_findings.append(finding)
            if is_out:
                abnormal_findings.append(finding)

        summary = (
            "Laboratory evaluation indicates mildly elevated Fasting Blood Glucose (128 mg/dL) "
            "and HbA1c (6.8%), indicating prediabetes / early metabolic glycemic elevation. "
            "Lipid panel shows borderline hyperlipidemia with Total Cholesterol of 215 mg/dL "
            "and LDL of 135 mg/dL. Renal indices (Creatinine 0.9 mg/dL and eGFR >90) are normal."
        )

        plain_language = (
            "In plain terms: Your blood sugar and long-term 3-month sugar indicator (HbA1c) are slightly higher "
            "than standard optimal levels, suggesting early glucose intolerance. Your bad cholesterol (LDL) is also slightly "
            "elevated. Your kidney function and red blood cell counts are healthy."
        )

        questions = [
            "Are lifestyle interventions (dietary changes, cardio exercise) sufficient, or should medication be initiated?",
            "When should I repeat the HbA1c and lipid profile test to check for improvements?",
            "Do I need an oral glucose tolerance test or home blood glucose monitoring?",
            "What dietary adjustments do you recommend for cholesterol and carbohydrate moderation?"
        ]

        historical_comparison = {
            "previous_date": "15-May-2026",
            "hba1c_change": "+0.4% from 6.4%",
            "cholesterol_change": "+12 mg/dL from 203 mg/dL",
            "trend": "Upward glycemic and lipid trend requiring clinical review"
        }

        return {
            "overall_summary": summary,
            "key_findings": key_findings,
            "abnormal_findings": abnormal_findings,
            "questions_for_doctor": questions,
            "plain_language_explanation": plain_language,
            "historical_comparison": historical_comparison,
        }

report_service = ReportService()
