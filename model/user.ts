
export type User = {
    id: number;
    email: string;
    hashed_password: string;
    status: string;
    verification_token: string;
    token_expires_at: string;
}
