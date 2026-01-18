import type { Transaction } from '../types/transaction';

const STORAGE_KEY = 'household_transactions';

/**
 * LocalStorage に取引データを保存
 */
export function saveTransactions(transactions: Transaction[]): void {
    try {
        const json = JSON.stringify(transactions);
        localStorage.setItem(STORAGE_KEY, json);
    } catch (error) {
        console.error('LocalStorage への保存に失敗しました:', error);
    }
}

/**
 * LocalStorage から取引データを読み込み
 */
export function loadTransactions(): Transaction[] {
    try {
        const json = localStorage.getItem(STORAGE_KEY);

        if (!json) {
            return [];
        }

        const parsed = JSON.parse(json);

        if (!Array.isArray(parsed)) {
            console.warn('LocalStorage のデータ形式が不正です');
            return [];
        }

        return parsed as Transaction[];
    } catch (error) {
        console.error('LocalStorage からの読み込みに失敗しました:', error);
        return [];
    }
}

/**
 * LocalStorage のデータを全削除
 */
export function clearTransactions(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('LocalStorage のクリアに失敗しました:', error);
    }
}