import { PriceDatabase, SHEET_URL } from '../types';

export const fetchPriceData = async (): Promise<PriceDatabase> => {
  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const csvText = await response.text();
    return parseCSVData(csvText);
  } catch (error) {
    console.error("Failed to fetch data:", error);
    throw error;
  }
};

const parseCSVData = (csvText: string): PriceDatabase => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return {};

  const headers = lines[0].split(',').map(h => h.trim());
  const data: PriceDatabase = {};
  
  const requiredFields = ['PurchaseBonus', 'GiftNote', 'TaxScrap', 'ScrapRefund', 'TaxNew'];
  const indices: Record<string, number> = {};
  requiredFields.forEach(field => {
    indices[field] = headers.indexOf(field);
  });

  const priceTypes: string[] = [];
  headers.slice(3).forEach(h => {
    if (!requiredFields.includes(h)) {
      priceTypes.push(h);
    }
  });

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < 4) continue;

    const [modelKey, modelName, versionName] = values;

    if (!data[modelName]) {
      data[modelName] = {};
    }

    const prices: Record<string, number> = {};
    priceTypes.forEach(header => {
      const headerIndex = headers.indexOf(header);
      prices[header] = parseInt(values[headerIndex]) || 0;
    });

    data[modelName][versionName] = {
      ModelKey: modelKey,
      Prices: prices,
      PurchaseBonus: parseInt(values[indices.PurchaseBonus]) || 0,
      GiftNote: values[indices.GiftNote] || '',
      TaxScrap: parseInt(values[indices.TaxScrap]) || 0,
      ScrapRefund: parseInt(values[indices.ScrapRefund]) || 0,
      TaxNew: parseInt(values[indices.TaxNew]) || 0,
    };
  }
  return data;
};