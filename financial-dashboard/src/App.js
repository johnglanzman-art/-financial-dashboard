import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Dashboard from './Dashboard';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [marketPrices, setMarketPrices] = useState({
    btcPrice: 95000,
    audRate: 0.62
  });
  const [dragOver, setDragOver] = useState(false);

  const parseSpreadsheet = useCallback((workbook) => {
    const sheet = workbook.Sheets['2023 ->'];
    if (!sheet) throw new Error('Sheet "2023 ->" not found');

    const getCell = (row, col) => {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = sheet[cellRef];
      return cell ? cell.v : null;
    };

    const dateColumns = {
      'Jan 23': 4, 'Jun 23': 10, 'Dec 23': 16, 'Jun 24': 22,
      'Dec 24': 28, 'Jun 25': 34, 'Dec 25': 40
    };

    const latestCol = 40;

    // Nick's data
    const nick = {
      name: 'Nick (NWB)',
      totalAssetsUSD: getCell(125, latestCol) || 0,
      totalLiabilitiesUSD: getCell(150, latestCol) || 0,
      netAssetsUSD: getCell(153, latestCol) || 0,
      liquidAssetsUSD: getCell(71, latestCol) || 0,
      illiquidAssetsUSD: getCell(122, latestCol) || 0,
      btcHoldings: getCell(19, latestCol) || 0,
      btcValueUSD: (getCell(19, latestCol) || 0) * marketPrices.btcPrice,
      jpmMarginLoans: getCell(133, latestCol) || 0,
      jpmInvestmentsUSD: getCell(54, latestCol) || 12000000,
      anzMortgagesAUD: getCell(128, latestCol) || 0,
      commsecAUD: getCell(60, latestCol) || 0,
      foragerAUD: getCell(59, latestCol) || 0,
      auSuperAUD: getCell(61, latestCol) || 0,
      auHouse1AUD: getCell(75, latestCol) || 0,
      auHouse2AUD: getCell(76, latestCol) || 0,
      creditCardsUSD: getCell(145, latestCol) || 25000,
      holdingForMomAUD: getCell(63, latestCol) || 0,
      // JPM Mortgages
      jpmMortgages: {
        street88th: getCell(135, latestCol) || 2665000,
        hollywood88: getCell(136, latestCol) || 570000,
        hollywood90: getCell(137, latestCol) || 570000,
        main73: getCell(138, latestCol) || 583000,
        whitney: getCell(139, latestCol) || 357000,
        virginia167_1: getCell(140, latestCol) || 465000,
        virginia167_4: getCell(141, latestCol) || 465000,
      },
      // Property values
      property: {
        hollywood84: 950000,
        hollywood88: 850000,
        hollywood90: 850000,
        main73: 790000,
        street88th: 2670000,
        whitney2610: 471000,
        virginia167_1: 425000,
        virginia167_4: 425000,
        virginiaDev: 800000,
        locustAve: 686000,
        lihtc: 269000,
        communipaw: 850000,
        vanNess: 323000,
        ridgecut107H: 204000,
        ridgecut25OCR: 80000,
        ridgecut131BB: 126000,
        arkviewLogan: 200000,
        bergen: 1074000,
        fifthSt: 400000,
      },
      // Historical data
      historicalNetWorth: [],
      historicalDebt: [],
      historicalAssets: [],
    };

    // Get historical data
    for (const [date, col] of Object.entries(dateColumns)) {
      const netWorth = getCell(153, col);
      const debt = getCell(150, col);
      const assets = getCell(125, col);
      if (netWorth) nick.historicalNetWorth.push({ date, value: netWorth });
      if (debt) nick.historicalDebt.push({ date, value: debt });
      if (assets) nick.historicalAssets.push({ date, value: assets });
    }

    // Mom's data
    const mom = {
      name: 'Mom (MMB)',
      totalAssetsUSD: getCell(213, latestCol) || 0,
      totalLiabilitiesUSD: getCell(222, latestCol) || 0,
      netAssetsUSD: getCell(225, latestCol) || 0,
      liquidAssetsUSD: getCell(185, latestCol) || 0,
      illiquidAssetsUSD: getCell(210, latestCol) || 0,
    };

    // Poppy's data
    const poppy = {
      name: 'Poppy (PGB)',
      totalAssetsUSD: getCell(161, latestCol) || 0,
      netAssetsUSD: getCell(161, latestCol) || 0,
      liquidAssetsUSD: getCell(161, latestCol) || 0,
    };

    return { nick, mom, poppy, marketPrices };
  }, [marketPrices]);

  const handleFile = useCallback((file) => {
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const parsed = parseSpreadsheet(workbook);
        setData(parsed);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [parseSpreadsheet]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (data) {
    return <Dashboard data={data} marketPrices={marketPrices} onUploadNew={() => setData(null)} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            Family Financial Dashboard
          </h1>
          <p className="text-slate-400">Upload your spreadsheet to view your financial overview</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
          className={`rounded-2xl p-12 text-center cursor-pointer bg-slate-800/50 border-2 border-dashed transition-all ${
            dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500'
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400">Processing spreadsheet...</p>
            </div>
          ) : (
            <>
              <svg className="w-16 h-16 mx-auto text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg text-slate-300 mb-2">Drag & drop your Excel file here</p>
              <p className="text-slate-500 mb-4">or click to browse</p>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white transition-colors">
                Select Spreadsheet
              </button>
            </>
          )}
          <input
            type="file"
            id="file-input"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        <div className="mt-6 text-center text-slate-500 text-sm">
          <p>Supports: Finances_XXXX_EOFY.xlsx</p>
        </div>

        <div className="mt-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Current Market Prices</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">BTC Price (USD)</label>
              <input
                type="number"
                value={marketPrices.btcPrice}
                onChange={(e) => setMarketPrices(p => ({ ...p, btcPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mono text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">AUD/USD Rate</label>
              <input
                type="number"
                value={marketPrices.audRate}
                step="0.01"
                onChange={(e) => setMarketPrices(p => ({ ...p, audRate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mono text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
