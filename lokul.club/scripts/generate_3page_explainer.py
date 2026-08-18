#!/usr/bin/env python3
"""
Generate a 3-page Lokul explanatory document (idea + how it works, no revenue)
Focuses on: Problem → Solution → Impact
Visualizations: Community structure, how it works diagram, network effects
"""

import os
from pathlib import Path
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from PIL import Image as PILImage, ImageDraw, ImageFont

# ============================================================================
# CONFIGURATION
# ============================================================================

OUTPUT_DIR = Path("/Users/vivekanandchoudhari/try/lokul.club/pdf_assets_3pager")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

COLORS_BRAND = {
    "primary": "#1D65AF",      # Lokul blue
    "primary_dark": "#165499",
    "secondary": "#EA580C",    # Movement orange
    "flow": "#14B8A6",         # Teal accent
    "gray_50": "#F9FAFB",
    "gray_100": "#F3F4F6",
    "gray_200": "#E5E7EB",
    "gray_400": "#9CA3AF",
    "gray_700": "#374151",
    "success": "#059669",
    "warning": "#D97706",
}

HEX_TO_RGB = {
    "#1D65AF": (29, 101, 175),
    "#165499": (22, 84, 153),
    "#EA580C": (234, 88, 12),
    "#14B8A6": (20, 184, 166),
    "#EEF4FB": (238, 244, 251),
    "#FFF7ED": (255, 247, 237),
    "#F0FDFA": (240, 253, 250),
    "#F9FAFB": (249, 250, 251),
    "#F3F4F6": (243, 244, 246),
    "#FEF2F2": (254, 242, 242),
    "#F0FDF4": (240, 253, 244),
    "#E5E7EB": (229, 231, 235),
    "#D1D5DB": (209, 213, 219),
    "#9CA3AF": (156, 163, 175),
    "#374151": (55, 65, 81),
    "#059669": (5, 150, 105),
    "#D97706": (217, 151, 6),
    "#DC2626": (220, 38, 38),
}

# ============================================================================
# VISUALIZATION GENERATORS
# ============================================================================

def create_community_structure_diagram():
    """
    Diagram showing how a Lokul community is structured
    - Center: Community (100-300 households)
    - Layers: Residents, Merchants, Service Providers, Volunteers
    """
    img = PILImage.new('RGB', (1200, 800), color=HEX_TO_RGB["#F9FAFB"])
    draw = ImageDraw.Draw(img)
    
    # Center circle (Community)
    center_x, center_y = 600, 400
    community_radius = 120
    draw.ellipse(
        [center_x - community_radius, center_y - community_radius,
         center_x + community_radius, center_y + community_radius],
        fill=HEX_TO_RGB["#1D65AF"],
        outline=HEX_TO_RGB["#165499"],
        width=3
    )
    draw.text((center_x - 60, center_y - 20), "COMMUNITY", fill=(255, 255, 255))
    draw.text((center_x - 80, center_y + 15), "100-300 Houses", fill=(255, 255, 255))
    
    # Ring 1: Residents
    resident_radius = 200
    draw.ellipse(
        [center_x - resident_radius, center_y - resident_radius,
         center_x + resident_radius, center_y + resident_radius],
        outline=HEX_TO_RGB["#14B8A6"],
        width=4
    )
    draw.text((center_x + resident_radius + 20, center_y - 10), "RESIDENTS", fill=HEX_TO_RGB["#14B8A6"])
    
    # Ring 2: Merchants + Service Providers
    merchant_radius = 280
    draw.ellipse(
        [center_x - merchant_radius, center_y - merchant_radius,
         center_x + merchant_radius, center_y + merchant_radius],
        outline=HEX_TO_RGB["#EA580C"],
        width=4
    )
    draw.text((center_x + merchant_radius + 20, center_y + 40), "MERCHANTS & SERVICES", fill=HEX_TO_RGB["#EA580C"])
    
    # Ring 3: All connected
    connection_radius = 350
    draw.ellipse(
        [center_x - connection_radius, center_y - connection_radius,
         center_x + connection_radius, center_y + connection_radius],
        outline=HEX_TO_RGB["#9CA3AF"],
        width=2
    )
    
    # Draw some connecting lines
    for angle in [0, 45, 90, 135, 180, 225, 270, 315]:
        import math
        rad = math.radians(angle)
        x1 = center_x + community_radius * math.cos(rad)
        y1 = center_y + community_radius * math.sin(rad)
        x2 = center_x + merchant_radius * math.cos(rad)
        y2 = center_y + merchant_radius * math.sin(rad)
        draw.line([(x1, y1), (x2, y2)], fill=HEX_TO_RGB["#D1D5DB"], width=2)
    
    img.save(OUTPUT_DIR / "3p_01_community_structure.png")
    print("✅ Community structure diagram created")


