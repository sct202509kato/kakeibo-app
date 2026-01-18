import { useState, useEffect } from 'react';
import type {
  Transaction,
  TransactionInput,
  TransactionType,
  Category,
} from './types/transaction';
import { CATEGORIES } from "./types/transaction";
import {
  addTransaction,
  updateTransaction,
  deleteTransaction
} from './utils/transactionHelpers';
import {
  loadTransactions,
  saveTransactions
} from './utils/storage';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(
    () => loadTransactions()
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  // 初期読み込み
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // 自動保存
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  const handleAdd = (input: TransactionInput) => {
    setTransactions(prev => addTransaction(prev, input));
  };

  const handleUpdate = (id: string, input: Partial<TransactionInput>) => {
    setTransactions(prev => updateTransaction(prev, id, input));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('本当に削除しますか？')) {
      setTransactions(prev => deleteTransaction(prev, id));
    }
  };

  const handleStartEdit = (id: string) => {
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const sortedTransactions = [...transactions].sort((a, b) => {
    return b.date.localeCompare(a.date);
  });

  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<Category, number>);

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => {
    return b[1] - a[1];
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>家計簿アプリ</h1>

      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <SummaryCard label="収入" amount={totalIncome} color="#4CAF50" />
        <SummaryCard label="支出" amount={totalExpense} color="#F44336" />
        <SummaryCard label="収支" amount={balance} color="#2196F3" />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2>取引を追加</h2>
        <TransactionForm onSubmit={handleAdd} categories={CATEGORIES} />
      </div>

      <div>
        <h2>取引履歴（{transactions.length}件）</h2>
        <TransactionList
          transactions={sortedTransactions}
          editingId={editingId}
          onStartEdit={handleStartEdit}
          onUpdate={handleUpdate}
          onCancelEdit={handleCancelEdit}
          onDelete={handleDelete}
          categories={CATEGORIES}
        />
      </div>

      <div style={{ marginTop: '24px' }}>
        <h2>カテゴリ別集計（支出）</h2>
        <CategorySummary
          categories={sortedCategories}
          totalExpense={totalExpense}
        />
      </div>
    </div>
  );
}

function SummaryCard({ label, amount, color }: {
  label: string;
  amount: number;
  color: string
}) {
  return (
    <div style={{
      flex: '1',
      minWidth: '200px',
      padding: '16px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <div style={{ fontSize: '14px', color: '#666' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>
        ¥{amount.toLocaleString()}
      </div>
    </div>
  );
}

function TransactionForm({ onSubmit, categories }: {
  onSubmit: (input: TransactionInput) => void;
  categories: readonly string[];
}) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [memo, setMemo] = useState('');

  const handleSubmit = () => {
    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('金額は1円以上の整数を入力してください');
      return;
    }

    onSubmit({
      date,
      type,
      amount: amountNum,
      category: category as Category,
      memo,
    });

    setAmount('');
    setMemo('');
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      alignItems: 'end'
    }}>
      <label>
        日付
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ display: 'block', marginTop: '4px' }}
        />
      </label>

      <label>
        種別
        <select
          value={type}
          onChange={e => setType(e.target.value as TransactionType)}
          style={{ display: 'block', marginTop: '4px' }}
        >
          <option value="expense">支出</option>
          <option value="income">収入</option>
        </select>
      </label>

      <label>
        金額
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="1"
          placeholder="1000"
          style={{ display: 'block', marginTop: '4px', width: '120px' }}
        />
      </label>

      <label>
        カテゴリ
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ display: 'block', marginTop: '4px' }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </label>

      <label>
        メモ
        <input
          type="text"
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="コンビニでランチ"
          style={{ display: 'block', marginTop: '4px', width: '200px' }}
        />
      </label>

      <button onClick={handleSubmit} style={{
        padding: '8px 24px',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        追加
      </button>
    </div>
  );
}

