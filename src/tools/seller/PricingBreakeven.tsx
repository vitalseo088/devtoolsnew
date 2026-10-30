import React, { useState } from 'react';
import { DollarSign, Percent, Calculator, Layers, HelpCircle } from 'lucide-react';

interface PricingProps {
  tool: 'product-pricing' | 'break-even' | 'wholesale';
}

export const PricingBreakevenCalculator: React.FC<PricingProps> = ({ tool }) => {
  // 3.6 Product Pricing
  const [materialCost, setMaterialCost] = useState<number>(12.0);
  const [laborCost, setLaborCost] = useState<number>(8.0);
  const [shippingCost, setShippingCost] = useState<number>(4.5);
  const [packagingCost, setPackagingCost] = useState<number>(1.5);
  const [overheadAlloc, setOverheadAlloc] = useState<number>(3.0);
  const [targetMarginPct, setTargetMarginPct] = useState<number>(40); // 40% margin
  const [discountPct, setDiscountPct] = useState<number>(10); // 10% promo
  const [salesTaxPct, setSalesTaxPct] = useState<number>(8.25);

  // 3.7 Break-Even
  const [fixedMonthlyCosts, setFixedMonthlyCosts] = useState<number>(3500); // Rent, software, salaries
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<number>(18.0);
  const [unitSellingPrice, setUnitSellingPrice] = useState<number>(45.0);
  const [targetMonthlyProfit, setTargetMonthlyProfit] = useState<number>(5000);

  // 3.8 Wholesale
  const [unitMfgCost, setUnitMfgCost] = useState<number>(15.0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(30.0);
  const [msrp, setMsrp] = useState<number>(60.0); // Keystone 2x

  // Calculations for Product Pricing
  const totalCostPerUnit = materialCost + laborCost + shippingCost + packagingCost + overheadAlloc;
  // Price for target margin: Price = Cost / (1 - Margin)
  const recommendedPrice = targetMarginPct < 100 ? totalCostPerUnit / (1 - (targetMarginPct / 100)) : 0;
  const unitProfit = recommendedPrice - totalCostPerUnit;
  const markupPct = totalCostPerUnit > 0 ? (unitProfit / totalCostPerUnit) * 100 : 0;
  const discountedPrice = recommendedPrice * (1 - (discountPct / 100));
  const profitAfterDiscount = discountedPrice - totalCostPerUnit;
  const minimumAcceptablePrice = totalCostPerUnit; // 0 profit floor

  // Calculations for Break-Even
  const contributionMargin = unitSellingPrice - variableCostPerUnit;
  const contributionMarginRatio = unitSellingPrice > 0 ? (contributionMargin / unitSellingPrice) * 100 : 0;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedMonthlyCosts / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * unitSellingPrice;
  const unitsForTargetProfit = contributionMargin > 0 ? Math.ceil((fixedMonthlyCosts + targetMonthlyProfit) / contributionMargin) : 0;
  const revenueForTargetProfit = unitsForTargetProfit * unitSellingPrice;

  // Calculations for Wholesale Margin
  const wholesaleProfit = wholesalePrice - unitMfgCost;
  const wholesaleMarginPct = wholesalePrice > 0 ? (wholesaleProfit / wholesalePrice) * 100 : 0;
  const wholesaleMarkupPct = unitMfgCost > 0 ? (wholesaleProfit / unitMfgCost) * 100 : 0;
  const retailerMarginPct = msrp > 0 ? ((msrp - wholesalePrice) / msrp) * 100 : 0;
  const retailerMarkupPct = wholesalePrice > 0 ? ((msrp - wholesalePrice) / wholesalePrice) * 100 : 0;

  const titles: Record<string, string> = {
    'product-pricing': 'Product Pricing & Profit Margin Calculator',
    'break-even': 'Break-Even Sales & Target Profit Calculator',
    'wholesale': 'Wholesale vs Retail (MSRP) Margin Calculator',
  };

  return (
    <div className="space-y-4">
      {/* Tool Header */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block pb-2 border-b border-slate-100">
          {titles[tool]}
        </span>

        {tool === 'product-pricing' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Raw Materials / Unit ($):</label>
              <input
                type="number"
                step="0.5"
                value={materialCost}
                onChange={(e) => setMaterialCost(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Direct Labor / Unit ($):</label>
              <input
                type="number"
                step="0.5"
                value={laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Shipping &amp; Logistics ($):</label>
              <input
                type="number"
                step="0.5"
                value={shippingCost}
                onChange={(e) => setShippingCost(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Packaging Supplies ($):</label>
              <input
                type="number"
                step="0.5"
                value={packagingCost}
                onChange={(e) => setPackagingCost(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Overhead Allocation ($):</label>
              <input
                type="number"
                step="0.5"
                value={overheadAlloc}
                onChange={(e) => setOverheadAlloc(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Desired Profit Margin (%):</label>
              <input
                type="number"
                min={1}
                max={99}
                value={targetMarginPct}
                onChange={(e) => setTargetMarginPct(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono text-[#8A244B] font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Planned Discount (%):</label>
              <input
                type="number"
                min={0}
                max={90}
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Sales Tax (%):</label>
              <input
                type="number"
                step="0.25"
                value={salesTaxPct}
                onChange={(e) => setSalesTaxPct(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
          </div>
        )}

        {tool === 'break-even' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Monthly Fixed Costs ($):</label>
              <input
                type="number"
                step="100"
                value={fixedMonthlyCosts}
                onChange={(e) => setFixedMonthlyCosts(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400">Rent, payroll, software</span>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Variable Cost / Unit ($):</label>
              <input
                type="number"
                step="0.5"
                value={variableCostPerUnit}
                onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
              <span className="text-[10px] text-slate-400">COGS, fees, shipping</span>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Unit Selling Price ($):</label>
              <input
                type="number"
                step="0.5"
                value={unitSellingPrice}
                onChange={(e) => setUnitSellingPrice(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono text-[#8A244B] font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Target Monthly Profit ($):</label>
              <input
                type="number"
                step="500"
                value={targetMonthlyProfit}
                onChange={(e) => setTargetMonthlyProfit(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
          </div>
        )}

        {tool === 'wholesale' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Manufacturing Cost ($):</label>
              <input
                type="number"
                step="0.5"
                value={unitMfgCost}
                onChange={(e) => setUnitMfgCost(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Wholesale Price (B2B) ($):</label>
              <input
                type="number"
                step="0.5"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono text-[#8A244B] font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Suggested Retail Price (MSRP) ($):</label>
              <input
                type="number"
                step="0.5"
                value={msrp}
                onChange={(e) => setMsrp(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
              <span className="text-[10px] text-slate-400">Keystone is 2x wholesale</span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tool === 'product-pricing' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Total Unit Cost</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                ${totalCostPerUnit.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Recommended Retail Price</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                ${recommendedPrice.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Profit Per Unit</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                +${unitProfit.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Markup Percentage</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                {markupPct.toFixed(1)}%
              </span>
            </div>
          </>
        )}

        {tool === 'break-even' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Contribution Margin</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                ${contributionMargin.toFixed(2)} ({contributionMarginRatio.toFixed(1)}%)
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Break-Even Units</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {breakEvenUnits.toLocaleString()} units
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Break-Even Revenue</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                ${breakEvenRevenue.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Target Profit Units</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                {unitsForTargetProfit.toLocaleString()} units
              </span>
            </div>
          </>
        )}

        {tool === 'wholesale' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Your Wholesale Profit</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                +${wholesaleProfit.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Wholesale Margin</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                {wholesaleMarginPct.toFixed(1)}%
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Retailer Margin (at MSRP)</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {retailerMarginPct.toFixed(1)}%
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Retailer Markup</span>
              <span className="font-mono text-lg font-bold text-slate-800">
                {retailerMarkupPct.toFixed(1)}%
              </span>
            </div>
          </>
        )}
      </div>

      {/* Formula & Explanation Card */}
      <div className="p-4 bg-white card-dev27 space-y-2 text-xs text-slate-600">
        <span className="font-bold text-slate-800 block">Calculation Method &amp; Formula:</span>
        {tool === 'product-pricing' && (
          <div className="space-y-1">
            <p><strong>Pricing Formula:</strong> <code>Recommended Price = Total Unit Cost / (1 - Desired Margin)</code></p>
            <p><strong>Discount Resilience:</strong> At a {discountPct}% promotional discount, your selling price becomes <strong>${discountedPrice.toFixed(2)}</strong>, netting <strong>+${profitAfterDiscount.toFixed(2)}</strong> per unit.</p>
            <p><strong>Minimum Floor:</strong> Absolute minimum acceptable breakeven price is <strong>${minimumAcceptablePrice.toFixed(2)}</strong>.</p>
          </div>
        )}
        {tool === 'break-even' && (
          <div className="space-y-1">
            <p><strong>Contribution Margin:</strong> <code>Unit Price (${unitSellingPrice}) - Variable Cost (${variableCostPerUnit}) = ${contributionMargin.toFixed(2)}</code>.</p>
            <p><strong>Break-Even Formula:</strong> <code>Units = Fixed Costs (${fixedMonthlyCosts}) / Contribution Margin (${contributionMargin.toFixed(2)}) = {breakEvenUnits} units</code>.</p>
            <p>To reach your monthly profit goal of <strong>${targetMonthlyProfit.toLocaleString()}</strong>, you must sell <strong>{unitsForTargetProfit.toLocaleString()} units</strong> ($<strong>{revenueForTargetProfit.toLocaleString()}</strong> revenue).</p>
          </div>
        )}
        {tool === 'wholesale' && (
          <div className="space-y-1">
            <p><strong>Keystone Pricing:</strong> In standard retail distribution, wholesale is typically 2x manufacturing cost, and retail MSRP is 2x wholesale price (a 50% margin for both brand and retailer).</p>
            <p>Wholesale price of <strong>${wholesalePrice.toFixed(2)}</strong> gives your brand <strong>{wholesaleMarginPct.toFixed(1)}% margin</strong>, while leaving <strong>{retailerMarginPct.toFixed(1)}% margin</strong> for retail stores.</p>
          </div>
        )}
      </div>
    </div>
  );
};