def create_how_it_works_diagram():
    """
    3-step flow showing how Lokul works:
    1. Discover (geo-verified app)
    2. Connect (see neighbors & services)
    3. Transact (trust-based commerce)
    """
    img = PILImage.new('RGB', (1200, 400), color=HEX_TO_RGB["#F9FAFB"])
    draw = ImageDraw.Draw(img)
    
    # Step 1: Discover
    step1_x = 150
    draw.rectangle([50, 100, 250, 300], fill=HEX_TO_RGB["#EEF4FB"], outline=HEX_TO_RGB["#1D65AF"], width=3)
    draw.text((step1_x - 60, 120), "STEP 1", fill=HEX_TO_RGB["#1D65AF"])
    draw.text((step1_x - 50, 160), "DISCOVER", fill=HEX_TO_RGB["#1D65AF"])
    draw.text((step1_x - 80, 210), "GPS-verified", fill=HEX_TO_RGB["#374151"])
    draw.text((step1_x - 80, 240), "your community", fill=HEX_TO_RGB["#374151"])
    
    # Arrow 1
    draw.line([(260, 200), (340, 200)], fill=HEX_TO_RGB["#374151"], width=3)
    draw.polygon([(340, 200), (325, 190), (325, 210)], fill=HEX_TO_RGB["#374151"])
    
    # Step 2: Connect
    step2_x = 500
    draw.rectangle([400, 100, 600, 300], fill=HEX_TO_RGB["#FFF7ED"], outline=HEX_TO_RGB["#EA580C"], width=3)
    draw.text((step2_x - 60, 120), "STEP 2", fill=HEX_TO_RGB["#EA580C"])
    draw.text((step2_x - 50, 160), "CONNECT", fill=HEX_TO_RGB["#EA580C"])
    draw.text((step2_x - 100, 210), "Find neighbors &", fill=HEX_TO_RGB["#374151"])
    draw.text((step2_x - 100, 240), "services nearby", fill=HEX_TO_RGB["#374151"])
    
    # Arrow 2
    draw.line([(610, 200), (690, 200)], fill=HEX_TO_RGB["#374151"], width=3)
    draw.polygon([(690, 200), (675, 190), (675, 210)], fill=HEX_TO_RGB["#374151"])
    
    # Step 3: Transact
    step3_x = 850
    draw.rectangle([750, 100, 950, 300], fill=HEX_TO_RGB["#F0FDFA"], outline=HEX_TO_RGB["#14B8A6"], width=3)
    draw.text((step3_x - 60, 120), "STEP 3", fill=HEX_TO_RGB["#14B8A6"])
    draw.text((step3_x - 60, 160), "TRANSACT", fill=HEX_TO_RGB["#14B8A6"])
    draw.text((step3_x - 100, 210), "Trust-based", fill=HEX_TO_RGB["#374151"])
    draw.text((step3_x - 100, 240), "commerce & payments", fill=HEX_TO_RGB["#374151"])
    
    img.save(OUTPUT_DIR / "3p_02_how_it_works.png")
    print("✅ How it works diagram created")


