'use client';

import React, { useState } from 'react';
import { RefreshCw, ArrowRightLeft, Box, Circle, Triangle, Shapes } from 'lucide-react';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'speed' | 'storage' | 'geometry';

const CONVERSION_FACTORS: Record<Exclude<UnitCategory, 'geometry'>, Record<string, number>> = {
  length: {
    Meter: 1,
    Kilometer: 1000,
    Centimeter: 0.01,
    Millimeter: 0.001,
    Mile: 1609.34,
    Yard: 0.9144,
    Foot: 0.3048,
    Inch: 0.0254,
  },
  weight: {
    Kilogram: 1,
    Gram: 0.001,
    Milligram: 0.000001,
    Pound: 0.453592,
    Ounce: 0.0283495,
    Ton: 1000,
  },
  speed: {
    'Meters/sec': 1,
    'Kilometers/hour': 0.277778,
    'Miles/hour': 0.44704,
    Knot: 0.514444,
    Mach: 343, // Speed of Sound Mach 1
    'Sound Speed (343m/s)': 343,
    'Light Speed (c)': 299792458,
  },
  storage: {
    Bit: 0.125, // 1 Byte = 8 bits
    Byte: 1,
    Kilobyte: 1024,
    Megabyte: 1048576,
    Gigabyte: 1073741824,
    Terabyte: 1099511627776,
  },
  temperature: {
    Celsius: 1,
    Fahrenheit: 1,
    Kelvin: 1,
  },
};

