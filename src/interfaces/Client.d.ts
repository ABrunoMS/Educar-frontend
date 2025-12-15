import { ProductDto, ContentDto } from "src/app/modules/apps/client-management/clients-list/core/_requests";

// Estrutura para criar/atualizar regionais
export interface RegionalDto {
  id?: string;
  name: string;
}

// Estrutura para criar/atualizar subsecretarias
export interface SubsecretariaDto {
  id?: string;
  name: string;
  regionais?: RegionalDto[];
}

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
  // Estrutura nova - lista de subsecretarias com regionais aninhadas
  subsecretarias?: SubsecretariaDto[];
  products?: ProductDto[];
  contents?: ContentDto[];
  selectedProducts: string[];
  selectedContents: string[];
}