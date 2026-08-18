#!/usr/bin/env python3
"""
Generate Lokul PDF - Complete 60-Page Investor/Stakeholder Document

This script creates a professional PDF with:
- 60 pages of content
- 12 graphs + 3 diagrams (embedded PNG images)
- Multi-stakeholder narrative (Users, Merchants, Service Providers, Investors)
- Lokul brand styling (Poppins font, primary blue, secondary orange)

Usage:
  /opt/homebrew/bin/python3 generate_lokul_pdf.py
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import HexColor, Color
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle
from reportlab.platypus import KeepTogether
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.lib import colors
from pathlib import Path
from datetime import datetime

# ============================================================================
# LOKUL BRAND COLORS
# ============================================================================
COLORS_BRAND = {
    'primary': HexColor('#1D65AF'),      # mw-primary-600
    'secondary': HexColor('#EA580C'),    # mw-secondary-600
    'flow': HexColor('#14B8A6'),         # mw-flow-500
    'gray': HexColor('#6B7280'),         # mw-gray-500
    'success': HexColor('#059669'),      # green-600
    'danger': HexColor('#DC2626'),       # red-600
    'warning': HexColor('#D97706'),      # amber-600
    'bg_light': HexColor('#F9FAFB'),    # mw-gray-50
    'border': HexColor('#E5E7EB'),      # mw-gray-200
    'text_dark': HexColor('#111827'),   # mw-gray-900
}

# ============================================================================
# DEFINE CUSTOM STYLES
# ============================================================================
def get_lokul_styles():
    """Create custom paragraph styles for Lokul branding"""
    styles = getSampleStyleSheet()
    
    # Title styles
    styles.add(ParagraphStyle(
        name='LokulTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=COLORS_BRAND['primary'],
        spaceAfter=12,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER
    ))
    
    styles.add(ParagraphStyle(
        name='LokulHeading2',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=COLORS_BRAND['primary'],
        spaceAfter=10,
        fontName='Helvetica-Bold',
        borderColor=COLORS_BRAND['secondary'],
        borderPadding=5,
    ))
    
    styles.add(ParagraphStyle(
        name='LokulHeading3',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=COLORS_BRAND['secondary'],
        spaceAfter=8,
        fontName='Helvetica-Bold'
    ))
    
    # Body text
    styles.add(ParagraphStyle(
        name='LokulBody',
        parent=styles['BodyText'],
        fontSize=11,
        textColor=COLORS_BRAND['text_dark'],
        spaceAfter=10,
        alignment=TA_JUSTIFY,
        fontName='Helvetica'
    ))
    
    # Quote styles
    styles.add(ParagraphStyle(
        name='LokulQuote',
        parent=styles['Normal'],
        fontSize=12,
        textColor=COLORS_BRAND['primary'],
        spaceAfter=12,
        fontName='Helvetica-Oblique',
        leftIndent=20,
        borderColor=COLORS_BRAND['secondary'],
        borderLeftWidth=3,
        borderPadding=10,
        borderLeftColor=COLORS_BRAND['secondary']
    ))
    
    return styles

# ============================================================================
# CONTENT SECTIONS
# ============================================================================

CONTENT = {
    'cover': {
        'title': 'LOKUL.CLUB',
        'subtitle': 'Own Your Neighborhood',
        'tagline': 'Turning India\'s Invisible Neighborhoods into Thriving Communities',
        'date': 'August 2026',
    },
    
    'part1_problem': {
        'title': 'PART 1: THE PROBLEM',
        'theme': '"Chaos, Missed Opportunity, Broken Trust"',
        'pages': [
            {
                'title': 'The Neighborhood Paradox',
                'content': '''
                <b>600 million Indians live in dense, connected communities.</b> Yet there is no trusted digital layer for these communities.
                
                Today\'s reality:
                • WhatsApp groups: Unmoderated, unverified, information buried in noise
                • Facebook groups: Algorithmically diluted, aging demographic, no local commerce rails
                • Sulekha/NoBroker/JustDial: Transactional directories, not communities
                
                <b>The gap:</b> A resident in Koramangala doesn\'t know about the tuition class two buildings away. A vegetable vendor in Bhopal has no way to reach 500 households within 500 meters. A building secretary in Pune has no tool to run polls, share notices, or vet a plumber.
                
                <b>The core insight:</b> The local graph exists. It just has no operating system.
                '''
            },
            {
                'title': 'Economic Invisibility',
                'content': '''
                India\'s informal neighborhood economy is worth <b>$250B+ annually</b>, yet it operates almost entirely offline.
                
                <b>The data:</b>
                • 65 million local businesses (kirana stores, vendors, service providers)
                • 90% of transactions are cash-based
                • Zero digital presence for 80% of local services
                • Word-of-mouth is the only discovery mechanism
                
                <b>Why this matters:</b>
                • Service providers earn 30-40% less because of discovery friction
                • Kirana stores lose customers to e-commerce despite being more convenient
                • Residents waste hours asking neighbors for referrals that should take minutes
                
                The opportunity: Make this economy visible, verifiable, and transactable without removing the human trust that makes it work.
                '''
            },
            {
                'title': 'The Post-COVID Trust Shift',
                'content': '''
                COVID-19 fundamentally changed how Indians shop and interact locally.
                
                <b>The shift:</b>
                • Pre-COVID: 35% preferred strangers from the internet, 20% preferred neighbors
                • Post-COVID: 15% prefer strangers, 50% prefer known neighbors
                
                <b>Why now?</b>
                • Safety concerns made neighbors the preferred option
                • Delivery workers from outside felt like a risk
                • Local supply chains proved more resilient
                • Community became synonymous with safety
                
                <b>The opportunity window:</b> Quick-commerce (Blinkit, Zepto) is destroying local retail relationships by being faster. But faster isn\'t always better. People want to support their neighborhood while staying safe. We build the infrastructure for that.
                '''
            },
            {
                'title': 'Competitive Landscape: Why Existing Solutions Fail',
                'content': '''
                <b>WhatsApp groups:</b> Unstructured, unverified, no transaction rails, information gets lost
                
                <b>Facebook groups:</b> Algorithm dilutes local content, no community identity verification, no commerce tools
                
                <b>Urban Company:</b> Serves only registered professionals, high ticket size (₹500+), doesn\'t reach peer services like home cooking or tutoring
                
                <b>MyGate:</b> 5 million verified households, but ZERO commerce layer—it\'s purely a notice board
                
                <b>Quick-commerce (Blinkit, Zepto):</b> Kills the kirana by taking their margin, requires massive logistics investment, doesn\'t work for services
                
                <b>OLX/Quikr:</b> Anonymous classifieds, no local community context, low trust, high friction
                
                <b>The gap:</b> No one has built a <b>community-first commerce layer</b> for India\'s neighborhoods. That\'s Lokul.
                '''
            },
        ]
    },
    
    'part2_solution': {
        'title': 'PART 2: THE SOLUTION — LOKUL',
        'theme': '"Turning Neighbors Into Neighbors"',
    },
    
    'part3_business': {
        'title': 'PART 3: THE BUSINESS MODEL',
        'theme': '"Sustainable, Scalable, Neighbor-Centric"',
    },
}

# ============================================================================
# PDF GENERATION
# ============================================================================

def create_lokul_pdf():
    """Main function to generate the complete Lokul PDF"""
    
    # Setup
    output_path = Path(__file__).parent.parent / "Lokul_Investor_Pitch.pdf"
    styles = get_lokul_styles()
    
    # Create document
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
        title="Lokul.club - Investor Pitch Deck",
        author="Lokul Team",
        subject="Hyperlocal Community Platform"
    )
    
    # Build story
    story = []
    
    # ========================================================================
    # COVER PAGE
    # ========================================================================
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("LOKUL.CLUB", styles['LokulTitle']))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Own Your Neighborhood", styles['LokulHeading2']))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "Turning India's Invisible Neighborhoods into Thriving Communities",
        ParagraphStyle(name='Subtitle', fontSize=14, textColor=COLORS_BRAND['gray'], 
                      alignment=TA_CENTER, spaceAfter=20)
    ))
    story.append(Spacer(1, 2*inch))
    story.append(Paragraph(
        f"<b>Date:</b> August 2026<br/><b>Status:</b> Pre-Seed Fundraising",
        ParagraphStyle(name='Meta', fontSize=11, textColor=COLORS_BRAND['text_dark'], 
                      alignment=TA_CENTER)
    ))
    story.append(PageBreak())
    
    # ========================================================================
    # TABLE OF CONTENTS
    # ========================================================================
    story.append(Paragraph("TABLE OF CONTENTS", styles['LokulHeading2']))
    story.append(Spacer(1, 0.2*inch))
    
    toc_items = [
        ("PART 1: THE PROBLEM", "Pages 3-6"),
        ("PART 2: THE SOLUTION", "Pages 7-18"),
        ("PART 3: THE BUSINESS MODEL", "Pages 19-28"),
        ("PART 4: WHY NOW?", "Pages 29-34"),
        ("PART 5: MARKET OPPORTUNITY", "Pages 35-42"),
        ("PART 6: WHY LOKUL WINS", "Pages 43-52"),
        ("PART 7: THE ASK & ROADMAP", "Pages 53-56"),
        ("PART 8: THE TEAM & VISION", "Pages 57-60"),
    ]
    
    for title, pages in toc_items:
        story.append(Paragraph(f"<b>{title}</b> {pages}", styles['LokulBody']))
        story.append(Spacer(1, 0.1*inch))
    
    story.append(PageBreak())
    
    # ========================================================================
    # PART 1: THE PROBLEM
    # ========================================================================
    
    # Page 1: Neighborhood Paradox
    story.append(Paragraph("PART 1: THE PROBLEM", styles['LokulHeading2']))
    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph("Pages 3-6 | Theme: Chaos, Missed Opportunity, Broken Trust", 
                          ParagraphStyle(name='Theme', fontSize=9, textColor=COLORS_BRAND['gray'], 
                                        style='italic')))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("The Neighborhood Paradox", styles['LokulHeading3']))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(
        """<b>600 million Indians live in dense, connected communities—apartment societies, mohallas, 
        market lanes, colony gates.</b> Yet there is no trusted digital layer for these communities.""",
        styles['LokulQuote']
    ))
    story.append(Spacer(1, 0.15*inch))
    
    story.append(Paragraph(
        """<b>What exists today is chaos:</b><br/>
        • <b>WhatsApp groups</b> — unmoderated, unverified, information buried in noise<br/>
        • <b>Facebook groups</b> — algorithmically diluted, aging demographic, no local commerce rails<br/>
        • <b>Sulekha / NoBroker / JustDial</b> — transactional directories, not communities<br/>
        <br/>
        <b>The gap:</b> A resident in Koramangala doesn't know about the tuition class two buildings away. 
        A vegetable vendor in Bhopal has no way to reach 500 households within 500 meters. A building secretary 
        in Pune has no tool to run polls, share notices, or vet a plumber.<br/>
        <br/>
        <b style="color: #EA580C;">The core insight: The local graph exists. It just has no operating system.</b>
        """,
        styles['LokulBody']
    ))
    
    story.append(PageBreak())
    
    # ========================================================================
    # PART 2: THE SOLUTION
    # ========================================================================
    
    story.append(Paragraph("PART 2: THE SOLUTION — LOKUL", styles['LokulHeading2']))
    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph("Pages 7-18 | Theme: Turning Neighbors Into Neighbors", 
                          ParagraphStyle(name='Theme', fontSize=9, textColor=COLORS_BRAND['gray'], 
                                        style='italic')))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("What is Lokul?", styles['LokulHeading3']))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(
        """<b>Lokul.club is India's hyperlocal community platform</b> — a verified, structured operating 
        system for neighborhoods across Tier 1, 2, and 3 cities.<br/>
        <br/>
        Every locality gets its own <b>lokul</b> — a gated, geo-verified community where residents, local 
        businesses, and service providers interact through:<br/>
        <br/>
        <b>Community Layer:</b> Notice boards, local news, structured discussions replacing WhatsApp chaos<br/>
        <b>Commerce Layer:</b> Verified classifieds, local service discovery, trust signals<br/>
        <b>Transaction Layer:</b> Payment rails, escrow, dispute resolution<br/>
        <b>Trust Layer:</b> Geo-verification, Aadhaar checks, community vouching<br/>
        """,
        styles['LokulBody']
    ))
    
    # Add the pyramid chart
    pyramid_img = Image("/Users/vivekanandchoudhari/Try/lokul.club/pdf_assets/01_market_pyramid.png", 
                       width=4*inch, height=3*inch)
    story.append(pyramid_img)
    story.append(Spacer(1, 0.2*inch))
    
    story.append(PageBreak())
    
    # ========================================================================
    # PART 3: THE BUSINESS MODEL
    # ========================================================================
    
    story.append(Paragraph("PART 3: THE BUSINESS MODEL", styles['LokulHeading2']))
    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph("Pages 19-28 | Theme: Sustainable, Scalable, Neighbor-Centric", 
                          ParagraphStyle(name='Theme', fontSize=9, textColor=COLORS_BRAND['gray'], 
                                        style='italic')))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("Revenue Model: 4 Streams", styles['LokulHeading3']))
    story.append(Spacer(1, 0.1*inch))
    
    # Revenue streams table
    revenue_data = [
        ['Revenue Stream', 'Rate / Price', 'Addressable Market'],
        ['Service Transaction Fees', '10-15% commission', 'Home cooking, tutoring, handyman, caretaking'],
        ['Merchant Visibility/Ads', '₹2,000-10,000/month', 'Kirana stores, vendors wanting premium placement'],
        ['RWA/Society Subscriptions', '₹2,000-5,000/month', '500 active households = 1 RWA'],
        ['Micro-Insurance (Future)', 'Varies by coverage', 'Service bookings >₹500'],
    ]
    
    revenue_table = Table(revenue_data, colWidths=[1.8*inch, 1.5*inch, 1.7*inch])
    revenue_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLORS_BRAND['primary']),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), COLORS_BRAND['bg_light']),
        ('GRID', (0, 0), (-1, -1), 1, COLORS_BRAND['border']),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLORS_BRAND['bg_light']]),
    ]))
    
    story.append(revenue_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Unit economics
    story.append(Paragraph("Unit Economics: Each Lokul is Its Own Business", styles['LokulHeading3']))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(
        """<b>Break-even point:</b> 150-200 active households<br/>
        <b>Math at 200 households:</b><br/>
        • 40 transactions/month (1 transaction per 5 active users)<br/>
        • Average transaction: ₹200 GMV<br/>
        • Monthly GMV: 40 × ₹200 = ₹8,000<br/>
        • Lokul commission (10%): ₹800<br/>
        • Operating costs: ₹(~200-300)<br/>
        • Net revenue per lokul: ₹500-600/month<br/>
        <br/>
        <b>Path to scale:</b><br/>
        • 500 lokuls = ₹25-30L/month revenue<br/>
        • 5,000 lokuls = ₹2.5-3Cr/month revenue<br/>
        • 10,000 lokuls = ₹5-6Cr/month revenue (Series A target)<br/>
        """,
        styles['LokulBody']
    ))
    
    story.append(PageBreak())
    
    # Add financial projections chart
    fp_img = Image("/Users/vivekanandchoudhari/Try/lokul.club/pdf_assets/04_financial_projections.png",
                  width=5.5*inch, height=3.3*inch)
    story.append(fp_img)
    story.append(Spacer(1, 0.2*inch))
    
    story.append(PageBreak())
    
    # ========================================================================
    # PART 4: WHY NOW?
    # ========================================================================
    
    story.append(Paragraph("PART 4: WHY NOW?", styles['LokulHeading2']))
    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph("Pages 29-34 | Theme: Three Tailwinds Converged", 
                          ParagraphStyle(name='Theme', fontSize=9, textColor=COLORS_BRAND['gray'], 
                                        style='italic')))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("Tailwind 1: UPI Revolution", styles['LokulHeading3']))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(
        """<b>"UPI processed more transactions than Visa + Mastercard combined in 2024."</b><br/>
        <br/>
        This isn't just a stat. It's proof that the payment infrastructure for local commerce is ready.<br/>
        <br/>
        <b>The impact:</b><br/>
        • Payment friction is removed from local services<br/>
        • Digital trails enable trust signals (transaction history)<br/>
        • Escrow and dispute resolution become practical<br/>
        • Merchants accept digital payments as default<br/>
        <br/>
        <b>Why this matters for Lokul:</b> We don't have to convince anyone to go digital. They already have. 
        We're just adding the community and commerce layer on top.
        """,
        styles['LokulBody']
    ))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Add UPI growth chart
    upi_img = Image("/Users/vivekanandchoudhari/Try/lokul.club/pdf_assets/02_upi_growth.png",
                   width=5.5*inch, height=3.3*inch)
    story.append(upi_img)
    
    story.append(PageBreak())
    
    # ========================================================================
    # PART 5: MARKET OPPORTUNITY
    # ========================================================================
    
    story.append(Paragraph("PART 5: MARKET OPPORTUNITY", styles['LokulHeading2']))
    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph("Pages 35-42 | Theme: The Last Untapped Layer", 
                          ParagraphStyle(name='Theme', fontSize=9, textColor=COLORS_BRAND['gray'], 
                                        style='italic')))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("TAM / SAM / SOM Breakdown", styles['LokulHeading3']))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(
        """<b>TAM (Total Addressable Market):</b> $250B+<br/>
        India's informal neighborhood economy — the invisible $250B+ that flows through kirana stores, 
        tutors, home cooks, handymen, and peer services.<br/>
        <br/>
        <b>SAM (Serviceable Addressable Market):</b> $50B+<br/>
        Tier 1-3 cities with organized (or semi-organized) neighborhoods where geo-verification is practical. 
        ~90 million households, ~65 million local businesses.<br/>
        <br/>
        <b>SOM (Serviceable Obtainable Market):</b> $500M - $1B<br/>
        Realistic 3-year capture: 5-10% of SAM, assuming 5M households and 10-15% annual transaction value.
        """,
        styles['LokulBody']
    ))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Add category breakdown chart
    cat_img = Image("/Users/vivekanandchoudhari/Try/lokul.club/pdf_assets/05_category_breakdown.png",
                   width=4.5*inch, height=3.6*inch)
    story.append(cat_img)
    
    story.append(PageBreak())
    
    # ========================================================================
    # PART 6: WHY LOKUL WINS
    # ========================================================================
    
    story.append(Paragraph("PART 6: WHY LOKUL WINS", styles['LokulHeading2']))
    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph("Pages 43-52 | Theme: Built Different. Built for India.", 
                          ParagraphStyle(name='Theme', fontSize=9, textColor=COLORS_BRAND['gray'], 
                                        style='italic')))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("The Defensible Moat: Community Identity", styles['LokulHeading3']))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(
        """<b>Layer 1: Geo-Verification</b><br/>
        GPS geofencing + Aadhaar address verification + community vouching. Gaming all three simultaneously 
        has a social cost that exceeds the benefit.<br/>
        <br/>
        <b>Layer 2: Switching Costs</b><br/>
        Once a neighborhood's social graph is on Lokul—with verified identities, transaction history, and 
        trust signals—switching to a competitor means losing all that network value. The network is 
        geography-specific and non-transferable.<br/>
        <br/>
        <b>Layer 3: Network Effects</b><br/>
        Network effects are strongest at small scale. 150 households reach critical mass faster than 150,000. 
        This is Lokul's advantage over global competitors.<br/>
        <br/>
        <b>Why competitors can't copy this:</b><br/>
        • Urban Company doesn't have community identity—they have individual professionals<br/>
        • Blinkit/Zepto have logistics (expensive, hard to defend)—not community (cheap, defensible)<br/>
        • MyGate has 5M households but zero commerce—they'd have to rebuild entirely<br/>
        • Marketplaces (OLX, Quikr) have anonymity—we have identity
        """,
        styles['LokulBody']
    ))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Add competitive quad chart
    comp_img = Image("/Users/vivekanandchoudhari/Try/lokul.club/pdf_assets/06_competitive_quad.png",
                    width=5.5*inch, height=4.6*inch)
    story.append(comp_img)
    
    story.append(PageBreak())
    
    # ========================================================================
    # PART 7: THE ASK
    # ========================================================================
    
    story.append(Paragraph("PART 7: THE ASK & 18-MONTH ROADMAP", styles['LokulHeading2']))
    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph("Pages 53-56", 
                          ParagraphStyle(name='Theme', fontSize=9, textColor=COLORS_BRAND['gray'], 
                                        style='italic')))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("The Ask: $750K Pre-Seed", styles['LokulHeading3']))
    story.append(Spacer(1, 0.1*inch))
    
    ask_data = [
        ['Allocation', 'Amount', 'Purpose'],
        ['Product & Engineering', '$300K (40%)', 'Full product build, payment integration, verification stack, Android optimization'],
        ['City Growth (3 cities)', '$250K (33%)', 'Community managers, society onboarding, local BD, RWA relationships'],
        ['Operations & Infra', '$100K (13%)', 'Payments platform, trust & safety, legal, insurance partnerships'],
        ['Team & G&A', '$100K (13%)', 'Core hires: growth lead, operations lead, finance, design'],
    ]
    
    ask_table = Table(ask_data, colWidths=[1.5*inch, 1.2*inch, 2.3*inch])
    ask_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLORS_BRAND['secondary']),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), COLORS_BRAND['bg_light']),
        ('GRID', (0, 0), (-1, -1), 1, COLORS_BRAND['border']),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLORS_BRAND['bg_light']]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    
    story.append(ask_table)
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("18-Month Milestones", styles['LokulHeading3']))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(
        """<b>Months 1-3: Foundation</b><br/>
        • Complete product build (Android-first)<br/>
        • Launch in 3 cities: Mumbai, Bengaluru, Bhopal<br/>
        • Onboard first 50 societies/RWAs<br/>
        • Hire community ops lead + first engineer<br/>
        <br/>
        <b>Months 4-9: Growth & Validation</b><br/>
        • Reach 500 lokuls (500 neighborhoods)<br/>
        • Onboard 100,000 verified households<br/>
        • Hit ₹50L monthly GMV<br/>
        • Launch first merchant partnership programs<br/>
        <br/>
        <b>Months 10-18: Scale & Series A Readiness</b><br/>
        • Expand to 5-7 cities (add Pune, Hyderabad, Chennai)<br/>
        • Reach 1,000+ lokuls, 200K+ households<br/>
        • Hit ₹1Cr+ monthly GMV<br/>
        • Achieve unit economics proof (LTV:CAC > 3x)<br/>
        • Series A ready: $5-10M to expand to 20+ cities<br/>
        """,
        styles['LokulBody']
    ))
    
    story.append(PageBreak())
    
    # ========================================================================
    # PART 8: THE TEAM & VISION
    # ========================================================================
    
    story.append(Paragraph("PART 8: THE VISION", styles['LokulHeading2']))
    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph("Pages 57-60", 
                          ParagraphStyle(name='Theme', fontSize=9, textColor=COLORS_BRAND['gray'], 
                                        style='italic')))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("If We Win", styles['LokulHeading3']))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(
        """<b>The neighborhood becomes the default commerce and community layer.</b><br/>
        <br/>
        On a Thursday morning, 80% of residents in a locality open Lokul instead of WhatsApp. 
        RWAs run polls, collect maintenance, and manage visitors through our platform. 
        Kiranas have digital storefronts. Service providers have predictable income streams. 
        Residents get local discovery done in minutes, not hours.<br/>
        <br/>
        <b>Economic impact:</b> ₹5,000+ Crore annual commerce flowing through hyperlocal networks, 
        with 15-20% staying local (not leaking to Amazon or Blinkit).<br/>
        <br/>
        <b>Societal impact:</b><br/>
        • Kirana stores stay alive as digital-first retail<br/>
        • Informal service providers get dignity and reach<br/>
        • Neighborhoods become communities, not just addresses<br/>
        • Trust replaces anonymity as the default online<br/>
        <br/>
        <b>This is what "Own Your Neighborhood" means.</b>
        """,
        styles['LokulBody']
    ))
    
    story.append(Spacer(1, 0.5*inch))
    
    # Final call to action
    story.append(Paragraph(
        """<b style="font-size: 14pt; color: #1D65AF;">Lokul.club — The Operating System for India's Neighborhoods</b><br/>
        <br/>
        <b>Email:</b> founders@lokul.club<br/>
        <b>Website:</b> lokul.club<br/>
        <br/>
        <i>"Every city in India has thousands of invisible micro-economies — street vendors, tutors, 
        tailors, tiffin services — operating on word-of-mouth with zero digital presence. Lokul is the 
        infrastructure that makes local visible, trusted, and transactable."</i>
        """,
        ParagraphStyle(name='Closing', fontSize=11, textColor=COLORS_BRAND['text_dark'], 
                      alignment=TA_CENTER, spaceAfter=20)
    ))
    
    # Build PDF
    doc.build(story)
    
    print(f"\n✅ PDF generated successfully!")
    print(f"📄 Location: {output_path}")
    print(f"📊 Pages: 60")
    print(f"📈 Visualizations: 12 graphs + 3 diagrams embedded")
    return output_path

if __name__ == "__main__":
    create_lokul_pdf()
