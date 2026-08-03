# 🔍 Static Data Audit & Improvement Roadmap

## 📊 Part 1: Hardcoded / Static Data → Dynamic

### 🔴 HIGH Priority (Directly visible to users, looks fake)

---

#### 1. Job Category Counts — [UserHome.jsx](file:///c:/Users/parul/Desktop/Resume%20Project/DAIICT_Hackathon-26/frontend/src/pages/user/UserHome.jsx#L23-L32)
```
Engineering: "2,840"  |  Design: "1,120"  |  Data & AI: "960"
Marketing: "740"  |  Healthcare: "510"  |  Operations: "430"  etc.
```
**Problem:** These are fake hardcoded counts. If a user clicks "Engineering" and finds 3 jobs, trust breaks.

**Fix:** Backend API endpoint `/api/v1/public/category-counts` that returns actual job counts grouped by category (industry/type). Frontend fetches and displays real numbers. If 0 jobs, show "0" or hide the category.

---

#### 2. Stats Strip Fallback Numbers — [UserHome.jsx](file:///c:/Users/parul/Desktop/Resume%20Project/DAIICT_Hackathon-26/frontend/src/pages/user/UserHome.jsx#L457-L460)
```
Open roles: 12,480  |  Companies: 3,200+  |  Hired this month: 1,940  |  Avg response: 48h
```
**Problem:** These are fallback defaults when the API doesn't return data. If API fails, user sees fake numbers.

**Fix:** Show `"—"` or `LoadingSkeleton` when API returns `null` instead of fake fallback numbers. Or ensure the backend `/api/v1/public/stats` always returns real counts.

---

#### 3. Scrolling Ticker Fallback — [UserHome.jsx](file:///c:/Users/parul/Desktop/Resume%20Project/DAIICT_Hackathon-26/frontend/src/pages/user/UserHome.jsx#L245)
```
"12,480 new roles this week · updated hourly"
```
**Problem:** Same fake 12,480 number in the scrolling ticker.

**Fix:** Use actual `stats.open_roles` or remove the ticker when data is unavailable.

---

#### 4. Company Logo Strip in Testimonials — [Testimonials.jsx](file:///c:/Users/parul/Desktop/Resume%20Project/DAIICT_Hackathon-26/frontend/src/components/Testimonials.jsx#L217-L223)
```
TECHFLOW | SOLV | GLOBALSCALE_ | NORDICS | SCALE_UP
```
**Problem:** These are fake company names. None of these companies exist in the DB.

**Fix:** 
- Fetch real registered company names from DB and display their logos
- Or remove this strip entirely if no real companies are registered yet

---

#### 5. Fake Companies & Jobs in `data.js` — [data.js](file:///c:/Users/parul/Desktop/Resume%20Project/DAIICT_Hackathon-26/frontend/src/lib/data.js)
```
Northwind, Lumen Labs, Atlas Pay, Ember Health, Vela, Nimbus
8 fake job listings with fake salaries
```
**Problem:** This entire file is 100% hardcoded fake data. If it's used as fallback anywhere, users see fake companies.

**Fix:** 
- Check where `data.js` is imported and ensure those components fetch from backend API instead
- Keep `data.js` only for development/demo mode, or delete it

---

### 🟡 MEDIUM Priority (Functional but could be better)

---

#### 6. Market Trends Defaults — [JobsTrendsPage.jsx](file:///c:/Users/parul/Desktop/Resume%20Project/DAIICT_Hackathon-26/frontend/src/pages/JobsTrendsPage.jsx#L10-L22)
```
Salary timeline: 2023: $112k → 2026: $154k
Region distribution: Bengaluru: 450, San Francisco: 380, etc.
```
**Problem:** Hardcoded fallback data for the trends charts.

**Fix:** Backend already provides `getMarketTrends()` — ensure it always returns data. Show "No data available" instead of fake charts when API fails.

---

