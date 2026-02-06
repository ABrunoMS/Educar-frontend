import { ProductDto, ContentDto } from "src/app/modules/apps/client-management/clients-list/core/_requests";

// Estrutura para criar/atualizar regionais
export interface RegionalDto {
  id?: string;
  name: string;
  secretarioRegionalId?: string;       // ID do Secretário Regional vinculado
  secretarioRegionalName?: string;     // Nome do Secretário Regional (para exibição)
  schoolCount?: number;                // Contagem de escolas na regional
}

// Estrutura para criar/atualizar subsecretarias
export interface SubsecretariaDto {
  id?: string;
  name: string;
  subsecretarioId?: string;            // ID do Subsecretário vinculado
  subsecretarioName?: string;          // Nome do Subsecretário (para exibição)
  regionais?: RegionalDto[];
  regionalCount?: number;              // Contagem de regionais
  totalSchools?: number;               // Total de escolas na subsecretaria
}

export interface ClientType {
  id?: string;
  name?: string;
  description?: string;
  partner?: string;
  partnerName?: string;
  contacts?: string;
  contract?: string;
  validity?: string;
  signatureDate?: string;
  implantationDate?: string;
  totalAccounts?: number;
  remainingAccounts?: number;
  secretarioId?: string;               // ID do Secretário Geral vinculado ao cliente
  secretarioName?: string;             // Nome do Secretário Geral (para exibição)
  macroRegionId?: string;
  macroRegionName?: string;
  // Estrutura nova - lista de subsecretarias com regionais aninhadas
  subsecretarias?: SubsecretariaDto[];
  products?: ProductDto[];
  contents?: ContentDto[];
  selectedProducts: string[];
  selectedContents: string[];
}