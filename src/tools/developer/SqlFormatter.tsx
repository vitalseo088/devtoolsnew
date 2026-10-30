import React, { useState } from 'react';
import { format as formatSql } from 'sql-formatter';
import { Copy, Download, Check, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

export const SqlFormatter: React.FC = () => {
  const [sqlInput, setSqlInput] = useState<string>(
    `with ranked_orders as (select o.id as order_id, o.customer_id, o.order_date, sum(oi.quantity * oi.unit_price) as total_amount, row_number() over (partition by o.customer_id order by o.order_date desc) as rn from orders o join order_items oi on o.id = oi.order_id where o.status in ('completed', 'shipped') and o.order_date >= '2026-01-01' group by o.id, o.customer_id, o.order_date having sum(oi.quantity * oi.unit_price) > 100) select c.name, c.email, ro.order_id, ro.total_amount from ranked_orders ro left join customers c on ro.customer_id = c.id where ro.rn = 1 order by ro.total_amount desc limit 25;`
  );
  const [output, setOutput] = useState<string>('');
  const [dialect, setDialect] = useState<string>('sql');
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower' | 'preserve'>('upper');
  const [tabWidth, setTabWidth] = useState<number>(2);
  const [useTabs, setUseTabs] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const formatQuery = (inputStr = sqlInput, isMinify = false) => {
    if (!inputStr.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      setError(null);
      if (isMinify) {
        // Safe minifier removing redundant whitespace and linebreaks while keeping strings/comments
        const minified = inputStr
          .replace(/\s+/g, ' ')
          .replace(/\s*([,;()=><+\-*])\s*/g, '$1')
          .trim();
        setOutput(minified);
        return;
      }

      const formatted = formatSql(inputStr, {
        language: dialect as any,
        tabWidth: tabWidth,
        useTabs: useTabs,
        keywordCase: keywordCase,
        linesBetweenQueries: 2,
      });
      setOutput(formatted);
    } catch (err: any) {
      setError(err.message || 'Error formatting SQL statement');
    }
  };

  React.useEffect(() => {
    formatQuery(sqlInput, false);
  }, [dialect, keywordCase, tabWidth, useTabs]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-${Date.now()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = (type: string) => {
    let sample = '';
    if (type === 'select') {
      sample = `SELECT u.id, u.username, u.email, COUNT(p.id) AS post_count, MAX(p.created_at) AS latest_post FROM users u INNER JOIN posts p ON u.id = p.user_id WHERE u.is_active = 1 AND u.country IN ('US', 'CA', 'UK') GROUP BY u.id, u.username, u.email HAVING COUNT(p.id) >= 5 ORDER BY latest_post DESC LIMIT 50;`;
    } else if (type === 'insert') {
      sample = `INSERT INTO inventory (sku, product_name, category_id, stock_qty, unit_cost, created_at) VALUES ('SKU-8821', 'Ergonomic Desk Mat', 4, 150, 18.50, NOW()), ('SKU-9942', 'Mechanical Switch Pack', 7, 300, 12.00, NOW());`;
    } else if (type === 'cte') {
      sample = `WITH monthly_sales AS (SELECT date_trunc('month', sale_date) AS sale_month, product_id, SUM(amount) AS revenue FROM sales GROUP BY 1, 2) SELECT ms.sale_month, p.title, ms.revenue FROM monthly_sales ms JOIN products p ON ms.product_id = p.id WHERE ms.revenue > 1000 ORDER BY ms.sale_month DESC, ms.revenue DESC;`;
    }
    setSqlInput(sample);
    formatQuery(sample, false);
  };

  return (
    <div className="space-y-4">
      {/* Configuration Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white card-dev27">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Dialect:</span>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs font-medium"
            >
              <option value="sql">Standard SQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlite">SQLite</option>
              <option value="transactsql">SQL Server (T-SQL)</option>
              <option value="mariadb">MariaDB</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Keyword Case:</span>
            <select
              value={keywordCase}
              onChange={(e) => setKeywordCase(e.target.value as any)}
              className="border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
            >
              <option value="upper">UPPERCASE</option>
              <option value="lower">lowercase</option>
              <option value="preserve">Preserve</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Indent:</span>
            <select
              value={useTabs ? 'tab' : tabWidth}
              onChange={(e) => {
                if (e.target.value === 'tab') {
                  setUseTabs(true);
                } else {
                  setUseTabs(false);
                  setTabWidth(Number(e.target.value));
                }
              }}
              className="border border-slate-300 rounded-[4px] px-2 py-1 bg-white text-xs"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value="tab">Tabs</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => formatQuery(sqlInput, false)}
            className="px-3 py-1 font-semibold bg-[#8A244B] text-white hover:bg-[#721C3D] rounded-[4px]"
          >
            Format
          </button>
          <button
            onClick={() => formatQuery(sqlInput, true)}
            className="px-2.5 py-1 font-medium bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px]"
          >
            Minify
          </button>
          <button
            onClick={() => {
              setSqlInput('');
              setOutput('');
              setError(null);
            }}
            className="p-1 text-slate-500 hover:text-red-700"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Samples banner */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-medium">Load Sample Query:</span>
        <button
          onClick={() => loadSample('select')}
          className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-[#F2EFE7] rounded-[4px] text-slate-700"
        >
          Complex SELECT & JOIN
        </button>
        <button
          onClick={() => loadSample('cte')}
          className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-[#F2EFE7] rounded-[4px] text-slate-700"
        >
          Common Table Expression (WITH)
        </button>
        <button
          onClick={() => loadSample('insert')}
          className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-[#F2EFE7] rounded-[4px] text-slate-700"
        >
          Batch INSERT
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col card-dev27 p-3 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
            <span>Raw SQL Query Input</span>
            <span className="text-slate-400 font-mono text-[11px]">{sqlInput.length} chars</span>
          </div>
          <textarea
            value={sqlInput}
            onChange={(e) => {
              setSqlInput(e.target.value);
              formatQuery(e.target.value, false);
            }}
            placeholder="Type or paste SQL queries here..."
            rows={16}
            className="w-full font-mono text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none focus:border-[#8A244B] resize-y"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col card-dev27 p-3 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
            <span>Formatted Structured SQL</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="px-2 py-0.5 text-xs bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1 disabled:opacity-40"
              >
                {copied ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3 text-[#8A244B]" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="px-2 py-0.5 text-xs bg-[#8A244B] text-white hover:bg-[#721C3D] rounded-[4px] flex items-center gap-1 disabled:opacity-40"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted SQL output will appear here..."
            rows={16}
            className="w-full font-mono text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] focus:outline-none resize-y text-slate-800"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
