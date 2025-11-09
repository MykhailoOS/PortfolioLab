# Investor Pitch Deck - Guide

## 🎯 Professional Investor Presentation

**File:** `investor-pitch.pdf` (132 KB, 14 slides)

This presentation uses the **Metropolis theme** - a modern, professional style perfect for business pitches and investor conferences.

---

## 📸 Screenshot Placeholders

I've added **dedicated spaces for your screenshots** throughout the presentation. Look for dashed boxes with camera icons that say:

```
📷 Screenshot
Paste your screenshot here
```

### Where to Add Screenshots:

1. **Slide 3** (Our Solution) - Dashboard/Editor interface screenshot
2. **Slide 4** (Product Demo 1) - Large drag-and-drop interface screenshot
3. **Slide 5** (Product Demo 2) - Projects dashboard screenshot
4. **Slide 6** (Product Demo 3) - Two screenshots:
   - 3D visual effects
   - Mobile preview
5. **Slide 12** (Team) - Three team member photos

---

## 📋 How to Add Your Screenshots

### Method 1: Edit LaTeX Source (Recommended)

1. Open `investor-pitch.tex` in TeXmaker
2. Find the `\screenshotbox` commands
3. Replace with:
   ```latex
   \includegraphics[width=5cm,height=4cm]{your-screenshot.png}
   ```
4. Save screenshots in the `presentation/` folder
5. Recompile with F6

### Method 2: Edit PDF Directly

1. Open `investor-pitch.pdf` in Adobe Acrobat Pro or PDF Editor
2. Use "Edit PDF" tool
3. Add images over the placeholder boxes
4. Save as new file

### Method 3: PowerPoint/Keynote

1. Import the PDF into PowerPoint or Keynote
2. Add images on top of placeholder boxes
3. Export as new PDF

---

## 🎨 Presentation Structure (14 Slides)

### Part 1: Problem & Solution (Slides 1-6)

1. **Title** - Professional cover slide
2. **The Problem** - Market pain points and opportunity
3. **Our Solution** - Product overview + screenshot space
4. **Product Demo 1** - Visual editor (large screenshot)
5. **Product Demo 2** - Dashboard (screenshot + features)
6. **Product Demo 3** - 3D effects + mobile (2 screenshots)

### Part 2: Business Case (Slides 7-10)

7. **Market Opportunity** - TAM/SAM/SOM, target markets
8. **Business Model** - Pricing, revenue, financial projections
9. **Competitive Advantage** - How you beat competitors
10. **Technology** - Tech stack and scalability

### Part 3: Traction & Investment (Slides 11-14)

11. **Traction** - Current achievements and 12-month roadmap
12. **Team** - Founding team (3 photo placeholders)
13. **The Ask** - Investment amount, use of funds, ROI
14. **Closing** - Standout slide with call-to-action

---

## 💼 Investor-Focused Content

### Key Numbers Included:

- ✅ **Market size:** $8.5B TAM, $2.8B SAM
- ✅ **Traction:** 15K users, 42% conversion, 4.8/5 rating
- ✅ **Financials:** Y1-Y3 projections, unit economics
- ✅ **Ask:** $1.5M seed round, $8M valuation
- ✅ **ROI:** 10-15x in 3-4 years

### Business Metrics:

- LTV: $324
- CAC: $48
- LTV/CAC: 6.75x
- Payback: 4 months
- EBITDA positive by Year 2

---

## 🎨 Design Differences from Educational Deck

| Feature     | Educational Deck      | Investor Pitch            |
| ----------- | --------------------- | ------------------------- |
| Theme       | Madrid (Colorful)     | Metropolis (Professional) |
| Colors      | Purple/Blue gradient  | Business Blue + Orange    |
| Focus       | Features & benefits   | Market & ROI              |
| Slides      | 10 slides             | 14 slides                 |
| Screenshots | None                  | 6 placeholder spaces      |
| Style       | Friendly, educational | Corporate, data-driven    |
| Tone        | "What we built"       | "Why invest now"          |

---

## 📊 Data to Customize

Before your pitch, update these numbers in the `.tex` file:

### Slide 2 (Problem):

- Market statistics (currently placeholder data)

### Slide 7 (Market):

