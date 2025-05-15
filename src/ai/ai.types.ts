export type Category = 'history' | 'content' | 'prepare';

export interface Item {
  name: string;
  information: string;
  imageurl?: string;
}

export interface AIResponse {
  category: Category;
  message:
    | string
    | {
        Place?: Item[];
        'F&B'?: Item[];
        Activity?: Item[];
        Clothes?: Item[];
        ETC?: Item[];
      };
  summary: string;
  imageurl?: string;
}
