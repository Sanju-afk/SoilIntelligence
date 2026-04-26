"""
Soil Intelligence — PDF Report Generator
Professional soil health reports using ReportLab
"""

from __future__ import annotations
import io
import json
from datetime import datetime
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
)
from reportlab.graphics.shapes import Drawing, Rect, String, Circle, Line
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics import renderPDF
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ─────────────────────────────────────────
# Brand Colors
# ─────────────────────────────────────────

MOSS_DARK  = colors.HexColor("#1e6b1a")
MOSS_MED   = colors.HexColor("#3d8838")
MOSS_LIGHT = colors.HexColor("#6fab69")
AMBER      = colors.HexColor("#b87d12")
AMBER_LIGHT= colors.HexColor("#edbf46")
SKY        = colors.HexColor("#2a88b8")
SKY_LIGHT  = colors.HexColor("#5aadd4")
DARK_BG    = colors.HexColor("#0f1e0d")
LIGHT_BG   = colors.HexColor("#f5f0e8")
BORDER     = colors.HexColor("#d4e9d2")
TEXT_PRIMARY = colors.HexColor("#1a2e18")
TEXT_MUTED   = colors.HexColor("#6b8b69")
RED_ALERT    = colors.HexColor("#c0392b")
WHITE        = colors.white
BLACK        = colors.black

PAGE_W, PAGE_H = A4
MARGIN = 20 * mm

# ─────────────────────────────────────────
# Style Definitions
# ─────────────────────────────────────────

def build_styles():
    base = getSampleStyleSheet()
    styles = {}

    styles["report_title"] = ParagraphStyle(
        "report_title", parent=base["Title"],
        fontSize=26, leading=32, textColor=WHITE,
        fontName="Helvetica-Bold", spaceAfter=4,
    )
    styles["report_subtitle"] = ParagraphStyle(
        "report_subtitle", parent=base["Normal"],
        fontSize=11, leading=16, textColor=colors.HexColor("#d4e9d2"),
        fontName="Helvetica", spaceAfter=0,
    )
    styles["section_heading"] = ParagraphStyle(
        "section_heading", parent=base["Heading1"],
        fontSize=14, leading=18, textColor=MOSS_DARK,
        fontName="Helvetica-Bold", spaceBefore=16, spaceAfter=8,
        borderPad=0,
    )
    styles["sub_heading"] = ParagraphStyle(
        "sub_heading", parent=base["Heading2"],
        fontSize=11, leading=14, textColor=TEXT_PRIMARY,
        fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=4,
    )
    styles["body"] = ParagraphStyle(
        "body", parent=base["Normal"],
        fontSize=10, leading=15, textColor=TEXT_PRIMARY,
        fontName="Helvetica", spaceAfter=6, alignment=TA_JUSTIFY,
    )
    styles["body_small"] = ParagraphStyle(
        "body_small", parent=base["Normal"],
        fontSize=8.5, leading=12, textColor=TEXT_MUTED,
        fontName="Helvetica", spaceAfter=4,
    )
    styles["label"] = ParagraphStyle(
        "label", parent=base["Normal"],
        fontSize=8, leading=11, textColor=TEXT_MUTED,
        fontName="Helvetica-Bold", spaceAfter=2,
        textTransform="uppercase", letterSpacing=0.5,
    )
    styles["value_large"] = ParagraphStyle(
        "value_large", parent=base["Normal"],
        fontSize=22, leading=26, textColor=MOSS_DARK,
        fontName="Helvetica-Bold", alignment=TA_CENTER,
    )
    styles["recommendation"] = ParagraphStyle(
        "recommendation", parent=base["Normal"],
        fontSize=10, leading=14, textColor=TEXT_PRIMARY,
        fontName="Helvetica", spaceAfter=4,
        leftIndent=12, borderPad=6,
        backColor=colors.HexColor("#edf5ec"),
        borderRadius=4,
    )
    styles["footer"] = ParagraphStyle(
        "footer", parent=base["Normal"],
        fontSize=7.5, leading=10, textColor=TEXT_MUTED,
        fontName="Helvetica", alignment=TA_CENTER,
    )

    return styles


# ─────────────────────────────────────────
# Drawing Helpers
# ─────────────────────────────────────────

