// カテゴリの定数配列
export const CATEGORIES = [
    '食費',
    '日用品',
    '交通費',
    '娯楽',
    '医療',
    '家賃',
    '光熱費',
    '通信費',
    '給料',
    'その他',
] as const;

// 配列から型を生成
export type Category = typeof CATEGORIES[number];

// 取引の種別
export type TransactionType = 'income' | 'expense';

// 取引データ本体
export type Transaction = {
    id: string;
    date: string;
    type: TransactionType;
    amount: number;
    category: Category;
    memo: string;
    createdAt: number;
    updatedAt: number;
};

// 新規作成時の入力データ
export type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;