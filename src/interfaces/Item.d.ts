export interface Item {
  name: string;
  lore: string;
  itemType: 'Common' | 'Equipment' | 'Consumable' | 'CraftingMaterial';
  itemRarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Artifact';
  sellValue: number;
  dismantleId: string;
  reference2D: string;
  reference3D: string;
  dropRate: number;
}