- Beta user numbers (line 292: currently "15,000+")
- Conversion rate (line 293: currently "42%")

### Slide 8 (Financials):

- Revenue projections (lines 324-329)
- Update with your actual financial model

### Slide 11 (Traction):

- Current user count (line 403: "15,000+")
- Portfolios created (line 404: "45,000+")
- User rating (line 405: "4.8/5")

### Slide 13 (The Ask):

- Investment amount (line 548: "$1.5M")
- Valuation (line 551: "$8M")
- Expected outcomes (lines 563-569)

---

## 🎯 Tips for Your Pitch

### Do:

- ✅ Replace ALL screenshot placeholders before presenting
- ✅ Update numbers with your real data
- ✅ Practice the 10-minute pitch (1 min per slide + Q&A)
- ✅ Have backups: USB drive, email to yourself, cloud storage
- ✅ Test on presentation computer beforehand

### Don't:

- ❌ Leave placeholder boxes visible
- ❌ Use fake/demo data if you have real metrics
- ❌ Read slides verbatim (slides are visual aids)
- ❌ Skip the problem slide (investors need context)

---

## 🚀 Quick Edits

### Change Investment Amount:

Find line 548:

```latex
{\Large\textbf{Seeking \$1.5M Seed Round}}
```

Change to your amount.

### Update Contact Info:

Find line 617:

```latex
contact@portfoliomakerpro.com • +1 (555) 123-4567
```

Update with your real contact details.

### Adjust Team Size:

On Slide 12, you have 3 team member placeholders. To add more:

```latex
\begin{column}{0.3\textwidth}
  \screenshotbox{3}{3}
  \textbf{Name/Title}
\end{column}
```

---

## 📱 Screenshot Recommendations

### For Best Results:

- **Format:** PNG or JPG
- **Resolution:** 1920x1080 or higher
- **File size:** Under 2MB each
- **Style:** Clean UI, no personal data visible

### Recommended Screenshots:

1. Dashboard with 3-5 projects
2. Editor interface mid-edit (show inspector, canvas, library)
3. 3D hero section with effects visible
4. Mobile preview (use browser dev tools)
5. Professional headshots for team (square crop)

---

## 🎭 Color Scheme

**Primary:** Business Blue `RGB(0, 51, 102)`  
**Accent:** Orange `RGB(255, 102, 0)`  
**Success:** Green `RGB(0, 150, 136)`  
**Background:** Light Gray `RGB(245, 245, 245)`

This color scheme conveys:

- **Blue:** Trust, professionalism, stability
- **Orange:** Innovation, energy, action
- **Green:** Growth, success, positive metrics

---

## ✅ Pre-Pitch Checklist

- [ ] All screenshot placeholders replaced with real images
- [ ] Financial numbers updated with real/realistic data
- [ ] Contact information updated
- [ ] Team photos added
- [ ] PDF tested on presentation computer
- [ ] Backup copies made (USB, email, cloud)
- [ ] Pitch practiced and timed (aim for 10-12 minutes)
- [ ] Q&A answers prepared
- [ ] Demo link ready (if needed)
- [ ] One-pager/executive summary prepared

---

## 🎤 Pitch Structure (10-12 minutes)

1. **Intro (30 sec)** - Who you are, what you've built
2. **Problem (1.5 min)** - Paint the pain, market size
3. **Solution (2 min)** - Show screenshots, explain uniqueness
4. **Demo (2 min)** - Walk through key features (use screenshots)
5. **Business Model (1.5 min)** - How you make money
6. **Market & Competition (1.5 min)** - TAM/SAM/SOM, advantages
7. **Traction (1.5 min)** - Current achievements, growth
8. **Team (1 min)** - Why you're the right team
9. **Ask (1 min)** - How much, what for, expected ROI
10. **Q&A (5-10 min)** - Be ready for tough questions

---

## 📞 Next Steps After the Pitch

1. **Send follow-up email** within 24 hours
2. **Include:** Pitch deck PDF, one-pager, financial model
3. **Offer:** Demo access, reference calls, data room
4. **Timeline:** When you need response, other investor interest
5. **Close:** Clear call-to-action (next meeting, due diligence)

---

**Good luck with your investor conference!** 🚀

Remember: Investors invest in **teams** and **traction**, not just ideas. Show them you can execute!
