
export interface AuthState{
   user: {
    id: string
    name:string
    surname:string
    role:'ADMIN' | 'USER'
   } | null
   token: string|null
   isAuthenticated: boolean
}