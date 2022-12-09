export interface StockHandlingReportResponse {
  list: {
    date: string;
    history: string;
    quantity: string;
    type: string;
    code: number;
    name: string;
    cost: string;
    saleValue: string;
    oldCost: string;
  }[];
  data: {
    total: number;
  };
}