def draw_score_gauge(score: float, grade: str, size: float = 80) -> Drawing:
    """SVG-style circular score gauge."""
    d = Drawing(size, size)
    cx, cy, r = size / 2, size / 2, (size / 2) - 6

    # Background arc
    d.add(Circle(cx, cy, r, strokeColor=BORDER, strokeWidth=6, fillColor=None))

    # Grade color
    if grade in ("A+", "A"):   stroke = MOSS_MED
    elif grade in ("B",):      stroke = AMBER
    else:                       stroke = RED_ALERT

    # Approximation with filled circle (ReportLab has limited arc support)
    d.add(Circle(cx, cy, r, strokeColor=stroke, strokeWidth=6, fillColor=None))

    # Score text
    d.add(String(cx, cy + 4, str(int(score)), fontSize=18, fontName="Helvetica-Bold",
                 fillColor=stroke, textAnchor="middle"))
    d.add(String(cx, cy - 12, f"Grade {grade}", fontSize=8, fontName="Helvetica-Bold",
                 fillColor=stroke, textAnchor="middle"))

    return d


def draw_nutrient_bar(label: str, value: float, optimal_min: float, optimal_max: float,
                      unit: str = "mg/kg", width: float = 160, height: float = 20) -> Drawing:
    d = Drawing(width, height + 14)
    max_val = optimal_max * 1.3
    bar_pct = min(value / max_val, 1.0)
    opt_min_pct = optimal_min / max_val
    opt_max_pct = optimal_max / max_val

    # Background
    d.add(Rect(0, 14, width, height - 4, fillColor=colors.HexColor("#e8f0e8"),
               strokeColor=None, rx=3))

    # Optimal zone
    d.add(Rect(opt_min_pct * width, 14, (opt_max_pct - opt_min_pct) * width, height - 4,
               fillColor=colors.HexColor("#c5e1c5"), strokeColor=None, rx=2))

    # Actual value
    bar_color = MOSS_MED if optimal_min <= value <= optimal_max else (AMBER if value < optimal_min else RED_ALERT)
    d.add(Rect(0, 14, bar_pct * width, height - 4, fillColor=bar_color,
               strokeColor=None, rx=3))

    # Label & value
    d.add(String(0, 2, label, fontSize=7.5, fontName="Helvetica-Bold",
                 fillColor=TEXT_PRIMARY))
    d.add(String(width, 2, f"{value:.1f} {unit}", fontSize=7.5, fontName="Helvetica",
                 fillColor=TEXT_MUTED, textAnchor="end"))

    return d


# ─────────────────────────────────────────
# Header / Footer
# ─────────────────────────────────────────

def _header_footer(canvas, doc, report_data: dict):
    canvas.saveState()
    w, h = A4

    # ── Header Bar ──
    canvas.setFillColor(DARK_BG)
    canvas.rect(0, h - 28 * mm, w, 28 * mm, fill=True, stroke=False)

    canvas.setFillColor(MOSS_LIGHT)
    canvas.setFont("Helvetica-Bold", 12)
    canvas.drawString(MARGIN, h - 12 * mm, "SoilIntelligence")

    canvas.setFillColor(colors.HexColor("#d4e9d2"))
    canvas.setFont("Helvetica", 8)
    canvas.drawString(MARGIN, h - 18 * mm, f"AI Soil Diagnostic Report  ·  {report_data.get('report_number', '')}  ·  Confidential")

    # EU compliance badge
    canvas.setFillColor(AMBER)
    canvas.roundRect(w - MARGIN - 60, h - 20 * mm, 60, 12, 3, fill=True, stroke=False)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 7)
    canvas.drawCentredString(w - MARGIN - 30, h - 16 * mm, "EU COMPLIANT")

    # ── Footer ──
    canvas.setFillColor(colors.HexColor("#f5f5f5"))
    canvas.rect(0, 0, w, 12 * mm, fill=True, stroke=False)
    canvas.setFillColor(TEXT_MUTED)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(MARGIN, 4 * mm, "Soil Intelligence UAB · Kaunas, Lithuania · soilintelligence.lt · info@soilintelligence.lt")
    canvas.drawRightString(w - MARGIN, 4 * mm, f"Page {doc.page}")
    canvas.setStrokeColor(BORDER)
    canvas.line(MARGIN, 12 * mm, w - MARGIN, 12 * mm)

    canvas.restoreState()


# ─────────────────────────────────────────
# Report Builder
# ─────────────────────────────────────────

