
export type EquipmentStatus = 'normal' | 'attention' | 'critical' | 'offline';

export interface Equipment {
  id: number;
  name: string;
  type: string;
  temperature: number;
  status: EquipmentStatus;
  lastUpdate: string;
}

export const equipmentList: Equipment[] = [
  { id: 1, name: 'Freezer 01', type: 'Freezer', temperature: -18, status: 'normal', lastUpdate: 'Há 1 min' },
  { id: 2, name: 'Freezer 02', type: 'Freezer', temperature: -17, status: 'normal', lastUpdate: 'Há 2 min' },
  { id: 3, name: 'Freezer 03', type: 'Freezer', temperature: -6, status: 'critical', lastUpdate: 'Há 1 min' },
  { id: 4, name: 'Freezer 04', type: 'Freezer', temperature: -15, status: 'attention', lastUpdate: 'Há 3 min' },
  { id: 5, name: 'Freezer 05', type: 'Freezer', temperature: -19, status: 'normal', lastUpdate: 'Há 1 min' },
  { id: 6, name: 'Câmara fria 01', type: 'Câmara fria', temperature: -10, status: 'normal', lastUpdate: 'Há 1 min' },
  { id: 7, name: 'Câmara fria 02', type: 'Câmara fria', temperature: -8, status: 'normal', lastUpdate: 'Há 2 min' },
  { id: 8, name: 'Geladeira 01', type: 'Geladeira', temperature: 4, status: 'offline', lastUpdate: 'Sem comunicação' },
];
