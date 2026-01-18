import type { Transaction, TransactionInput } from '../types/transaction';

/**
 * 新規取引を追加
 */
export function addTransaction(
    transactions: Transaction[],
    input: TransactionInput
): Transaction[] {
    const newTransaction: Transaction = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    return [...transactions, newTransaction];
}

/**
 * 既存取引を更新
 */
export function updateTransaction(
    transactions: Transaction[],
    id: string,
    input: Partial<TransactionInput>
): Transaction[] {
    return transactions.map(transaction => {
        if (transaction.id !== id) {
            return transaction;
        }

        return {
            ...transaction,
            ...input,
            updatedAt: Date.now(),
        };
    });
}

/**
 * 取引を削除
 */
export function deleteTransaction(
    transactions: Transaction[],
    id: string
): Transaction[] {
    return transactions.filter(transaction => transaction.id !== id);
}