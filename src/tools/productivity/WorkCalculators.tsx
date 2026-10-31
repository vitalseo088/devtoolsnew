import React, { useState } from 'react';
import { DollarSign, Clock, Calendar, Download, Plus, Trash2, Copy, Check } from 'lucide-react';

interface Props {
  type: 'overtime' | 'freelance-rate' | 'work-hours';
}

export const WorkCalculators: React.FC<Props> = ({ type }) => {
  // 4.1 Overtime
  const [hourlyWage, setHourlyWage] = useState<number>(32.0);
  const [regularHoursLimit, setRegularHoursLimit] = useState<number>(40);
  const [actualHoursWorked, setActualHoursWorked] = useState<number>(48.5);
  const [otMultiplier, setOtMultiplier] = useState<number>(1.5);
  const [doubleTimeThreshold, setDoubleTimeThreshold] = useState<number>(60);
  const [doubleTimeMultiplier, setDoubleTimeMultiplier] = useState<number>(2.0);
  const [copied, setCopied] = useState<boolean>(false);

  // 4.2 Freelance Rate
  const [targetAnnualIncome, setTargetAnnualIncome] = useState<number>(110000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(1200);
  const [taxRatePct, setTaxRatePct] = useState<number>(28);
  const [vacationWeeks, setVacationWeeks] = useState<number>(4);
  const [billableHoursPerDay, setBillableHoursPerDay] = useState<number>(5.5);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);

  // 4.16 Work Hours Timesheet
  interface ShiftDay {
    id: string;
    day: string;
    start: string;
    end: string;
    breakMinutes: number;
    hourlyPay: number;
  }
  const [shifts, setShifts] = useState<ShiftDay[]>([
    { id: '1', day: 'Monday', start: '09:00', end: '17:30', breakMinutes: 45, hourlyPay: 30 },
    { id: '2', day: 'Tuesday', start: '09:00', end: '18:00', breakMinutes: 60, hourlyPay: 30 },
    { id: '3', day: 'Wednesday', start: '08:30', end: '17:00', breakMinutes: 30, hourlyPay: 30 },
    { id: '4', day: 'Thursday', start: '09:00', end: '17:30', breakMinutes: 45, hourlyPay: 30 },
    { id: '5', day: 'Friday', start: '09:00', end: '16:00', breakMinutes: 30, hourlyPay: 30 },
  ]);

  // Overtime calculations
  const regularHours = Math.min(actualHoursWorked, regularHoursLimit);
  const overtimeHours = Math.max(0, Math.min(actualHoursWorked - regularHoursLimit, doubleTimeThreshold - regularHoursLimit));
  const doubleTimeHours = Math.max(0, actualHoursWorked - doubleTimeThreshold);

  const regularPay = regularHours * hourlyWage;
  const overtimePay = overtimeHours * hourlyWage * otMultiplier;
  const doubleTimePay = doubleTimeHours * hourlyWage * doubleTimeMultiplier;
  const totalGrossPay = regularPay + overtimePay + doubleTimePay;

  // Freelance Rate calculations
  const workingWeeksPerYear = 52 - vacationWeeks;
  const totalAnnualExpenses = monthlyExpenses * 12;
  const grossIncomeNeeded = (targetAnnualIncome + totalAnnualExpenses) / (1 - (taxRatePct / 100));
  const totalBillableHoursPerYear = workingWeeksPerYear * daysPerWeek * billableHoursPerDay;
  const hourlyRateNeeded = totalBillableHoursPerYear > 0 ? grossIncomeNeeded / totalBillableHoursPerYear : 0;
  const dayRate = hourlyRateNeeded * billableHoursPerDay;
  const weeklyRate = dayRate * daysPerWeek;
  const monthlyRate = grossIncomeNeeded / 12;

  // Work Hours helper
  const calculateShiftHours = (start: string, end: string, breakMin: number) => {
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let startTotalMin = sH * 60 + sM;
    let endTotalMin = eH * 60 + eM;
    if (endTotalMin < startTotalMin) endTotalMin += 24 * 60;
    const netMinutes = Math.max(0, endTotalMin - startTotalMin - breakMin);
    return netMinutes / 60;
  };

  const totalTimesheetHours = shifts.reduce((acc, s) => acc + calculateShiftHours(s.start, s.end, s.breakMinutes), 0);
  const totalTimesheetPay = shifts.reduce((acc, s) => acc + (calculateShiftHours(s.start, s.end, s.breakMinutes) * s.hourlyPay), 0);

  const exportTimesheetCsv = () => {
    const header = 'Day,Start Time,End Time,Break (min),Net Hours,Hourly Rate,Gross Pay\n';
    const rows = shifts.map(s => {
      const hrs = calculateShiftHours(s.start, s.end, s.breakMinutes);
      const pay = hrs * s.hourlyPay;
      return `"${s.day}","${s.start}","${s.end}",${s.breakMinutes},${hrs.toFixed(2)},$${s.hourlyPay},$${pay.toFixed(2)}`;
    }).join('\n');
    const totalRow = `\n"TOTAL","","",,${totalTimesheetHours.toFixed(2)},,$${totalTimesheetPay.toFixed(2)}`;
    const blob = new Blob([header + rows + totalRow], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const titles = {
    'overtime': 'Overtime Pay & Double-Time Wage Calculator',
    'freelance-rate': 'Freelance Hourly & Project Rate Calculator',
    'work-hours': 'Work Hours & Timesheet Gross Pay Calculator',
  };

  const copySummary = () => {
    let text = `${titles[type]} Summary:\n`;
    if (type === 'overtime') {
      text += `Total Gross Pay: $${totalGrossPay.toFixed(2)}
Regular Pay (${regularHours} hrs @ $${hourlyWage}/hr): $${regularPay.toFixed(2)}
Overtime Pay (${overtimeHours} hrs @ ${otMultiplier}x): $${overtimePay.toFixed(2)}
Double-Time Pay (${doubleTimeHours} hrs @ ${doubleTimeMultiplier}x): $${doubleTimePay.toFixed(2)}`;
    } else if (type === 'freelance-rate') {
      text += `Required Hourly Rate: $${hourlyRateNeeded.toFixed(2)}/hr
Day Rate (${billableHoursPerDay} hrs/day): $${dayRate.toFixed(0)}/day
Weekly Target: $${weeklyRate.toFixed(0)}/wk
Gross Annual Revenue Target: $${grossIncomeNeeded.toFixed(0)}`;
    } else {
      text += `Total Weekly Hours: ${totalTimesheetHours.toFixed(2)} hrs
Total Gross Pay: $${totalTimesheetPay.toFixed(2)}
Active Days: ${shifts.length} days`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="p-4 bg-white card-dev27 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block">
            Work &amp; Compensation
          </span>
          <h2 className="text-lg font-bold text-[#111F35]">{titles[type]}</h2>
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
              <span>Parameters &amp; Time Entry</span>
              <span className="text-slate-400 font-normal lowercase">editable inputs</span>
            </h3>

            {type === 'overtime' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Base Hourly Wage ($/hr)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={hourlyWage}
                      onChange={(e) => setHourlyWage(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block mb-1.5">
                      Actual Hours Worked This Week
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={actualHoursWorked}
                      onChange={(e) => setActualHoursWorked(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-extrabold text-[#8A244B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Regular Hours Limit (hrs)
                    </label>
                    <input
                      type="number"
                      value={regularHoursLimit}
                      onChange={(e) => setRegularHoursLimit(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      OT Multiplier (e.g. 1.5x)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={otMultiplier}
                      onChange={(e) => setOtMultiplier(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Double Time Threshold (hrs)
                    </label>
                    <input
                      type="number"
                      value={doubleTimeThreshold}
                      onChange={(e) => setDoubleTimeThreshold(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {type === 'freelance-rate' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Desired Annual Take-Home ($)
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={targetAnnualIncome}
                      onChange={(e) => setTargetAnnualIncome(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Monthly Business Expenses ($)
                    </label>
                    <input
                      type="number"
                      step="100"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 focus:bg-white focus:border-[#8A244B] font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Tax Reserve Rate (%)
                    </label>
                    <input
                      type="number"
                      value={taxRatePct}
                      onChange={(e) => setTaxRatePct(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Vacation / Sick Weeks
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={vacationWeeks}
                      onChange={(e) => setVacationWeeks(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block mb-1.5">
                      Billable Hours / Day
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={1}
                      max={12}
                      value={billableHoursPerDay}
                      onChange={(e) => setBillableHoursPerDay(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-sm font-extrabold text-[#8A244B]"
                    />
                  </div>
                </div>
              </div>
            )}

            {type === 'work-hours' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-bold text-slate-800">Timesheet Days</span>
                  <button
                    onClick={exportTimesheetCsv}
                    className="px-3 py-1 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {shifts.map((s) => {
                    const netHrs = calculateShiftHours(s.start, s.end, s.breakMinutes);
                    const pay = netHrs * s.hourlyPay;
                    return (
                      <div key={s.id} className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs items-center">
                        <div className="font-extrabold text-slate-900">{s.day}</div>
                        <div className="flex items-center gap-1 font-mono">
                          <input
                            type="time"
                            value={s.start}
                            onChange={(e) => setShifts(shifts.map(item => item.id === s.id ? { ...item, start: e.target.value } : item))}
                            className="p-1.5 border border-slate-300 rounded bg-white text-xs w-full text-center"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={s.end}
                            onChange={(e) => setShifts(shifts.map(item => item.id === s.id ? { ...item, end: e.target.value } : item))}
                            className="p-1.5 border border-slate-300 rounded bg-white text-xs w-full text-center"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Break (min):</span>
                          <input
                            type="number"
                            step={15}
                            value={s.breakMinutes}
                            onChange={(e) => setShifts(shifts.map(item => item.id === s.id ? { ...item, breakMinutes: Number(e.target.value) } : item))}
                            className="p-1.5 border border-slate-300 rounded bg-white text-xs w-full text-center"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Rate ($/hr):</span>
                          <input
                            type="number"
                            value={s.hourlyPay}
                            onChange={(e) => setShifts(shifts.map(item => item.id === s.id ? { ...item, hourlyPay: Number(e.target.value) } : item))}
                            className="p-1.5 border border-slate-300 rounded bg-white text-xs w-full text-center font-mono font-bold"
                          />
                        </div>
                        <div className="font-mono text-right text-[#2E7D32] font-bold text-xs sm:text-sm">
                          ${pay.toFixed(2)}
                          <span className="block text-[10px] text-slate-400 font-normal">({netHrs.toFixed(2)} hrs)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output Layout with Easy-to-Read Highlights */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          {type === 'overtime' && (
            <>
              {/* Hero Pay Highlight */}
              <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Total Gross Weekly Pay
                </span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                    ${totalGrossPay.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">({actualHoursWorked} hrs worked)</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Regular Pay</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">${regularPay.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 block">{regularHours} hrs @ ${hourlyWage}/hr</span>
                  </div>
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Overtime Pay</span>
                    <span className="font-mono text-lg font-extrabold text-[#2E7D32]">+${overtimePay.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 block">{overtimeHours} hrs @ {otMultiplier}x</span>
                  </div>
                  {doubleTimeHours > 0 && (
                    <div className="col-span-2 p-3 bg-red-50 border border-red-200 rounded-[4px]">
                      <span className="text-[11px] font-bold text-[#D84315] uppercase block mb-0.5">Double-Time Pay</span>
                      <span className="font-mono text-lg font-extrabold text-[#D84315]">+${doubleTimePay.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 block">{doubleTimeHours} hrs @ {doubleTimeMultiplier}x</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {type === 'freelance-rate' && (
            <>
              {/* Hero Rate Highlight */}
              <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Required Minimum Hourly Rate
                </span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#8A244B]">
                    ${hourlyRateNeeded.toFixed(2)}
                  </span>
                  <span className="text-sm text-slate-600 font-bold">/ hour</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Daily Day Rate</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">${dayRate.toFixed(0)}/day</span>
                  </div>
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Weekly Goal</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">${weeklyRate.toFixed(0)}/wk</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Monthly Billing</span>
                    <span className="font-mono text-base font-bold text-[#2E7D32]">${monthlyRate.toFixed(0)}/mo</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Annual Gross Target</span>
                    <span className="font-mono text-base font-bold text-slate-800">${grossIncomeNeeded.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {type === 'work-hours' && (
            <>
              {/* Hero Timesheet Highlight */}
              <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  Total Gross Pay ({shifts.length} shifts)
                </span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#2E7D32]">
                    ${totalTimesheetPay.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">USD</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Total Net Hours</span>
                    <span className="font-mono text-lg font-extrabold text-[#8A244B]">{totalTimesheetHours.toFixed(2)} hrs</span>
                  </div>
                  <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Avg Daily Hours</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">
                      {(shifts.length ? totalTimesheetHours / shifts.length : 0).toFixed(1)} hrs
                    </span>
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
