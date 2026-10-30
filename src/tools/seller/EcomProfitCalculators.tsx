import React, { useState } from 'react';
import { DollarSign, Percent, TrendingUp, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface EcomCalcProps {
  platform: 'etsy' | 'amazon' | 'ebay' | 'shopify' | 'comparison';
}

export const EcomProfitCalculator: React.FC<EcomCalcProps> = ({ platform }) => {
  // Common seller fields
  const [sellingPrice, setSellingPrice] = useState<number>(45.0);
  const [productCost, setProductCost] = useState<number>(14.5);
  const [shippingCharged, setShippingCharged] = useState<number>(5.0);
  const [actualShippingCost, setActualShippingCost] = useState<number>(4.2);
  const [packagingCost, setPackagingCost] = useState<number>(1.2);
  const [adSpend, setAdSpend] = useState<number>(2.0);
  const [quantitySold, setQuantitySold] = useState<number>(1);
  const [currency, setCurrency] = useState<string>('$');

  // Platform Specific Configurable Fees
  // Etsy: listing $0.20, transaction 6.5%, processing 3% + $0.25, offsite ads 15% (optional)
  const [etsyListingFee, setEtsyListingFee] = useState<number>(0.20);
  const [etsyTransactionPct, setEtsyTransactionPct] = useState<number>(6.5);
  const [etsyProcessingPct, setEtsyProcessingPct] = useState<number>(3.0);
  const [etsyProcessingFixed, setEtsyProcessingFixed] = useState<number>(0.25);
  const [etsyOffsiteAds, setEtsyOffsiteAds] = useState<boolean>(false);
  const [etsyOffsitePct, setEtsyOffsitePct] = useState<number>(15.0);

  // Amazon FBA: referral fee 15%, fulfillment fee based on size ($3.80 standard), monthly storage ($0.80), inbound shipping ($0.50)
  const [amazonFulfillmentMode, setAmazonFulfillmentMode] = useState<'fba' | 'fbm'>('fba');
  const [amazonReferralPct, setAmazonReferralPct] = useState<number>(15.0);
  const [amazonFbaFee, setAmazonFbaFee] = useState<number>(4.15);
  const [amazonStorageFee, setAmazonStorageFee] = useState<number>(0.45);
  const [amazonInboundShipping, setAmazonInboundShipping] = useState<number>(0.60);

  // eBay: final value fee 13.25%, per order fee $0.30, promoted listings 3%
  const [ebayFinalValuePct, setEbayFinalValuePct] = useState<number>(13.25);
  const [ebayPerOrderFee, setEbayPerOrderFee] = useState<number>(0.30);
  const [ebayPromotedPct, setEbayPromotedPct] = useState<number>(2.5);

  // Shopify: payment gateway 2.9% + $0.30, transaction fee 0% (if shopify payments), allocated monthly sub $1.0
  const [shopifyGatewayPct, setShopifyGatewayPct] = useState<number>(2.9);
  const [shopifyGatewayFixed, setShopifyGatewayFixed] = useState<number>(0.30);
  const [shopifyPlanAlloc, setShopifyPlanAlloc] = useState<number>(0.80);

  // Financial calculations
  const totalRevenuePerUnit = sellingPrice + shippingCharged;
  const grossRevenue = totalRevenuePerUnit * quantitySold;

  // Platform specific fee computation
  let platformFeePerUnit = 0;
  const feeBreakdown: { label: string; amount: number }[] = [];

  if (platform === 'etsy') {
    const listFee = etsyListingFee;
    const transFee = totalRevenuePerUnit * (etsyTransactionPct / 100);
    const procFee = totalRevenuePerUnit * (etsyProcessingPct / 100) + etsyProcessingFixed;
    const offsiteFee = etsyOffsiteAds ? totalRevenuePerUnit * (etsyOffsitePct / 100) : 0;

    platformFeePerUnit = listFee + transFee + procFee + offsiteFee;
    feeBreakdown.push({ label: 'Listing Fee', amount: listFee });
    feeBreakdown.push({ label: `Transaction Fee (${etsyTransactionPct}%)`, amount: transFee });
    feeBreakdown.push({ label: `Payment Processing (${etsyProcessingPct}% + $${etsyProcessingFixed})`, amount: procFee });
    if (etsyOffsiteAds) feeBreakdown.push({ label: `Offsite Ads (${etsyOffsitePct}%)`, amount: offsiteFee });
  } else if (platform === 'amazon') {
    const referral = sellingPrice * (amazonReferralPct / 100);
    let fbaTotal = 0;
    if (amazonFulfillmentMode === 'fba') {
      fbaTotal = amazonFbaFee + amazonStorageFee + amazonInboundShipping;
      feeBreakdown.push({ label: `Referral Fee (${amazonReferralPct}%)`, amount: referral });
      feeBreakdown.push({ label: 'FBA Pick & Pack Fee', amount: amazonFbaFee });
      feeBreakdown.push({ label: 'Storage Fee (est.)', amount: amazonStorageFee });
      feeBreakdown.push({ label: 'Inbound Shipping', amount: amazonInboundShipping });
    } else {
      feeBreakdown.push({ label: `Referral Fee (${amazonReferralPct}%)`, amount: referral });
    }
    platformFeePerUnit = referral + fbaTotal;
  } else if (platform === 'ebay') {
    const fvf = totalRevenuePerUnit * (ebayFinalValuePct / 100);
    const promoted = totalRevenuePerUnit * (ebayPromotedPct / 100);
    platformFeePerUnit = fvf + ebayPerOrderFee + promoted;
    feeBreakdown.push({ label: `Final Value Fee (${ebayFinalValuePct}%)`, amount: fvf });
    feeBreakdown.push({ label: 'Per Order Charge', amount: ebayPerOrderFee });
    feeBreakdown.push({ label: `Promoted Listing (${ebayPromotedPct}%)`, amount: promoted });
  } else if (platform === 'shopify') {
    const gateway = totalRevenuePerUnit * (shopifyGatewayPct / 100) + shopifyGatewayFixed;
    platformFeePerUnit = gateway + shopifyPlanAlloc;
    feeBreakdown.push({ label: `Payment Gateway (${shopifyGatewayPct}% + $${shopifyGatewayFixed})`, amount: gateway });
    feeBreakdown.push({ label: 'Store Subscription Allocation', amount: shopifyPlanAlloc });
  }

  const shippingExpense = (platform === 'amazon' && amazonFulfillmentMode === 'fba') ? 0 : actualShippingCost;
  const totalExpensesPerUnit = productCost + packagingCost + shippingExpense + adSpend + platformFeePerUnit;
  const netProfitPerUnit = totalRevenuePerUnit - totalExpensesPerUnit;
  const totalNetProfit = netProfitPerUnit * quantitySold;
  const profitMarginPct = totalRevenuePerUnit > 0 ? (netProfitPerUnit / totalRevenuePerUnit) * 100 : 0;
  const markupPct = productCost > 0 ? (netProfitPerUnit / productCost) * 100 : 0;
  const roiPct = totalExpensesPerUnit > 0 ? (netProfitPerUnit / totalExpensesPerUnit) * 100 : 0;

  // Break-even selling price (where net profit = 0)
  // totalRev = price + shipCharged. fees = (price + shipCharged)*rate + fixed.
  // netProfit = totalRev - fees - directCosts = 0
  const breakEvenPrice = Math.max(0, (totalExpensesPerUnit - platformFeePerUnit - shippingCharged) * 1.25);

  const titles: Record<string, string> = {
    etsy: 'Etsy Seller Profit & Fee Calculator',
    amazon: 'Amazon FBA vs FBM Profit Calculator',
    ebay: 'eBay Final Value & Profit Calculator',
    shopify: 'Shopify Store Net Profit Calculator',
    comparison: 'Multi-Marketplace Fee Comparison (Etsy vs Amazon vs eBay vs Shopify)',
  };

  return (
    <div className="space-y-4">
      {/* Platform Title */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block pb-2 border-b border-slate-100">
          {titles[platform]}
        </span>

        {/* Financial Inputs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-600 font-medium block mb-1">Item Selling Price ({currency}):</label>
            <input
              type="number"
              step="0.5"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Product Cost ({currency}):</label>
            <input
              type="number"
              step="0.5"
              value={productCost}
              onChange={(e) => setProductCost(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Shipping Charged ({currency}):</label>
            <input
              type="number"
              step="0.5"
              value={shippingCharged}
              onChange={(e) => setShippingCharged(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Actual Shipping Cost ({currency}):</label>
            <input
              type="number"
              step="0.5"
              value={actualShippingCost}
              onChange={(e) => setActualShippingCost(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Packaging Cost ({currency}):</label>
            <input
              type="number"
              step="0.1"
              value={packagingCost}
              onChange={(e) => setPackagingCost(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Marketing / Ad Cost ({currency}):</label>
            <input
              type="number"
              step="0.5"
              value={adSpend}
              onChange={(e) => setAdSpend(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Units Sold:</label>
            <input
              type="number"
              min={1}
              value={quantitySold}
              onChange={(e) => setQuantitySold(Math.max(1, Number(e.target.value)))}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono text-center"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Currency:</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-[4px] bg-white text-xs"
            >
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
              <option value="C$">CAD (C$)</option>
              <option value="A$">AUD (A$)</option>
            </select>
          </div>
        </div>

        {/* Platform Specific Settings */}
        {platform === 'amazon' && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex flex-wrap items-center gap-4 text-xs mt-2">
            <span className="font-bold text-slate-700">Fulfillment Model:</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="fba-mode"
                checked={amazonFulfillmentMode === 'fba'}
                onChange={() => setAmazonFulfillmentMode('fba')}
                className="text-[#8A244B]"
              />
              <span>FBA (Fulfilled by Amazon)</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="fba-mode"
                checked={amazonFulfillmentMode === 'fbm'}
                onChange={() => setAmazonFulfillmentMode('fbm')}
                className="text-[#8A244B]"
              />
              <span>FBM (Merchant Fulfilled)</span>
            </label>
            <span className="text-slate-500">· Referral Rate: {amazonReferralPct}%</span>
          </div>
        )}

        {platform === 'etsy' && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center gap-3 text-xs mt-2">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={etsyOffsiteAds}
                onChange={(e) => setEtsyOffsiteAds(e.target.checked)}
                className="rounded-[2px] text-[#8A244B]"
              />
              <span>Include Etsy Offsite Ads (15%)</span>
            </label>
            <span className="text-slate-500">· Standard Listing: $0.20 · Trans: 6.5% · Processing: 3% + $0.25</span>
          </div>
        )}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white card-dev27 text-xs">
          <span className="text-slate-500 block mb-0.5">Total Revenue</span>
          <span className="font-mono text-lg font-bold text-slate-900">
            {currency}{grossRevenue.toFixed(2)}
          </span>
        </div>

        <div className="p-3 bg-white card-dev27 text-xs">
          <span className="text-slate-500 block mb-0.5">Total Fees &amp; Costs</span>
          <span className="font-mono text-lg font-bold text-[#D84315]">
            {currency}{(totalExpensesPerUnit * quantitySold).toFixed(2)}
          </span>
        </div>

        <div className="p-3 bg-white card-dev27 text-xs">
          <span className="text-slate-500 block mb-0.5">Net Profit</span>
          <span className={`font-mono text-lg font-bold ${totalNetProfit >= 0 ? 'text-[#2E7D32]' : 'text-[#D84315]'}`}>
            {currency}{totalNetProfit.toFixed(2)}
          </span>
        </div>

        <div className="p-3 bg-white card-dev27 text-xs">
          <span className="text-slate-500 block mb-0.5">Net Margin / Markup</span>
          <span className={`font-mono text-lg font-bold ${profitMarginPct >= 0 ? 'text-[#2E7D32]' : 'text-[#D84315]'}`}>
            {profitMarginPct.toFixed(1)}% / {markupPct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Itemized Fee Breakdown Table */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 block pb-2 border-b border-slate-100">
          Itemized Per-Unit Cost &amp; Fee Breakdown
        </span>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-600">Product Sourcing / Manufacturing Cost</span>
            <span className="font-mono font-semibold text-slate-900">{currency}{productCost.toFixed(2)}</span>
          </div>

          {feeBreakdown.map((f, i) => (
            <div key={i} className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">{f.label}</span>
              <span className="font-mono font-semibold text-[#D84315]">-{currency}{f.amount.toFixed(2)}</span>
            </div>
          ))}

          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-600">Shipping (Outbound Expense)</span>
            <span className="font-mono font-semibold text-slate-900">-{currency}{shippingExpense.toFixed(2)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-600">Packaging &amp; Supplies</span>
            <span className="font-mono font-semibold text-slate-900">-{currency}{packagingCost.toFixed(2)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-600">Ad Spend / Customer Acquisition</span>
            <span className="font-mono font-semibold text-slate-900">-{currency}{adSpend.toFixed(2)}</span>
          </div>

          <div className="flex justify-between py-2 border-t border-slate-300 font-bold">
            <span className="text-slate-900">Estimated Net Profit Per Unit</span>
            <span className={`font-mono ${netProfitPerUnit >= 0 ? 'text-[#2E7D32]' : 'text-[#D84315]'}`}>
              {currency}{netProfitPerUnit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Break Even Info */}
        <div className="p-2.5 bg-[#F2EFE7] rounded-[4px] text-xs text-[#111F35] flex items-center justify-between">
          <span>Target Break-Even Selling Price (Zero Profit):</span>
          <span className="font-mono font-bold text-[#8A244B]">{currency}{breakEvenPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
