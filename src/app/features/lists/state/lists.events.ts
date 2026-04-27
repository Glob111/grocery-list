import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { GroceryItem, GroceryItemDraft, GroceryList } from '@app/core/models/grocery.models';

/* eslint-disable import/exports-last -- discriminated unions + guards in one module */

/** UI → facade commands (no callbacks). */
export type ListsIntent =
  | { type: 'CATALOG_START_AUTO_REFRESH' }
  | { type: 'REDIRECT_DEFAULT_LIST' }
  | { type: 'LIST_NEW_SUBMIT'; name: string; correlationId?: string }
  | { type: 'LIST_EDIT_BIND'; route: ActivatedRoute; form: FormGroup }
  | { type: 'LIST_EDIT_SAVE'; name: string; correlationId?: string }
  | { type: 'LIST_EDIT_DELETE'; correlationId?: string }
  | { type: 'LIST_DETAIL_BIND'; route: ActivatedRoute }
  | { type: 'LIST_DETAIL_ADD_ITEM'; draft: GroceryItemDraft }
  | {
      type: 'LIST_DETAIL_SAVE_ITEM';
      id: number;
      body: { title: string; amount: number };
      correlationId?: string;
    }
  | { type: 'LIST_DETAIL_BOUGHT'; id: number; bought: boolean }
  | { type: 'LIST_DETAIL_DELETE_ITEM'; id: number };

/** Facade → UI outcomes (emit on the same bus as intents). */
export type ListsResult =
  | { type: 'LIST_NEW_SUCCEEDED'; list: GroceryList; correlationId?: string }
  | { type: 'LIST_NEW_FAILED'; correlationId?: string }
  | { type: 'LIST_EDIT_LOADED'; list: GroceryList }
  | { type: 'LIST_EDIT_LOAD_FAILED' }
  | { type: 'LIST_EDIT_SAVE_SUCCEEDED'; list: GroceryList; correlationId?: string }
  | { type: 'LIST_EDIT_SAVE_FAILED'; correlationId?: string }
  | { type: 'LIST_EDIT_DELETE_SUCCEEDED'; correlationId?: string }
  | { type: 'LIST_EDIT_DELETE_FAILED'; correlationId?: string }
  | { type: 'LIST_DETAIL_LOADED'; list: GroceryList; items: GroceryItem[] }
  | { type: 'LIST_DETAIL_LOAD_FAILED' }
  | { type: 'LIST_DETAIL_ITEM_CREATED'; item: GroceryItem }
  | { type: 'LIST_DETAIL_ADD_ITEM_FAILED' }
  | { type: 'LIST_DETAIL_ITEM_SAVED'; id: number; item: GroceryItem; correlationId?: string }
  | { type: 'LIST_DETAIL_ITEM_SAVE_FAILED'; id: number; correlationId?: string }
  | { type: 'LIST_DETAIL_ITEM_BOUGHT_UPDATED'; id: number; item: GroceryItem }
  | { type: 'LIST_DETAIL_ITEM_BOUGHT_FAILED'; id: number }
  | { type: 'LIST_DETAIL_ITEM_DELETED'; id: number }
  | { type: 'LIST_DETAIL_ITEM_DELETE_FAILED'; id: number };

/** Full bus payload: commands from components and results from {@link ListsFacade}. */
export type ListsBusMessage = ListsIntent | ListsResult;

/** Result `type` literals for the new-list screen (use with `filterBusMessageByTypes`). */
export const LISTS_NEW_RESULT_TYPES = ['LIST_NEW_SUCCEEDED', 'LIST_NEW_FAILED'] as const;

/** Result events for the list edit screen. */
export type ListsEditResult =
  | { type: 'LIST_EDIT_LOADED'; list: GroceryList }
  | { type: 'LIST_EDIT_LOAD_FAILED' }
  | { type: 'LIST_EDIT_SAVE_SUCCEEDED'; list: GroceryList; correlationId?: string }
  | { type: 'LIST_EDIT_SAVE_FAILED'; correlationId?: string }
  | { type: 'LIST_EDIT_DELETE_SUCCEEDED'; correlationId?: string }
  | { type: 'LIST_EDIT_DELETE_FAILED'; correlationId?: string };

export const LISTS_EDIT_RESULT_TYPES = [
  'LIST_EDIT_LOADED',
  'LIST_EDIT_LOAD_FAILED',
  'LIST_EDIT_SAVE_SUCCEEDED',
  'LIST_EDIT_SAVE_FAILED',
  'LIST_EDIT_DELETE_SUCCEEDED',
  'LIST_EDIT_DELETE_FAILED',
] as const satisfies readonly ListsEditResult['type'][];

/** Result events for the list detail screen (handled in `ListDetail`). */
export type ListsDetailResult =
  | { type: 'LIST_DETAIL_LOADED'; list: GroceryList; items: GroceryItem[] }
  | { type: 'LIST_DETAIL_LOAD_FAILED' }
  | { type: 'LIST_DETAIL_ITEM_CREATED'; item: GroceryItem }
  | { type: 'LIST_DETAIL_ADD_ITEM_FAILED' }
  | { type: 'LIST_DETAIL_ITEM_SAVED'; id: number; item: GroceryItem; correlationId?: string }
  | { type: 'LIST_DETAIL_ITEM_SAVE_FAILED'; id: number; correlationId?: string }
  | { type: 'LIST_DETAIL_ITEM_BOUGHT_UPDATED'; id: number; item: GroceryItem }
  | { type: 'LIST_DETAIL_ITEM_BOUGHT_FAILED'; id: number }
  | { type: 'LIST_DETAIL_ITEM_DELETED'; id: number }
  | { type: 'LIST_DETAIL_ITEM_DELETE_FAILED'; id: number };

export const LISTS_DETAIL_RESULT_TYPES = [
  'LIST_DETAIL_LOADED',
  'LIST_DETAIL_LOAD_FAILED',
  'LIST_DETAIL_ITEM_CREATED',
  'LIST_DETAIL_ADD_ITEM_FAILED',
  'LIST_DETAIL_ITEM_SAVED',
  'LIST_DETAIL_ITEM_SAVE_FAILED',
  'LIST_DETAIL_ITEM_BOUGHT_UPDATED',
  'LIST_DETAIL_ITEM_BOUGHT_FAILED',
  'LIST_DETAIL_ITEM_DELETED',
  'LIST_DETAIL_ITEM_DELETE_FAILED',
] as const satisfies readonly ListsDetailResult['type'][];

const INTENT_TYPES = new Set<ListsIntent['type']>([
  'CATALOG_START_AUTO_REFRESH',
  'REDIRECT_DEFAULT_LIST',
  'LIST_NEW_SUBMIT',
  'LIST_EDIT_BIND',
  'LIST_EDIT_SAVE',
  'LIST_EDIT_DELETE',
  'LIST_DETAIL_BIND',
  'LIST_DETAIL_ADD_ITEM',
  'LIST_DETAIL_SAVE_ITEM',
  'LIST_DETAIL_BOUGHT',
  'LIST_DETAIL_DELETE_ITEM',
]);

export function isListsIntent(m: ListsBusMessage): m is ListsIntent {
  return INTENT_TYPES.has(m.type as ListsIntent['type']);
}

export function isListsResult(m: ListsBusMessage): m is ListsResult {
  return !isListsIntent(m);
}
