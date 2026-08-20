import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    primary_color = colors.HexColor('#0284c7')

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0284c7'),
        fontName='Helvetica-Bold',
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#64748b'),
        fontName='Helvetica',
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#0f172a'),
        fontName='Helvetica-Bold',
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155'),
        fontName='Helvetica',
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#0f172a'),
        fontName='Helvetica-Oblique'
    )

    story = []

    # Title Banner
    story.append(Paragraph("Industrial AI Predictive Maintenance Platform", title_style))
    story.append(Paragraph("<b>Architecture & Operational Workflow Guide (ARC.pdf)</b> | Version 2.5 Enterprise", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=10))

    # Executive Summary
    story.append(Paragraph("1. Executive Architectural Summary", h1_style))
    story.append(Paragraph(
        "This document details the complete end-to-end multi-agent architectural pipeline, mathematical formulations, and operational workflow of the <b>AI Predictive Maintenance Operations Platform</b>. Designed for high-reliability manufacturing environments (CNC machining, stamping presses, welding robotics, and conveyor lines), the system continuously ingests multi-channel IoT sensor telemetry to predict Remaining Useful Life (RUL), diagnose root-cause mechanical failure modes, and generate prescriptive ERP work orders before catastrophic downtime occurs.",
        body_style
    ))

    # Flowchart Diagram Construction using ReportLab Drawing
    story.append(Paragraph("2. End-to-End Multi-Agent Data Pipeline", h1_style))
    story.append(Paragraph("The system operates on an autonomous 5-stage multi-agent supervisory loop:", body_style))

    dwg = Drawing(540, 75)
    # Background card
    dwg.add(Rect(0, 0, 540, 75, fillColor=colors.HexColor('#f8fafc'), strokeColor=colors.HexColor('#cbd5e1'), strokeWidth=1, rx=6, ry=6))
    
    # 5 Process Nodes
    nodes = [
        ("1. Telemetry Agent", "Anomaly Detect", colors.HexColor('#0284c7')),
        ("2. Diagnostic Agent", "Fault Classify", colors.HexColor('#f59e0b')),
        ("3. Prognostic Agent", "RUL Forecast", colors.HexColor('#818cf8')),
        ("4. Prescriptive Agent", "CMMS & Alert", colors.HexColor('#10b981')),
        ("5. Copilot", "OEM Manuals", colors.HexColor('#06b6d4')),
    ]

    x_offset = 10
    node_w = 94
    node_h = 55
    y_pos = 10

    for idx, (title, sub, col) in enumerate(nodes):
        # Node box
        dwg.add(Rect(x_offset, y_pos, node_w, node_h, fillColor=colors.white, strokeColor=col, strokeWidth=1.5, rx=4, ry=4))
        # Top banner
        dwg.add(Rect(x_offset, y_pos + node_h - 18, node_w, 18, fillColor=col, strokeColor=None, rx=4, ry=4))
        dwg.add(String(x_offset + 4, y_pos + node_h - 13, title, fontName="Helvetica-Bold", fontSize=6.5, fillColor=colors.white))
        dwg.add(String(x_offset + 4, y_pos + 22, sub, fontName="Helvetica-Bold", fontSize=7.5, fillColor=colors.HexColor('#0f172a')))
        dwg.add(String(x_offset + 4, y_pos + 8, "Active Loop", fontName="Helvetica", fontSize=6, fillColor=colors.HexColor('#64748b')))
        
        # Arrow connecting to next node
        if idx < 4:
            arrow_x = x_offset + node_w
            dwg.add(Line(arrow_x, y_pos + node_h/2, arrow_x + 10, y_pos + node_h/2, strokeColor=colors.HexColor('#94a3b8'), strokeWidth=1.5))
            dwg.add(Polygon([arrow_x + 10, y_pos + node_h/2 + 3, arrow_x + 13, y_pos + node_h/2, arrow_x + 10, y_pos + node_h/2 - 3], fillColor=colors.HexColor('#94a3b8'), strokeColor=None))

        x_offset += node_w + 12

    story.append(dwg)
    story.append(Spacer(1, 8))

    # Single Step vs Stream Explanation
    story.append(Paragraph("3. Telemetry Execution: Single Step vs. Continuous Stream", h1_style))
    story.append(Paragraph(
        "A common point of operational questions is understanding why the <b>Synthetic Anomaly Injector Console</b> offers both <i>Single Step</i> and <i>Continuous Stream</i> execution modes. Here is the detailed technical breakdown:",
        body_style
    ))

    inject_table_data = [
        [
            Paragraph("<b>Execution Mode</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')),
            Paragraph("<b>What It Does Under the Hood</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')),
            Paragraph("<b>When to Use It</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold'))
        ],
        [
            Paragraph("<b>Single Step<br/>(1 Reading Packet)</b>", body_style),
            Paragraph("Sends a single instantaneous IoT telemetry packet at point <i>t</i>. The Telemetry Agent evaluates anomaly status for that exact reading snapshot.", body_style),
            Paragraph("Use when testing precise incremental metric changes or verifying instantaneous sensor threshold triggers.", body_style)
        ],
        [
            Paragraph("<b>Continuous Stream<br/>(5 Progressive Steps)</b>", body_style),
            Paragraph("Simulates automated progressive sensor degradation over 5 sequential time steps (<i>t+1</i> to <i>t+5</i>), applying cumulative noise and thermal rise curves.", body_style),
            Paragraph("Use when observing how machine RUL drops continuously over time and testing automatic multi-step work order generation.", body_style)
        ]
    ]

    t_inject = Table(inject_table_data, colWidths=[120, 240, 180])
    t_inject.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_inject)
    story.append(Spacer(1, 8))

    # Simplified UI Note
    note_box = [
        [Paragraph("💡 <b>User Experience Enhancement Note:</b> To eliminate operational complexity, the Fault Injector console in the dashboard now features a clean <b>Simulation Execution Mode selector</b> (<i>Single Step</i> vs <i>Continuous Stream</i>) paired with a single prominent <b>🚀 Execute Telemetry Injection</b> button.", callout_style)]
    ]
    t_note = Table(note_box, colWidths=[540])
    t_note.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f9ff')),
        ('BORDER', (0, 0), (-1, -1), 1, colors.HexColor('#38bdf8')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_note)
    story.append(Spacer(1, 10))

    # Core System Capabilities & Mathematical Formulations
    story.append(Paragraph("4. Core Technical Modules & Formulations", h1_style))

    modules_data = [
        [Paragraph("<b>System Module</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')), Paragraph("<b>Mathematical / Algorithmic Foundation</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')), Paragraph("<b>Operational Benefit</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold'))],
        [
            Paragraph("<b>Overall Equipment Effectiveness (OEE)</b>", body_style),
            Paragraph("OEE = Availability x Performance x Quality<br/><i>A = Operating Time / Planned Time</i><br/><i>P = (Ideal Cycle x Count) / Operating</i><br/><i>Q = Good Units / Total Units</i>", body_style),
            Paragraph("Quantifies exact plant-wide production efficiency grade (Target > 85%).", body_style)
        ],
        [
            Paragraph("<b>Signal Processing (FFT Spectrum)</b>", body_style),
            Paragraph("X(f) = Sum x(t) * e^(-j 2 pi f t)<br/>Computes spectral power density across 0-500 Hz to detect 1X/2X misalignment frequencies.", body_style),
            Paragraph("Identifies bearing outer/inner race pass frequencies before physical failure.", body_style)
        ],
        [
            Paragraph("<b>Explainable AI (SHAP XAI)</b>", body_style),
            Paragraph("Shapley values phi_i(x) scoring percentage risk contributions for each sensor metric.", body_style),
            Paragraph("Provides clear feature risk attribution (e.g. Vibration +45%, Temp +30%).", body_style)
        ],
        [
            Paragraph("<b>Multimodal Inspection (CV & Audio)</b>", body_style),
            Paragraph("Optical bounding box CNN inference + Microphone decibel spectrogram peak matching.", body_style),
            Paragraph("Detects surface metal spalling, fluid leaks, and pump cavitation noise.", body_style)
        ],
        [
            Paragraph("<b>OEM Knowledge Base</b>", body_style),
            Paragraph("Vector Index (FAISS / Cosine Similarity) over OEM technical manuals (SKF, Siemens, Parker).", body_style),
            Paragraph("Technicians receive instant torque specs (e.g. 45 Nm) and step-by-step SOP guides.", body_style)
        ]
    ]

    t_mod = Table(modules_data, colWidths=[130, 240, 170])
    t_mod.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_mod)
    story.append(Spacer(1, 10))

    # User Guide to Navigating the 5 Tabs
    story.append(Paragraph("5. Step-by-Step Operator Navigation Guide", h1_style))
    story.append(Paragraph("• <b>Tab 1: Fleet Overview & Telemetry</b> — Monitor plant-wide health matrix, KPI cards, real-time Recharts waveforms, and run hardware fault simulations.", bullet_style))
    story.append(Paragraph("• <b>Tab 2: FFT Signal & SHAP XAI</b> — Inspect vibration frequency power spectra (0-500 Hz) and view SHAP anomaly risk attributions.", bullet_style))
    story.append(Paragraph("• <b>Tab 3: Visual & Acoustic AI</b> — Run computer vision optical part defect scans and microphone audio spectrogram noise checks.", bullet_style))
    story.append(Paragraph("• <b>Tab 4: CMMS Work Orders & Inventory</b> — Review prescriptive repair tickets, track warehouse spare parts stock, and export SAP PM / IBM Maximo JSON schemas.", bullet_style))
    story.append(Paragraph("• <b>Tab 5: Assistant</b> — Ask natural language operational queries and retrieve OEM manual citations with exact page numbers and torque specs.", bullet_style))

    doc.build(story)
    print(f"Successfully generated {filename}")

if __name__ == '__main__':
    target_path = os.path.join(os.getcwd(), 'ARC.pdf')
    build_pdf(target_path)
    
    # Also copy to artifacts directory
    artifacts_dir = r"C:\Users\Venkat_Vatshal\.gemini\antigravity\brain\80c5dd33-eebb-42b3-bb3a-228486788f3f"
    if os.path.exists(artifacts_dir):
        artifact_pdf = os.path.join(artifacts_dir, 'ARC.pdf')
        build_pdf(artifact_pdf)
