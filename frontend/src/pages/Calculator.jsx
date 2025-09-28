import React, { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const calculateFixedEMI = (principal, rate, months) => {
  const monthlyRate = rate / 12 / 100;
  if (monthlyRate === 0) return principal / months;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
};

const buildSchedule = (principal, rate, months, startDate, emiAmount) => {
  let schedule = [];
  let balance = principal;
  const monthlyRate = rate / 12 / 100;
  let emi = emiAmount;
  let dt = new Date(startDate);

  for (let i = 1; i <= months && balance > 0.01; i++) {
    let interest = balance * monthlyRate;
    let principalPaid = Math.min(emi - interest, balance);
    balance -= principalPaid;

    schedule.push({
      EmiNo: i,
      date: new Date(dt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      emiAmount: emi.toFixed(2),
      interestPaid: interest.toFixed(2),
      principalPaid: principalPaid.toFixed(2),
      remaining: balance > 0 ? balance.toFixed(2) : "0.00",
    });
    dt.setMonth(dt.getMonth() + 1);
  }
  return schedule;
};

export default function CalculatorPage() {
  const [loanAmount, setLoanAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [loanStartDate, setLoanStartDate] = useState("");
  const [tenureYears, setTenureYears] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [manualEmi, setManualEmi] = useState("");
  const [emiAdjustments, setEmiAdjustments] = useState([]);
  const [fixedEMI, setFixedEMI] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  const handleFixedEmiCalc = () => {
    setError("");
    if (!loanAmount || !annualRate || !loanStartDate || (!tenureYears && !tenureMonths)) {
      setError("Please enter all fixed EMI fields");
      return;
    }
    const months = Number(tenureYears) * 12 + Number(tenureMonths ? tenureMonths : 0);
    const emi = calculateFixedEMI(Number(loanAmount), Number(annualRate), months);
    setFixedEMI(emi);
    const sched = buildSchedule(Number(loanAmount), Number(annualRate), months, loanStartDate, emi);
    setSchedule(sched);
    calculateSummary(sched, emi);
  };

  const handleManualEmiCalc = () => {
    setError("");
    if (!loanAmount || !annualRate || !loanStartDate || !manualEmi) {
      setError("Please enter all manual EMI fields");
      return;
    }
    let sched = buildSchedule(Number(loanAmount), Number(annualRate), 360, loanStartDate, Number(manualEmi));
    if (emiAdjustments.length > 0) {
      let balance = Number(loanAmount);
      let dt = new Date(loanStartDate);
      let currEmi = Number(manualEmi);
      sched = [];
      let adjustmentIndex = 0;
      for (let i = 1; balance > 0.01 && i <= 360; i++) {
        if (adjustmentIndex < emiAdjustments.length && Number(emiAdjustments[adjustmentIndex].changeMonth) === i) {
          currEmi = Number(emiAdjustments[adjustmentIndex].amount);
          adjustmentIndex++;
        }
        let interest = balance * (Number(annualRate) / 12 / 100);
        let principalPaid = Math.min(currEmi - interest, balance);
        balance -= principalPaid;
        sched.push({
          emiNo: i,
          date: new Date(dt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          }),
          emiAmount: currEmi.toFixed(2),
          interestPaid: interest.toFixed(2),
          principalPaid: principalPaid.toFixed(2),
          remaining: balance > 0 ? balance.toFixed(2) : "0.00",
        });
        dt.setMonth(dt.getMonth() + 1);
      }
    }
    setSchedule(sched);
    calculateSummary(sched, manualEmi);
  };

  const calculateSummary = (sched, emiOrManual) => {
    const totalInterest = sched.map((r) => Number(r.interestPaid)).reduce((acc, curr) => acc + curr, 0);
    const totalPayment = sched.map((r) => Number(r.emiAmount)).reduce((acc, curr) => acc + curr, 0);
    let years = Math.floor(sched.length / 12);
    let months = sched.length % 12;
    setSummary({
      finalEmiAmount: Number(emiOrManual).toFixed(2),
      loanDuration: `${years} years ${months} months`,
      totalInterestPaid: totalInterest.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
    });
  };

  const addAdjustment = () => setEmiAdjustments([...emiAdjustments, { changeMonth: "", amount: "" }]);
  const updateAdjustment = (i, field, value) => {
    const next = emiAdjustments.map((v, idx) => (idx === i ? { ...v, [field]: value } : v));
    setEmiAdjustments(next);
  };
  const removeAdjustment = (i) => setEmiAdjustments(emiAdjustments.filter((_, idx) => idx !== i));

  const downloadExcel = () => {
    if (!schedule.length) return;
    const totals = {
      emiNo: "Total",
      date: "",
      emiAmount: schedule.reduce((sum, r) => sum + parseFloat(r.emiAmount), 0).toFixed(2),
      interestPaid: schedule.reduce((sum, r) => sum + parseFloat(r.interestPaid), 0).toFixed(2),
      principalPaid: schedule.reduce((sum, r) => sum + parseFloat(r.principalPaid), 0).toFixed(2),
      remaining: "",
    };
    const scheduleWithTotal = [...schedule, totals];
    const worksheet = XLSX.utils.json_to_sheet(scheduleWithTotal);

    const borderStyle = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    };
    Object.keys(worksheet).forEach((cell) => {
      if (cell[0] === "!") return;
      if (!worksheet[cell].s) worksheet[cell].s = {};
      worksheet[cell].s.border = borderStyle;
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Schedule");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "emi_schedule.xlsx");
  };

  const downloadPDF = () => {
    if (!schedule.length) return;

    const totals = [
      "Total",
      "",
      schedule.reduce((sum, r) => sum + parseFloat(r.emiAmount), 0).toFixed(2),
      schedule.reduce((sum, r) => sum + parseFloat(r.interestPaid), 0).toFixed(2),
      schedule.reduce((sum, r) => sum + parseFloat(r.principalPaid), 0).toFixed(2),
      "",
    ];

    const doc = new jsPDF();
    autoTable(doc, {
      head: [["EMI No.", "Date", "EMI Amount", "Interest Paid", "Principal Paid", "Remaining"]],
      body: [...schedule.map((r) => [r.emiNo, r.date, r.emiAmount, r.interestPaid, r.principalPaid, r.remaining]), totals],
      styles: {
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [250, 152, 95],
        textColor: 255,
        fontStyle: "bold",
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        textColor: 20,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      didParseCell(data) {
        if (data.row.index === schedule.length) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [230, 230, 230];
          data.cell.styles.textColor = 0;
        }
      },
      startY: 10,
      theme: "grid",
    });
    doc.save("emi_schedule.pdf");
  };

  const transparentButtonClasses =
    "bg-transparent hover:bg-gray-300 text-white hover:text-black py-2 px-6 rounded font-bold shadow transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white p-8">
      <div className="container max-w-4xl rounded-xl shadow-lg bg-white/10 backdrop-blur p-8">
        <h1 className="text-3xl font-bold text-center mb-6 drop-shadow">Advanced EMI Calculator</h1>

        {/* Loan Details */}
        <div className="mb-6 p-6 bg-white/20 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">Common Loan Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Loan Amount (₹)</label>
              <input type="number" min={1} value={loanAmount} className="w-full rounded p-2 text-black" onChange={(e) => setLoanAmount(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Annual Interest Rate (%)</label>
              <input type="number" min={0.01} step={0.01} value={annualRate} className="w-full rounded p-2 text-black" onChange={(e) => setAnnualRate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Loan Start Date</label>
              <input type="date" value={loanStartDate} className="w-full rounded p-2 text-black" onChange={(e) => setLoanStartDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Fixed EMI */}
        <div className="mb-6 p-6 bg-white/20 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">Calculate EMI based on Fixed Tenure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Loan Tenure (Years)</label>
              <input type="number" min={0} value={tenureYears} className="w-full rounded p-2 text-black" onChange={(e) => setTenureYears(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Loan Tenure (Months)</label>
              <input type="number" min={0} max={11} value={tenureMonths} className="w-full rounded p-2 text-black" onChange={(e) => setTenureMonths(e.target.value)} />
            </div>
          </div>
          <button className={transparentButtonClasses} onClick={handleFixedEmiCalc}>
            Calculate Fixed EMI & Schedule
          </button>
          {fixedEMI && <p className="mt-4 text-lg font-semibold drop-shadow">Fixed EMI: ₹ {fixedEMI.toFixed(2)}</p>}
          {error && <p className="text-red-300 mt-2">{error}</p>}
        </div>

        {/* Manual EMI */}
        <div className="mb-6 p-6 bg-white/20 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">Calculate Schedule based on Manual EMI</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Manual EMI Amount (₹)</label>
            <input type="number" min={1} value={manualEmi} className="w-full rounded p-2 text-black" onChange={(e) => setManualEmi(e.target.value)} />
          </div>
          <button className={`${transparentButtonClasses} mt-4`} onClick={handleManualEmiCalc}>
            Calculate Schedule
          </button>
          {error && <p className="text-red-300 mt-2">{error}</p>}
        </div>

        {/* Adjustments */}
        <div className="mb-6 p-6 bg-white/20 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">Multiple EMI Adjustments (Manual EMI only)</h2>
          <div>
            {emiAdjustments.map((adj, i) => (
              <div key={i} className="flex gap-2 items-center mb-2 bg-white/60 p-2 rounded">
                <input
                  type="number"
                  placeholder="Change at EMI No."
                  className="text-sm px-2 py-1 rounded w-28 bg-white/90 text-black"
                  value={adj.changeMonth}
                  onChange={(e) => updateAdjustment(i, "changeMonth", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="New EMI Amount"
                  className="text-sm px-2 py-1 rounded w-32 bg-white/90 text-black"
                  value={adj.amount}
                  onChange={(e) => updateAdjustment(i, "amount", e.target.value)}
                />
                <button className="bg-transparent hover:bg-gray-300 text-white hover:text-black px-2 py-1 rounded transition" onClick={() => removeAdjustment(i)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button className="px-4 py-2 mt-2 bg-transparent hover:bg-gray-300 text-white hover:text-black rounded transition" onClick={addAdjustment}>
            Add EMI Adjustment
          </button>
        </div>

        {/* Download buttons */}
        {schedule.length > 0 && (
          <div className="flex gap-4 mb-4">
            <button className="bg-transparent hover:bg-gray-300 text-white hover:text-black px-4 py-2 rounded transition" onClick={downloadExcel}>
              Download Excel
            </button>
            <button className="bg-transparent hover:bg-gray-300 text-white hover:text-black px-4 py-2 rounded transition" onClick={downloadPDF}>
              Download PDF
            </button>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="summary-box bg-white/30 border border-white rounded-lg p-6 grid grid-cols-2 gap-4 mb-8 text-white">
            <div>
              <label>Final EMI Amount</label>
              <div className="font-bold">₹ {summary.finalEmiAmount}</div>
            </div>
            <div>
              <label>Loan Duration</label>
              <div className="font-bold">{summary.loanDuration}</div>
            </div>
            <div>
              <label>Total Interest Paid</label>
              <div className="font-bold">₹ {summary.totalInterestPaid}</div>
            </div>
            <div>
              <label>Total Payment</label>
              <div className="font-bold">₹ {summary.totalPayment}</div>
            </div>
          </div>
        )}

        {/* Table without total row on page */}
        {schedule.length > 0 && (
          <div className="bg-white/30 rounded-lg shadow-md overflow-x-auto mb-8">
            <h2 className="text-xl font-semibold p-6 pb-0 text-white">Amortization Schedule</h2>
            <table className="min-w-full divide-y divide-white/50">
              <thead className="bg-pink-500/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">EMI No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">EMI Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Interest Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Principal Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white/60 divide-y divide-white">
                {schedule.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-2 text-black">{row.emiNo}</td>
                    <td className="px-6 py-2 text-black">{row.date}</td>
                    <td className="px-6 py-2 text-black">₹ {row.emiAmount}</td>
                    <td className="px-6 py-2 text-black">₹ {row.interestPaid}</td>
                    <td className="px-6 py-2 text-black">₹ {row.principalPaid}</td>
                    <td className="px-6 py-2 text-black">₹ {row.remaining}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
