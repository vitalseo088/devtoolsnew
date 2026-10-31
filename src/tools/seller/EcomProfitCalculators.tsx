import React, { useState } from 'react';
import { DollarSign, Percent, TrendingUp, AlertCircle, RefreshCw, Layers, Copy, Check } from 'lucide-react';

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
  const [copied, setCopied] = useState<boolean>(false);

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
  } else if (platform === 'comparison') {
    // Average or primary
    const estFee = totalRevenuePerUnit * 0.12 + 0.30;
    platformFeePerUnit = estFee;
    feeBreakdown.push({ label: 'Estimated Average Platform Fee', amount: estFee });
  }

  const shippingExpense = (platform === 'amazon' && amazonFulfillmentMode === 'fba') ? 0 : actualShippingCost;
  const totalExpensesPerUnit = productCost + packagingCost + shippingExpense + adSpend + platformFeePerUnit;
  const netProfitPerUnit = totalRevenuePerUnit - totalExpensesPerUnit;
  const totalNetProfit = netProfitPerUnit * quantitySold;
  const profitMarginPct = totalRevenuePerUnit > 0 ? (netProfitPerUnit / totalRevenuePerUnit) * 100 : 0;
  const markupPct = productCost > 0 ? (netProfitPerUnit / productCost) * 100 : 0;
  const roiPct = totalExpensesPerUnit > 0 ? (netProfitPerUnit / totalExpensesPerUnit) * 100 : 0;

  const breakEvenPrice = Math.max(0, (totalExpensesPerUnit - platformFeePerUnit - shippingCharged) * 1.25);

  const titles: Record<string, string> = {
    etsy: 'Etsy Seller Profit & Fee Calculator',
    amazon: 'Amazon FBA vs FBM Profit Calculator',
    ebay: 'eBay Final Value & Profit Calculator',
    shopify: 'Shopify Store Net Profit Calculator',
    comparison: 'Multi-Marketplace Fee Comparison',
  };

  const copySummary = () => {
    const text = `${titles[platform]} Summary:
Selling Price: ${currency}${sellingPrice.toFixed(2)}
Gross Revenue: ${currency}${grossRevenue.toFixed(2)}
Total Costs/Unit: ${currency}${totalExpensesPerUnit.toFixed(2)}
Net Profit/Unit: ${currency}${netProfitPerUnit.toFixed(2)}
Total Net Profit (${quantitySold} units): ${currency}${totalNetProfit.toFixed(2)}
Net Margin: ${profitMarginPct.toFixed(1)}%
Break-Even Price: ${currency}${breakEvenPrice.toFixed(2)}`;
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
            Seller &amp; Ecommerce
          </span>
          <h2 className="text-lg font-bold text-[#111F35]">{titles[platform]}</h2>
        </div>
        <button
          onClick={copySummary}
          className="px-3 py-1.5 rounded-[4px] bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5 text-[#8A244B]" />}
          <span>{copied ? 'Summary Copied' : 'Copy Summary'}</span>
        </button>
      </div>

      {/* Professional 2-Column Split: Left Inputs, Right Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Fields */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card: Pricing & Product Sourcing */}
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Product Pricing &amp; Costs</span>
              <span className="text-slate-400 font-normal lowercase">input parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Item Selling Price ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                  <input
                    type="number"
                    step="0.5"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] focus:ring-1 focus:ring-[#8A244B] font-mono font-bold text-slate-900 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Product Sourcing / Unit Cost ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                  <input
                    type="number"
                    step="0.5"
                    value={productCost}
                    onChange={(e) => setProductCost(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] focus:ring-1 focus:ring-[#8A244B] font-mono font-bold text-slate-900 text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Shipping Charged to Buyer ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                  <input
                    type="number"
                    step="0.5"
                    value={shippingCharged}
                    onChange={(e) => setShippingCharged(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] focus:ring-1 focus:ring-[#8A244B] font-mono text-slate-900 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Actual Outbound Shipping Cost ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                  <input
                    type="number"
                    step="0.5"
                    value={actualShippingCost}
                    onChange={(e) => setActualShippingCost(Number(e.target.value))}
                    disabled={platform === 'amazon' && amazonFulfillmentMode === 'fba'}
                    className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] focus:ring-1 focus:ring-[#8A244B] font-mono text-slate-900 text-sm disabled:opacity-50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Packaging Cost ({currency})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Ad Spend / Unit ({currency})
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={adSpend}
                  onChange={(e) => setAdSpend(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Units Sold
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantitySold}
                  onChange={(e) => setQuantitySold(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900 text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* Card: Platform Settings */}
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Platform Fee Configuration
            </h3>

            {platform === 'amazon' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Fulfillment Model
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAmazonFulfillmentMode('fba')}
                      className={`p-3 rounded-[4px] border text-left font-semibold transition-all cursor-pointer ${
                        amazonFulfillmentMode === 'fba'
                          ? 'border-[#8A244B] bg-[#8A244B]/5 text-[#8A244B]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-sm">FBA (Fulfilled by Amazon)</div>
                      <div className="text-[11px] text-slate-500 mt-1">Amazon handles storage, packing, shipping &amp; Prime.</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmazonFulfillmentMode('fbm')}
                      className={`p-3 rounded-[4px] border text-left font-semibold transition-all cursor-pointer ${
                        amazonFulfillmentMode === 'fbm'
                          ? 'border-[#8A244B] bg-[#8A244B]/5 text-[#8A244B]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-sm">FBM (Merchant Fulfilled)</div>
                      <div className="text-[11px] text-slate-500 mt-1">You warehouse and ship directly to buyers.</div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Referral Rate (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={amazonReferralPct}
                      onChange={(e) => setAmazonReferralPct(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                    />
                  </div>
                  {amazonFulfillmentMode === 'fba' && (
                    <>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">FBA Pick &amp; Pack ({currency})</label>
                        <input
                          type="number"
                          step="0.1"
                          value={amazonFbaFee}
                          onChange={(e) => setAmazonFbaFee(Number(e.target.value))}
                          className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Monthly Storage ({currency})</label>
                        <input
                          type="number"
                          step="0.05"
                          value={amazonStorageFee}
                          onChange={(e) => setAmazonStorageFee(Number(e.target.value))}
                          className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Inbound Shipping ({currency})</label>
                        <input
                          type="number"
                          step="0.1"
                          value={amazonInboundShipping}
                          onChange={(e) => setAmazonInboundShipping(Number(e.target.value))}
                          className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {platform === 'etsy' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Listing Fee ({currency})</label>
                    <input
                      type="number"
                      step="0.05"
                      value={etsyListingFee}
                      onChange={(e) => setEtsyListingFee(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Transaction Fee (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={etsyTransactionPct}
                      onChange={(e) => setEtsyTransactionPct(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Processing (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={etsyProcessingPct}
                      onChange={(e) => setEtsyProcessingPct(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Processing Fixed ({currency})</label>
                    <input
                      type="number"
                      step="0.05"
                      value={etsyProcessingFixed}
                      onChange={(e) => setEtsyProcessingFixed(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={etsyOffsiteAds}
                      onChange={(e) => setEtsyOffsiteAds(e.target.checked)}
                      className="rounded-[2px] text-[#8A244B]"
                    />
                    <span className="font-semibold text-slate-800">Include Etsy Offsite Ads</span>
                  </label>
                  {etsyOffsiteAds && (
                    <div className="flex items-center gap-1.5 font-mono">
                      <span>Rate:</span>
                      <input
                        type="number"
                        value={etsyOffsitePct}
                        onChange={(e) => setEtsyOffsitePct(Number(e.target.value))}
                        className="w-16 p-1 border border-slate-300 rounded-[4px] text-center"
                      />
                      <span>%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {platform === 'ebay' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Final Value Fee (%)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={ebayFinalValuePct}
                    onChange={(e) => setEbayFinalValuePct(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Per Order Fee ({currency})</label>
                  <input
                    type="number"
                    step="0.05"
                    value={ebayPerOrderFee}
                    onChange={(e) => setEbayPerOrderFee(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Promoted Listing (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={ebayPromotedPct}
                    onChange={(e) => setEbayPromotedPct(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {platform === 'shopify' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Gateway Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={shopifyGatewayPct}
                    onChange={(e) => setShopifyGatewayPct(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Gateway Fixed ({currency})</label>
                  <input
                    type="number"
                    step="0.05"
                    value={shopifyGatewayFixed}
                    onChange={(e) => setShopifyGatewayFixed(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Subscription Alloc. ({currency})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={shopifyPlanAlloc}
                    onChange={(e) => setShopifyPlanAlloc(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-[4px] font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output Layout with Easy-to-Read Highlights */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          {/* Hero Highlight Card */}
          <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />

            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
              <span>Net Profit ({quantitySold} unit{quantitySold > 1 ? 's' : ''})</span>
              <span className={`px-2 py-0.5 rounded-[4px] font-extrabold text-[11px] ${
                totalNetProfit >= 0 ? 'bg-green-100 text-[#2E7D32]' : 'bg-red-100 text-[#D84315]'
              }`}>
                {totalNetProfit >= 0 ? 'PROFITABLE' : 'UNPROFITABLE'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className={`font-mono text-3xl sm:text-4xl font-extrabold tracking-tight ${
                totalNetProfit >= 0 ? 'text-[#2E7D32]' : 'text-[#D84315]'
              }`}>
                {currency}{totalNetProfit.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({currency}{netProfitPerUnit.toFixed(2)} / unit)
              </span>
            </div>

            {/* Easy-to-read Metric Grid Highlights */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
              <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Net Margin</span>
                <span className={`font-mono text-lg font-extrabold ${profitMarginPct >= 0 ? 'text-[#2E7D32]' : 'text-[#D84315]'}`}>
                  {profitMarginPct.toFixed(1)}%
                </span>
              </div>

              <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Markup / ROI</span>
                <span className="font-mono text-lg font-extrabold text-slate-900">
                  {markupPct.toFixed(0)}% <span className="text-xs font-normal text-slate-500">/ {roiPct.toFixed(0)}%</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Gross Revenue</span>
                <span className="font-mono text-base font-bold text-slate-800">
                  {currency}{grossRevenue.toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Total Expenses</span>
                <span className="font-mono text-base font-bold text-[#D84315]">
                  {currency}{(totalExpensesPerUnit * quantitySold).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Fee Breakdown Card */}
          <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Per-Unit Cost Breakdown
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Product Sourcing</span>
                <span className="font-mono font-bold text-slate-800">-{currency}{productCost.toFixed(2)}</span>
              </div>

              {feeBreakdown.map((f, i) => (
                <div key={i} className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">{f.label}</span>
                  <span className="font-mono font-bold text-[#D84315]">-{currency}{f.amount.toFixed(2)}</span>
                </div>
              ))}

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Outbound Shipping</span>
                <span className="font-mono font-bold text-slate-800">-{currency}{shippingExpense.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Packaging &amp; Supplies</span>
                <span className="font-mono font-bold text-slate-800">-{currency}{packagingCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Marketing / Ads</span>
                <span className="font-mono font-bold text-slate-800">-{currency}{adSpend.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2.5 border-t-2 border-slate-200 font-extrabold text-sm">
                <span className="text-slate-900">Net Profit Per Unit</span>
                <span className={`font-mono ${netProfitPerUnit >= 0 ? 'text-[#2E7D32]' : 'text-[#D84315]'}`}>
                  {currency}{netProfitPerUnit.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Break Even Highlight Strip */}
            <div className="mt-4 p-3 bg-[#F2EFE7] rounded-[4px] border border-[#E2E8F0] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Target Break-Even Price:</span>
                <span className="text-[11px] text-slate-500">Minimum price to avoid loss</span>
              </div>
              <span className="font-mono font-extrabold text-base text-[#8A244B]">
                {currency}{breakEvenPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
