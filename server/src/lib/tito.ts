export interface TitoAccountInfo {
  authenticated: boolean
  access_token: string
  lookup_mode: string
  accounts: string[]
}

export interface TitoRegistration {
  _type: 'registration'
  id: number
  slug: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface TitoMeta {
  meta: {
    current_page: number | null
    next_page: number | null
    total_pages: number
    total_count: number
    per_page: number
  }
}

export interface TitoTicket {
  _type: 'ticket'
  id: number
  slug: string
  email: string | null
  registration_email: string
  name: string
  created_at: string
  updated_at: string
}

export interface TitoRecord {
  emailHash: string
  name: string
}

export interface TitoEvent {
  id: number
  created_at: string
  updated_at: string
  title: string
  // ...
}

export interface TitoRelease {
  id: number
  created_at: string
  updated_at: string
  slug: string
  title: string
  // ...
}
