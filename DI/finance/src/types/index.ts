export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    category: string;
    date: string;
    description: string;
    file_url?: string;
    created_at?: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'user_id' | 'created_at'>;

export interface FileAsset {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'pdf' | 'audio' | 'other';
}