def create_peer_roles_visualization():
    """
    Show 6 peer roles in Lokul ecosystem
    - Each role as a card with icon description
    """
    img = PILImage.new('RGB', (1200, 600), color=HEX_TO_RGB["#F9FAFB"])
    draw = ImageDraw.Draw(img)
    
    roles = [
        ("Kirana\nOwner", "Runs digital\nneighborhood\nstore", 100, 100),
        ("Service\nProvider", "Tutor, plumber,\nservices nearby", 450, 100),
        ("Chef/\nCook", "Home food\ndelivery trusted", 800, 100),
        ("Volunteer\nLeader", "Moderates\ncommunity", 100, 350),
        ("Elder\nAdviser", "Vouch for\nothers", 450, 350),
        ("Newbie\nResident", "Discover local\nservices", 800, 350),
    ]
    
    colors_list = [
        HEX_TO_RGB["#1D65AF"],
        HEX_TO_RGB["#EA580C"],
        HEX_TO_RGB["#14B8A6"],
        HEX_TO_RGB["#D97706"],
        HEX_TO_RGB["#059669"],
        HEX_TO_RGB["#9CA3AF"],
    ]
    
    for i, (role_name, description, x, y) in enumerate(roles):
        # Card background
        draw.rectangle([x - 70, y, x + 70, y + 150], fill=HEX_TO_RGB["#F3F4F6"], outline=colors_list[i], width=2)
        
        # Role name
        draw.text((x - 50, y + 10), role_name, fill=colors_list[i])
        
        # Description (smaller text)
        draw.text((x - 60, y + 50), description, fill=HEX_TO_RGB["#374151"])
    
    img.save(OUTPUT_DIR / "3p_03_peer_roles.png")
    print("✅ Peer roles visualization created")


def create_trust_layers_diagram():
    """
    Show 3 layers of trust in Lokul:
    Layer 1: Geo-verification
    Layer 2: Identity (Aadhaar)
    Layer 3: Community vouching
    """
    img = PILImage.new('RGB', (1200, 500), color=HEX_TO_RGB["#F9FAFB"])
    draw = ImageDraw.Draw(img)
    
    layers = [
        ("GEO-VERIFICATION", "Confirm you're in\nthe neighborhood", 100, HEX_TO_RGB["#1D65AF"]),
        ("IDENTITY", "Aadhaar + Name +\nPhone verified", 400, HEX_TO_RGB["#EA580C"]),
        ("COMMUNITY VOUCHING", "Neighbors vouch\nfor reliability", 700, HEX_TO_RGB["#14B8A6"]),
    ]
    
    for i, (title, desc, x, color) in enumerate(layers):
        # Shield shape (rectangle with rounded top)
        draw.rectangle([x - 70, 50, x + 70, 350], fill=color, outline=color, width=2)
        
        # Layer badge
        draw.rectangle([x - 60, 60, x + 60, 110], fill=(255, 255, 255), outline=color, width=2)
        draw.text((x - 55, 70), title, fill=color)
        
        # Description
        draw.text((x - 65, 150), desc, fill=(255, 255, 255))
        
        # Layer number
        draw.text((x - 15, 300), f"LAYER {i+1}", fill=(255, 255, 255))
        
        # Arrows between layers
        if i < len(layers) - 1:
            draw.line([(x + 80, 200), (layers[i+1][2] - 80, 200)], fill=HEX_TO_RGB["#D1D5DB"], width=3)
            next_x = layers[i+1][2]
            draw.polygon([(next_x - 80, 200), (next_x - 95, 190), (next_x - 95, 210)], 
                         fill=HEX_TO_RGB["#D1D5DB"])
    
    img.save(OUTPUT_DIR / "3p_04_trust_layers.png")
    print("✅ Trust layers diagram created")


