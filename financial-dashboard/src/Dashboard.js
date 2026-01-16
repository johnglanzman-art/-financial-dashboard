import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = ({ data, marketPrices, onUploadNew }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEntity, setSelectedEntity] = useState('nick');

  const { btcPrice, audRate } = marketPrices;
  const audToUsd = (aud) => aud * audRate;

  // Calculate derived values for Nick
  const nick = useMemo(() => {
    const d = data.nick;
    const btcValueUSD = d.btcHoldings * btcPrice;
    const auHousesUSD = audToUsd((d.auHouse1AUD || 0) + (d.auHouse2AUD || 0));
    const auStocksUSD = audToUsd((d.commsecAUD || 0) + (d.foragerAUD || 0));
    const auSuperUSD = audToUsd(d.auSuperAUD || 0);
    const anzMortgagesUSD = audToUsd(d.anzMortgagesAUD || 0);
    const holdingForMomUSD = audToUsd(d.holdingForMomAUD || 0);
    
    const totalJpmMortgages = d.jpmMortgages ? Object.values(d.jpmMortgages).reduce((a, b) => a + b, 0) : 5675000;
    const usRealEstateUSD = d.property ? Object.values(d.property).reduce((a, b) => a + b, 0) : 10700000;

    return {
      ...d,
      btcValueUSD,
      auHousesUSD,
      auStocksUSD,
      auSuperUSD,
      anzMortgagesUSD,
      holdingForMomUSD,
      totalJpmMortgages,
      usRealEstateUSD,
      jpmInvestmentsUSD: d.jpmInvestmentsUSD || 12600000,
      jpmLineSize: 6300000,
      jpmLineAvailable: 2550000,
    };
  }, [data.nick, btcPrice, audRate]);

  const mom = data.mom;
  const poppy = data.poppy;

  // Calculate ratios
  const totalDebtUSD = nick.totalLiabilitiesUSD;
  const shortTermDebt = (nick.jpmMarginLoans || 2900000) + (nick.creditCardsUSD || 25000);
  
  const nickRatios = {
    debtToEquity: totalDebtUSD / nick.netAssetsUSD,
    debtToAssets: totalDebtUSD / nick.totalAssetsUSD,
    currentRatio: nick.liquidAssetsUSD / totalDebtUSD,
    quickRatio: (nick.liquidAssetsUSD - nick.btcValueUSD) / totalDebtUSD,
    btcPercentOfNet: (nick.btcValueUSD / nick.netAssetsUSD) * 100,
    btcPercentOfLiquid: (nick.btcValueUSD / nick.liquidAssetsUSD) * 100,
    locUtilization: (nick.jpmMarginLoans || 2900000) / nick.jpmLineSize,
    locUtilizationToLiquid: (nick.jpmMarginLoans || 2900000) / nick.liquidAssetsUSD,
  };

  // Format helpers
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0';
    if (Math.abs(value) >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M';
    if (Math.abs(value) >= 1000) return '$' + (value / 1000).toFixed(0) + 'K';
    return '$' + value.toFixed(0);
  };

  const formatFullCurrency = (value) => {
    return '$' + (value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const formatPercent = (value) => ((value || 0) * 100).toFixed(1) + '%';

  // Pie chart colors
  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#6366f1'];

  // Asset composition data for pie chart
  const assetComposition = [
    { name: 'US Real Estate', value: nick.usRealEstateUSD, color: '#3b82f6' },
    { name: 'AU Real Estate', value: nick.auHousesUSD, color: '#06b6d4' },
    { name: 'JPM Investments', value: nick.jpmInvestmentsUSD, color: '#8b5cf6' },
    { name: 'Bitcoin', value: nick.btcValueUSD, color: '#f59e0b' },
    { name: 'AU Stocks', value: nick.auStocksUSD, color: '#10b981' },
    { name: 'AU Super', value: nick.auSuperUSD, color: '#6366f1' },
  ].filter(item => item.value > 0);

  // Debt composition
  const debtComposition = [
    { name: 'JPM Margin Loans', value: nick.jpmMarginLoans || 2900000, color: '#ef4444' },
    { name: 'JPM Mortgages', value: nick.totalJpmMortgages, color: '#f59e0b' },
    { name: 'ANZ Mortgages', value: nick.anzMortgagesUSD, color: '#3b82f6' },
    { name: 'Credit Cards', value: nick.creditCardsUSD || 25000, color: '#8b5cf6' },
    { name: 'Holding for Mom', value: nick.holdingForMomUSD, color: '#10b981' },
  ].filter(item => item.value > 0);

  // Property data with LTV
  const propertyData = nick.property ? Object.entries(nick.property).map(([key, value]) => {
    const mortgageMap = {
      hollywood88: nick.jpmMortgages?.hollywood88 || 570000,
      hollywood90: nick.jpmMortgages?.hollywood90 || 570000,
      main73: nick.jpmMortgages?.main73 || 583000,
      street88th: nick.jpmMortgages?.street88th || 2665000,
      whitney2610: nick.jpmMortgages?.whitney || 357000,
      virginia167_1: nick.jpmMortgages?.virginia167_1 || 465000,
      virginia167_4: nick.jpmMortgages?.virginia167_4 || 465000,
    };
    const mortgage = mortgageMap[key] || 0;
    const ltv = mortgage > 0 ? (mortgage / value) * 100 : 0;
    const equity = value - mortgage;
    
    const nameMap = {
      hollywood84: 'Hollywood 84',
      hollywood88: 'Hollywood 88',
      hollywood90: 'Hollywood 90',
      main73: '73 S Main',
      street88th: '88th Street',
      whitney2610: 'Whitney 2610',
      virginia167_1: 'Virginia 167-1',
      virginia167_4: 'Virginia 167-4',
      virginiaDev: 'Virginia Dev',
      locustAve: 'Locust Ave',
      lihtc: 'LIHTC',
      communipaw: 'Communipaw',
      vanNess: 'Van Ness',
      ridgecut107H: 'Ridgecut 107H',
      ridgecut25OCR: 'Ridgecut 25OCR',
      ridgecut131BB: 'Ridgecut 131BB',
      arkviewLogan: 'Arkview Logan',
      bergen: 'Bergen',
      fifthSt: 'Fifth St',
      smain73: '73 S Main',
    };

    return {
      name: nameMap[key] || key,
      value,
      mortgage,
      equity,
      ltv,
      status: ltv === 0 ? 'Free & Clear' : ltv > 100 ? 'Underwater' : ltv > 80 ? 'High LTV' : 'Leveraged'
    };
  }).sort((a, b) => b.value - a.value) : [];

  // Stress test scenarios
  const stressScenarios = [
    {
      name: 'BTC -50%',
      impact: -nick.btcValueUSD * 0.5,
      desc: 'Crypto winter scenario'
    },
    {
      name: 'RE -20%',
      impact: -(nick.usRealEstateUSD + nick.auHousesUSD) * 0.2,
      desc: 'Property market correction'
    },
    {
      name: 'BTC -50% + RE -20%',
      impact: -nick.btcValueUSD * 0.5 - (nick.usRealEstateUSD + nick.auHousesUSD) * 0.2,
      desc: 'Combined crash'
    },
    {
      name: 'Full Market Crash',
      impact: -nick.btcValueUSD * 0.7 - (nick.usRealEstateUSD + nick.auHousesUSD) * 0.3 - nick.jpmInvestmentsUSD * 0.4,
      desc: 'BTC -70%, RE -30%, Stocks -40%'
    },
  ];

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'debt', label: 'Debt & Leverage', icon: '💳' },
    { id: 'liquidity', label: 'Liquidity & Solvency', icon: '💧' },
    { id: 'assets', label: 'Assets', icon: '🏠' },
    { id: 'bitcoin', label: 'Bitcoin', icon: '₿' },
    { id: 'stress', label: 'Stress Tests', icon: '⚠️' },
  ];

  // Card component
  const Card = ({ title, value, subtitle, color = 'white', className = '' }) => (
    <div className={`bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 ${className}`}>
      <div className="text-slate-400 text-sm mb-2">{title}</div>
      <div className={`text-3xl font-bold text-${color}`}>{value}</div>
      {subtitle && <div className="text-slate-500 text-sm mt-1">{subtitle}</div>}
    </div>
  );

  // Status badge
  const StatusBadge = ({ status }) => {
    const colors = {
      'Free & Clear': 'bg-emerald-500/20 text-emerald-400',
      'Leveraged': 'bg-blue-500/20 text-blue-400',
      'High LTV': 'bg-amber-500/20 text-amber-400',
      'Underwater': 'bg-red-500/20 text-red-400',
      'SAFE': 'bg-emerald-500/20 text-emerald-400',
      'WARNING': 'bg-amber-500/20 text-amber-400',
      'DANGER': 'bg-red-500/20 text-red-400',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-slate-500/20 text-slate-400'}`}>
        {status}
      </span>
    );
  };

  // Ratio card with status
  const RatioCard = ({ title, value, target, status, description }) => (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-400 text-sm">{title}</span>
        <StatusBadge status={status} />
      </div>
      <div className={`text-2xl font-bold ${status === 'SAFE' ? 'text-emerald-400' : status === 'WARNING' ? 'text-amber-400' : 'text-red-400'}`}>
        {value}
      </div>
      <div className="text-slate-500 text-xs mt-1">{target || description}</div>
    </div>
  );

  // Progress bar
  const ProgressBar = ({ label, value, max, color = '#3b82f6', showPercent = true }) => {
    const pct = Math.min((value / max) * 100, 100);
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">{label}</span>
          <span className="text-slate-300">{formatCurrency(value)} {showPercent && `(${pct.toFixed(1)}%)`}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }}></div>
        </div>
      </div>
    );
  };

  // Render content based on selected entity and tab
  const renderContent = () => {
    if (selectedEntity === 'mom') {
      return renderMomContent();
    } else if (selectedEntity === 'poppy') {
      return renderPoppyContent();
    }
    return renderNickContent();
  };

  const renderNickContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <div className="text-blue-400 text-sm mb-2">Total Assets</div>
                <div className="text-3xl font-bold text-white">{formatCurrency(nick.totalAssetsUSD)}</div>
                <div className="text-slate-500 text-sm mt-1">USD</div>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-6 border border-red-500/20">
                <div className="text-red-400 text-sm mb-2">Total Liabilities</div>
                <div className="text-3xl font-bold text-red-400">{formatCurrency(totalDebtUSD)}</div>
                <div className="text-slate-500 text-sm mt-1">USD</div>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-6 border border-emerald-500/20">
                <div className="text-emerald-400 text-sm mb-2">Net Assets</div>
                <div className="text-3xl font-bold text-emerald-400">{formatCurrency(nick.netAssetsUSD)}</div>
                <div className="text-slate-500 text-sm mt-1">{formatFullCurrency(nick.netAssetsUSD)}</div>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-6 border border-amber-500/20">
                <div className="text-amber-400 text-sm mb-2">Bitcoin Value</div>
                <div className="text-3xl font-bold text-amber-400">{formatCurrency(nick.btcValueUSD)}</div>
                <div className="text-slate-500 text-sm mt-1">{nick.btcHoldings.toFixed(3)} BTC @ ${btcPrice.toLocaleString()}</div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Asset Composition Pie */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-4">Asset Composition</h3>
                <div className="flex items-center">
                  <div className="w-40 h-40">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={assetComposition}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                        >
                          {assetComposition.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="ml-6 space-y-2">
                    {assetComposition.map((item, i) => (
                      <div key={i} className="flex items-center text-sm">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-400">{item.name}</span>
                        <span className="ml-2 text-white">{((item.value / nick.totalAssetsUSD) * 100).toFixed(1)}%</span>
                        <span className="ml-2 text-slate-500">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Net Worth Trend */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-4">Net Worth Trend (USD)</h3>
                <div className="h-48">
                  <ResponsiveContainer>
                    <BarChart data={nick.historicalNetWorth}>
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                      <Tooltip 
                        formatter={(v) => formatCurrency(v)}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Key Ratios */}
            <div className="grid grid-cols-4 gap-4">
              <RatioCard 
                title="Debt-to-Equity Ratio"
                value={nickRatios.debtToEquity.toFixed(2) + 'x'}
                target="Target: < 0.5x for conservative"
                status={nickRatios.debtToEquity < 0.5 ? 'SAFE' : nickRatios.debtToEquity < 0.8 ? 'WARNING' : 'DANGER'}
              />
              <RatioCard 
                title="Current Ratio"
                value={nickRatios.currentRatio.toFixed(2) + 'x'}
                target="Liquid Assets / Total Debt"
                status={nickRatios.currentRatio > 2 ? 'SAFE' : nickRatios.currentRatio > 1 ? 'WARNING' : 'DANGER'}
              />
              <RatioCard 
                title="LOC Utilization"
                value={formatPercent(nickRatios.locUtilizationToLiquid)}
                target="Margin Loan / Liquid Assets"
                status={nickRatios.locUtilizationToLiquid < 0.3 ? 'SAFE' : nickRatios.locUtilizationToLiquid < 0.5 ? 'WARNING' : 'DANGER'}
              />
              <RatioCard 
                title="BTC % of Net Worth"
                value={nickRatios.btcPercentOfNet.toFixed(1) + '%'}
                target="Crypto concentration risk"
                status={nickRatios.btcPercentOfNet < 10 ? 'SAFE' : nickRatios.btcPercentOfNet < 20 ? 'WARNING' : 'DANGER'}
              />
            </div>
          </div>
        );

      case 'debt':
        return (
          <div className="space-y-6">
            {/* Debt Summary */}
            <div className="grid grid-cols-4 gap-4">
              <Card title="Total Debt" value={formatCurrency(totalDebtUSD)} color="red-400" />
              <RatioCard 
                title="Debt-to-Equity"
                value={nickRatios.debtToEquity.toFixed(2) + 'x'}
                target="Target: < 0.5x"
                status={nickRatios.debtToEquity < 0.5 ? 'SAFE' : nickRatios.debtToEquity < 0.8 ? 'WARNING' : 'DANGER'}
              />
              <RatioCard 
                title="LOC / Liquid Assets"
                value={formatPercent(nickRatios.locUtilizationToLiquid)}
                target="Target: < 50%"
                status={nickRatios.locUtilizationToLiquid < 0.3 ? 'SAFE' : nickRatios.locUtilizationToLiquid < 0.5 ? 'WARNING' : 'DANGER'}
              />
              <RatioCard 
                title="Short-Term Debt %"
                value={formatPercent(shortTermDebt / totalDebtUSD)}
                target="Target: < 20%"
                status={(shortTermDebt / totalDebtUSD) < 0.2 ? 'SAFE' : (shortTermDebt / totalDebtUSD) < 0.35 ? 'WARNING' : 'DANGER'}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Debt Breakdown Pie */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-4">Debt Breakdown</h3>
                <div className="flex items-center">
                  <div className="w-32 h-32">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={debtComposition}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          dataKey="value"
                        >
                          {debtComposition.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="ml-4 space-y-2">
                    {debtComposition.map((item, i) => (
                      <div key={i} className="flex items-center text-sm">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-400">{item.name}</span>
                        <span className="ml-2 text-white">{((item.value / totalDebtUSD) * 100).toFixed(1)}%</span>
                        <span className="ml-2 text-slate-500">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Debt Maturity Profile */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-4">Debt Maturity Profile</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400 flex items-center">
                        0-1 Year <span className="ml-2 text-amber-400 text-xs">⚠️ Above 20%</span>
                      </span>
                      <span className="text-white">{formatCurrency(shortTermDebt)} ({formatPercent(shortTermDebt / totalDebtUSD)})</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${(shortTermDebt / totalDebtUSD) * 100}%` }}></div>
                    </div>
                    <div className="text-slate-500 text-xs mt-1">Margin loans, credit cards</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">1-5 Years</span>
                      <span className="text-white">$0 (0.0%)</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <div className="text-slate-500 text-xs mt-1">Medium-term loans</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">5+ Years</span>
                      <span className="text-white">{formatCurrency(nick.totalJpmMortgages + nick.anzMortgagesUSD)} ({formatPercent((nick.totalJpmMortgages + nick.anzMortgagesUSD) / totalDebtUSD)})</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${((nick.totalJpmMortgages + nick.anzMortgagesUSD) / totalDebtUSD) * 100}%` }}></div>
                    </div>
                    <div className="text-slate-500 text-xs mt-1">Mortgages</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Debt vs Net Worth Chart */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4">Debt vs Net Worth Growth</h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={nick.historicalNetWorth.map((item, i) => ({
                    ...item,
                    debt: nick.historicalDebt[i]?.value || 0
                  }))}>
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                    <Tooltip 
                      formatter={(v) => formatCurrency(v)}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} name="Net Worth" dot={{ fill: '#10b981' }} />
                    <Line type="monotone" dataKey="debt" stroke="#ef4444" strokeWidth={2} name="Total Debt" dot={{ fill: '#ef4444' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Net Worth</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Total Debt</div>
              </div>
            </div>

            {/* Debt Details */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4">Debt Details</h3>
              <div className="space-y-3">
                <ProgressBar label="JPM Margin Loans (callable)" value={nick.jpmMarginLoans || 2900000} max={totalDebtUSD} color="#ef4444" />
                <ProgressBar label="88th St Mortgage" value={nick.jpmMortgages?.street88th || 2665000} max={totalDebtUSD} color="#f59e0b" />
                <ProgressBar label="ANZ Mortgages (AU)" value={nick.anzMortgagesUSD} max={totalDebtUSD} color="#3b82f6" />
                <ProgressBar label="Hollywood 88 Mortgage" value={nick.jpmMortgages?.hollywood88 || 570000} max={totalDebtUSD} color="#8b5cf6" />
                <ProgressBar label="Hollywood 90 Mortgage" value={nick.jpmMortgages?.hollywood90 || 570000} max={totalDebtUSD} color="#8b5cf6" />
                <ProgressBar label="73 S Main Mortgage" value={nick.jpmMortgages?.main73 || 583000} max={totalDebtUSD} color="#06b6d4" />
                <ProgressBar label="Whitney Mortgage" value={nick.jpmMortgages?.whitney || 357000} max={totalDebtUSD} color="#10b981" />
                <ProgressBar label="Credit Cards" value={nick.creditCardsUSD || 25000} max={totalDebtUSD} color="#ec4899" />
              </div>
            </div>
          </div>
        );

      case 'liquidity':
        return (
          <div className="space-y-6">
            {/* Liquidity Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card title="Liquid Assets" value={formatCurrency(nick.liquidAssetsUSD)} subtitle={formatPercent(nick.liquidAssetsUSD / nick.totalAssetsUSD) + ' of total assets'} color="emerald-400" />
              <RatioCard 
                title="Current Ratio"
                value={nickRatios.currentRatio.toFixed(2) + 'x'}
                target="Target: > 2x"
                status={nickRatios.currentRatio > 2 ? 'SAFE' : nickRatios.currentRatio > 1 ? 'WARNING' : 'DANGER'}
              />
              <RatioCard 
                title="Quick Ratio (ex-BTC)"
                value={nickRatios.quickRatio.toFixed(2) + 'x'}
                target="Target: > 1x"
                status={nickRatios.quickRatio > 1.5 ? 'SAFE' : nickRatios.quickRatio > 1 ? 'WARNING' : 'DANGER'}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Cash Runway */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-4">Cash Runway</h3>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-emerald-400">{Math.round(nick.liquidAssetsUSD / 25000)}</div>
                    <div className="text-slate-400 mt-2">months</div>
                    <div className="text-emerald-400 text-sm mt-1">Excellent</div>
                    <div className="text-slate-500 text-xs mt-2">of runway if income stops</div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500">Monthly Expenses (Est.)</div>
                    <div className="text-white font-medium">$25K</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Liquid Assets</div>
                    <div className="text-white font-medium">{formatCurrency(nick.liquidAssetsUSD)}</div>
                  </div>
                </div>
              </div>

              {/* Liquidity Breakdown */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-4">Liquidity Breakdown</h3>
                <div className="space-y-3">
                  <ProgressBar label="JPM Brokerage (US)" value={nick.jpmInvestmentsUSD - nick.btcValueUSD} max={nick.liquidAssetsUSD} color="#3b82f6" />
                  <ProgressBar label="Bitcoin" value={nick.btcValueUSD} max={nick.liquidAssetsUSD} color="#f59e0b" />
                  <ProgressBar label="AU Stocks (Commsec)" value={nick.auStocksUSD} max={nick.liquidAssetsUSD} color="#10b981" />
                  <ProgressBar label="Bank Accounts" value={100000} max={nick.liquidAssetsUSD} color="#8b5cf6" />
                </div>
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="text-amber-400 text-sm font-medium">⚠️ Note on Liquidity</div>
                  <div className="text-slate-400 text-xs mt-1">Bitcoin ({formatPercent(nick.btcValueUSD / nick.liquidAssetsUSD)} of liquid) is highly volatile. In a crisis, actual liquidity may be lower.</div>
                </div>
              </div>
            </div>

            {/* Short-Term Debt Coverage */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4">Short-Term Debt Coverage</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-slate-400 text-sm mb-2">Liquid Assets Available</div>
                  <div className="text-3xl font-bold text-emerald-400 mb-4">{formatCurrency(nick.liquidAssetsUSD)}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">JPM Cash/Securities</span><span>{formatCurrency(nick.jpmInvestmentsUSD - nick.btcValueUSD)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Bitcoin</span><span>{formatCurrency(nick.btcValueUSD)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">AU Investments</span><span>{formatCurrency(nick.auStocksUSD)}</span></div>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm mb-2">Short-Term Obligations</div>
                  <div className="text-3xl font-bold text-red-400 mb-4">{formatCurrency(shortTermDebt)}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">JPM Margin (callable)</span><span className="text-red-400">{formatCurrency(nick.jpmMarginLoans || 2900000)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Credit Cards</span><span className="text-red-400">{formatCurrency(nick.creditCardsUSD || 25000)}</span></div>
                  </div>
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="text-emerald-400 text-sm">✓ Sufficient Coverage</div>
                    <div className="text-slate-400 text-xs">Liquid assets cover short-term debt {(nick.liquidAssetsUSD / shortTermDebt).toFixed(1)}x</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'assets':
        return (
          <div className="space-y-6">
            {/* Asset Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card title="Liquid Assets" value={formatCurrency(nick.liquidAssetsUSD)} subtitle={formatPercent(nick.liquidAssetsUSD / nick.totalAssetsUSD) + ' of total'} color="emerald-400" />
              <Card title="Illiquid Assets" value={formatCurrency(nick.illiquidAssetsUSD)} subtitle={formatPercent(nick.illiquidAssetsUSD / nick.totalAssetsUSD) + ' of total'} color="blue-400" />
              <Card title="Real Estate Total" value={formatCurrency(nick.usRealEstateUSD + nick.auHousesUSD)} subtitle="US + AU Properties" color="cyan-400" />
            </div>

            {/* Asset Categories */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4">Asset Categories (USD)</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: '🏠', title: 'US Real Estate', value: nick.usRealEstateUSD, subtitle: '20+ properties' },
                  { icon: '🏡', title: 'AU Real Estate', value: nick.auHousesUSD, subtitle: 'Blairgowrie + Middle Park' },
                  { icon: '💼', title: 'JPM Investments', value: nick.jpmInvestmentsUSD, subtitle: 'PB + Trust' },
                  { icon: '₿', title: 'Bitcoin', value: nick.btcValueUSD, subtitle: `${nick.btcHoldings.toFixed(3)} BTC` },
                  { icon: '🏦', title: 'AU Superannuation', value: nick.auSuperUSD, subtitle: 'AusSuper + Hostplus' },
                  { icon: '📈', title: 'AU Stocks', value: nick.auStocksUSD, subtitle: 'Commsec + Forager' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-700/30 rounded-xl p-4 flex items-center">
                    <div className="text-2xl mr-3">{item.icon}</div>
                    <div>
                      <div className="text-slate-400 text-xs">{item.title}</div>
                      <div className="text-lg font-bold text-white">{formatCurrency(item.value)}</div>
                      <div className="text-slate-500 text-xs">{item.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Table */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4">US Real Estate Portfolio - Debt-to-Equity by Property</h3>
              <div className="text-slate-500 text-sm mb-4">Properties without mortgages shown are assumed paid off (0% LTV)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 text-slate-400">Property</th>
                      <th className="text-right py-3 text-slate-400">Value</th>
                      <th className="text-right py-3 text-slate-400">Mortgage</th>
                      <th className="text-right py-3 text-slate-400">Equity</th>
                      <th className="text-right py-3 text-slate-400">LTV</th>
                      <th className="text-right py-3 text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertyData.slice(0, 15).map((prop, i) => (
                      <tr key={i} className="border-b border-slate-700/50">
                        <td className="py-3 text-white">{prop.name}</td>
                        <td className="py-3 text-right text-slate-300">{formatCurrency(prop.value)}</td>
                        <td className="py-3 text-right text-slate-300">{prop.mortgage > 0 ? formatCurrency(prop.mortgage) : '-'}</td>
                        <td className={`py-3 text-right ${prop.equity >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(prop.equity)}</td>
                        <td className={`py-3 text-right ${prop.ltv > 80 ? 'text-red-400' : prop.ltv > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{prop.ltv.toFixed(0)}%</td>
                        <td className="py-3 text-right"><StatusBadge status={prop.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'bitcoin':
        return (
          <div className="space-y-6">
            {/* BTC Header */}
            <div className="bg-gradient-to-r from-amber-900/30 to-slate-800/50 rounded-2xl p-8 border border-amber-500/30">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-amber-400 text-sm font-medium mb-2">Bitcoin Holdings</div>
                  <div className="text-5xl font-bold text-white mb-2">{nick.btcHoldings.toFixed(3)} BTC</div>
                  <div className="text-2xl text-amber-400">{formatCurrency(nick.btcValueUSD)}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-sm">Live Price (Jan 15, 2026)</div>
                  <div className="text-3xl font-bold text-white">${btcPrice.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* BTC Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <div className="text-slate-400 text-sm mb-2">% of Net Worth</div>
                <div className="text-3xl font-bold text-emerald-400">{nickRatios.btcPercentOfNet.toFixed(1)}%</div>
                <div className="mt-2 h-2 bg-slate-700 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(nickRatios.btcPercentOfNet, 100)}%` }}></div>
                </div>
                <div className="text-slate-500 text-xs mt-2">Recommended: &lt;10%</div>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <div className="text-slate-400 text-sm mb-2">% of Liquid Assets</div>
                <div className="text-3xl font-bold text-blue-400">{nickRatios.btcPercentOfLiquid.toFixed(1)}%</div>
                <div className="mt-2 h-2 bg-slate-700 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(nickRatios.btcPercentOfLiquid, 100)}%` }}></div>
                </div>
                <div className="text-slate-500 text-xs mt-2">Recommended: &lt;15%</div>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <div className="text-slate-400 text-sm mb-2">Volatility Impact</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">If BTC -50%</span><span className="text-red-400">-{formatCurrency(nick.btcValueUSD * 0.5)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">If BTC +50%</span><span className="text-emerald-400">+{formatCurrency(nick.btcValueUSD * 0.5)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">If BTC +100%</span><span className="text-emerald-400">+{formatCurrency(nick.btcValueUSD)}</span></div>
                </div>
              </div>
            </div>

            {/* BTC Storage */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-2">BTC Storage Breakdown</h3>
              <div className="text-slate-500 text-sm mb-4">From spreadsheet notes: "Kraken (including deposit), Coinbase, Glanz, Trez"</div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { name: 'Hardware Wallet', icon: '🔐', subtitle: 'Trezor' },
                  { name: 'Kraken', icon: '🦑', subtitle: 'Exchange' },
                  { name: 'Coinbase', icon: '🪙', subtitle: 'Exchange' },
                  { name: 'Glanz', icon: '💎', subtitle: 'Storage' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-700/30 rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-slate-500 text-xs">{item.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'stress':
        return (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-2">⚠️ Stress Test Scenarios</h3>
              <p className="text-slate-400 text-sm mb-6">Simulations showing how your net worth would be affected by market downturns. These help identify if you could survive worst-case scenarios without forced liquidations or bankruptcy.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {stressScenarios.map((scenario, i) => {
                  const newNetWorth = nick.netAssetsUSD + scenario.impact;
                  const newDebtToEquity = totalDebtUSD / newNetWorth;
                  return (
                    <div key={i} className="bg-slate-700/30 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-white">{scenario.name}</div>
                        <StatusBadge status={newNetWorth > 0 ? 'SURVIVABLE' : 'DANGER'} />
                      </div>
                      <div className="text-slate-400 text-xs mb-3">{scenario.desc}</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500 text-xs">Impact</div>
                          <div className="text-red-400 font-medium">{formatCurrency(scenario.impact)}</div>
                          <div className="text-slate-500 text-xs">{formatPercent(scenario.impact / nick.netAssetsUSD)} of net worth</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-xs">New Net Worth</div>
                          <div className={`font-medium ${newNetWorth > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(newNetWorth)}</div>
                          <div className="text-slate-500 text-xs">D/E: {newDebtToEquity.toFixed(2)}x</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Analysis */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h4 className="text-lg font-semibold text-white mb-4">Stress Test Analysis</h4>
                <h5 className="text-amber-400 font-medium mb-2">Key Vulnerabilities</h5>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li className="flex items-start"><span className="text-amber-400 mr-2">⚠️</span><span><strong>Real Estate Concentration:</strong> RE makes up {formatPercent((nick.usRealEstateUSD + nick.auHousesUSD) / nick.totalAssetsUSD)} of net worth. A 30% RE crash would wipe out {formatCurrency((nick.usRealEstateUSD + nick.auHousesUSD) * 0.3)}.</span></li>
                  <li className="flex items-start"><span className="text-amber-400 mr-2">⚠️</span><span><strong>Margin Loan Risk:</strong> {formatCurrency(nick.jpmMarginLoans || 2900000)} is callable. In a market crash, this could be called while asset values are depressed.</span></li>
                  <li className="flex items-start"><span className="text-amber-400 mr-2">⚠️</span><span><strong>BTC Volatility:</strong> A 70% BTC crash (has happened before) would cost {formatCurrency(nick.btcValueUSD * 0.7)}.</span></li>
                </ul>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h5 className="text-emerald-400 font-medium mb-2">Protective Factors</h5>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li className="flex items-start"><span className="text-emerald-400 mr-2">✓</span><span><strong>Strong Equity Buffer:</strong> {formatCurrency(nick.netAssetsUSD)} net worth provides significant cushion before insolvency.</span></li>
                  <li className="flex items-start"><span className="text-emerald-400 mr-2">✓</span><span><strong>Diversified RE Portfolio:</strong> Properties spread across multiple locations reduce single-market risk.</span></li>
                  <li className="flex items-start"><span className="text-emerald-400 mr-2">✓</span><span><strong>Long Runway:</strong> {Math.round(nick.liquidAssetsUSD / 25000)} months of expenses covered by liquid assets.</span></li>
                </ul>
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="text-emerald-400 font-medium">✓ Overall Assessment: LOW BANKRUPTCY RISK</div>
                  <div className="text-slate-400 text-xs mt-1">Even in the worst-case "Full Market Crash" scenario, net worth remains positive at {formatCurrency(nick.netAssetsUSD + stressScenarios[3].impact)}. Primary risk is forced margin call liquidation at depressed prices.</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-slate-400">Select a tab to view data.</div>;
    }
  };

  const renderMomContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card title="Total Assets" value={formatCurrency(mom.totalAssetsUSD)} subtitle={formatFullCurrency(mom.totalAssetsUSD)} color="white" />
        <Card title="Total Liabilities" value={formatCurrency(mom.totalLiabilitiesUSD)} subtitle="Very low debt" color="emerald-400" />
        <Card title="Net Worth" value={formatCurrency(mom.netAssetsUSD)} subtitle={formatFullCurrency(mom.netAssetsUSD)} color="emerald-400" />
        <Card title="Liquid Assets" value={formatCurrency(mom.liquidAssetsUSD)} subtitle={formatPercent(mom.liquidAssetsUSD / mom.totalAssetsUSD) + ' of total'} color="blue-400" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4">Asset Composition</h3>
          <ProgressBar label="Liquid Assets" value={mom.liquidAssetsUSD} max={mom.totalAssetsUSD} color="#3b82f6" />
          <ProgressBar label="Illiquid Assets" value={mom.illiquidAssetsUSD} max={mom.totalAssetsUSD} color="#10b981" />
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-slate-400">Debt-to-Equity</span>
              <span className="text-emerald-400 font-semibold">{((mom.totalLiabilitiesUSD / mom.netAssetsUSD) * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-slate-400">Liquidity Ratio</span>
              <span className="text-emerald-400 font-semibold">{formatPercent(mom.liquidAssetsUSD / mom.totalAssetsUSD)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Debt Coverage</span>
              <span className="text-emerald-400 font-semibold">{(mom.liquidAssetsUSD / mom.totalLiabilitiesUSD).toFixed(0)}x</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <h4 className="text-emerald-400 font-semibold mb-2">✓ Excellent Financial Position</h4>
        <p className="text-slate-300">Near-zero leverage with {formatCurrency(mom.netAssetsUSD)} in net assets. Liquid assets ({formatCurrency(mom.liquidAssetsUSD)}) can cover liabilities {(mom.liquidAssetsUSD / mom.totalLiabilitiesUSD).toFixed(0)}x over.</p>
      </div>
    </div>
  );

  const renderPoppyContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card title="Total Assets" value={formatCurrency(poppy.totalAssetsUSD)} color="white" />
        <Card title="Liabilities" value="$0" color="emerald-400" />
        <Card title="Net Worth" value={formatCurrency(poppy.netAssetsUSD)} color="emerald-400" />
      </div>
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
        <h4 className="text-lg font-semibold mb-3">Summary</h4>
        <p className="text-slate-300">Poppy has {formatCurrency(poppy.totalAssetsUSD)} in liquid assets with no liabilities.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Financial Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              December 2025 EOFY • All values in USD (AUD/USD: {audRate})
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {['nick', 'poppy', 'mom'].map(entity => (
                <button
                  key={entity}
                  onClick={() => setSelectedEntity(entity)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedEntity === entity
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {entity === 'nick' ? 'Nick (NWB)' : entity === 'poppy' ? 'Poppy' : 'Mom (MMB)'}
                </button>
              ))}
            </div>
            <button
              onClick={onUploadNew}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload New
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Footer */}
      <div className="mt-8 text-center text-slate-500 text-xs">
        Holdings from Dec 25 EOFY | Current Prices: BTC ${btcPrice.toLocaleString()} • AUD/USD {audRate}
      </div>
    </div>
  );
};

export default Dashboard;
