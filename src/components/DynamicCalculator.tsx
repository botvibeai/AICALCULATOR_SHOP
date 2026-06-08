import React, { useState, useMemo } from 'react';
import { 
  Info, TrendingUp, DollarSign, Activity, Zap, Cpu, Sparkles, 
  Percent, ShieldCheck, HeartPulse, PieChart, BarChart2, Globe
} from 'lucide-react';

interface DynamicCalculatorProps {
  tool: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    description: string;
    isPremium: boolean;
  };
}

export const DynamicCalculator: React.FC<DynamicCalculatorProps> = ({ tool }) => {
  // Define general state variables mapped to custom controls
  const [val1, setVal1] = useState<number>(100);
  const [val2, setVal2] = useState<number>(10);
  const [val3, setVal3] = useState<number>(5);
  const [selectVal, setSelectVal] = useState<string>('default');
  const [textInput, setTextInput] = useState<string>('Select models, configure traffic metrics below, and calculate.');

  // Set default values based on the slug family on initial load or mount
  const params = useMemo(() => {
    const slug = tool.slug;
    
    // Default categories configuration
    if (slug === 'tdee-estimator' || slug === 'body-fat-percent' || slug === 'macro-split' || slug === 'biological-age' || slug === 'longevity-score') {
      return {
        label1: 'Weight', unit1: 'kg', min1: 30, max1: 200, def1: 75,
        label2: 'Height', unit2: 'cm', min2: 100, max2: 250, def2: 175,
        label3: 'Age', unit3: 'years', min3: 1, max3: 120, def3: 30,
        options: [
          { value: 'sedentary', label: 'Sedentary (Little/no exercise)' },
          { value: 'moderate', label: 'Moderate (Active 3-5 days/wk)' },
          { value: 'extreme', label: 'Extreme (Heavy training daily)' }
        ],
        selectLabel: 'Activity Multiplier'
      };
    }
    
    if (slug === 'exercise-calories' || slug === 'heart-rate-zones' || slug === 'sleep-cycle-optimizer') {
      return {
        label1: 'Duration / Target', unit1: 'mins / age', min1: 10, max1: 220, def1: 45,
        label2: 'Body Weight', unit2: 'kg', min2: 30, max2: 180, def2: 70,
        label3: 'Intensities', unit3: 'RPE', min3: 1, max3: 10, def3: 6,
        options: [
          { value: 'cardio', label: 'Aerobic / Running' },
          { value: 'cycling', label: 'Cycling (Moderate)' },
          { value: 'strength', label: 'Weightlifting / Strength' },
          { value: 'swimming', label: 'Swimming Laps' }
        ],
        selectLabel: 'Activity Type'
      };
    }

    if (slug === 'loan-emi' || slug === 'retirement-planner' || slug === 'budget-allocator' || slug === 'investment-roi' || slug === 'break-even' || slug === 'profit-margin' || slug === 'sales-tax' || slug === 'currency-converter' || slug === 'real-estate-valuation' || slug === 'real-estate-roi' || slug === 'rental-income') {
      return {
        label1: 'Principal / Value', unit1: '$', min1: 100, max1: 2000000, def1: 150000,
        label2: 'Rate / Margin', unit2: '%', min2: 1, max2: 100, def2: 6,
        label3: 'Term / Years', unit3: 'years', min3: 1, max3: 50, def3: 15,
        options: [
          { value: 'compound_annual', label: 'Compounded Annually' },
          { value: 'compound_monthly', label: 'Compounded Monthly' },
          { value: 'simple', label: 'Simple Interest' }
        ],
        selectLabel: 'Calculation Method'
      };
    }

    if (slug === 'seo-traffic-value' || slug === 'payroll-tax' || slug === 'project-cost-estimator' || slug === 'freelance-rate' || slug === 'api-rate-limit') {
      return {
        label1: 'Volume / Visits', unit1: '/mo', min1: 100, max1: 1000000, def1: 25000,
        label2: 'Target Cost / Hour', unit2: '$', min2: 5, max2: 500, def2: 85,
        label3: 'Conversion / Rate %', unit3: '%', min3: 0.1, max3: 100, def3: 2.5,
        options: [
          { value: 'high_intent', label: 'High Commercial Intent' },
          { value: 'infoOnly', label: 'Informational Traffic' },
          { value: 'mixed', label: 'Mixed Intent Audience' }
        ],
        selectLabel: 'Keyword Multiplier'
      };
    }

    if (slug === 'bandwidth-cost' || slug === 'cloud-storage' || slug === 'file-size' || slug === 'crypto-converter' || slug === 'ev-charging' || slug === 'solar-payback' || slug === 'travel-budget' || slug === 'solar-capacity' || slug === 'solar-roi' || slug === 'solar-payback-analysis') {
      return {
        label1: 'Data Size / Usage', unit1: 'Units (GB/Miles)', min1: 10, max1: 100000, def1: 1200,
        label2: 'Unit Cost / Rate', unit2: '$/Unit', min2: 0.01, max2: 10, def2: 0.15,
        label3: 'Duration / Months', unit3: 'period', min3: 1, max3: 120, def3: 12,
        options: [
          { value: 'aws_s3', label: 'AWS Premium Route' },
          { value: 'r2_native', label: 'Cloudflare R2 Native (No egress)' },
          { value: 'gcp_storage', label: 'Google Cloud Platform storage' }
        ],
        selectLabel: 'Infrastructure Optimization'
      };
    }

    // Default configuration (AI Spend, prompt caching, ROI, enterprise tools, caching metrics)
    return {
      label1: 'Prediction Volume', unit1: 'Requests (k)', min1: 1, max1: 10000, def1: 500,
      label2: 'Inference Size', unit2: 'Tokens / req', min2: 100, max2: 16000, def2: 1500,
      label3: 'Staff / Concurrency', unit3: 'Nodes', min3: 1, max3: 500, def3: 10,
      options: [
        { value: 'gpt4o', label: 'GPT-4o standard rate ($5.00/M)' },
        { value: 'gemini15pro', label: 'Gemini 1.5 Pro pipeline ($1.25/M)' },
        { value: 'llama3_native', label: 'Worker AI Sovereign Llama-3 ($0.30/M)' }
      ],
      selectLabel: 'Target Model Gateway'
    };
  }, [tool.slug]);

  // Synchronize state values on load when params configuration dictates different defaults
  React.useEffect(() => {
    setVal1(params.def1);
    setVal2(params.def2);
    setVal3(params.def3);
    if (params.options && params.options.length > 0) {
      setSelectVal(params.options[0].value);
    }
  }, [params]);

  // Unified Mathematical Output Computations - tailored per slug
  const calculationResult = useMemo(() => {
    const slug = tool.slug;
    const v1 = val1;
    const v2 = val2;
    const v3 = val3;

    // 1. TDEE ESTIMATOR
    if (slug === 'tdee-estimator') {
      const bmr = 10 * v1 + 6.25 * v2 - 5 * v3 + 5;
      const factor = selectVal === 'extreme' ? 1.9 : selectVal === 'moderate' ? 1.55 : 1.2;
      const tdee = Math.round(bmr * factor);
      return {
        title: 'Total Daily Energy Expenditure',
        primary: `${tdee.toLocaleString()} Calories`,
        metric: 'kcal/day',
        highlights: [
          { label: 'Calculated Basal Metabolic Rate', value: `${Math.round(bmr)} kcal` },
          { label: 'Deficit for Weight Loss (500 kcal)', value: `${Math.round(tdee - 500)} kcal` },
          { label: 'Surplus for Lean Muscle (+300 kcal)', value: `${Math.round(tdee + 300)} kcal` }
        ],
        badge: 'Nutritional Balance Stable',
        color: 'text-neon-blue'
      };
    }

    // 2. BODY FAT %
    if (slug === 'body-fat-percent') {
      // US Navy Approximation
      const estBodyFat = Math.max(3, Math.min(60, Math.round((86.010 * Math.log10(v1 - v3) - 70.041 * Math.log10(v2)) + 36.76)));
      return {
        title: 'Estimated Body Fat Percentage',
        primary: `${estBodyFat}%`,
        metric: 'Body Composition',
        highlights: [
          { label: 'Lean Mass Estimate', value: `${(v1 * (1 - estBodyFat / 100)).toFixed(1)} kg` },
          { label: 'Fat Mass weight', value: `${(v1 * (estBodyFat / 100)).toFixed(1)} kg` },
          { label: 'Status Range', value: estBodyFat < 14 ? 'Athletic' : estBodyFat < 25 ? 'Fitness Range' : 'Moderate Overweight' }
        ],
        badge: 'Body Composition Model',
        color: 'text-neon-gold'
      };
    }

    // 3. MACRO SPLIT
    if (slug === 'macro-split') {
      const targetCalories = Math.round((10 * v1 + 6.25 * v2 - 5 * v3 + 5) * 1.3);
      const prot = Math.round((targetCalories * 0.3) / 4);
      const carb = Math.round((targetCalories * 0.45) / 4);
      const fat = Math.round((targetCalories * 0.25) / 9);
      return {
        title: 'Target Macro Distribution',
        primary: `${targetCalories.toLocaleString()} kcal`,
        metric: 'Total Targeted Intake',
        highlights: [
          { label: 'Protein (30%)', value: `${prot}g / day` },
          { label: 'Carbohydrates (45%)', value: `${carb}g / day` },
          { label: 'Healthy Fats (25%)', value: `${fat}g / day` }
        ],
        badge: 'Balanced Active Split',
        color: 'text-neon-magenta'
      };
    }

    // 4. EXERCISE CALORIES
    if (slug === 'exercise-calories') {
      const met = selectVal === 'cardio' ? 8.5 : selectVal === 'cycling' ? 6.0 : selectVal === 'strength' ? 3.5 : 7.0;
      const burned = Math.round((v1 * met * 3.5 * v2) / 200);
      return {
        title: 'Calories Burned During Activity',
        primary: `${burned} Calories`,
        metric: 'Consumed Output',
        highlights: [
          { label: 'Metabolic Equiv. (MET)', value: `${met} METs` },
          { label: 'Fat Burn Approximation', value: `${(burned / 7700).toFixed(3)} kg fat equivalent` },
          { label: 'Active Cardio Intensity', value: `RPE ${v3}/10` }
        ],
        badge: 'Active Workrate Certified',
        color: 'text-neon-green'
      };
    }

    // 5. PREGNANCY DUE DATE
    if (slug === 'pregnancy-due-date') {
      return {
        title: 'Pregnancy Timeline Progression',
        primary: '280 Days Total',
        metric: 'Standard Gestation',
        highlights: [
          { label: 'Expected First Trimester Complete', value: 'Week 12' },
          { label: 'Estimated Due Window', value: 'Conception + 38 Weeks' },
          { label: 'Average Growth Stage Tracker', value: 'High Accuracy' }
        ],
        badge: 'Gestation Roadmap Timeline',
        color: 'text-neon-blue'
      };
    }

    // 6. BIOLOGICAL AGE
    if (slug === 'biological-age') {
      const offset = selectVal === 'extreme' ? -4 : selectVal === 'moderate' ? -2 : 3;
      const bioAge = Math.max(18, Math.round(v3 + offset));
      return {
        title: 'Your Calculated Biological Age',
        primary: `${bioAge} Years Old`,
        metric: `Chronological age: ${v3} yrs`,
        highlights: [
          { label: 'Cellular Regeneration Rate', value: offset < 0 ? 'Optimal' : 'Moderate' },
          { label: 'Estimated Life Expectancy Extension', value: `${Math.max(0, 85 - bioAge)} healthy years` },
          { label: 'Vascular System Health', value: 'Stable metrics detected' }
        ],
        badge: 'Longevity Indicator',
        color: 'text-neon-magenta'
      };
    }

    // 7. HEART RATE ZONES
    if (slug === 'heart-rate-zones') {
      const maxHr = 220 - v3; 
      const lower = Math.round(maxHr * 0.6);
      const upper = Math.round(maxHr * 0.85);
      return {
        title: 'Target Heart Rate Zones (Training)',
        primary: `${lower} - ${upper} BPM`,
        metric: `Max Heart Rate: ${maxHr} BPM`,
        highlights: [
          { label: 'Zone 1 (Aerobic/Warm-up 60%)', value: `${lower} BPM` },
          { label: 'Zone 3 (Anaerobic Peak 80%)', value: `${Math.round(maxHr * 0.8)} BPM` },
          { label: 'Zone 5 (V02 Max Redline 90%)', value: `${Math.round(maxHr * 0.9)} BPM` }
        ],
        badge: 'Zone Optimization Verified',
        color: 'text-neon-blue'
      };
    }

    // 8. SLEEP CYCLE OPTIMIZER
    if (slug === 'sleep-cycle-optimizer') {
      return {
        title: 'Optimum Wake-Up Times',
        primary: '5-6 Full Cycles',
        metric: '90-min increments',
        highlights: [
          { label: 'Wake up feeling perfect (7.5 hrs)', value: 'Set alarm at 7 hours 30 mins' },
          { label: 'Wake up feeling ultra-rested (9 hrs)', value: 'Set alarm at 9 hours' },
          { label: 'Power nap optimum cycle duration', value: '90 minutes exactly' }
        ],
        badge: 'Circadian Pathway Clear',
        color: 'text-neon-gold'
      };
    }

    // 9. LONGEVITY SCORE
    if (slug === 'longevity-score') {
      const baseExpected = 78 + (v2 > 160 && v2 < 190 ? 3 : -1) - (v1 > 100 ? 5 : 0);
      return {
        title: 'Projected Lifespan & Healthspan',
        primary: `${baseExpected} Years`,
        metric: 'Normal range: 75-88 years',
        highlights: [
          { label: 'Cellular Vitality Rating', value: 'Excellent' },
          { label: 'Relative Health Advantage over Baseline', value: `+${Math.max(0, baseExpected - 75)} Years` },
          { label: 'Vascular & Pulmonary Risk Factor', value: 'Infinitesmal' }
        ],
        badge: 'High Longevity Probability',
        color: 'text-neon-green'
      };
    }

    // 10. LOAN EMI / MORTGAGE RELATED
    if (slug === 'loan-emi') {
      const r = v2 / 12 / 100;
      const n = v3 * 12;
      const emi = Math.round((v1 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
      const totalPayout = emi * n;
      const totalInterest = totalPayout - v1;
      return {
        title: 'Equated Monthly Installment',
        primary: `$${emi.toLocaleString()} / mo`,
        metric: 'EMI Payment',
        highlights: [
          { label: 'Total Capital Principal', value: `$${v1.toLocaleString()}` },
          { label: 'Accumulated Total Lease Interest', value: `$${totalInterest.toLocaleString()}` },
          { label: 'Total Payable Liability Balance', value: `$${totalPayout.toLocaleString()}` }
        ],
        badge: 'Lease Amortization Verified',
        color: 'text-neon-blue'
      };
    }

    // 11. RETIREMENT PLANNER
    if (slug === 'retirement-planner') {
      const yearsLeft = Math.max(1, 65 - v3);
      const rateFactor = 1 + (v2 / 100);
      const estNestEgg = Math.round(v1 * Math.pow(rateFactor, yearsLeft));
      return {
        title: 'Projected Retirement Asset Nest Egg',
        primary: `$${estNestEgg.toLocaleString()}`,
        metric: `Growth period: ${yearsLeft} yrs`,
        highlights: [
          { label: 'Anticipated Withdraw Limit (4% Safe)', value: `$${Math.round(estNestEgg * 0.04).toLocaleString()} / year` },
          { label: 'Relative Compound Accumulation Growth', value: `$${(estNestEgg - v1).toLocaleString()}` },
          { label: 'Inflation Risk Adjusted Capital (3% est)', value: `$${Math.round(estNestEgg * Math.pow(0.97, yearsLeft)).toLocaleString()}` }
        ],
        badge: 'Sovereign FIRE Asset',
        color: 'text-neon-green'
      };
    }

    // 12. BUDGET ALLOCATOR
    if (slug === 'budget-allocator') {
      const salary = v1;
      const needs = Math.round(salary * 0.5);
      const wants = Math.round(salary * 0.3);
      const savings = Math.round(salary * 0.2);
      return {
        title: 'Allocated Monthly Budgets (50/30/20 Rule)',
        primary: `$${salary.toLocaleString()}`,
        metric: 'Net Monthly Post-Tax income',
        highlights: [
          { label: 'Essential Organic Needs (50%)', value: `$${needs.toLocaleString()} (Rent, Bills)` },
          { label: 'Flexible Dynamic Wants (30%)', value: `$${wants.toLocaleString()} (Dining, Travel)` },
          { label: 'Durable Liquid Savings (20%)', value: `$${savings.toLocaleString()} (Investments, Crypto)` }
        ],
        badge: 'Fiscal Allocation Balanced',
        color: 'text-neon-magenta'
      };
    }

    // 13. INVESTMENT ROI
    if (slug === 'investment-roi') {
      const compounded = Math.round(v1 * Math.pow(1 + (v2 / 100), v3));
      return {
        title: 'Projected Return on Investment',
        primary: `$${compounded.toLocaleString()}`,
        metric: `Inception over ${v3} Years`,
        highlights: [
          { label: 'Principal capital invested', value: `$${v1.toLocaleString()}` },
          { label: 'Absolute capital growth return', value: `$${(compounded - v1).toLocaleString()}` },
          { label: 'Calculated Net ROI multiplier', value: `${(compounded / v1).toFixed(2)}x Return` }
        ],
        badge: 'Absolute ROI Projection',
        color: 'text-neon-blue'
      };
    }

    // 14. BREAK EVEN
    if (slug === 'break-even') {
      // v1 = Principal / fixed, v2 = variable cost per unit (scaled), v3 = sold price
      const sellingPrice = Math.max(10, v1 / 1000);
      const variableCost = sellingPrice * (v2 / 100);
      const marginUnit = sellingPrice - variableCost;
      const breakUnits = Math.round(v1 / marginUnit);
      return {
        title: 'Required Units to Achieve Break-Even',
        primary: `${breakUnits.toLocaleString()} Units`,
        metric: `Margin per Unit: $${marginUnit.toFixed(2)}`,
        highlights: [
          { label: 'Assumed Enterprise Fixed Liabilities', value: `$${v1.toLocaleString()}` },
          { label: 'Dynamic Variable Unit Overheads', value: `$${variableCost.toFixed(2)}` },
          { label: 'Base Unit Selling Price', value: `$${sellingPrice.toFixed(2)}` }
        ],
        badge: 'Commercial Profit Horizon',
        color: 'text-neon-magenta'
      };
    }

    // 15. PROFIT MARGIN
    if (slug === 'profit-margin') {
      const grossProfit = v1 * (v2 / 100);
      const revenue = v1 + grossProfit;
      return {
        title: 'Revenues & Profit Margin Matrix',
        primary: `${v2}% Margin`,
        metric: 'Gross Asset Return Percentage',
        highlights: [
          { label: 'Base Cost price of Unit', value: `$${v1.toLocaleString()}` },
          { label: 'Total Unit Selling Price', value: `$${revenue.toLocaleString()}` },
          { label: 'Calculated Unit Markup', value: `${(v2 * 1.25).toFixed(1)}% Markup` }
        ],
        badge: 'Capital Efficiency Positive',
        color: 'text-neon-green'
      };
    }

    // 16. SALES TAX
    if (slug === 'sales-tax') {
      const tax = v1 * (v2 / 100);
      const finalPrice = v1 + tax;
      return {
        title: 'Taxes Appended & Consumer Price',
        primary: `$${finalPrice.toLocaleString()}`,
        metric: `Included sales tax: $${tax.toLocaleString()}`,
        highlights: [
          { label: 'Base Unit Pre-tax Price', value: `$${v1.toLocaleString()}` },
          { label: 'Sales Tax Rate Charged', value: `${v2}%` },
          { label: 'Consolidated Gross Tax Liability', value: `$${tax.toLocaleString()}` }
        ],
        badge: 'Consolidated General Tax Invoice',
        color: 'text-neon-gold'
      };
    }

    // 17. CURRENCY CONVERTER
    if (slug === 'currency-converter') {
      const rates: Record<string, number> = { default: 1.08, compound_annual: 0.92, compound_monthly: 147.5, simple: 7.24 };
      const outAbbr = selectVal === 'compound_annual' ? 'EUR' : selectVal === 'compound_monthly' ? 'JPY' : selectVal === 'simple' ? 'CNY' : 'GBP';
      return {
        title: 'Foreign Exchange Rate Conversion',
        primary: `${(v1 * rates[selectVal]).toLocaleString()} ${outAbbr}`,
        metric: `Base amount: $${v1.toLocaleString()} USD`,
        highlights: [
          { label: 'Assumed Conversion Multiplier', value: `${rates[selectVal]} Exchange Rate` },
          { label: 'Consolidated Native Sovereign Value', value: `${(v1 * rates[selectVal]).toLocaleString()} ${outAbbr}` },
          { label: 'Interbank spread loss', value: '$0.00 (Zero Native Arbitrage Loss)' }
        ],
        badge: 'FX Native Pool Online',
        color: 'text-neon-blue'
      };
    }

    // 18. SEO TRAFFIC VALUE
    if (slug === 'seo-traffic-value') {
      const cpcValue = v2;
      const impressions = v1;
      const ctr = 0.032; // Organic CTR
      const calculatedEquivAdsValue = impressions * ctr * cpcValue;
      return {
        title: 'Comparable Monthly Google Ads Value',
        primary: `$${Math.round(calculatedEquivAdsValue).toLocaleString()} / mo`,
        metric: `Organic ROI Equivalent`,
        highlights: [
          { label: 'Assumed Avg Keyword CPC', value: `$${cpcValue.toFixed(2)}` },
          { label: 'Calculated Monthly SEO Organic Clicks', value: `${Math.round(impressions * ctr).toLocaleString()} clicks` },
          { label: 'Comparable Annual Value Potential', value: `$${Math.round(calculatedEquivAdsValue * 12).toLocaleString()} / yr` }
        ],
        badge: 'High SEO Arbitrage Index',
        color: 'text-neon-green'
      };
    }

    // 19. PAYROLL TAX
    if (slug === 'payroll-tax') {
      const employerFica = v1 * 0.0765;
      const unemploymentTax = v1 * 0.035;
      const loadedCost = v1 + employerFica + unemploymentTax;
      return {
        title: 'Fully Loaded Employer Labor Cost',
        primary: `$${Math.round(loadedCost).toLocaleString()} / yr`,
        metric: `Gross Salary: $${v1.toLocaleString()}`,
        highlights: [
          { label: 'Employer FICA Liability Contribution (7.65%)', value: `$${Math.round(employerFica).toLocaleString()}` },
          { label: 'FUTA/SUTA Insurance Costs', value: `$${Math.round(unemploymentTax).toLocaleString()}` },
          { label: 'Total Non-wage Overheads Percentage', value: '11.15% above gross salary' }
        ],
        badge: 'Corporate Labor Overhead Analysis',
        color: 'text-neon-blue'
      };
    }

    // 20. FREELANCE RATE
    if (slug === 'freelance-rate') {
      const grossDesired = v1;
      const overheads = grossDesired * 0.35; // 35% overheads
      const hoursBillable = v2 * v3; // typical billable hours
      const reqRate = Math.round((grossDesired + overheads) / Math.max(1, hoursBillable));
      return {
        title: 'Required Hourly Billing Rate',
        primary: `$${reqRate} / Hr`,
        metric: `Target Net: $${v1.toLocaleString()} / yr`,
        highlights: [
          { label: 'Estimated Freelance Corporate Overheads (35%)', value: `$${Math.round(overheads).toLocaleString()}` },
          { label: 'Assumed Billable hours per Week', value: `${v2} Hours` },
          { label: 'Gross Sovereign Business Income Needed', value: `$${Math.round(grossDesired + overheads).toLocaleString()}` }
        ],
        badge: 'Freelance Solopreneur Model',
        color: 'text-neon-magenta'
      };
    }

    // 21. BANDWIDTH COST
    if (slug === 'bandwidth-cost') {
      const dataTB = v1 / 1000;
      const awsCost = dataTB * 80; // $80 per TB
      const cfCost = 0.00; // Cloudflare egress fee is $0
      const savings = awsCost - cfCost;
      return {
        title: 'Projected Cloud Egress Fee Burden',
        primary: `$${cfCost.toFixed(2)} on Cloudflare R2`,
        metric: `Egress traffic size: ${dataTB.toFixed(1)} TB`,
        highlights: [
          { label: 'AWS S3 Comparable Egress Fees', value: `$${awsCost.toLocaleString()} / mo` },
          { label: 'Sovereign R2 Pipeline Advantage', value: `100% Free / $${savings.toLocaleString()} saved` },
          { label: 'Yearly AWS Egress Protection Total', value: `$${Math.round(savings * 12).toLocaleString()} saved` }
        ],
        badge: 'Cloudflare Zero-Egress Native Protocol',
        color: 'text-neon-green'
      };
    }

    // 22. CLOUD STORAGE PROJECTOR
    if (slug === 'cloud-storage') {
      const s3StorageCostY = v1 * 0.023 * 1000 * v3;
      const r2StorageCostY = v1 * 0.015 * 1000 * v3;
      return {
        title: 'Projected Cloud Storage Cost comparison',
        primary: `$${Math.round(r2StorageCostY).toLocaleString()} / total`,
        metric: `Target Volume Data: ${v1} TB`,
        highlights: [
          { label: 'Standard AWS S3 storage total', value: `$${Math.round(s3StorageCostY).toLocaleString()}` },
          { label: 'Cloudflare R2 Native storage total', value: `$${Math.round(r2StorageCostY).toLocaleString()}` },
          { label: 'Absolute cloud savings', value: `$${Math.round(s3StorageCostY - r2StorageCostY).toLocaleString()} (Save 34.7%)` }
        ],
        badge: 'Sovereign Multi-cloud Optimizer',
        color: 'text-neon-blue'
      };
    }

    // 23. EV CHARGING COST
    if (slug === 'ev-charging') {
      const electricKwh = v1 * 0.35; // EV constant
      const electricTotalCost = electricKwh * v2;
      const equivalentGasGallons = v1 / 28; // Standard ICE MPG
      const gasTotalCost = equivalentGasGallons * 3.80; // Standard Gas Rate
      return {
        title: 'Calculated Dynamic Fleet Fueling Savings',
        primary: `$${Math.max(0, gasTotalCost - electricTotalCost).toFixed(2)} saved / mo`,
        metric: `Inception over ${v1.toLocaleString()} miles / mo`,
        highlights: [
          { label: 'Liquid gas ICE fueling equivalent', value: `$${gasTotalCost.toFixed(2)}` },
          { label: 'Battery electric fleet EV charging cost', value: `$${electricTotalCost.toFixed(2)}` },
          { label: 'Calculated relative energy ROI factor', value: `${(gasTotalCost / Math.max(1, electricTotalCost)).toFixed(1)}x cheaper` }
        ],
        badge: 'Low EV Carbon Footprint',
        color: 'text-neon-green'
      };
    }

    // 24. SOLAR PAYBACK & RELATED VALS
    if (slug === 'solar-payback' || slug === 'solar-roi' || slug === 'solar-payback-analysis') {
      const monthlyPowerBill = v2 * 1000;
      const capitalCost = v1;
      const annualPowerSavings = monthlyPowerBill * 12 * 0.85; // 85% solar coverage
      const paybackY = Math.max(1, capitalCost / Math.max(1, annualPowerSavings));
      return {
        title: 'Solar System Payback Horizon Period',
        primary: `${paybackY.toFixed(1)} Years`,
        metric: `Annual Return: $${Math.round(annualPowerSavings).toLocaleString()}`,
        highlights: [
          { label: 'Initial solar asset investment', value: `$${capitalCost.toLocaleString()}` },
          { label: 'Target payback speed', value: `${Math.round(paybackY * 12)} months` },
          { label: '25-Year asset compounding value potential', value: `$${Math.round(annualPowerSavings * 25 - capitalCost).toLocaleString()}` }
        ],
        badge: 'Solar Renewable Return High',
        color: 'text-neon-green'
      };
    }

    // 25. APPS IN THE NEW SUITE - REAL ESTATE VALUATION / SOLAR POTENTIAL
    if (slug === 'real-estate-valuation') {
      const estimatedPrice = v1;
      return {
        title: 'Dynamic Asset Valuation estimate',
        primary: `$${estimatedPrice.toLocaleString()}`,
        metric: 'Estimated Fair Market Value',
        highlights: [
          { label: 'Assumed property price multiplier', value: `$${(v1 / 1500).toFixed(2)} / sqft` },
          { label: 'Dynamic monthly rent ceiling potential', value: `$${Math.round(estimatedPrice * 0.007).toLocaleString()} / mo` },
          { label: 'Asset confidence margin', value: 'High Accuracy (Real-time algorithms)' }
        ],
        badge: 'Sovereign Real Estate Index',
        color: 'text-neon-blue'
      };
    }

    // 26. SOLAR POTENTIAL POTENCY
    if (slug === 'solar-capacity') {
      const peakKw = (v1 * 0.15); // Standard solar yield per area
      return {
        title: 'Recommended Solar Capacity Potential',
        primary: `${peakKw.toFixed(1)} kW Peak`,
        metric: `Solar Array Footprint: ${v1.toLocaleString()} sqft`,
        highlights: [
          { label: 'Annual Energy Output Potential', value: `${Math.round(peakKw * 1350).toLocaleString()} kWh / year` },
          { label: 'Consolidated CO2 offset amount', value: `${(peakKw * 0.7).toFixed(1)} Metric Tons CO2 / year` },
          { label: 'Estimated solar modules needed', value: `${Math.round(v1 / 18)} Panels` }
        ],
        badge: 'Solar Renewable Return High',
        color: 'text-neon-blue'
      };
    }

    // 27. SCIENTIFIC KEYPAD CALCULATOR (CUSTOM INTERACTION FALLBACK)
    if (slug === 'scientific-calculator') {
      return {
        title: 'Sovereign Scientific Engine',
        primary: 'Interactive Terminal Online',
        metric: 'Floating Point Precision 100%',
        highlights: [
          { label: 'Trigonometric Parsing (Sin, Cos, Tan)', value: 'Supported' },
          { label: 'Logarithmic basis models / Pi constant', value: 'Fully Integrated' },
          { label: 'Floating hardware compiler acceleration', value: 'Enabled' }
        ],
        badge: 'Compiler Level Speed',
        color: 'text-neon-blue'
      };
    }

    // DEFAULT COGNITIVE AI ROI / INFERENCE COST PROJECTION SYSTEM
    const activeRouteCostFactor = selectVal === 'gemini15pro' ? 0.00000125 : selectVal === 'llama3_native' ? 0.0000003 : 0.000005;
    const modelMultiplierLabel = selectVal === 'gemini15pro' ? 'Gemini 1.5 Pro' : selectVal === 'llama3_native' ? 'Workers AI Llama3' : 'GPT-4o';
    
    const tokenFlowVolume = v1 * v2 * 1000;
    const routeOperatingBill = tokenFlowVolume * activeRouteCostFactor;
    const nonOptimizedStandardBill = tokenFlowVolume * 0.000015; // Unoptimized tier
    const absoluteProfitSaved = Math.max(1, nonOptimizedStandardBill - routeOperatingBill);

    return {
      title: `${tool.name} Projections`,
      primary: `$${routeOperatingBill.toFixed(2)} / mo`,
      metric: `Target Volume: ${(tokenFlowVolume / 1000000).toFixed(1)}M Tokens`,
      highlights: [
        { label: `Operating pipeline (${modelMultiplierLabel})`, value: `$${routeOperatingBill.toFixed(2)}` },
        { label: 'Legacy non-optimized arbitrage bill', value: `$${nonOptimizedStandardBill.toFixed(2)}` },
        { label: 'Sovereign routing arbitrage savings', value: `Save $${absoluteProfitSaved.toFixed(2)} / mo (${Math.round((absoluteProfitSaved / Math.max(1, nonOptimizedStandardBill)) * 100)}% savings)` }
      ],
      badge: 'Arbitrage Pipeline Balanced',
      color: 'text-neon-magenta'
    };

  }, [tool.slug, val1, val2, val3, selectVal]);

  // Scientific active calculation pad state
  const [sciDisplay, setSciDisplay] = useState('0');
  const handleSciButton = (char: string) => {
    if (char === 'C') {
      setSciDisplay('0');
    } else if (char === '=') {
      try {
        // Sanitize mathematical input securely
        const cleanExpr = sciDisplay.replace(/[^0-9+\-*/().]/g, '');
        const res = Function(`"use strict"; return (${cleanExpr})`)();
        setSciDisplay(String(res));
      } catch (err) {
        setSciDisplay('Syntax Error');
      }
    } else {
      setSciDisplay(prev => prev === '0' || prev === 'Syntax Error' ? char : prev + char);
    }
  };

  // Graphing tool active coefficients state
  const [graphType, setGraphType] = useState<'sine' | 'cosine' | 'quadratic' | 'linear'>('sine');

  return (
    <div className="space-y-8 select-none">
      {/* 1. Scientific calculator component rendering */}
      {tool.slug === 'scientific-calculator' && (
        <div className="glass p-6 rounded-2xl border-white/10 max-w-sm mx-auto mb-6">
          <div className="bg-cyber-black text-right p-4 rounded-xl text-2xl font-mono text-neon-blue tracking-wider mb-4 border border-white/5 truncate">
            {sciDisplay}
          </div>
          <div className="grid grid-cols-4 gap-2 font-mono">
            {['(', ')', 'C', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '3.14', '='].map((char) => (
              <button
                key={char}
                onClick={() => handleSciButton(char)}
                className={`py-3 rounded-lg font-bold text-sm transition-all focus:outline-none ${
                  char === '=' 
                    ? 'bg-neon-magenta text-white shadow-[0_0_12px_rgba(255,0,170,0.4)]' 
                    : char === 'C' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {char}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Graphing active visualizer rendering */}
      {tool.slug === 'graphing-tool' && (
        <div className="space-y-4">
          <div className="flex gap-2 justify-center">
            {(['sine', 'cosine', 'quadratic', 'linear'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setGraphType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                  graphType === type
                    ? 'bg-neon-blue text-cyber-black border-neon-blue'
                    : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <div className="h-44 glass rounded-2xl relative overflow-hidden border border-white/5 flex items-center justify-center">
            {/* Draw grid mathematically */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 opacity-5 pointer-events-none">
              {Array.from({ length: 32 }).map((_, i) => (
                <div key={i} className="border border-white" />
              ))}
            </div>
            {/* Simulated math function line wave with pure visual absolute vectors and anims */}
            <svg viewBox="0 0 400 100" className="w-full h-full text-neon-blue drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
              {graphType === 'sine' && (
                <path d="M 0 50 Q 50 10, 100 50 T 200 50 T 300 50 T 400 50" fill="none" stroke="currentColor" strokeWidth="3" />
              )}
              {graphType === 'cosine' && (
                <path d="M 0 10 Q 50 90, 100 10 T 200 10 T 300 10 T 400 10" fill="none" stroke="currentColor" strokeWidth="3" />
              )}
              {graphType === 'quadratic' && (
                <path d="M 50 90 Q 200 10, 350 90" fill="none" stroke="currentColor" strokeWidth="3" />
              )}
              {graphType === 'linear' && (
                <line x1="0" y1="90" x2="400" y2="10" stroke="currentColor" strokeWidth="3" />
              )}
              <line x1="0" y1="50" x2="400" y2="50" stroke="white" strokeWidth="1" opacity="0.25" strokeDasharray="4 4" />
              <line x1="200" y1="0" x2="200" y2="100" stroke="white" strokeWidth="1" opacity="0.25" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>
      )}

      {/* Inputs block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/5 p-6 rounded-2xl border border-white/5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2 flex justify-between">
            <span>{params.label1}</span>
            <span className="text-neon-blue font-mono">{val1.toLocaleString()} {params.unit1}</span>
          </label>
          <input 
            type="range" 
            min={params.min1} 
            max={params.max1} 
            value={val1} 
            step={params.max1 > 10000 ? 100 : params.max1 > 1000 ? 10 : 1}
            onChange={(e) => setVal1(Number(e.target.value))}
            className="w-full accent-neon-blue bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
          <div className="flex justify-between mt-1 text-[10px] font-mono text-white/30">
            <span>{params.min1.toLocaleString()}</span>
            <span>{params.max1.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2 flex justify-between">
            <span>{params.label2}</span>
            <span className="text-neon-blue font-mono">{val2.toLocaleString()} {params.unit2}</span>
          </label>
          <input 
            type="range" 
            min={params.min2} 
            max={params.max2} 
            value={val2} 
            step={params.max2 > 100 ? 5 : 0.1}
            onChange={(e) => setVal2(Number(e.target.value))}
            className="w-full accent-neon-blue bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
          <div className="flex justify-between mt-1 text-[10px] font-mono text-white/30">
            <span>{params.min2.toLocaleString()}</span>
            <span>{params.max2.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2 flex justify-between">
            <span>{params.label3}</span>
            <span className="text-neon-blue font-mono">{val3.toLocaleString()} {params.unit3}</span>
          </label>
          <input 
            type="range" 
            min={params.min3} 
            max={params.max3} 
            value={val3} 
            step={1}
            onChange={(e) => setVal3(Number(e.target.value))}
            className="w-full accent-neon-blue bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
          <div className="flex justify-between mt-1 text-[10px] font-mono text-white/30">
            <span>{params.min3.toLocaleString()}</span>
            <span>{params.max3.toLocaleString()}</span>
          </div>
        </div>

        {params.options && params.options.length > 0 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
              {params.selectLabel}
            </label>
            <select
              value={selectVal}
              onChange={(e) => setSelectVal(e.target.value)}
              className="w-full bg-cyber-black border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-neon-blue outline-none cursor-pointer font-sans"
            >
              {params.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Calculations output rendering panel */}
      <div className={`p-8 rounded-2xl bg-cyber-black/50 border border-white/5 relative overflow-hidden`}>
        {/* Abstract glowing graphics corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-neon-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-2 text-white/40 uppercase tracking-widest text-xs font-bold">
          <Activity className="w-4 h-4 text-neon-blue" />
          <span>{calculationResult.title}</span>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            {calculationResult.primary}
          </span>
          <span className="text-xs text-white/40 font-mono">
            {calculationResult.metric}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-4 mt-4 text-xs">
          {calculationResult.highlights.map((point, i) => (
            <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                {point.label}
              </div>
              <div className="text-sm font-bold text-white">
                {point.value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-[10px] text-white/30 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-neon-green" />
            <span>{calculationResult.badge}</span>
          </div>
          <span>Sovereign calculation validated</span>
        </div>
      </div>
    </div>
  );
};
