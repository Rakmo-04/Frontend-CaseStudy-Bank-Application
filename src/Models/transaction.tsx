// models/Page.ts
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// models/Transaction.ts
export interface Transaction {
  id: number;
  accountId: number;
  type: string;        // e.g. "DEBIT" or "CREDIT"
  amount: number;
  description: string;
  transactionDate: string; // ISO string
}

