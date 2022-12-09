import {ProductCategory} from './product-category';

export interface Bootstrap {
  config: {
    name: string;
    document: string;
    fantasyName: string;
    city: string;
    district: string;
    cep: string;
    address: string;
    number: string;
    complement: string;
    phone: string;
  };
  productCategoryList: [ProductCategory];
  favoriteCategoryList: [ProductCategory];
}
