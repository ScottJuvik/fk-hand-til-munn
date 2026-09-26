export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: number
          name: string
          position: string
          rating: number
          image_url: string | null
          nationality: string | null
          club: string
          created_at: string
          updated_at: string
          shirt_number: number | null
          weak_foot: number | null
          skill_moves: number | null
          attacking_work_rate: string | null
          defensive_work_rate: string | null
          nickname: string | null
          alternate_positions: string | null
          specialties: string | null
          is_icon: boolean
        }
        Insert: {
          id?: number
          name: string
          position: string
          rating: number
          image_url?: string | null
          nationality?: string | null
          club?: string
          created_at?: string
          updated_at?: string
          shirt_number?: number | null
          weak_foot?: number | null
          skill_moves?: number | null
          attacking_work_rate?: string | null
          defensive_work_rate?: string | null
          nickname?: string | null
          alternate_positions?: string | null
          specialties?: string | null
          is_icon?: boolean
        }
        Update: {
          id?: number
          name?: string
          position?: string
          rating?: number
          image_url?: string | null
          nationality?: string | null
          club?: string
          created_at?: string
          updated_at?: string
          shirt_number?: number | null
          weak_foot?: number | null
          skill_moves?: number | null
          attacking_work_rate?: string | null
          defensive_work_rate?: string | null
          nickname?: string | null
          alternate_positions?: string | null
          specialties?: string | null
          is_icon?: boolean
        }
      }
      player_stats: {
        Row: {
          id: number
          player_id: number
          pace: number
          shooting: number
          passing: number
          dribbling: number
          defending: number
          physical: number
          acceleration: number
          sprint_speed: number
          positioning: number
          finishing: number
          shot_power: number
          long_shots: number
          vision: number
          crossing: number
          free_kick: number
          short_passing: number
          long_passing: number
          curve: number
          agility: number
          balance: number
          reactions: number
          ball_control: number
          composure: number
          interceptions: number
          heading_accuracy: number
          marking: number
          standing_tackle: number
          sliding_tackle: number
          jumping: number
          stamina: number
          strength: number
          aggression: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          player_id: number
          pace: number
          shooting: number
          passing: number
          dribbling: number
          defending: number
          physical: number
          acceleration: number
          sprint_speed: number
          positioning: number
          finishing: number
          shot_power: number
          long_shots: number
          vision: number
          crossing: number
          free_kick: number
          short_passing: number
          long_passing: number
          curve: number
          agility: number
          balance: number
          reactions: number
          ball_control: number
          composure: number
          interceptions: number
          heading_accuracy: number
          marking: number
          standing_tackle: number
          sliding_tackle: number
          jumping: number
          stamina: number
          strength: number
          aggression: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          player_id?: number
          pace?: number
          shooting?: number
          passing?: number
          dribbling?: number
          defending?: number
          physical?: number
          acceleration?: number
          sprint_speed?: number
          positioning?: number
          finishing?: number
          shot_power?: number
          long_shots?: number
          vision?: number
          crossing?: number
          free_kick?: number
          short_passing?: number
          long_passing?: number
          curve?: number
          agility?: number
          balance?: number
          reactions?: number
          ball_control?: number
          composure?: number
          interceptions?: number
          heading_accuracy?: number
          marking?: number
          standing_tackle?: number
          sliding_tackle?: number
          jumping?: number
          stamina?: number
          strength?: number
          aggression?: number
          created_at?: string
          updated_at?: string
        }
      }
      player_statistics: {
        Row: {
          id: number
          player_id: number
          matches_played: number
          goals: number
          assists: number
          yellow_cards: number
          red_cards: number
          minutes_played: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          player_id: number
          matches_played?: number
          goals?: number
          assists?: number
          yellow_cards?: number
          red_cards?: number
          minutes_played?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          player_id?: number
          matches_played?: number
          goals?: number
          assists?: number
          yellow_cards?: number
          red_cards?: number
          minutes_played?: number
          created_at?: string
          updated_at?: string
        }
      }
      lineups: {
        Row: {
          id: number
          name: string
          formation: string
          match_date: string | null
          match_id: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          formation: string
          match_date?: string | null
          match_id?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          formation?: string
          match_date?: string | null
          match_id?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lineup_players: {
        Row: {
          id: number
          lineup_id: number
          player_id: number
          position: string
          position_order: number
          is_substitute: boolean
          created_at: string
        }
        Insert: {
          id?: number
          lineup_id: number
          player_id: number
          position: string
          position_order: number
          is_substitute?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          lineup_id?: number
          player_id?: number
          position?: string
          position_order?: number
          is_substitute?: boolean
          created_at?: string
        }
      }
      band_members: {
        Row: {
          player_id: number
          instrument: string
          band_bio: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          player_id: number
          instrument: string
          band_bio?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          player_id?: number
          instrument?: string
          band_bio?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      band_shows: {
        Row: {
          id: number
          venue: string
          show_date: string
          show_time: string
          location: string
          additional_info: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          venue: string
          show_date: string
          show_time: string
          location: string
          additional_info?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          venue?: string
          show_date?: string
          show_time?: string
          location?: string
          additional_info?: string
          created_at?: string
          updated_at?: string
        }
      }
      booking_requests: {
        Row: {
          id: number
          name: string
          email: string
          phone: string | null
          event_date: string | null
          event_location: string | null
          message: string
          email_sent: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          phone?: string | null
          event_date?: string | null
          event_location?: string | null
          message: string
          email_sent?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          phone?: string | null
          event_date?: string | null
          event_location?: string | null
          message?: string
          email_sent?: boolean
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      leagues: {
        Row: {
          id: number
          name: string
          season: string
          type: string
          year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          season: string
          type: string
          year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          season?: string
          type?: string
          year?: number
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: number
          name: string
          short_name: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          short_name?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          short_name?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: number
          league_id: number
          week: number
          match_date: string
          match_time: string
          home_team_id: number
          away_team_id: number
          home_score: number | null
          away_score: number | null
          location: string
          played: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          league_id: number
          week: number
          match_date: string
          match_time: string
          home_team_id: number
          away_team_id: number
          home_score?: number | null
          away_score?: number | null
          location: string
          played?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          league_id?: number
          week?: number
          match_date?: string
          match_time?: string
          home_team_id?: number
          away_team_id?: number
          home_score?: number | null
          away_score?: number | null
          location?: string
          played?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      standings: {
        Row: {
          id: number
          league_id: number
          team_id: number
          position: number
          played: number
          won: number
          drawn: number
          lost: number
          goals_for: number
          goals_against: number
          goal_difference: number
          points: number
          qualification_group: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          league_id: number
          team_id: number
          position: number
          played: number
          won: number
          drawn: number
          lost: number
          goals_for: number
          goals_against: number
          goal_difference: number
          points: number
          qualification_group?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          league_id?: number
          team_id?: number
          position?: number
          played?: number
          won?: number
          drawn?: number
          lost?: number
          goals_for?: number
          goals_against?: number
          goal_difference?: number
          points?: number
          qualification_group?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      news_articles: {
        Row: {
          id: number
          title: string
          excerpt: string
          content: string
          image: string | null
          author: string | null
          published_at: string | null
          is_featured: boolean
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          excerpt: string
          content: string
          image?: string | null
          author?: string | null
          published_at?: string | null
          is_featured?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          excerpt?: string
          content?: string
          image?: string | null
          author?: string | null
          published_at?: string | null
          is_featured?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Player = Database["public"]["Tables"]["players"]["Row"]
export type PlayerStats = Database["public"]["Tables"]["player_stats"]["Row"]
export type PlayerStatistics = Database["public"]["Tables"]["player_statistics"]["Row"]
export type Lineup = Database["public"]["Tables"]["lineups"]["Row"]
export type LineupPlayer = Database["public"]["Tables"]["lineup_players"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]
export type League = Database["public"]["Tables"]["leagues"]["Row"]
export type Team = Database["public"]["Tables"]["teams"]["Row"]
export type Match = Database["public"]["Tables"]["matches"]["Row"]
export type Standing = Database["public"]["Tables"]["standings"]["Row"]
export type NewsArticleRow = Database["public"]["Tables"]["news_articles"]["Row"]

export interface PlayerWithStats extends Player {
  stats: Omit<PlayerStats, "id" | "player_id" | "created_at" | "updated_at">
}
