export interface ContractBase {
  contractDurationInYears: number;
  contractSigningDate: Date | null;
  implementationDate: Date | null;
  totalAccounts: number;
  remainingAccounts: number;
  deliveryReport: string;
  status: 'Signed' | 'Expired' | 'Canceled';
  clientId: string;
}

export interface Contract extends ContractBase {
  id: string;
}

export interface ContractCreate extends ContractBase {
  gameId: string;
}