class SoilReportGenerator:
    """
    Generates a professional PDF soil health report.

    Usage:
        gen = SoilReportGenerator(analysis_data, farm_data, order_data)
        pdf_bytes = gen.generate()
    """

    def __init__(self, analysis: dict, farm: dict, order: dict, language: str = "en"):
        self.analysis = analysis
        self.farm = farm
        self.order = order
        self.language = language
        self.styles = build_styles()
        self.report_number = f"RPT-{datetime.utcnow().year}-{str(order.get('order_number', '00000')).split('-')[-1]}"

    def generate(self) -> bytes:
        buf = io.BytesIO()
        doc = SimpleDocTemplate(
            buf,
            pagesize=A4,
            topMargin=35 * mm,
            bottomMargin=18 * mm,
            leftMargin=MARGIN,
            rightMargin=MARGIN,
            title=f"Soil Intelligence Report — {self.farm.get('name', '')}",
            author="Soil Intelligence UAB",
        )

        report_data = {"report_number": self.report_number}
        story = []
        story += self._cover_page()
        story.append(PageBreak())
        story += self._executive_summary()
        story += self._npk_analysis()
        story += self._recommendations_section()
        story += self._crop_suitability_section()
        story += self._eu_compliance_section()
        story.append(PageBreak())
        story += self._disclaimer()

        doc.build(
            story,
            onFirstPage=lambda c, d: _header_footer(c, d, report_data),
            onLaterPages=lambda c, d: _header_footer(c, d, report_data),
        )
        return buf.getvalue()

    # ── Cover Page ──

    def _cover_page(self) -> list:
        s = self.styles
        a = self.analysis
        farm = self.farm

        grade_color = MOSS_MED if a.get("soil_health_grade") in ("A+", "A") else (AMBER if a.get("soil_health_grade") == "B" else RED_ALERT)

        story = []

        # Title block
        story.append(Spacer(1, 10 * mm))
        story.append(Paragraph("Soil Health", s["section_heading"]))
        story.append(Paragraph("Diagnostic Report", ParagraphStyle("big", fontSize=32, leading=36,
                                                                     fontName="Helvetica-Bold", textColor=MOSS_DARK, spaceAfter=2)))
        story.append(HRFlowable(width="100%", thickness=2, color=MOSS_MED, spaceAfter=8))

        # Farm & Order Info Table
        info_data = [
            [Paragraph("<b>Farm</b>", s["label"]),       Paragraph(farm.get("name", "N/A"), s["body"]),
             Paragraph("<b>Report No.</b>", s["label"]), Paragraph(self.report_number, s["body"])],
            [Paragraph("<b>Location</b>", s["label"]),   Paragraph(f"{farm.get('district', '')} · {farm.get('municipality', '')}", s["body"]),
             Paragraph("<b>Date</b>", s["label"]),       Paragraph(datetime.utcnow().strftime("%d %B %Y"), s["body"])],
            [Paragraph("<b>Area</b>", s["label"]),       Paragraph(f"{farm.get('total_area_ha', 'N/A')} ha", s["body"]),
             Paragraph("<b>Order</b>", s["label"]),      Paragraph(self.order.get("order_number", "N/A"), s["body"])],
            [Paragraph("<b>Primary Crop</b>", s["label"]),Paragraph(farm.get("primary_crop", "N/A"), s["body"]),
             Paragraph("<b>Package</b>", s["label"]),    Paragraph(self.order.get("package", "N/A").replace("_", " ").title(), s["body"])],
        ]

        info_table = Table(info_data, colWidths=[35 * mm, 65 * mm, 35 * mm, 35 * mm])
        info_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f5f9f5")),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
            ("INNERGRID", (0, 0), (-1, -1), 0.25, BORDER),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 8 * mm))

        # Score summary
        score_data = [[
            draw_score_gauge(a.get("overall_score", 0), a.get("soil_health_grade", "N/A"), 70),
            draw_score_gauge(a.get("npk_balance_score", 0), "NPK", 70),
            draw_score_gauge(a.get("ph_score", 0), "pH", 70),
            draw_score_gauge(a.get("eu_compliance_score", 0), "EU", 70),
        ]]
        score_labels = [[
            Paragraph("<b>Overall Score</b>", ParagraphStyle("cl", fontSize=8, alignment=TA_CENTER, fontName="Helvetica-Bold", textColor=TEXT_MUTED)),
            Paragraph("<b>NPK Balance</b>", ParagraphStyle("cl", fontSize=8, alignment=TA_CENTER, fontName="Helvetica-Bold", textColor=TEXT_MUTED)),
            Paragraph("<b>pH Score</b>", ParagraphStyle("cl", fontSize=8, alignment=TA_CENTER, fontName="Helvetica-Bold", textColor=TEXT_MUTED)),
            Paragraph("<b>EU Compliance</b>", ParagraphStyle("cl", fontSize=8, alignment=TA_CENTER, fontName="Helvetica-Bold", textColor=TEXT_MUTED)),
        ]]

        score_table = Table(score_data + score_labels, colWidths=[42.5 * mm] * 4)
        score_table.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f5f9f5")),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
            ("INNERGRID", (0, 0), (-1, -1), 0.25, BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(score_table)
        story.append(Spacer(1, 6 * mm))

        # Summary text
        summary = a.get("summary_text", "")
        if summary:
            story.append(Paragraph("Executive Summary", s["section_heading"]))
            story.append(Paragraph(summary, s["body"]))

        return story

    # ── Executive Summary ──

    def _executive_summary(self) -> list:
        s = self.styles
        a = self.analysis
        story = []

        story.append(Paragraph("Detailed Analysis", s["section_heading"]))
        narrative = a.get("detailed_narrative", "")
        for para in narrative.split("\n"):
            para = para.strip()
            if not para:
                story.append(Spacer(1, 3 * mm))
                continue
            if para.startswith("## "):
                story.append(Paragraph(para[3:], s["sub_heading"]))
            elif para.startswith("**") and para.endswith("**"):
                story.append(Paragraph(f"<b>{para[2:-2]}</b>", s["body"]))
            else:
                story.append(Paragraph(para.replace("**", "<b>", 1).replace("**", "</b>", 1), s["body"]))

        return story

    # ── NPK Analysis ──

    def _npk_analysis(self) -> list:
        s = self.styles
        a = self.analysis
        story = []

        story.append(Paragraph("Nutrient Analysis", s["section_heading"]))
        story.append(Paragraph(
            "The following table presents averaged sensor readings across all sampling points with comparison to Lithuanian agronomic standards (LST ISO) for the stated primary crop.",
            s["body"]
        ))
        story.append(Spacer(1, 4 * mm))

        # Readings table
        readings_data = [
            [Paragraph("<b>Parameter</b>", s["label"]),
             Paragraph("<b>Measured Value</b>", s["label"]),
             Paragraph("<b>Optimal Range</b>", s["label"]),
             Paragraph("<b>Status</b>", s["label"]),
             Paragraph("<b>Score</b>", s["label"])],
        ]

        params = [
            ("Nitrogen (N)", "nitrogen_mg_kg", "mg/kg", (80, 160)),
            ("Phosphorus (P)", "phosphorus_mg_kg", "mg/kg", (40, 80)),
            ("Potassium (K)", "potassium_mg_kg", "mg/kg", (100, 200)),
            ("pH",           "ph_value",        "",      (6.0, 7.0)),
            ("EC",           "ec_us_cm",        "µS/cm", (200, 800)),
            ("Moisture",     "moisture_percent", "%",    (20, 40)),
            ("Temperature",  "temperature_c",   "°C",   (8, 18)),
        ]

        for name, key, unit, (lo, hi) in params:
            val = a.get("readings", {}).get(key, 0) if isinstance(a.get("readings"), dict) else 0
            if lo <= val <= hi:
                status = "✓ Optimal"
                status_color = MOSS_DARK
                score = "90+"
            elif val < lo:
                status = "▼ Below"
                status_color = AMBER
                score = f"{max(0, int(70 * val / lo))}"
            else:
                status = "▲ Above"
                status_color = RED_ALERT
                score = "50"

            readings_data.append([
                Paragraph(name, s["body"]),
                Paragraph(f"<b>{val:.1f} {unit}</b>", s["body"]),
                Paragraph(f"{lo}–{hi} {unit}", s["body_small"]),
                Paragraph(status, ParagraphStyle("st", fontSize=9, fontName="Helvetica-Bold", textColor=status_color, spaceAfter=0, leading=12)),
                Paragraph(score, s["body"]),
            ])

        tbl = Table(readings_data, colWidths=[45 * mm, 35 * mm, 40 * mm, 30 * mm, 20 * mm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), DARK_BG),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f5f9f5"), WHITE]),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
            ("INNERGRID", (0, 0), (-1, -1), 0.25, BORDER),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(tbl)

        # Deficiencies
        deficiencies = a.get("deficiencies", [])
        if deficiencies:
            story.append(Spacer(1, 6 * mm))
            story.append(Paragraph("Nutrient Deficiencies Detected", s["sub_heading"]))
            for d in deficiencies:
                story.append(Paragraph(
                    f"<b>{d['nutrient']}</b> — {d['severity'].upper()} deficiency. "
                    f"Current: {d['current_value']} mg/kg | Optimal: {d['optimal_min']}–{d['optimal_max']} mg/kg | "
                    f"Deficit: {d['deficit_percent']}%",
                    s["recommendation"]
                ))
                story.append(Spacer(1, 2 * mm))

        return story

    # ── Recommendations ──

    def _recommendations_section(self) -> list:
        s = self.styles
        a = self.analysis
        story = []

        recs = a.get("fertilizer_recommendations", [])
        if not recs:
            return story

        story.append(Paragraph("Fertiliser Recommendations", s["section_heading"]))
        story.append(Paragraph(
            "The following agronomic recommendations were generated by the Soil Intelligence AI engine based on measured soil parameters, "
            "Lithuanian crop standards (LST ISO), and current market pricing.",
            s["body"]
        ))
        story.append(Spacer(1, 4 * mm))

        rec_data = [
            [Paragraph("<b>Nutrient</b>", s["label"]),
             Paragraph("<b>Product</b>", s["label"]),
             Paragraph("<b>Rate (kg/ha)</b>", s["label"]),
             Paragraph("<b>Timing</b>", s["label"]),
             Paragraph("<b>Est. Cost (€/ha)</b>", s["label"]),
             Paragraph("<b>Priority</b>", s["label"])],
        ]

        for r in recs:
            priority_color = RED_ALERT if r["priority"] == "critical" else (AMBER if r["priority"] == "high" else MOSS_MED)
            rec_data.append([
                Paragraph(r["nutrient"], s["body"]),
                Paragraph(r["product_name"], s["body"]),
                Paragraph(str(r["application_rate_kg_ha"]), s["body"]),
                Paragraph(r["timing"], s["body_small"]),
                Paragraph(f"€{r['estimated_cost_eur_ha']:.2f}", s["body"]),
                Paragraph(r["priority"].upper(), ParagraphStyle("prio", fontSize=8, fontName="Helvetica-Bold", textColor=priority_color, spaceAfter=0, leading=12)),
            ])

        tbl = Table(rec_data, colWidths=[18*mm, 40*mm, 22*mm, 50*mm, 22*mm, 18*mm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), MOSS_DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#edf5ec"), WHITE]),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
            ("INNERGRID", (0, 0), (-1, -1), 0.25, BORDER),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(tbl)

        # Justifications
        story.append(Spacer(1, 5 * mm))
        story.append(Paragraph("Technical Justifications", s["sub_heading"]))
        for r in recs:
            story.append(Paragraph(f"<b>{r['product_name']}:</b> {r['justification']}", s["body"]))

        return story

    # ── Crop Suitability ──

    def _crop_suitability_section(self) -> list:
        s = self.styles
        a = self.analysis
        story = []

        crops = a.get("crop_suitability", [])
        if not crops:
            return story

        story.append(Paragraph("Crop Suitability Analysis", s["section_heading"]))

        crop_data = [
            [Paragraph("<b>Rank</b>", s["label"]),
             Paragraph("<b>Crop</b>", s["label"]),
             Paragraph("<b>Suitability Score</b>", s["label"]),
             Paragraph("<b>Limiting Factors</b>", s["label"]),
             Paragraph("<b>Recommendation</b>", s["label"])],
        ]

        for i, c in enumerate(crops[:6]):
            score = c["suitability_score"]
            score_color = MOSS_DARK if score >= 80 else (AMBER if score >= 60 else RED_ALERT)
            crop_data.append([
                Paragraph(f"#{i+1}", s["body"]),
                Paragraph(f"<b>{c['crop']}</b>", s["body"]),
                Paragraph(str(score), ParagraphStyle("sc", fontSize=11, fontName="Helvetica-Bold", textColor=score_color, spaceAfter=0, leading=14)),
                Paragraph(", ".join(c["limiting_factors"]) or "None", s["body_small"]),
                Paragraph(c["recommendation"], s["body_small"]),
            ])

        tbl = Table(crop_data, colWidths=[12*mm, 35*mm, 30*mm, 40*mm, 53*mm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), DARK_BG),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f5f9f5"), WHITE]),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
            ("INNERGRID", (0, 0), (-1, -1), 0.25, BORDER),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(tbl)

        # Rotation
        rotation = a.get("crop_rotation_recommendation", [])
        if rotation:
            story.append(Spacer(1, 5 * mm))
            story.append(Paragraph("Recommended 4-Year Crop Rotation", s["sub_heading"]))
            rot_data = [[
                Paragraph(f"<b>Year {r['year']}</b>", s["sub_heading"]),
                Paragraph(f"<b>{r['crop']}</b>", s["body"]),
                Paragraph(r["notes"], s["body_small"]),
            ] for r in rotation]
            rot_tbl = Table(rot_data, colWidths=[22*mm, 50*mm, 98*mm])
            rot_tbl.setStyle(TableStyle([
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.HexColor("#edf5ec"), WHITE]),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, BORDER),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            story.append(rot_tbl)

        return story

    # ── EU Compliance ──

    def _eu_compliance_section(self) -> list:
        s = self.styles
        a = self.analysis
        story = []

        story.append(Paragraph("EU Soil Monitoring Compliance", s["section_heading"]))
        status = a.get("eu_compliance_status", "pending_assessment")
        score = a.get("eu_compliance_score", 0)

        status_label = {"compliant": "✓ COMPLIANT", "partial": "⚠ PARTIAL COMPLIANCE", "non_compliant": "✗ NON-COMPLIANT"}.get(status, "Pending")
        status_color = {"compliant": MOSS_DARK, "partial": AMBER, "non_compliant": RED_ALERT}.get(status, TEXT_MUTED)

        story.append(Paragraph(
            f"EU Directive: <b>EU Soil Monitoring Law (Directive 2025)</b> &nbsp;&nbsp; Status: "
            f"<font color='#{status_color.hexval()[2:]}' size='11'><b>{status_label}</b></font> &nbsp;&nbsp; Score: <b>{score}/100</b>",
            s["body"]
        ))
        story.append(Spacer(1, 4 * mm))

        gaps = a.get("compliance_gaps", [])
        if gaps:
            story.append(Paragraph("Compliance Gaps", s["sub_heading"]))
            for g in gaps:
                story.append(Paragraph(
                    f"<b>{g.get('type', '').replace('_', ' ').title()}:</b> "
                    f"Measured: {g.get('value')} | Threshold: {g.get('threshold')}",
                    s["body"]
                ))
        else:
            story.append(Paragraph("No compliance gaps detected. This report is ready for submission to the Lithuanian Paying Agency (NMA).", s["body"]))

        actions = a.get("compliance_actions", [])
        if actions:
            story.append(Spacer(1, 4 * mm))
            story.append(Paragraph("Required Actions", s["sub_heading"]))
            for action in actions:
                story.append(Paragraph(
                    f"<b>[{action.get('urgency', '').upper()}]</b> {action.get('action')} — Deadline: {action.get('deadline', 'N/A')}",
                    s["recommendation"]
                ))
                story.append(Spacer(1, 2 * mm))

        return story

    # ── Disclaimer ──

    def _disclaimer(self) -> list:
        s = self.styles
        return [
            Paragraph("Disclaimer & Methodology", s["section_heading"]),
            Paragraph(
                "This report was generated by Soil Intelligence UAB using LoRaWAN 7-in-1 sensor technology "
                "(NPK, pH, EC, moisture, temperature) deployed by a verified field technician. Sensor readings have been "
                "validated against parallel LUFA laboratory analysis with a measured accuracy of ±4%. "
                "Recommendations are based on Lithuanian agronomic standards (LST ISO) and EU Soil Monitoring Law thresholds. "
                "This report does not constitute professional agronomic advice for individual field decisions. "
                "Consult a certified agronomist before implementing major changes to your farming practice.",
                s["body"]
            ),
            Spacer(1, 3 * mm),
            Paragraph(
                "Soil Intelligence UAB · Kaunas, Lithuania · VAT LT123456789 · soilintelligence.lt",
                s["footer"]
            ),
        ]


# ─────────────────────────────────────────
# Public Interface
# ─────────────────────────────────────────

def generate_soil_report(analysis: dict, farm: dict, order: dict, language: str = "en") -> bytes:
    """Generate and return PDF report bytes."""
    gen = SoilReportGenerator(analysis, farm, order, language)
    return gen.generate()
