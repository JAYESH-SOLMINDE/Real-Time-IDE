import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BMIRecord {
  id: string;
  date: string;
  value: number;
  weight: number;
  height: number;
  unit: 'metric' | 'imperial';
}

interface BMICategory {
  label: string;
  range: string;
  color: string;
  tips: string[];
}

const BMICalculator: React.FC = () => {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<BMICategory | null>(null);
  const [records, setRecords] = useState<BMIRecord[]>(() => {
    const saved = localStorage.getItem('bmiRecords');
    return saved ? JSON.parse(saved) : [];
  });

  const categories: Record<string, BMICategory> = {
    underweight: {
      label: 'Underweight',
      range: 'BMI < 18.5',
      color: 'bg-blue-500',
      tips: [
        'Consult a healthcare provider',
        'Focus on nutrient-dense foods',
        'Include healthy proteins and fats',
      ],
    },
    normal: {
      label: 'Normal Weight',
      range: '18.5 ≤ BMI < 25',
      color: 'bg-green-500',
      tips: [
        'Maintain your current lifestyle',
        'Continue regular exercise',
        'Eat a balanced diet',
      ],
    },
    overweight: {
      label: 'Overweight',
      range: '25 ≤ BMI < 30',
      color: 'bg-yellow-500',
      tips: [
        'Increase physical activity',
        'Reduce caloric intake gradually',
        'Choose whole foods over processed',
      ],
    },
    obese: {
      label: 'Obese',
      range: 'BMI ≥ 30',
      color: 'bg-red-500',
      tips: [
        'Consult a healthcare professional',
        'Start a structured exercise program',
        'Consider a weighted nutrition plan',
      ],
    },
  };

  const calculateBMI = () => {
    let weightKg: number;
    let heightM: number;

    if (unit === 'metric') {
      if (!weight || !heightCm) return;
      weightKg = parseFloat(weight);
      heightM = parseFloat(heightCm) / 100;
    } else {
      if (!weight || !height) return;
      weightKg = parseFloat(weight) * 0.453592;
      heightM = (parseFloat(height) * 12) * 0.0254;
    }

    const calculatedBMI = weightKg / (heightM * heightM);
    const roundedBMI = Math.round(calculatedBMI * 10) / 10;
    setBmi(roundedBMI);

    // Determine category
    let selectedCategory: BMICategory;
    if (roundedBMI < 18.5) {
      selectedCategory = categories.underweight;
    } else if (roundedBMI < 25) {
      selectedCategory = categories.normal;
    } else if (roundedBMI < 30) {
      selectedCategory = categories.overweight;
    } else {
      selectedCategory = categories.obese;
    }
    setCategory(selectedCategory);

    // Save to history
    const newRecord: BMIRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      value: roundedBMI,
      weight: parseFloat(weight),
      height: unit === 'metric' ? parseFloat(heightCm) : parseFloat(height),
      unit,
    };
    const updatedRecords = [newRecord, ...records].slice(0, 30); // Keep last 30
    setRecords(updatedRecords);
    localStorage.setItem('bmiRecords', JSON.stringify(updatedRecords));
  };

  const clearHistory = () => {
    if (window.confirm('Clear all BMI history?')) {
      setRecords([]);
      localStorage.removeItem('bmiRecords');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      calculateBMI();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              BMI Calculator
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Track your health and get personalized tips</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Calculate Your BMI</h2>

            {/* Unit Toggle */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => {
                  setUnit('metric');
                  setHeight('');
                }}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  unit === 'metric'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Metric (kg, cm)
              </button>
              <button
                onClick={() => {
                  setUnit('imperial');
                  setHeightCm('');
                }}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  unit === 'imperial'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Imperial (lbs, in)
              </button>
            </div>

            {/* Input Fields */}
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight ({unit === 'metric' ? 'kg' : 'lbs'})
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your weight"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-lg"
                />
              </div>

              {unit === 'metric' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your height"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-lg"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Height (inches)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your height"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-lg"
                  />
                </div>
              )}
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateBMI}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105"
            >
              Calculate BMI
            </button>

            {/* Result */}
            {bmi && category && (
              <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                <div className="text-center mb-4">
                  <p className="text-gray-600 text-sm mb-2">Your BMI</p>
                  <p className="text-5xl font-bold text-indigo-600">{bmi}</p>
                </div>

                <div className="mb-6">
                  <div
                    className={`${category.color} h-2 rounded-full mb-3`}
                  ></div>
                  <h3 className="text-xl font-bold text-gray-800">{category.label}</h3>
                  <p className="text-gray-600 text-sm">{category.range}</p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-gray-700 mb-3">Health Tips:</p>
                  {category.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* History & Chart */}
          <div className="space-y-6">
            {/* Chart */}
            {records.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-gray-800">BMI Trend</h2>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[...records].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      interval={Math.max(0, Math.floor(records.length / 5) - 1)}
                    />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '2px solid #4f46e5',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#4f46e5"
                      dot={{ fill: '#4f46e5', r: 5 }}
                      activeDot={{ r: 7 }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* History */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">History</h2>
                {records.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>

              {records.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No history yet. Calculate your BMI to get started!</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:shadow-md transition"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{record.value}</p>
                        <p className="text-sm text-gray-600">
                          {record.weight}
                          {record.unit === 'metric' ? ' kg' : ' lbs'} • {record.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-indigo-600">
                          {record.value < 18.5
                            ? 'Underweight'
                            : record.value < 25
                            ? 'Normal'
                            : record.value < 30
                            ? 'Overweight'
                            : 'Obese'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;
