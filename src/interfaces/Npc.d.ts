export interface Npc {
  id?: string;
  name: string;
  lore: string;
  npcType: "Common" | "Boss" | "Enemy" | "History"
  goldDropRate: 0;
  goldAmount: 0;
  itemIds: string[];
  gameIds: string[];
}