import React, { useState } from 'react';
import { DollarSign, Clock, Calendar, Download, Plus, Trash2 } from 'lucide-react';

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

  // 4.2 Freelance Rate
  const [targetAnnualIncome, setTargetAnnualIncome] = useState<number>(110000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(1200);
  const [taxRatePct, setTaxRatePct] = useState<number>(28);
  const [vacationWeeks, setVacationWeeks] = useState<number>(4);
  const [billableHoursPerDay, setBillableHoursPerDay] = useState<number>(5.5); // 5.5 of 8 hours
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
    // overnight shift handling
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

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block pb-2 border-b border-slate-100">
          {titles[type]}
        </span>

        {type === 'overtime' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Regular Hourly Wage ($/hr):</label>
              <input
                type="number"
                step="0.5"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Weekly Overtime Threshold (hrs):</label>
              <input
                type="number"
                value={regularHoursLimit}
                onChange={(e) => setRegularHoursLimit(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Actual Hours Worked This Week:</label>
              <input
                type="number"
                step="0.5"
                value={actualHoursWorked}
                onChange={(e) => setActualHoursWorked(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono text-[#8A244B] font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Overtime Multiplier (1.5x):</label>
              <input
                type="number"
                step="0.1"
                value={otMultiplier}
                onChange={(e) => setOtMultiplier(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Double Time Threshold (hrs):</label>
              <input
                type="number"
                value={doubleTimeThreshold}
                onChange={(e) => setDoubleTimeThreshold(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
          </div>
        )}

        {type === 'freelance-rate' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Target Annual Take-Home ($):</label>
              <input
                type="number"
                step="5000"
                value={targetAnnualIncome}
                onChange={(e) => setTargetAnnualIncome(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Monthly Business Expenses ($):</label>
              <input
                type="number"
                step="100"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Estimated Tax Rate (%):</label>
              <input
                type="number"
                value={taxRatePct}
                onChange={(e) => setTaxRatePct(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Vacation / Sick Weeks Off / Year:</label>
              <input
                type="number"
                min={0}
                max={20}
                value={vacationWeeks}
                onChange={(e) => setVacationWeeks(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Actual Billable Hours / Day:</label>
              <input
                type="number"
                step="0.5"
                min={1}
                max={12}
                value={billableHoursPerDay}
                onChange={(e) => setBillableHoursPerDay(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-[4px] bg-white font-mono text-[#8A244B] font-bold"
              />
              <span className="text-[10px] text-slate-400">Excludes emails, proposals, admin</span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {type === 'overtime' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Regular Pay ({regularHours} hrs)</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                ${regularPay.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Overtime Pay ({overtimeHours} hrs @ {otMultiplier}x)</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                +${overtimePay.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Double-Time Pay ({doubleTimeHours} hrs)</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                +${doubleTimePay.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Total Gross Pay</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                ${totalGrossPay.toFixed(2)}
              </span>
            </div>
          </>
        )}

        {type === 'freelance-rate' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Required Hourly Rate</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                ${hourlyRateNeeded.toFixed(2)}/hr
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Required Day Rate</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                ${dayRate.toFixed(0)}/day
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Weekly Billing Goal</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                ${weeklyRate.toFixed(0)}/wk
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Gross Annual Target</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                ${grossIncomeNeeded.toFixed(0)}
              </span>
            </div>
          </>
        )}

        {type === 'work-hours' && (
          <>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Total Weekly Hours</span>
              <span className="font-mono text-lg font-bold text-[#8A244B]">
                {totalTimesheetHours.toFixed(2)} hrs
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Total Gross Pay</span>
              <span className="font-mono text-lg font-bold text-[#2E7D32]">
                ${totalTimesheetPay.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Active Shift Days</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                {shifts.length} days
              </span>
            </div>
            <div className="p-3 bg-white card-dev27 text-xs">
              <span className="text-slate-500 block mb-0.5">Average Daily Hours</span>
              <span className="font-mono text-lg font-bold text-slate-900">
                {(shifts.length ? totalTimesheetHours / shifts.length : 0).toFixed(1)} hrs/day
              </span>
            </div>
          </>
        )}
      </div>

      {/* Timesheet shifts table for work hours */}
      {type === 'work-hours' && (
        <div className="p-4 bg-white card-dev27 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">Weekly Shift Breakdown</span>
            <button
              onClick={exportTimesheetCsv}
              className="px-3 py-1 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Export Timesheet (CSV)
            </button>
          </div>

          <div className="space-y-2">
            {shifts.map((s, idx) => {
              const netHrs = calculateShiftHours(s.start, s.end, s.breakMinutes);
              const pay = netHrs * s.hourlyPay;
              return (
                <div key={s.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs items-center">
                  <div className="font-bold text-slate-900">{s.day}</div>
                  <div className="flex items-center gap-1 font-mono">
                    <input
                      type="time"
                      value={s.start}
                      onChange={(e) => setShifts(shifts.map(item => item.id === s.id ? { ...item, start: e.target.value } : item))}
                      className="p-1 border border-slate-300 rounded bg-white text-xs text-center w-full"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={s.end}
                      onChange={(e) => setShifts(shifts.map(item => item.id === s.id ? { ...item, end: e.target.value } : item))}
                      className="p-1 border border-slate-300 rounded bg-white text-xs text-center w-full"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Unpaid Break:</span>
                    <input
                      type="number"
                      step={15}
                      value={s.breakMinutes}
                      onChange={(e) => setShifts(shifts.map(item => item.id === s.id ? { ...item, breakMinutes: Number(e.target.value) } : item))}
                      className="p-1 border border-slate-300 rounded bg-white text-xs w-full text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Rate ($/hr):</span>
                    <input
                      type="number"
                      value={s.hourlyPay}
                      onChange={(e) => setShifts(shifts.map(item => item.id === s.id ? { ...item, hourlyPay: Number(e.target.value) } : item))}
                      className="p-1 border border-slate-300 rounded bg-white text-xs w-full text-center font-mono"
                    />
                  </div>
                  <div className="font-mono text-right">
                    <span className="text-slate-500 block text-[10px]">Net Work:</span>
                    <strong>{netHrs.toFixed(2)} hrs</strong>
                  </div>
                  <div className="font-mono text-right text-[#2E7D32] font-bold">
                    <span className="text-slate-500 block text-[10px]">Gross Pay:</span>
                    ${pay.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
