export type Match = {
  id: string;
  clientId: string;
  name: string;
  createdAt: number;
};

export type Set = {
  id: string;
  matchId: string;
  index: number;
  createdAt: number;
};

export type EventPoint = {
  id: string;
  setId: string;
  x: number;
  y: number;
  createdAt: number;
};

