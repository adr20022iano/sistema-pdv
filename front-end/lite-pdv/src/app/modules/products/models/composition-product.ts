export interface CompositionProduct {
  /** Código do item da produção do produto */
  productionCode: number;

  /** Código do produto que faz parte da produção */
  productCode: number;

  quantity: number;
  name: string;
  unit: string;
  value: number;
}
