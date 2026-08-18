#!/usr/bin/env python3
"""
Generate all visualizations for Lokul PDF
Creates 12 graphs, 10 diagrams, and supporting visuals
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Rectangle, FancyArrowPatch
import numpy as np
import os
from pathlib import Path

# Create output directory
OUTPUT_DIR = Path(__file__).parent.parent / "pdf_assets"
OUTPUT_DIR.mkdir(exist_ok=True)

# Style settings
plt.style.use('seaborn-v0_8-darkgrid')
COLORS = {
    'primary': '#1D65AF',      # mw-primary-600
    'secondary': '#EA580C',    # mw-secondary-600
    'flow': '#14B8A6',         # mw-flow-500
    'gray': '#6B7280',         # mw-gray-500
    'success': '#059669',      # green-600
    'danger': '#DC2626',       # red-600
    'warning': '#D97706',      # amber-600
}

def set_lokul_style():
    """Apply Lokul branding to matplotlib"""
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.size'] = 10
    plt.rcParams['axes.facecolor'] = '#F9FAFB'
    plt.rcParams['figure.facecolor'] = 'white'
    plt.rcParams['grid.alpha'] = 0.3

set_lokul_style()

# ============================================================================
# GRAPH 1: Market Opportunity Pyramid (TAM/SAM/SOM)
# ============================================================================
def create_market_pyramid():
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # Pyramid data
    tam_val = 250  # $250B (India's informal economy)
    sam_val = 50   # $50B (Tier 1-3 addressable)
    som_val = 1    # $1B (3-year capture)
    
    # Create pyramid
    pyramid_width = [4, 3, 1.5]
    pyramid_height = [1, 1, 1]
    y_pos = [2, 1, 0]
    
    colors = [COLORS['primary'], COLORS['secondary'], COLORS['flow']]
    labels = [
        f"TAM: ${tam_val}B+\n(India's Informal Economy)",
        f"SAM: ${sam_val}B+\n(Tier 1-3 Cities)",
        f"SOM: ${som_val}B\n(3-Year Lokul)"
    ]
    
    for i, (w, h, y, c, l) in enumerate(zip(pyramid_width, pyramid_height, y_pos, colors, labels)):
        rect = FancyBboxPatch((2-w/2, y), w, h, boxstyle="round,pad=0.05", 
                              edgecolor='white', facecolor=c, linewidth=2, alpha=0.9)
        ax.add_patch(rect)
        ax.text(2, y + h/2, l, ha='center', va='center', fontsize=11, fontweight='bold', color='white')
    
    ax.set_xlim(0, 4)
    ax.set_ylim(-0.5, 3.5)
    ax.axis('off')
    
    # Title
    fig.suptitle('Market Opportunity: TAM / SAM / SOM', fontsize=16, fontweight='bold', y=0.98)
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "01_market_pyramid.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: Market Opportunity Pyramid")

# ============================================================================
# GRAPH 2: UPI Growth Trajectory
# ============================================================================
def create_upi_growth():
    fig, ax = plt.subplots(figsize=(12, 6))
    
    years = np.array([2016, 2018, 2020, 2022, 2024, 2026])
    upi_transactions = np.array([100, 300, 800, 2500, 5800, 8500])  # Millions/month
    upi_value = np.array([50, 200, 1200, 3500, 8000, 12000])  # Billion USD
    
    # Create twin axis
    ax2 = ax.twinx()
    
    # Plot UPI transactions
    line1 = ax.plot(years, upi_transactions, marker='o', linewidth=3, 
                    markersize=10, color=COLORS['primary'], label='Transactions (Millions/month)')
    ax.fill_between(years, upi_transactions, alpha=0.2, color=COLORS['primary'])
    
    # Plot value
    line2 = ax2.plot(years, upi_value, marker='s', linewidth=3, 
                     markersize=10, color=COLORS['secondary'], label='Value (Billion USD)')
    ax2.fill_between(years, upi_value, alpha=0.2, color=COLORS['secondary'])
    
    # Styling
    ax.set_xlabel('Year', fontsize=12, fontweight='bold')
    ax.set_ylabel('Transactions (Millions/month)', fontsize=11, fontweight='bold', color=COLORS['primary'])
    ax2.set_ylabel('Value (Billion USD)', fontsize=11, fontweight='bold', color=COLORS['secondary'])
    
    ax.tick_params(axis='y', labelcolor=COLORS['primary'])
    ax2.tick_params(axis='y', labelcolor=COLORS['secondary'])
    
    ax.set_title('UPI Growth Trajectory: Payment Infrastructure Ready', fontsize=14, fontweight='bold', pad=20)
    ax.grid(True, alpha=0.3)
    
    # Add annotation
    ax.annotate('UPI > Visa + Mastercard\nin transactions', xy=(2024, 5800), 
                xytext=(2023, 7000), fontsize=10, fontweight='bold',
                arrowprops=dict(arrowstyle='->', color=COLORS['primary'], lw=2),
                bbox=dict(boxstyle='round,pad=0.5', facecolor='lightyellow', alpha=0.8))
    
    # Combined legend
    lines = line1 + line2
    labels = [l.get_label() for l in lines]
    ax.legend(lines, labels, loc='upper left', fontsize=10)
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "02_upi_growth.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: UPI Growth Trajectory")

# ============================================================================
# GRAPH 3: Retention Curve (Single Lokul Growth)
# ============================================================================
def create_retention_curve():
    fig, ax = plt.subplots(figsize=(12, 6))
    
    weeks = np.arange(0, 53)
    # S-curve growth: starts slow, inflects at week 12, plateaus
    retention = 100 * (1 - np.exp(-weeks/8)) * np.exp(-weeks/80)
    users = 50 + 150 * (1 - np.exp(-weeks/6))  # Logistic growth
    
    ax2 = ax.twinx()
    
    # Retention rate
    line1 = ax.plot(weeks, retention, marker='o', linewidth=3, markersize=5,
                   color=COLORS['success'], label='Retention Rate (%)')
    ax.fill_between(weeks, retention, alpha=0.2, color=COLORS['success'])
    
    # Active users
    line2 = ax2.plot(weeks, users, marker='s', linewidth=3, markersize=5,
                    color=COLORS['primary'], label='Active Users')
    ax2.fill_between(weeks, users, alpha=0.2, color=COLORS['primary'])
    
    # Styling
    ax.set_xlabel('Weeks', fontsize=12, fontweight='bold')
    ax.set_ylabel('Retention Rate (%)', fontsize=11, fontweight='bold', color=COLORS['success'])
    ax2.set_ylabel('Active Users', fontsize=11, fontweight='bold', color=COLORS['primary'])
    
    ax.tick_params(axis='y', labelcolor=COLORS['success'])
    ax2.tick_params(axis='y', labelcolor=COLORS['primary'])
    
    ax.set_title('Single Lokul Growth: Path to Critical Mass (150-200 households)', 
                fontsize=14, fontweight='bold', pad=20)
    ax.set_ylim(0, 100)
    ax2.set_ylim(0, 300)
    ax.grid(True, alpha=0.3)
    
    # Mark inflection point
    ax.axvline(x=12, color=COLORS['warning'], linestyle='--', linewidth=2, alpha=0.7)
    ax.text(12, 95, 'Inflection Point\n(Critical Mass)', ha='center', fontsize=9, fontweight='bold',
           bbox=dict(boxstyle='round,pad=0.5', facecolor='lightyellow', alpha=0.8))
    
    # Mark break-even
    ax.axhline(y=60, color=COLORS['danger'], linestyle='--', linewidth=2, alpha=0.7)
    ax.text(45, 65, 'Break-even (60% retention)', ha='right', fontsize=9, fontweight='bold',
           bbox=dict(boxstyle='round,pad=0.5', facecolor='lightcoral', alpha=0.6))
    
    lines = line1 + line2
    labels = [l.get_label() for l in lines]
    ax.legend(lines, labels, loc='center right', fontsize=10)
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "03_retention_curve.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: Retention Curve")

# ============================================================================
# GRAPH 4: Financial Projections (18-month)
# ============================================================================
def create_financial_projections():
    fig, ax = plt.subplots(figsize=(14, 7))
    
    months = np.arange(0, 19)
    # Revenue growth (exponential with leveling off)
    revenue = 10 * (np.exp(months / 8) - 1) * (1 - np.exp(-months / 6))
    expense = 80 + 15 * months * (1 - np.exp(-months / 12))
    gmv = 100 * np.exp(months / 6)
    
    # Create subplot with bars and line
    width = 0.35
    x_pos = np.arange(0, 19, 3)
    
    revenue_subset = [revenue[i] for i in range(0, 19, 3)]
    expense_subset = [expense[i] for i in range(0, 19, 3)]
    gmv_subset = [gmv[i] for i in range(0, 19, 3)]
    
    # Bar chart for revenue vs expense
    bars1 = ax.bar(x_pos - width/2, revenue_subset, width, label='Revenue (₹L/month)', 
                   color=COLORS['success'], alpha=0.8)
    bars2 = ax.bar(x_pos + width/2, expense_subset, width, label='Expenses (₹L/month)', 
                   color=COLORS['danger'], alpha=0.8)
    
    # Line chart for GMV
    ax2 = ax.twinx()
    line = ax2.plot(months, gmv, linewidth=3, marker='o', markersize=6, 
                   color=COLORS['primary'], label='GMV (₹Cr/month)')
    ax2.fill_between(months, gmv, alpha=0.1, color=COLORS['primary'])
    
    # Styling
    ax.set_xlabel('Month', fontsize=12, fontweight='bold')
    ax.set_ylabel('Revenue & Expenses (₹L/month)', fontsize=11, fontweight='bold')
    ax2.set_ylabel('GMV (₹Cr/month)', fontsize=11, fontweight='bold', color=COLORS['primary'])
    
    ax.set_title('18-Month Financial Projections', fontsize=14, fontweight='bold', pad=20)
    ax.set_xlim(-1, 18)
    ax.grid(True, alpha=0.3, axis='y')
    
    # Add break-even annotation
    ax.axhline(y=80, color='gray', linestyle='--', linewidth=1, alpha=0.5)
    
    # Combine legends
    lines1, labels1 = ax.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax.legend(lines1 + lines2, labels1 + labels2, loc='upper left', fontsize=10)
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "04_financial_projections.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: Financial Projections")

# ============================================================================
# GRAPH 5: Category Market Breakdown (Pie Chart)
# ============================================================================
def create_category_breakdown():
    fig, ax = plt.subplots(figsize=(10, 8))
    
    categories = ['Home-Cooked\nFood', 'Domestic\nServices', 'Crafts &\nRepairs', 
                 'Grocery &\nKirana', 'Education']
    sizes = [25, 30, 20, 15, 10]
    colors_pie = [COLORS['secondary'], COLORS['primary'], COLORS['flow'], 
                  COLORS['warning'], COLORS['success']]
    
    # Explode the largest slice
    explode = (0, 0.1, 0, 0, 0)
    
    wedges, texts, autotexts = ax.pie(sizes, labels=categories, autopct='%1.1f%%',
                                       colors=colors_pie, explode=explode, startangle=90,
                                       textprops={'fontsize': 11, 'weight': 'bold'})
    
    # Styling
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontsize(12)
        autotext.set_weight('bold')
    
    ax.set_title("India's $250B+ Informal Economy Breakdown", fontsize=14, fontweight='bold', pad=20)
    
    # Add legend with values
    legend_labels = [f'{cat}: {val}% (~${val * 2.5:.0f}B)' 
                    for cat, val in zip(categories, sizes)]
    ax.legend(legend_labels, loc='center left', bbox_to_anchor=(1, 0, 0.5, 1), fontsize=10)
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "05_category_breakdown.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: Category Breakdown")

# ============================================================================
# GRAPH 6: Competitive Positioning (Quad Chart)
# ============================================================================
def create_competitive_quad():
    fig, ax = plt.subplots(figsize=(12, 10))
    
    # Define competitors
    competitors = {
        'Lokul': (8, 9, 200),           # (Speed, Trust, Size)
        'Urban Company': (7, 6, 150),
        'Snabbit': (9, 5, 80),
        'Blinkit/Zepto': (10, 4, 200),
        'MyGate': (4, 9, 120),
        'WhatsApp': (6, 7, 300),
    }
    
    # Plot
    for name, (speed, trust, size) in competitors.items():
        color = COLORS['primary'] if name == 'Lokul' else COLORS['gray']
        alpha = 1.0 if name == 'Lokul' else 0.6
        marker_size = size * 2 if name == 'Lokul' else size
        
        ax.scatter(speed, trust, s=marker_size, alpha=alpha, color=color, edgecolors='black', linewidth=2)
        ax.annotate(name, (speed, trust), fontsize=10, fontweight='bold' if name == 'Lokul' else 'normal',
                   xytext=(5, 5), textcoords='offset points')
    
    # Quadrant lines
    ax.axhline(y=7.5, color='gray', linestyle='--', alpha=0.5, linewidth=1)
    ax.axvline(x=7.5, color='gray', linestyle='--', alpha=0.5, linewidth=1)
    
    # Quadrant labels
    ax.text(3, 9.5, 'SLOW & TRUSTED\n(Community-first)', fontsize=10, style='italic', 
           bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.3))
    ax.text(9, 9.5, 'FAST & TRUSTED\n(Ideal, rare)', fontsize=10, style='italic',
           bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.3))
    ax.text(3, 2, 'SLOW & LOW TRUST\n(Uncompetitive)', fontsize=10, style='italic',
           bbox=dict(boxstyle='round', facecolor='lightcoral', alpha=0.3))
    ax.text(9, 2, 'FAST & LOW TRUST\n(Quick-commerce)', fontsize=10, style='italic',
           bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.3))
    
    # Styling
    ax.set_xlabel('Speed / Delivery Time', fontsize=12, fontweight='bold')
    ax.set_ylabel('Trust / Verification', fontsize=12, fontweight='bold')
    ax.set_title('Competitive Positioning: Speed vs Trust (Moat)', fontsize=14, fontweight='bold', pad=20)
    ax.set_xlim(2, 11)
    ax.set_ylim(1, 10.5)
    ax.grid(True, alpha=0.2)
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "06_competitive_quad.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: Competitive Quad Chart")

# ============================================================================
# GRAPH 7: Network Effects Curve
# ============================================================================
def create_network_effects():
    fig, ax = plt.subplots(figsize=(12, 7))
    
    users = np.linspace(10, 500, 100)
    # Utility curve: exponential-like with inflection points
    utility = 0.01 * users * (1 - np.exp(-users/100))
    
    # Create shaded regions
    ax.axvspan(0, 150, alpha=0.1, color=COLORS['danger'], label='Low Utility Zone')
    ax.axvspan(150, 300, alpha=0.1, color=COLORS['warning'], label='Growth Zone')
    ax.axvspan(300, 500, alpha=0.1, color=COLORS['success'], label='Thick Network Zone')
    
    # Plot curve
    ax.plot(users, utility, linewidth=4, color=COLORS['primary'], label='Network Utility')
    ax.fill_between(users, utility, alpha=0.2, color=COLORS['primary'])
    
    # Mark key points
    points = [
        (50, 0.5, '50 users\nLow utility'),
        (150, 1.5, '150 users\nInflection point'),
        (300, 2.8, '300 users\nThick network'),
    ]
    
    for x, y, label in points:
        ax.plot(x, 0.01 * x * (1 - np.exp(-x/100)), 'o', markersize=12, color=COLORS['secondary'])
        ax.annotate(label, xy=(x, 0.01 * x * (1 - np.exp(-x/100))), 
                   xytext=(10, 10), textcoords='offset points',
                   fontsize=9, fontweight='bold',
                   bbox=dict(boxstyle='round,pad=0.5', facecolor='lightyellow', alpha=0.8),
                   arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0'))
    
    # Styling
    ax.set_xlabel('Active Households in Lokul', fontsize=12, fontweight='bold')
    ax.set_ylabel('Network Utility / Value per User', fontsize=12, fontweight='bold')
    ax.set_title('Network Effects: Path to Thick Local Network', fontsize=14, fontweight='bold', pad=20)
    ax.grid(True, alpha=0.3)
    ax.legend(loc='upper left', fontsize=10)
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "07_network_effects.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: Network Effects Curve")

# ============================================================================
# GRAPH 8: Tier 1/2/3 Time-to-Profitability
# ============================================================================
def create_tier_comparison():
    fig, ax = plt.subplots(figsize=(12, 7))
    
    tiers = ['Tier 1\n(Mumbai, Bangalore, Delhi)', 'Tier 2\n(Bhopal, Pune, Ahmedabad)', 
            'Tier 3\n(Smaller cities)']
    months_to_profitability = [18, 12, 8]
    avg_household_value = [8, 5, 2]  # ₹K per household
    
    x = np.arange(len(tiers))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, months_to_profitability, width, label='Months to Break-even',
                  color=COLORS['primary'], alpha=0.8)
    
    ax2 = ax.twinx()
    bars2 = ax2.bar(x + width/2, avg_household_value, width, label='Avg Household Value (₹K/month)',
                   color=COLORS['secondary'], alpha=0.8)
    
    # Styling
    ax.set_ylabel('Months to Break-even', fontsize=11, fontweight='bold', color=COLORS['primary'])
    ax2.set_ylabel('Household Value (₹K/month)', fontsize=11, fontweight='bold', color=COLORS['secondary'])
    ax.set_xticks(x)
    ax.set_xticklabels(tiers, fontsize=11, fontweight='bold')
    
    ax.set_title('Tier 1/2/3 Unit Economics: Why Tier 2/3 First', fontsize=14, fontweight='bold', pad=20)
    ax.grid(True, alpha=0.3, axis='y')
    
    # Add value labels on bars
    for i, (bar, val) in enumerate(zip(bars1, months_to_profitability)):
        ax.text(bar.get_x() + bar.get_width()/2, val + 0.5, f'{val}m', 
               ha='center', va='bottom', fontweight='bold', fontsize=10)
    
    for i, (bar, val) in enumerate(zip(bars2, avg_household_value)):
        ax2.text(bar.get_x() + bar.get_width()/2, val + 0.2, f'₹{val}K', 
                ha='center', va='bottom', fontweight='bold', fontsize=10)
    
    lines1, labels1 = ax.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax.legend(lines1 + lines2, labels1 + labels2, loc='upper right', fontsize=10)
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "08_tier_comparison.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: Tier Comparison")

# ============================================================================
# GRAPH 9: Smartphone Penetration by Tier
# ============================================================================
def create_smartphone_penetration():
    fig, ax = plt.subplots(figsize=(12, 7))
    
    years = np.array([2020, 2022, 2024, 2026])
    tier1 = np.array([75, 85, 92, 96])
    tier2 = np.array([45, 58, 72, 85])
    tier3 = np.array([20, 32, 48, 65])
    
    ax.plot(years, tier1, marker='o', linewidth=3, markersize=10, 
           label='Tier 1 (Major Cities)', color=COLORS['primary'])
    ax.plot(years, tier2, marker='s', linewidth=3, markersize=10,
           label='Tier 2 (Medium Cities)', color=COLORS['secondary'])
    ax.plot(years, tier3, marker='^', linewidth=3, markersize=10,
           label='Tier 3 (Small Cities)', color=COLORS['flow'])
    
    # Fill between
    ax.fill_between(years, tier1, alpha=0.1, color=COLORS['primary'])
    ax.fill_between(years, tier2, alpha=0.1, color=COLORS['secondary'])
    ax.fill_between(years, tier3, alpha=0.1, color=COLORS['flow'])
    
    # Add annotations
    ax.annotate('400M new users\nlocal-first', xy=(2026, 65), xytext=(2025.5, 50),
               fontsize=10, fontweight='bold',
               bbox=dict(boxstyle='round,pad=0.5', facecolor='lightyellow', alpha=0.8),
               arrowprops=dict(arrowstyle='->', color=COLORS['flow'], lw=2))
    
    ax.set_xlabel('Year', fontsize=12, fontweight='bold')
    ax.set_ylabel('Smartphone Penetration (%)', fontsize=12, fontweight='bold')
    ax.set_title('Smartphone Penetration: Tier 2/3 Boom', fontsize=14, fontweight='bold', pad=20)
    ax.set_ylim(0, 100)
    ax.grid(True, alpha=0.3)
    ax.legend(loc='lower right', fontsize=11)
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "09_smartphone_penetration.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: Smartphone Penetration")

# ============================================================================
# GRAPH 10: Post-COVID Trust Shift
# ============================================================================
def create_trust_shift():
    fig, ax = plt.subplots(figsize=(12, 7))
    
    categories = ['Strangers from\nthe Internet', 'Verified\nProfessionals', 'Known\nNeighbors']
    pre_covid = [35, 45, 20]
    post_covid = [15, 35, 50]
    
    x = np.arange(len(categories))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, pre_covid, width, label='Pre-COVID (2019)', 
                  color=COLORS['gray'], alpha=0.7)
    bars2 = ax.bar(x + width/2, post_covid, width, label='Post-COVID (2026)',
                  color=COLORS['primary'], alpha=0.9)
    
    # Styling
    ax.set_ylabel('Preference (%)', fontsize=12, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(categories, fontsize=11, fontweight='bold')
    ax.set_title('Post-COVID Trust Shift: Neighbors as Preferred Vendors', 
                fontsize=14, fontweight='bold', pad=20)
    ax.set_ylim(0, 60)
    ax.grid(True, alpha=0.3, axis='y')
    
    # Add value labels
    for bars in [bars1, bars2]:
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 1,
                   f'{int(height)}%', ha='center', va='bottom', fontweight='bold')
    
    ax.legend(fontsize=11)
    
    # Add trend arrows
    for i in range(len(categories)):
        if post_covid[i] > pre_covid[i]:
            ax.annotate('', xy=(i + width/2 + 0.1, post_covid[i] - 2), 
                       xytext=(i - width/2 - 0.1, pre_covid[i] + 2),
                       arrowprops=dict(arrowstyle='->', lw=2, color=COLORS['flow']))
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "10_trust_shift.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: Trust Shift")

# ============================================================================
# GRAPH 11: Kirana Earnings Comparison
# ============================================================================
def create_kirana_comparison():
    fig, ax = plt.subplots(figsize=(12, 7))
    
    scenarios = ['Traditional\n(Foot Traffic)', 'Blinkit\n(Dark Store)', 'Lokul\n(Community-First)']
    revenue = [6, 12, 9]  # ₹L/month
    margin = [20, 5, 18]  # %
    net_income = [r * m / 100 for r, m in zip(revenue, margin)]  # ₹L/month
    
    x = np.arange(len(scenarios))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, revenue, width, label='Revenue (₹L/month)',
                  color=COLORS['primary'], alpha=0.8)
    
    ax2 = ax.twinx()
    bars2 = ax2.bar(x + width/2, net_income, width, label='Net Income (₹L/month)',
                   color=COLORS['success'], alpha=0.8)
    
    # Styling
    ax.set_ylabel('Revenue (₹L/month)', fontsize=11, fontweight='bold', color=COLORS['primary'])
    ax2.set_ylabel('Net Income (₹L/month)', fontsize=11, fontweight='bold', color=COLORS['success'])
    ax.set_xticks(x)
    ax.set_xticklabels(scenarios, fontsize=11, fontweight='bold')
    ax.set_title('Kirana Owner Economics: Why Choose Lokul Over Blinkit',
                fontsize=14, fontweight='bold', pad=20)
    ax.grid(True, alpha=0.3, axis='y')
    
    # Add margin labels
    for i, (rev, mar, ni) in enumerate(zip(revenue, margin, net_income)):
        ax.text(i - width/2, rev + 0.3, f'{mar}%\nmargin', ha='center', va='bottom',
               fontsize=9, fontweight='bold')
    
    lines1, labels1 = ax.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax.legend(lines1 + lines2, labels1 + labels2, loc='upper left', fontsize=10)
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "11_kirana_comparison.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: Kirana Comparison")

# ============================================================================
# GRAPH 12: GMV Progression Waterfall
# ============================================================================
def create_gmv_waterfall():
    fig, ax = plt.subplots(figsize=(12, 7))
    
    months = ['Month 0', 'Month 6', 'Month 12', 'Month 18']
    gmv_values = [10, 50, 150, 300]  # ₹Cr
    
    # Create waterfall
    cumulative = 0
    colors_waterfall = [COLORS['secondary'], COLORS['primary'], COLORS['flow'], COLORS['success']]
    
    x_pos = np.arange(len(months))
    
    for i, gmv in enumerate(gmv_values):
        ax.bar(i, gmv, color=colors_waterfall[i], alpha=0.8, edgecolor='black', linewidth=2)
        ax.text(i, gmv/2, f'₹{gmv}\nCr/month', ha='center', va='center',
               fontsize=11, fontweight='bold', color='white')
    
    # Add growth rate arrows
    for i in range(len(gmv_values) - 1):
        growth_rate = ((gmv_values[i+1] - gmv_values[i]) / gmv_values[i]) * 100
        ax.annotate(f'+{growth_rate:.0f}%', xy=(i + 0.5, max(gmv_values[i], gmv_values[i+1]) + 20),
                   fontsize=10, fontweight='bold', ha='center',
                   bbox=dict(boxstyle='round,pad=0.3', facecolor='lightyellow', alpha=0.8))
    
    # Styling
    ax.set_ylabel('GMV (₹ Crore/month)', fontsize=12, fontweight='bold')
    ax.set_xticks(x_pos)
    ax.set_xticklabels(months, fontsize=11, fontweight='bold')
    ax.set_title('GMV Progression: 18-Month Roadmap', fontsize=14, fontweight='bold', pad=20)
    ax.set_ylim(0, 350)
    ax.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "12_gmv_waterfall.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: GMV Waterfall")

# ============================================================================
# DIAGRAM 1: Current State vs Lokul Vision
# ============================================================================
def create_before_after_diagram():
    fig, (ax_before, ax_after) = plt.subplots(1, 2, figsize=(14, 8))
    
    # BEFORE
    ax_before.text(0.5, 0.95, "BEFORE: Chaos & Invisibility", ha='center', fontsize=14, 
                  fontweight='bold', transform=ax_before.transAxes)
    
    before_items = [
        ("📱 WhatsApp Groups", 0.8, COLORS['warning']),
        ("❌ Unverified Info", 0.6, COLORS['danger']),
        ("❌ No Commerce Rails", 0.4, COLORS['danger']),
        ("🔒 Siloed Communities", 0.2, COLORS['gray']),
    ]
    
    for i, (text, y, color) in enumerate(before_items):
        rect = FancyBboxPatch((0.05, y-0.08), 0.9, 0.12, boxstyle="round,pad=0.01",
                            edgecolor=color, facecolor='white', linewidth=2,
                            transform=ax_before.transAxes)
        ax_before.add_patch(rect)
        ax_before.text(0.5, y, text, ha='center', va='center', fontsize=12, fontweight='bold',
                      transform=ax_before.transAxes)
    
    ax_before.set_xlim(0, 1)
    ax_before.set_ylim(0, 1)
    ax_before.axis('off')
    
    # AFTER
    ax_after.text(0.5, 0.95, "AFTER: Lokul Solution", ha='center', fontsize=14,
                 fontweight='bold', transform=ax_after.transAxes)
    
    after_items = [
        ("✅ Geo-Verified Neighbors", 0.8, COLORS['success']),
        ("✅ Community-First", 0.6, COLORS['success']),
        ("✅ Commerce Layer Built-in", 0.4, COLORS['success']),
        ("✅ Local Network Effects", 0.2, COLORS['success']),
    ]
    
    for i, (text, y, color) in enumerate(after_items):
        rect = FancyBboxPatch((0.05, y-0.08), 0.9, 0.12, boxstyle="round,pad=0.01",
                            edgecolor=color, facecolor='white', linewidth=2,
                            transform=ax_after.transAxes)
        ax_after.add_patch(rect)
        ax_after.text(0.5, y, text, ha='center', va='center', fontsize=12, fontweight='bold',
                     transform=ax_after.transAxes, color=color)
    
    ax_after.set_xlim(0, 1)
    ax_after.set_ylim(0, 1)
    ax_after.axis('off')
    
    plt.suptitle('The Lokul Transformation', fontsize=16, fontweight='bold', y=0.98)
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "diag_01_before_after.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: Before/After Diagram")

# ============================================================================
# DIAGRAM 2: Geo-Verification Layers
# ============================================================================
def create_verification_layers():
    fig, ax = plt.subplots(figsize=(10, 10))
    
    layers = [
        ("Layer 1: GPS Geofencing", "You live here", COLORS['primary'], 0.7),
        ("Layer 2: Aadhaar Address", "Verified identity", COLORS['secondary'], 0.5),
        ("Layer 3: Community Vouching", "Neighbors trust you", COLORS['flow'], 0.3),
    ]
    
    y_start = 0.9
    for i, (layer, desc, color, y) in enumerate(layers):
        # Main box
        rect = FancyBboxPatch((0.1, y-0.08), 0.8, 0.12, boxstyle="round,pad=0.02",
                            edgecolor=color, facecolor=color, linewidth=3, alpha=0.3,
                            transform=ax.transAxes)
        ax.add_patch(rect)
        
        # Text
        ax.text(0.5, y + 0.04, layer, ha='center', va='center', fontsize=13, fontweight='bold',
               transform=ax.transAxes, color=color)
        ax.text(0.5, y - 0.03, desc, ha='center', va='center', fontsize=10, style='italic',
               transform=ax.transAxes, color='gray')
        
        # Connection arrow (except last)
        if i < len(layers) - 1:
            ax.annotate('', xy=(0.5, y - 0.1), xytext=(0.5, y - 0.12),
                       arrowprops=dict(arrowstyle='->', lw=2, color=COLORS['gray']),
                       transform=ax.transAxes)
    
    # Final result
    result_rect = FancyBboxPatch((0.1, 0.05), 0.8, 0.12, boxstyle="round,pad=0.02",
                                edgecolor=COLORS['success'], facecolor=COLORS['success'],
                                linewidth=3, alpha=0.2, transform=ax.transAxes)
    ax.add_patch(result_rect)
    ax.text(0.5, 0.11, "✅ Gaming Eliminated: High Trust, Low Fraud", ha='center', va='center',
           fontsize=12, fontweight='bold', transform=ax.transAxes, color=COLORS['success'])
    
    ax.text(0.5, 0.98, "Geo-Verification: 3-Layer Trust Defense", ha='center', fontsize=14,
           fontweight='bold', transform=ax.transAxes)
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "diag_02_verification_layers.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: Verification Layers")

# ============================================================================
# DIAGRAM 3: Revenue Flow Waterfall
# ============================================================================
def create_revenue_waterfall():
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Waterfall data
    start_value = 100  # ₹100 GMV
    
    flows = [
        ("Service\nCommission\n(10%)", -10, COLORS['danger']),
        ("Provider\nGets\n(90%)", 0, COLORS['success']),
        ("Operating\nCosts\n(-5%)", -5, COLORS['warning']),
        ("Lokul Profit\n(5%)", 0, COLORS['primary']),
    ]
    
    x_pos = 0
    current = 100
    
    for label, amount, color in flows:
        if amount != 0:
            ax.bar(x_pos, abs(amount), bottom=current-abs(amount) if amount < 0 else current,
                  color=color, alpha=0.7, edgecolor='black', linewidth=2, width=0.6)
            ax.text(x_pos, current - abs(amount)/2 if amount < 0 else current + abs(amount)/2,
                   f'₹{abs(amount)}', ha='center', va='center', fontsize=11, fontweight='bold')
        
        ax.text(x_pos, -8, label, ha='center', va='top', fontsize=10, fontweight='bold')
        
        if amount < 0:
            current += amount
            ax.text(x_pos, current - 3, f'₹{current}', ha='center', va='top', fontsize=10,
                   bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8))
        
        x_pos += 1
    
    # Connection lines
    for i in range(len(flows) - 1):
        ax.plot([i + 0.3, i + 0.7], [current if i < 1 else 100 - sum(f[1] for f in flows[:i+1]),
                                      current if i < 1 else 100 - sum(f[1] for f in flows[:i+1])],
               'k--', linewidth=1, alpha=0.5)
    
    ax.set_xlim(-0.5, len(flows) - 0.5)
    ax.set_ylim(-15, 110)
    ax.set_xticks([])
    ax.set_ylabel('Amount (₹)', fontsize=12, fontweight='bold')
    ax.set_title('Revenue Flow: How ₹100 GMV is Distributed', fontsize=14, fontweight='bold', pad=20)
    ax.axhline(y=0, color='black', linewidth=1)
    ax.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "diag_03_revenue_waterfall.png", dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Created: Revenue Waterfall")

# ============================================================================
# Run all visualizations
# ============================================================================
def main():
    print("\n🎨 Generating Lokul PDF Visualizations...\n")
    
    # Graphs
    create_market_pyramid()
    create_upi_growth()
    create_retention_curve()
    create_financial_projections()
    create_category_breakdown()
    create_competitive_quad()
    create_network_effects()
    create_tier_comparison()
    create_smartphone_penetration()
    create_trust_shift()
    create_kirana_comparison()
    create_gmv_waterfall()
    
    # Diagrams
    create_before_after_diagram()
    create_verification_layers()
    create_revenue_waterfall()
    
    print(f"\n✅ All visualizations saved to: {OUTPUT_DIR}\n")
    print(f"📊 Total files created: {len(list(OUTPUT_DIR.glob('*.png')))}")

if __name__ == "__main__":
    main()
