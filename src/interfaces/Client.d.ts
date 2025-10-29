import { ProductDto, ContentDto } from "src/app/modules/apps/client-management/clients-list/core/_requests";

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
  secretaryId?: string;
  subSecretary?: string;
  regional?: string;
  products?: ProductDto[];
  contents?: ContentDto[];
  selectedProducts: string[];
  selectedContents: string[];
}