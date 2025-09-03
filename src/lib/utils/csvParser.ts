export interface CountryData {
  country: string;
  value: number;
}

export function parseCSVData(csvContent: string): CountryData[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      country: values[0].trim(),
      value: parseFloat(values[1].trim())
    };
  }).filter(item => !isNaN(item.value));
}

// Sample data for testing
export const sampleEuropeanData: CountryData[] = [
  { country: 'AUT', value: 89.2 },
  { country: 'BEL', value: 93.8 },
  { country: 'BGR', value: 21.8 },
  { country: 'CHE', value: 128.9 },
  { country: 'CZE', value: 199.5 },
  { country: 'DEU', value: 765.7 },
  { country: 'DNK', value: 23.9 },
  { country: 'EST', value: 3.3 },
  { country: 'GRC', value: 3.1 },
  { country: 'ESP', value: 123 },
  { country: 'FIN', value: 51.5 },
  { country: 'FRA', value: 296.6 },
  { country: 'HRV', value: 21.9 },
  { country: 'HUN', value: 101.2 },
  { country: 'IRL', value: 5.1 },
  { country: 'ITA', value: 135 },
  { country: 'LTU', value: 4 },
  { country: 'LUX', value: 3.1 },
  { country: 'LVA', value: 7.6 },
  { country: 'NLD', value: 200.2 },
  { country: 'NOR', value: 10.9 },
  { country: 'POL', value: 86.5 },
  { country: 'PRT', value: 42.5 },
  { country: 'ROU', value: 45 },
  { country: 'SWE', value: 73.5 },
  { country: 'SVN', value: 16.8 },
  { country: 'SVK', value: 56.1 }
];

