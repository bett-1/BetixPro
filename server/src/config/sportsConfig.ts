export type SportsConfigItem = {
  key: string;
  label: string;
  sidebarLabel: string;
  active: boolean;
  priority: 1 | 2 | 3;
  alternateKeys?: string[];
};

export const SPORTS_CONFIG: readonly SportsConfigItem[] = [
  {
    key: "soccer_epl",
    label: "Football - EPL",
    sidebarLabel: "Football",
    active: true,
    priority: 1,
  },
  {
    key: "soccer_spain_la_liga",
    label: "Football - La Liga",
    sidebarLabel: "Football",
    active: true,
    priority: 1,
  },
  {
    key: "soccer_italy_serie_a",
    label: "Football - Serie A",
    sidebarLabel: "Football",
    active: true,
    priority: 1,
  },
  {
    key: "soccer_germany_bundesliga",
    label: "Football - Bundesliga",
    sidebarLabel: "Football",
    active: true,
    priority: 1,
    alternateKeys: ["soccer_germany_bundesliga2", "soccer_germany_dfb_pokal"],
  },
  {
    key: "soccer_france_ligue_one",
    label: "Football - Ligue 1",
    sidebarLabel: "Football",
    active: true,
    priority: 1,
  },
  {
    key: "basketball_nba",
    label: "Basketball - NBA",
    sidebarLabel: "Basketball",
    active: true,
    priority: 2,
    alternateKeys: ["basketball_euroleague", "basketball_wnba"],
  },
  {
    key: "tennis_atp_french_open",
    label: "Tennis",
    sidebarLabel: "Tennis",
    active: true,
    priority: 2,
    alternateKeys: ["tennis_atp_italian_open", "tennis_wta_italian_open"],
  },
  {
    key: "americanfootball_nfl",
    label: "American Football",
    sidebarLabel: "American Football",
    active: true,
    priority: 3,
    alternateKeys: ["americanfootball_nfl_preseason", "americanfootball_ufl"],
  },
  {
    key: "cricket_icc_world_cup",
    label: "Cricket",
    sidebarLabel: "Cricket",
    active: true,
    priority: 3,
    alternateKeys: ["cricket_ipl", "cricket_odi", "cricket_test_match"],
  },
  {
    key: "icehockey_nhl",
    label: "Ice Hockey",
    sidebarLabel: "Ice Hockey",
    active: true,
    priority: 2,
    alternateKeys: ["icehockey_ahl"],
  },
  {
    key: "rugbyleague_nrl",
    label: "Rugby Union",
    sidebarLabel: "Rugby Union",
    active: true,
    priority: 3,
    alternateKeys: ["rugbyleague_nrl_state_of_origin"],
  },
  {
    key: "boxing",
    label: "Boxing / MMA",
    sidebarLabel: "Boxing / MMA",
    active: true,
    priority: 2,
    alternateKeys: ["boxing_boxing"],
  },
  {
    key: "mma_mixed_martial_arts",
    label: "MMA",
    sidebarLabel: "Boxing / MMA",
    active: true,
    priority: 2,
  },
  {
    key: "baseball_mlb",
    label: "Baseball",
    sidebarLabel: "Baseball",
    active: true,
    priority: 3,
    alternateKeys: ["baseball_kbo", "baseball_npb"],
  },
  {
    key: "volleyball_womens_volleyball_nations_league",
    label: "Volleyball",
    sidebarLabel: "Volleyball",
    active: true,
    priority: 3,
  },
  {
    key: "tabletennis",
    label: "Table Tennis",
    sidebarLabel: "Table Tennis",
    active: true,
    priority: 3,
  },
  {
    key: "golf_pga_championship",
    label: "Golf",
    sidebarLabel: "Golf",
    active: true,
    priority: 3,
    alternateKeys: [
      "golf_pga_championship_winner",
      "golf_the_open_championship_winner",
      "golf_us_open_winner",
    ],
  },
  {
    key: "snooker",
    label: "Snooker",
    sidebarLabel: "Snooker",
    active: true,
    priority: 3,
  },
  {
    key: "darts",
    label: "Darts",
    sidebarLabel: "Darts",
    active: true,
    priority: 3,
  },
] as const;

export const DAILY_CREDIT_BUDGET = 600;
export const CREDITS_PER_CALL = 1;
export const MAX_DAILY_CALLS = Math.floor(DAILY_CREDIT_BUDGET / CREDITS_PER_CALL);
export const TOTAL_MONTHLY_CREDITS = 20_000;
export const SEVEN_DAY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