type ShapeType =
  | 'Circle'
  | 'Square'
  | 'Rectangle'
  | 'Triangle'
  | 'Pentagon'
  | 'Hexagon'
  | 'Octagon'
  | 'Decagon'
  | 'Trapezium'
  | 'Cube'
  | 'Cuboid'
  | 'Sphere'
  | 'Cylinder'
  | 'Cone';

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState<string>('Meter');
  const [toUnit, setToUnit] = useState<string>('Foot');
  const [inputValue, setInputValue] = useState<number>(1);

  // Geometry shape parameters state
  const [selectedShape, setSelectedShape] = useState<ShapeType>('Circle');
  const [dimA, setDimA] = useState<number>(5); // radius or side A
  const [dimB, setDimB] = useState<number>(10); // height or side B
  const [dimC, setDimC] = useState<number>(8); // base 2 for trapezium / cuboid width

  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    if (newCat !== 'geometry') {
      const newUnits = Object.keys(CONVERSION_FACTORS[newCat]);
      setFromUnit(newUnits[0]);
      setToUnit(newUnits[1] || newUnits[0]);
    }
  };

  const convertValue = () => {
    if (category === 'geometry') return 0;
    if (isNaN(inputValue)) return 0;

    if (category === 'temperature') {
      if (fromUnit === toUnit) return inputValue;
      let celsius = inputValue;
      if (fromUnit === 'Fahrenheit') celsius = ((inputValue - 32) * 5) / 9;
      if (fromUnit === 'Kelvin') celsius = inputValue - 273.15;

      if (toUnit === 'Celsius') return celsius;
      if (toUnit === 'Fahrenheit') return (celsius * 9) / 5 + 32;
      if (toUnit === 'Kelvin') return celsius + 273.15;
    }

    const fromFactor = CONVERSION_FACTORS[category][fromUnit];
    const toFactor = CONVERSION_FACTORS[category][toUnit];
    const baseValue = inputValue * fromFactor;
    return baseValue / toFactor;
  };

  // Geometry calculations for 14 shapes
  const calculateShapeGeometry = () => {
    const a = Math.max(0, dimA);
    const b = Math.max(0, dimB);
    const c = Math.max(0, dimC);

    switch (selectedShape) {
      case 'Circle':
        return { area: Math.PI * a * a, perimeter: 2 * Math.PI * a, volume: null };
      case 'Square':
        return { area: a * a, perimeter: 4 * a, volume: null };
      case 'Rectangle':
        return { area: a * b, perimeter: 2 * (a + b), volume: null };
      case 'Triangle':
        return { area: 0.5 * a * b, perimeter: a + b + Math.sqrt(a * a + b * b), volume: null };
      case 'Pentagon':
        return { area: 1.720477 * a * a, perimeter: 5 * a, volume: null };
      case 'Hexagon':
        return { area: 2.598076 * a * a, perimeter: 6 * a, volume: null };
      case 'Octagon':
        return { area: 4.828427 * a * a, perimeter: 8 * a, volume: null };
      case 'Decagon':
        return { area: 7.694209 * a * a, perimeter: 10 * a, volume: null };
      case 'Trapezium':
        return { area: 0.5 * (a + c) * b, perimeter: a + c + 2 * Math.sqrt(Math.pow((a - c) / 2, 2) + b * b), volume: null };
      case 'Cube':
        return { surfaceArea: 6 * a * a, volume: Math.pow(a, 3) };
      case 'Cuboid':
        return { surfaceArea: 2 * (a * b + b * c + a * c), volume: a * b * c };
      case 'Sphere':
        return { surfaceArea: 4 * Math.PI * a * a, volume: (4 / 3) * Math.PI * Math.pow(a, 3) };
      case 'Cylinder':
        return { surfaceArea: 2 * Math.PI * a * (a + b), volume: Math.PI * a * a * b };
      case 'Cone':
        const slant = Math.sqrt(a * a + b * b);
        return { surfaceArea: Math.PI * a * (a + slant), volume: (1 / 3) * Math.PI * a * a * b };
      default:
        return { area: 0, volume: null };
    }
  };

  const outputValue = convertValue();
  const shapeRes = calculateShapeGeometry();

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        {(['length', 'weight', 'speed', 'storage', 'temperature', 'geometry'] as UnitCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              category === cat
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {cat === 'geometry' ? 'Shapes & Surface Area' : cat}
          </button>
        ))}
      </div>

      {category !== 'geometry' ? (
        /* Standard Unit Converter */
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4">
          <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-2">
            <label className="text-xs text-gray-400 font-semibold">From Unit:</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
            >
              {Object.keys(CONVERSION_FACTORS[category]).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-lg font-mono font-bold text-sky-400 focus:outline-none"
            />
          </div>

          <button
            onClick={() => {
              setFromUnit(toUnit);
              setToUnit(fromUnit);
            }}
            className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-sky-400 hover:text-sky-300 transition-colors mx-auto"
            title="Swap Units"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </button>

          <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-2">
            <label className="text-xs text-gray-400 font-semibold">To Unit:</label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
            >
              {Object.keys(CONVERSION_FACTORS[category]).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <div className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-lg font-mono font-bold text-emerald-400 truncate">
              {outputValue.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </div>
          </div>
        </div>
      ) : (
        /* 2D & 3D Shapes Surface Area & Volume Finder */
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Shapes className="h-4 w-4 text-sky-400" />
              <span>Select 2D or 3D Geometric Shape:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {[
                'Circle',
                'Square',
                'Rectangle',
                'Triangle',
                'Pentagon',
                'Hexagon',
                'Octagon',
                'Decagon',
                'Trapezium',
                'Cube',
                'Cuboid',
                'Sphere',
                'Cylinder',
                'Cone',
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedShape(s as ShapeType)}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedShape === s
                      ? 'bg-sky-500 text-white border-sky-400 shadow-md'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">
                {selectedShape === 'Circle' || selectedShape === 'Sphere' || selectedShape === 'Cylinder' || selectedShape === 'Cone'
                  ? 'Radius (r):'
                  : 'Side / Length (a):'}
              </label>
              <input
                type="number"
                value={dimA}
                onChange={(e) => setDimA(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
              />
            </div>

            {['Rectangle', 'Triangle', 'Trapezium', 'Cuboid', 'Cylinder', 'Cone'].includes(selectedShape) && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">
                  {selectedShape === 'Trapezium' ? 'Height (h):' : 'Width / Height (b):'}
                </label>
                <input
                  type="number"
                  value={dimB}
                  onChange={(e) => setDimB(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
                />
              </div>
            )}

            {['Trapezium', 'Cuboid'].includes(selectedShape) && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">
                  {selectedShape === 'Trapezium' ? 'Parallel Base (c):' : 'Depth (c):'}
                </label>
                <input
                  type="number"
                  value={dimC}
                  onChange={(e) => setDimC(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Results Box */}
          <div className="p-6 bg-gradient-to-r from-sky-950/70 to-indigo-950/70 border border-sky-500/20 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-xl">
            <div>
              <div className="text-xs uppercase tracking-wider text-sky-400 font-semibold">
                {shapeRes.volume !== undefined && shapeRes.volume !== null
                  ? 'Surface Area'
                  : 'Surface Area / 2D Area'}
              </div>
              <div className="text-3xl font-extrabold text-white font-mono mt-1">
                {((shapeRes as any).surfaceArea || (shapeRes as any).area || 0).toFixed(2)}
                <span className="text-xs font-normal text-gray-400"> sq units</span>
              </div>
            </div>

            {shapeRes.volume !== null && shapeRes.volume !== undefined && (
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                  3D Volume
                </div>
                <div className="text-3xl font-extrabold text-emerald-300 font-mono mt-1">
                  {shapeRes.volume.toFixed(2)}
                  <span className="text-xs font-normal text-gray-400"> cubic units</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
