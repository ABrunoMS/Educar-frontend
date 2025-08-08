export interface ClientType {
  id?: string;
  name?: string;
  description?: string;
  partner?: string;
  contacts?: string;
  contract?: string;
  validity?: string;
  signatureDate?: string;
  implantationDate?: string;
  totalAccounts?: number;
  remainingAccounts?: number;
  secretary?: string;
  subSecretary?: string;
  regional?: string;
}

export interface ClientContactType {
  name: string;
  id: string;
}

export interface ClientContractType {
  name: string;
  id: string;
}