function TransactionList({
  transactions,
  editingId,
  onStartEdit,
  onUpdate,
  onCancelEdit,
  onDelete,
  categories
}: {
  transactions: Transaction[];
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onUpdate: (id: string, input: Partial<TransactionInput>) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  categories: readonly string[];
}) {
  if (transactions.length === 0) {
    return <p style={{ color: '#999' }}>取引データがありません</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#fff'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>日付</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>種別</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>カテゴリ</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>金額</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>メモ</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => {
            const isEditing = editingId === transaction.id;

            if (isEditing) {
              return (
                <EditRow
                  key={transaction.id}
                  transaction={transaction}
                  categories={categories}
                  onSave={onUpdate}
                  onCancel={onCancelEdit}
                />
              );
            }

            return (
              <tr key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{transaction.date}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: transaction.type === 'income' ? '#E8F5E9' : '#FFEBEE',
                    color: transaction.type === 'income' ? '#2E7D32' : '#C62828'
                  }}>
                    {transaction.type === 'income' ? '収入' : '支出'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{transaction.category}</td>
                <td style={{
                  padding: '12px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: transaction.type === 'income' ? '#4CAF50' : '#F44336'
                }}>
                  {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                </td>
                <td style={{ padding: '12px', color: '#666' }}>
                  {transaction.memo || '—'}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => onStartEdit(transaction.id)}
                      style={{
                        padding: '6px 16px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}
                    >
                      編集
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(transaction.id);
                      }}
                      style={{
                        padding: '6px 16px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EditRow({ transaction, categories, onSave, onCancel }: {
  transaction: Transaction;
  categories: readonly string[];
  onSave: (id: string, input: Partial<TransactionInput>) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(transaction.date);
  const [type, setType] = useState(transaction.type);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [category, setCategory] = useState(transaction.category);
  const [memo, setMemo] = useState(transaction.memo);

  const handleSave = () => {
    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('金額は1円以上の整数を入力してください');
      return;
    }

    onSave(transaction.id, {
      date,
      type,
      amount: amountNum,
      category: category as Category,
      memo,
    });
  };

  return (
    <tr style={{ backgroundColor: '#FFF9C4', borderBottom: '1px solid #eee' }}>
      <td style={{ padding: '8px' }}>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ width: '100%', padding: '4px' }}
        />
      </td>
      <td style={{ padding: '8px' }}>
        <select
          value={type}
          onChange={e => setType(e.target.value as TransactionType)}
          style={{ width: '100%', padding: '4px' }}
        >
          <option value="expense">支出</option>
          <option value="income">収入</option>
        </select>
      </td>
      <td style={{ padding: '8px' }}>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as Category)}
          style={{ width: '100%', padding: '4px' }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </td>
      <td style={{ padding: '8px' }}>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="1"
          style={{ width: '100%', padding: '4px', textAlign: 'right' }}
        />
      </td>
      <td style={{ padding: '8px' }}>
        <input
          type="text"
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="メモ"
          style={{ width: '100%', padding: '4px' }}
        />
      </td>
      <td style={{ padding: '8px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '6px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            保存
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '6px 16px',
              backgroundColor: '#9E9E9E',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            キャンセル
          </button>
        </div>
      </td>
    </tr>
  );
}

function CategorySummary({ categories, totalExpense }: {
  categories: [string, number][];
  totalExpense: number;
}) {
  if (categories.length === 0) {
    return <p style={{ color: '#999' }}>支出データがありません</p>;
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>カテゴリ</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>金額</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>割合</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(([category, amount]) => {
            const percentage = totalExpense > 0
              ? Math.round((amount / totalExpense) * 100)
              : 0;

            return (
              <tr key={category} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '12px' }}>{category}</td>
                <td style={{
                  padding: '12px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: '#F44336'
                }}>
                  ¥{amount.toLocaleString()}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                    <div style={{
                      flex: '0 0 100px',
                      height: '20px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: '#F44336',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '14px', color: '#666', minWidth: '40px' }}>
                      {percentage}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}