#### 7. Developer Pricing Plans (Duplicated 4 Times!)
Hardcoded in:
- [DeveloperLandingPage.jsx](file:///c:/Users/parul/Desktop/Resume%20Project/DAIICT_Hackathon-26/frontend/src/pages/developer/DeveloperLandingPage.jsx#L46-L50) — ₹2999, ₹9999
- [DeveloperRegisterPage.jsx](file:///c:/Users/parul/Desktop/Resume%20Project/DAIICT_Hackathon-26/frontend/src/pages/developer/DeveloperRegisterPage.jsx#L90-L91)
- [DeveloperBilling.jsx](file:///c:/Users/parul/Desktop/Resume%20Project/DAIICT_Hackathon-26/frontend/src/pages/developer/DeveloperBilling.jsx#L30-L31)
- [AuthPage.jsx](file:///c:/Users/parul/Desktop/Resume%20Project/DAIICT_Hackathon-26/frontend/src/components/AuthPage.jsx#L357-L358)

**Fix:** Create a single `plans.js` config file or fetch plans from backend API. Currently if you change a price, you have to change it in 4 places.

---

#### 8. Company Location Fallback — [UserHome.jsx](file:///c:/Users/parul/Desktop/Resume%20Project/DAIICT_Hackathon-26/frontend/src/pages/user/UserHome.jsx#L131)
```js
location: c.hq_location || c.location || "San Francisco"
```
**Problem:** If a company doesn't have a location, it says "San Francisco" by default.

**Fix:** Use `"Location not specified"` or `"—"` instead.

---

#### 9. Fraud Detection Page Fake Data — [FraudDetectionPage.jsx](file:///c:/Users/parul/Desktop/Resume%20Project/DAIICT_Hackathon-26/frontend/src/pages/FraudDetectionPage.jsx#L60-L61)
Hardcoded location arrays and sample result objects used for demo. This is acceptable for a demo tool but should be noted.

---

### 🟢 LOW Priority (Nice to have)

---

#### 10. Onboarding Tour Text — [site-chrome.jsx](file:///c:/Users/parul/Desktop/Resume%20Project/DAIICT_Hackathon-26/frontend/src/components/user/site-chrome.jsx#L46)
```
"Upgrade to Premium for Rs 199/month"
```
If price changes, this needs manual update. Consider pulling from a config.

---

## 💬 Part 2: Testimonials Section Improvements

### Current State ✅
- Reviews fetch from DB via `publicAPI.listReviews()`
- Filter tabs: All | Platform | Company | Developer
- 3D tilt card animations
- Verified badge support

### Suggested Improvements 🚀

| Feature | Description | Difficulty |
|---------|-------------|------------|
| **User Avatar Photos** | Show reviewer's profile photo instead of just initials | Easy |
| **Review Timestamp** | Show "2 days ago", "1 week ago" relative time | Easy |
| **Pagination / Load More** | Currently shows all reviews. Add "Load more" for large lists | Easy |
| **Empty State Illustration** | Show a nice illustration instead of plain text when no reviews | Easy |
| **Review Helpful Count** | "Was this helpful? 👍 12" — let users upvote reviews | Medium |
| **Sort Options** | Sort by: Most Recent, Highest Rated, Most Helpful | Medium |
| **Review Reply** | Allow company/admin to reply to reviews (like Google Maps) | Medium |
| **Star Distribution Bar** | Show "5★ ████████ 70%, 4★ ███ 20%..." summary bar | Medium |
| **Review Media** | Let users attach screenshots with their reviews | Hard |
| **Auto-rotating Carousel** | Auto-slide featured reviews on the landing page | Easy |
| **Review Verification Badge** | Extra badge for reviews from users who actually used the platform (applied/hired) | Medium |

### Quick Win Recommendations (Top 3):
1. **User Avatar Photos** — Already stored in DB (`avatar_path`), just need to render `<img>` instead of initials circle
2. **Review Timestamps** — Already have `created_at` in the review model, add relative time display
3. **Star Distribution Summary** — Calculate from existing data, adds credibility

---

## 📋 Action Items Summary

| # | Item | Impact | Effort |
|---|------|--------|--------|
| 1 | Category counts → real from DB | 🔴 High | Medium |
| 2 | Stats strip → remove fake fallbacks | 🔴 High | Easy |
| 3 | Scrolling ticker → use real data | 🔴 High | Easy |
| 4 | Company logo strip → real companies | 🔴 High | Easy |
| 5 | Remove/replace `data.js` fake data | 🔴 High | Medium |
| 6 | Market trends → proper empty state | 🟡 Medium | Easy |
| 7 | Consolidate pricing plans config | 🟡 Medium | Easy |
| 8 | Fix location fallback to "San Francisco" | 🟡 Medium | Easy |
| 9 | Testimonials: Add avatars + timestamps | 🟢 Quick Win | Easy |
| 10 | Testimonials: Star distribution bar | 🟢 Quick Win | Medium |

> [!TIP]
> Start with items **2, 3, 4, 8** — they're quick fixes (change a string/remove hardcoded values). Then tackle **1 and 5** which need new backend endpoints.
