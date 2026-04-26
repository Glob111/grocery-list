export interface GroceryList {
  id: number;
  name: string;
}

export interface GroceryItem {
  id: number;
  listId: number;
  title: string;
  amount: number;
  bought: boolean;
}

export type GroceryItemDraft = Pick<GroceryItem, 'title' | 'amount' | 'listId'>;
