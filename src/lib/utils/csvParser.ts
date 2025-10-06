/**
 * CSV Parser Utility for Marmaray Story Data
 * Loads and parses CSV files from the graphics-table directory
 */

export interface CSVRow {
  [key: string]: string | number;
}

/**
 * Parse CSV text into array of objects
 */
export function parseCSV(text: string): CSVRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  console.log('CSV Headers:', headers);

  const result = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row: CSVRow = {};

    headers.forEach((header, i) => {
      const value = values[i] || '';
      // Try to convert to number if it looks like a number
      const numValue = parseFloat(value);
      row[header] = isNaN(numValue) ? value : numValue;
    });

    console.log('Parsed row:', row);
    return row;
  });

  console.log('Final CSV data:', result);
  return result;
}

/**
 * Load CSV file from the media-assets/graphics-table directory
 */
export async function loadCSV(filename: string): Promise<CSVRow[]> {
  try {
    console.log(`Loading CSV file: ${filename}`);
    const response = await fetch(`/media-assets/graphics-table/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }
    const text = await response.text();
    console.log(`Raw CSV text for ${filename}:`, text);
    const parsed = parseCSV(text);
    console.log(`Parsed data for ${filename}:`, parsed);
    return parsed;
  } catch (error) {
    console.error(`Error loading CSV file ${filename}:`, error);
    return [];
  }
}

/**
 * Load all Marmaray-related CSV data
 */
export async function loadMarmarayData() {
  const [
    yearlyData,
    weeklyData,
    monthlyData,
    stationDeaths,
    outcomes,
    europeAverages,
    europeData,
    marmarayReporting,
    twitterWords,
  ] = await Promise.all([
    loadCSV('yıllara göre intihar vakaları.csv'),
    loadCSV('günlere göre intihar vakaları.csv'),
    loadCSV('aylara göre intihar vakaları.csv'),
    loadCSV('ölümlü vaka yaşanan duraklar.csv'),
    loadCSV('akıbetlere göre dağılım.csv'),
    loadCSV('ab ülkeleri ölüm ortalamaları.csv'),
    loadCSV('ab geneli intihar vakaları sayısı.csv'),
    loadCSV('marmaray kaçını duyurdu.csv'),
    loadCSV(
      'marmaray twitter hesabının intihar vakalarını duyururken en sık kullandığı kelimeler.csv'
    ),
  ]);

  return {
    yearly: yearlyData,
    weekly: weeklyData,
    monthly: monthlyData,
    stationDeaths,
    outcomes,
    europeAverages,
    europeData,
    marmarayReporting,
    twitterWords,
  };
}

/**
 * Load Metro-related CSV data
 */
export async function loadMetroData() {
  const [
    metroMonthly,
    metroWeekly,
    metroTimeOfDay,
    metroLines,
    metroStations,
    metroOutcomes,
  ] = await Promise.all([
    loadCSV('metro aylara göre intihar vakaları.csv'),
    loadCSV('metro günlere göre intihar vakaları.csv'),
    loadCSV('metro günün vakitlerine göre intihar vakaları.csv'),
    loadCSV('metro hatlara göre intihar vakaları.csv'),
    loadCSV('metro ölüm vaka yaşanan duraklar.csv'),
    loadCSV('metro vakalar.csv'),
  ]);

  return {
    monthly: metroMonthly,
    weekly: metroWeekly,
    timeOfDay: metroTimeOfDay,
    lines: metroLines,
    stations: metroStations,
    outcomes: metroOutcomes,
    // Backwards compatibility aliases (in case other code expects these keys)
    yearly: metroMonthly,
    daily: metroWeekly,
  };
}

// Global Solutions (Swarm) Data Types and Loader
export type GlobalMeasureType =
  | 'door' // Platform Kapısı
  | 'pit' // Ray Altı Çukur
  | 'led' // Mavi LED Işıklar
  | 'training' // Personel Eğitimi & Yapay Zeka İzleme
  | 'helpline'; // Yardım Hattı / Tabela

export interface GlobalSolutionRow {
  city: string;
  station: string;
  type: GlobalMeasureType;
  year: number;
  change: number; // intihar_change percentage; negative means decrease
}

function mapPreventionTypeToKey(raw: string): GlobalMeasureType | null {
  const t = (raw || '').toLowerCase();
  if (t.includes('platform kap')) return 'door';
  if (t.includes('ray alt')) return 'pit';
  if (t.includes('mavi led')) return 'led';
  if (
    t.includes('personel') ||
    t.includes('yapay zeka') ||
    t.includes('izleme')
  )
    return 'training';
  if (t.includes('yardım') || t.includes('tabela') || t.includes('helpline'))
    return 'helpline';
  return null;
}

export async function loadGlobalSolutionsData(): Promise<GlobalSolutionRow[]> {
  const rows = await loadCSV('metro_suicide_prevention_scenario.csv');
  return rows
    .map((r) => {
      const type = mapPreventionTypeToKey(String(r['prevention_type'] || ''));
      const yearNum = Number(r['year']);
      const changeNum = Number(r['intihar_change']);
      if (!type || isNaN(yearNum) || isNaN(changeNum)) return null;
      return {
        city: String(r['city'] || ''),
        station: String(r['station'] || ''),
        type,
        year: yearNum,
        change: changeNum,
      } as GlobalSolutionRow;
    })
    .filter(Boolean) as GlobalSolutionRow[];
}
