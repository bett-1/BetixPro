export interface ValidOdds {
  home: number;
  draw?: number;
  away: number;
}

export interface ValidEvent {
  id: string;
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  odds: ValidOdds;
  startTime: Date;
}
