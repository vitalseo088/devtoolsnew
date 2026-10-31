import React, { useState } from 'react';
import { DollarSign, Percent, Calculator, Layers, HelpCircle, Copy, Check } from 'lucide-react';

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
  const [targetMarginPct, setTargetMarginPct] = useState<number>(40);
  const [discountPct, setDiscountPct] = useState<number>(10);
  const [salesTaxPct, setSalesTaxPct] = useState<number>(8.25);
  const [copied, setCopied] = useState<boolean>(false);

  // 3.7 Break-Even
  const [fixedMonthlyCosts, setFixedMonthlyCosts] = useState<number>(3500);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<number>(18.0);
  const [unitSellingPrice, setUnitSellingPrice] = useState<number>(45.0);
  const [targetMonthlyProfit, setTargetMonthlyProfit] = useState<number>(5000);

  // 3.8 Wholesale
  const [unitMfgCost, setUnitMfgCost] = useState<number>(15.0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(30.0);
  const [msrp, setMsrp] = useState<number>(60.0);

  // Calculations for Product Pricing
  const totalCostPerUnit = materialCost + laborCost + shippingCost + packagingCost + overheadAlloc;
  const recommendedPrice = targetMarginPct < 100 ? totalCostPerUnit / (1 - (targetMarginPct / 100)) : 0;
  const unitProfit = recommendedPrice - totalCostPerUnit;
  const markupPct = totalCostPerUnit > 0 ? (unitProfit / totalCostPerUnit) * 100 : 0;
  const discountedPrice = recommendedPrice * (1 - (discountPct / 100));
  const profitAfterDiscount = discountedPrice - totalCostPerUnit;
  const minimumAcceptablePrice = totalCostPerUnit;

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

  const copySummary = () => {
    let text = `${titles[tool]} Summary:\n`;
    if (tool === 'product-pricing') {
      text += `Total Unit Cost: $${totalCostPerUnit.toFixed(2)}
Recommended Retail Price: $${recommendedPrice.toFixed(2)}
Unit Profit: $${unitProfit.toFixed(2)} (${targetMarginPct}% Margin / ${markupPct.toFixed(1)}% Markup)
Discounted (${discountPct}% off): $${discountedPrice.toFixed(2)} (Profit: $${profitAfterDiscount.toFixed(2)})`;
    } else if (tool === 'break-even') {
      text += `Break-Even Units: ${breakEvenUnits.toLocaleString()} units
Break-Even Revenue: $${breakEvenRevenue.toLocaleString()}
Contribution Margin: $${contributionMargin.toFixed(2)} (${contributionMarginRatio.toFixed(1)}%)
Target Profit Goal ($${targetMonthlyProfit.toLocaleString()}): Requires ${unitsForTargetProfit.toLocaleString()} units ($${revenueForTargetProfit.toLocaleString()} revenue)`;
    } else {
      text += `Wholesale Profit: $${wholesaleProfit.toFixed(2)} (${wholesaleMarginPct.toFixed(1)}% Margin)
Retailer Margin at MSRP ($${msrp.toFixed(2)}): ${retailerMarginPct.toFixed(1)}% (${retailerMarkupPct.toFixed(1)}% Markup)`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Platform Title Banner */}
      <div className="p-4 bg-white card-dev27 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block">
            Pricing &amp; Margins
          </span>
          <h2 className="text-lg font-bold text-[#111F35]">{titles[tool]}</h2>
        </div>
        <button
          onClick={copySummary}
          className="px-3 py-1.5 rounded-[4px] bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5 text-[#8A244B]" />}
          <span>{copied ? 'Summary Copied' : 'Copy Summary'}</span>
        </button>
      </div>

      {/* Professional 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Fields */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Input Parameters</span>
              <span className="text-slate-400 font-normal lowercase">editable inputs</span>
            </h3>

            {tool === 'product-pricing' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Raw Materials / Unit ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={materialCost}
                      onChange={(e) => setMaterialCost(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Direct Labor / Unit ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={laborCost}
                      onChange={(e) => setLaborCost(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Shipping / Logistics ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Packaging Supplies ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={packagingCost}
                      onChange={(e) => setPackagingCost(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Overhead Allocation ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={overheadAlloc}
                      onChange={(e) => setOverheadAlloc(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block mb-1.5">
                      Desired Margin (%)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={targetMarginPct}
                      onChange={(e) => setTargetMarginPct(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-[#8A244B]/5 border-[#8A244B] font-mono text-sm font-extrabold text-[#8A244B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Planned Promo Discount (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      value={discountPct}
                      onChange={(e) => setDiscountPct(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Sales Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={salesTaxPct}
                      onChange={(e) => setSalesTaxPct(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {tool === 'break-even' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Monthly Fixed Costs ($)
                    </label>
                    <input
                      type="number"
                      step="100"
                      value={fixedMonthlyCosts}
                      onChange={(e) => setFixedMonthlyCosts(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Rent, payroll, subscriptions, utilities</span>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Variable Cost / Unit ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={variableCostPerUnit}
                      onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">COGS, packaging, fulfillment, processing</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block mb-1.5">
                      Unit Selling Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={unitSellingPrice}
                      onChange={(e) => setUnitSellingPrice(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-extrabold text-[#8A244B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Target Monthly Net Profit ($)
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={targetMonthlyProfit}
                      onChange={(e) => setTargetMonthlyProfit(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {tool === 'wholesale' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Manufacturing Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={unitMfgCost}
                      onChange={(e) => setUnitMfgCost(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block mb-1.5">
                      Wholesale Price (B2B) ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={wholesalePrice}
                      onChange={(e) => setWholesalePrice(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-extrabold text-[#8A244B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Suggested MSRP ($)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={msrp}
                      onChange={(e) => setMsrp(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Keystone standard: 2x wholesale</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Formula Card */}
          <div className="p-4 bg-white card-dev27 text-xs text-slate-600 space-y-2">
            <span className="font-extrabold text-slate-800 uppercase tracking-wider block">Financial Formula:</span>
            {tool === 'product-pricing' && (
              <p><code>Price = Total Unit Cost / (1 - Desired Margin)</code>. Profit per unit is <strong>${unitProfit.toFixed(2)}</strong> ({targetMarginPct}% of sale price).</p>
            )}
            {tool === 'break-even' && (
              <p><code>Contribution Margin = Price (${unitSellingPrice}) - Variable Cost (${variableCostPerUnit}) = ${contributionMargin.toFixed(2)}</code>.</p>
            )}
            {tool === 'wholesale' && (
              <p>In retail wholesale distribution, brand margin is based on wholesale price, while retailer margin is based on MSRP.</p>
            )}
          </div>
        </div>

        {/* Right Column: Output Layout with Easy-to-Read Highlights */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          {tool === 'product-pricing' && (
            <>
              {/* Hero Pricing Highlight */}
              <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Recommended Retail Price
                </span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                    ${recommendedPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-[#2E7D32] font-bold">
                    (+${unitProfit.toFixed(2)} profit)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Target Margin</span>
                    <span className="font-mono text-lg font-extrabold text-[#2E7D32]">{targetMarginPct}%</span>
                  </div>
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Markup on Cost</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">{markupPct.toFixed(1)}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Total Unit Cost</span>
                    <span className="font-mono text-base font-bold text-slate-800">${totalCostPerUnit.toFixed(2)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Cost Floor (0% profit)</span>
                    <span className="font-mono text-base font-bold text-slate-800">${minimumAcceptablePrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Promo Resilience Box */}
              <div className="p-4 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 text-xs space-y-2.5">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider block pb-1 border-b border-slate-100">
                  Promotional Resilience
                </span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Price at {discountPct}% Promo Discount</span>
                  <span className="font-mono font-bold text-slate-900">${discountedPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Profit Remaining after Promo</span>
                  <span className={`font-mono font-bold ${profitAfterDiscount >= 0 ? 'text-[#2E7D32]' : 'text-[#D84315]'}`}>
                    +${profitAfterDiscount.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}

          {tool === 'break-even' && (
            <>
              {/* Hero Break-Even Highlight */}
              <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Required Monthly Sales (Zero Loss)
                </span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                    {breakEvenUnits.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-600 font-bold">units / month</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Break-Even Revenue</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">${breakEvenRevenue.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Unit Contribution</span>
                    <span className="font-mono text-lg font-extrabold text-[#2E7D32]">${contributionMargin.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Profit Target Box */}
              <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 text-xs space-y-3">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider block pb-1 border-b border-slate-100">
                  Monthly Profit Target (${targetMonthlyProfit.toLocaleString()})
                </span>
                <div className="p-3 bg-[#8A244B]/5 border border-[#8A244B]/20 rounded-[4px] text-center">
                  <span className="text-xs text-slate-600 block mb-1">Units to Reach Target Profit:</span>
                  <span className="font-mono text-2xl font-extrabold text-[#8A244B]">
                    {unitsForTargetProfit.toLocaleString()} units
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    (${revenueForTargetProfit.toLocaleString()} in gross monthly revenue)
                  </span>
                </div>
              </div>
            </>
          )}

          {tool === 'wholesale' && (
            <>
              {/* Hero Wholesale Highlight */}
              <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Brand Wholesale Profit Per Unit
                </span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#2E7D32]">
                    +${wholesaleProfit.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">({wholesaleMarginPct.toFixed(1)}% margin)</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Wholesale Margin</span>
                    <span className="font-mono text-lg font-extrabold text-[#2E7D32]">{wholesaleMarginPct.toFixed(1)}%</span>
                  </div>
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Retailer Margin</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">{retailerMarginPct.toFixed(1)}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Wholesale Price</span>
                    <span className="font-mono text-base font-bold text-slate-800">${wholesalePrice.toFixed(2)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">MSRP (Retail)</span>
                    <span className="font-mono text-base font-bold text-slate-800">${msrp.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