def create_problem_vs_solution():
    """
    Before/after showing the problem and Lokul solution
    """
    img = PILImage.new('RGB', (1200, 400), color=HEX_TO_RGB["#F9FAFB"])
    draw = ImageDraw.Draw(img)
    
    # Left side: PROBLEM (red background)
    draw.rectangle([20, 20, 580, 380], fill=HEX_TO_RGB["#FEF2F2"], outline="#DC2626", width=3)
    draw.text((100, 40), "BEFORE: THE PROBLEM", fill="#DC2626")
    
    problems = [
        "❌ No way to find local services",
        "❌ Unreliable neighbors (no trust signal)",
        "❌ Cash-only, no digital records",
        "❌ Chaos in WhatsApp groups",
        "❌ Merchants invisible on Google",
    ]
    
    y = 100
    for problem in problems:
        draw.text((50, y), problem, fill=HEX_TO_RGB["#374151"])
        y += 50
    
    # Right side: SOLUTION (green background)
    draw.rectangle([620, 20, 1180, 380], fill=HEX_TO_RGB["#F0FDF4"], outline=HEX_TO_RGB["#059669"], width=3)
    draw.text((650, 40), "AFTER: LOKUL SOLUTION", fill=HEX_TO_RGB["#059669"])
    
    solutions = [
        "✅ Find neighbors & services instantly",
        "✅ Verified community profiles",
        "✅ UPI payments with transaction trails",
        "✅ Organized community platform",
        "✅ Digital storefront for merchants",
    ]
    
    y = 100
    for solution in solutions:
        draw.text((650, y), solution, fill=HEX_TO_RGB["#374151"])
        y += 50
    
    img.save(OUTPUT_DIR / "3p_05_problem_solution.png")
    print("✅ Problem vs solution diagram created")


# ============================================================================
# PDF GENERATION
# ============================================================================

