export interface FavoriteCabin {
  cabinId: string;
  time: Date;
}

export interface AuthUser {
  id: string | null;
  username: string | null;
  role: string | null;
}

export interface UserData {
  favoriteCabins?: FavoriteCabin[];
}
