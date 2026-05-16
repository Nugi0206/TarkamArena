export type UserRole = "PLAYER" | "CLUB_ADMIN" | "EO" | "ADMIN" | "VIEWER";
export type Region = "Cirebon" | "Indramayu" | "Majalengka" | "Kuningan";

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  region: Region;
  photographerInfo?: string;
  liveVideoInfo?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  createdAt: any;
  updatedAt: any;
}

export interface PlayerProfile {
  userId: string;
  nickname?: string;
  positions: string[];
  dominantFoot: "Left" | "Right" | "Both";
  height?: number;
  weight?: number;
  bio?: string;
  contactWhatsApp?: string;
  negotiationPrice?: string;
  highlightVideoUrl?: string;
  isOpenToJoin: boolean;
  clubId?: string;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
  };
  rating: number;
  achievements: string[];
}

export interface Club {
  id: string;
  name: string;
  logoUrl?: string;
  homeJerseyUrl?: string;
  awayJerseyUrl?: string;
  region: Region;
  adminId: string;
  squad: string[]; // Player IDs
  achievements: string[];
  instagramUrl?: string;
  whatsappNumber?: string;
  description?: string;
  stats: {
    wins: number;
    draws: number;
    losses: number;
  };
}

export interface MatchEvent {
  type: "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION";
  minute: number;
  playerId?: string;
  teamId?: string;
  description?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  venueId: string;
  scheduledAt: any;
  status: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED";
  homeScore: number;
  awayScore: number;
  matchDay?: number;
  motmId?: string;
  events?: MatchEvent[];
  photoUrls?: string[];
  flyerUrl?: string;
  ticketPrice?: number;
  photographerInfo?: string;
  liveStreamUrl?: string;
}

export interface Tournament {
  id: string;
  name: string;
  eoId: string;
  description: string;
  termsAndConditions: string;
  registrationFee: number;
  bannerUrl?: string;
  startDate: any;
  endDate: any;
  prize: string;
  status: "REGISTRATION" | "ONGOING" | "FINISHED";
  venueId?: string;
  location: string;
  region: Region;
  participants: string[]; // Club IDs
  bracketData?: any;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  lat?: number;
  lng?: number;
  grassCondition: string;
  facilities: string[];
  photoUrls: string[];
}

export interface Registration {
  id: string;
  tournamentId: string;
  clubName: string;
  managerName: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  contactWhatsApp: string;
  registeredAt: any;
}

export interface Sparing {
  id: string;
  clubName: string;
  venue: string;
  dateTime: any;
  status: "OPEN" | "FOUND";
  contactWhatsApp: string;
  region: string;
  postedBy: string;
}

export interface Ticket {
  id: string;
  tournamentId: string;
  buyerName: string;
  price: number;
  status: "PAID" | "USED";
  purchasedAt: any;
  userId?: string;
}