def create_3page_pdf():
    """Generate the 3-page Lokul explanatory PDF"""
    
    pdf_path = "/Users/vivekanandchoudhari/try/lokul.club/Lokul_3Page_Explainer.pdf"
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, topMargin=0.6*inch, bottomMargin=0.6*inch,
                           leftMargin=0.65*inch, rightMargin=0.65*inch)
    
    story = []
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'LokulTitle',
        parent=styles['Normal'],
        fontSize=42,
        textColor=colors.HexColor(COLORS_BRAND["primary"]),
        spaceAfter=10,
        spaceBefore=0,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        leading=48,
    )
    
    subtitle_style = ParagraphStyle(
        'LokulSubtitle',
        parent=styles['Normal'],
        fontSize=18,
        textColor=colors.HexColor(COLORS_BRAND["secondary"]),
        spaceAfter=16,
        spaceBefore=0,
        alignment=TA_CENTER,
        fontName='Helvetica',
        leading=22,
    )
    
    heading_style = ParagraphStyle(
        'LokulHeading',
        parent=styles['Normal'],
        fontSize=26,
        textColor=colors.HexColor(COLORS_BRAND["primary"]),
        spaceAfter=14,
        spaceBefore=16,
        fontName='Helvetica-Bold',
        leading=30,
    )
    
    subheading_style = ParagraphStyle(
        'LokulSubheading',
        parent=styles['Normal'],
        fontSize=16,
        textColor=colors.HexColor(COLORS_BRAND["secondary"]),
        spaceAfter=10,
        spaceBefore=10,
        fontName='Helvetica-Bold',
        leading=20,
    )
    
    body_style = ParagraphStyle(
        'LokulBody',
        parent=styles['Normal'],
        fontSize=13,
        textColor=colors.HexColor(COLORS_BRAND["gray_700"]),
        alignment=TA_JUSTIFY,
        spaceAfter=12,
        leading=20,
    )
    
    body_emphasis_style = ParagraphStyle(
        'LokulBodyEmphasis',
        parent=styles['Normal'],
        fontSize=13,
        textColor=colors.HexColor(COLORS_BRAND["gray_700"]),
        alignment=TA_LEFT,
        spaceAfter=8,
        leading=20,
    )
    
    # ========================================================================
    # PAGE 1: THE PROBLEM & THE VISION
    # ========================================================================
    
    story.append(Paragraph("LOKUL.CLUB", title_style))
    story.append(Paragraph("Own Your Neighborhood", subtitle_style))
    story.append(Spacer(1, 0.25*inch))
    
    story.append(Paragraph("THE PROBLEM", heading_style))
    story.append(Spacer(1, 0.1*inch))
    
    story.append(Paragraph(
        "600 million Indians live in communities—neighborhoods, apartment complexes, colonies—but have zero digital layer connecting them. "
        "When neighbors need services (tutor, plumber, food), they turn to WhatsApp chaos. When merchants need customers, they're invisible. "
        "There's no operating system for the hyperlocal economy.",
        body_style
    ))
    
    story.append(Spacer(1, 0.12*inch))
    
    story.append(Paragraph("WHAT'S BROKEN", subheading_style))
    story.append(Spacer(1, 0.08*inch))
    story.append(Paragraph(
        "🔴 <b>Discovery is broken:</b> No way to find trustworthy services nearby. Google Maps shows chains, not neighbors.<br/><br/>"
        "🔴 <b>Trust is missing:</b> Who is this person? Are they reliable? No verification, no accountability.<br/><br/>"
        "🔴 <b>Payments are stuck:</b> Everything is cash-only. No transaction history, no digital records.<br/><br/>"
        "🔴 <b>Chaos replaces order:</b> WhatsApp groups are impossible to search. Facebook has spam. There's no community home.",
        body_emphasis_style
    ))
    
    story.append(Spacer(1, 0.15*inch))
    
    # Add problem vs solution diagram
    try:
        img = Image(str(OUTPUT_DIR / "3p_05_problem_solution.png"), width=5.8*inch, height=2*inch)
        story.append(img)
    except:
        pass
    
    story.append(PageBreak())
    
    # ========================================================================
    # PAGE 2: HOW LOKUL WORKS
    # ========================================================================
    
    story.append(Paragraph("HOW LOKUL WORKS", heading_style))
    story.append(Spacer(1, 0.1*inch))
    
    story.append(Paragraph(
        "Lokul is a geo-verified community app that turns neighbors into a trusted, functioning ecosystem. "
        "Residents discover services, merchants reach customers, and trust replaces friction.",
        body_style
    ))
    
    story.append(Spacer(1, 0.15*inch))
    
    # Add how it works diagram
    try:
        img = Image(str(OUTPUT_DIR / "3p_02_how_it_works.png"), width=6.2*inch, height=1.9*inch)
        story.append(img)
    except:
        pass
    
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("THE 4 LAYERS", heading_style))
    story.append(Spacer(1, 0.1*inch))
    
    story.append(Paragraph(
        "<b>1. Community Layer:</b> Notices, events, local news. Your neighborhood has a digital home.<br/><br/>"
        "<b>2. Commerce Layer:</b> Browse neighbors offering services. Kiranas, tutors, chefs, plumbers—all verified.<br/><br/>"
        "<b>3. Transaction Layer:</b> UPI payments with escrow. Clear transaction trails, buyer protection.<br/><br/>"
        "<b>4. Trust Layer:</b> Geo-verification, Aadhaar, community vouching. Three layers of trust.",
        body_emphasis_style
    ))
    
    story.append(Spacer(1, 0.18*inch))
    
    story.append(Paragraph("PEER ROLES IN THE ECOSYSTEM", heading_style))
    story.append(Spacer(1, 0.1*inch))
    
    story.append(Paragraph(
        "Everyone in a Lokul community can play a role:<br/><br/>"
        "• <b>Kirana Owner:</b> Runs a digital neighborhood store, keeps 100% margin<br/><br/>"
        "• <b>Service Provider:</b> Tutor, plumber, cook—reaches customers instantly<br/><br/>"
        "• <b>Volunteer Leader:</b> Moderates the community, earns commission on disputes resolved<br/><br/>"
        "• <b>Elder Adviser:</b> Vouches for reliability, earns trust score<br/><br/>"
        "• <b>Newbie Resident:</b> Discovers services, feels part of the community",
        body_emphasis_style
    ))
    
    story.append(PageBreak())
    
    # ========================================================================
    # PAGE 3: WHY THIS MATTERS
    # ========================================================================
    
    story.append(Paragraph("WHY THIS MATTERS", heading_style))
    story.append(Spacer(1, 0.1*inch))
    
    story.append(Paragraph(
        "<b>For Residents:</b> Find trustworthy neighbors without friction. "
        "Get services faster, cheaper, from people you know or neighbors vouch for.",
        body_emphasis_style
    ))
    
    story.append(Spacer(1, 0.12*inch))
    
    story.append(Paragraph(
        "<b>For Merchants & Service Providers:</b> Stop being invisible. Reach customers who want to buy from neighbors. "
        "Keep your margin. Build a loyal customer base.",
        body_emphasis_style
    ))
    
    story.append(Spacer(1, 0.12*inch))
    
    story.append(Paragraph(
        "<b>For Communities:</b> Transform from a random collection of addresses into a functioning neighborhood. "
        "Reduce crime (everyone knows each other), increase resilience (neighbors help neighbors), build culture.",
        body_emphasis_style
    ))
    
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("THE TRUST FOUNDATION", heading_style))
    story.append(Spacer(1, 0.1*inch))
    
    # Add trust layers diagram
    try:
        img = Image(str(OUTPUT_DIR / "3p_04_trust_layers.png"), width=6.5*inch, height=1.8*inch)
        story.append(img)
    except:
        pass
    
    story.append(Spacer(1, 0.12*inch))
    
    story.append(Paragraph(
        "<b>Layer 1: Geo-Verification</b> — Confirm you're actually in the neighborhood (GPS).<br/><br/>"
        "<b>Layer 2: Identity</b> — Verify name, Aadhaar, phone (no fakes).<br/><br/>"
        "<b>Layer 3: Community Vouching</b> — Neighbors vouch for each other (reputation).",
        body_emphasis_style
    ))
    
    story.append(Spacer(1, 0.18*inch))
    
    story.append(Paragraph("THE VISION", heading_style))
    story.append(Spacer(1, 0.1*inch))
    
    story.append(Paragraph(
        "In 2024, 600M Indians in communities are still using WhatsApp for local commerce. "
        "Merchants are invisible. Service providers earn 30% less. Trust is missing.<br/><br/>"
        "Lokul changes this. By building an operating system for hyperlocal communities, we unlock $250B+ in "
        "informal economy value. Residents discover better services. Merchants stay alive. Service providers "
        "thrive. Neighborhoods become communities.",
        body_style
    ))
    
    story.append(Spacer(1, 0.15*inch))
    
    story.append(Paragraph("Your neighborhood. Connected. Trusted. Local.", subheading_style))
    
    # Build PDF
    doc.build(story)
    print(f"\n✅ 3-Page PDF generated successfully!")
    print(f"📄 Location: {pdf_path}")
    print(f"📊 File size: {os.path.getsize(pdf_path) / 1024:.1f} KB")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("🎯 Starting 3-page Lokul explainer PDF generation...\n")
    
    print("📊 Generating visualizations...")
    create_community_structure_diagram()
    create_how_it_works_diagram()
    create_peer_roles_visualization()
    create_trust_layers_diagram()
    create_problem_vs_solution()
    
    print("\n📄 Building 3-page PDF...")
    create_3page_pdf()
    
    print("\n✨ Generation complete!")
    print(f"📁 Assets: {OUTPUT_DIR}")
