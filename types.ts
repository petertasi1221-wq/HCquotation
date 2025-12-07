export interface VersionData {
  ModelKey: string;
  Prices: Record<string, number>;
  PurchaseBonus: number;
  GiftNote: string;
  TaxScrap: number;
  ScrapRefund: number;
  TaxNew: number;
}

export type ModelData = Record<string, VersionData>;
export type PriceDatabase = Record<string, ModelData>;

export interface DiscountState {
  PurchaseBonus: boolean;
  TaxScrap: boolean;
  ScrapRefund: boolean;
  TaxNew: boolean;
}

export const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXy0hBS-sxSyOU7VNpyuQtOZBin6hAWw6Wt_RGOxTOIhlVXShbQp5ne0A48nYYrhQAByaP7fu8m0Fl/pub?gid=796832465&single=true&output=csv';