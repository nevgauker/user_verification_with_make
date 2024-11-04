// app/api/users/route.ts
import { db } from '@/db/db';
import { generateToken, generateTokenExpiry, hashPassword, verifyPassword } from '@/utils/authHelpers';
import { User } from '@/model/user';
import { errorResponse, successResponse } from '@/app/api/responses/responses';

type NewUserInput = {
    email: string;
    password: string;
    isSignIn?: boolean;
}

async function getUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
            if (err) reject(err);
            else resolve(row ? (row as User) : null);
        });
    });
}

async function createUser(newUser: Omit<User, 'id'>): Promise<User> {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO users (email, hashed_password, status, verification_token, token_expires_at) VALUES (?, ?, ?, ?, ?)`,
            [
                newUser.email,
                newUser.hashed_password,
                newUser.status,
                newUser.verification_token,
                newUser.token_expires_at,
            ],
            function (err) {
                if (err) reject(err);
                else resolve({ ...newUser, id: this.lastID });
            }
        );
    });
}



export async function POST(request: Request) {
    const { email, password, isSignIn = false }: NewUserInput = await request.json();
    const verificationToken = generateToken();
    const tokenExpiresAt = generateTokenExpiry();

    try {
        if (isSignIn) {
            const user = await getUserByEmail(email);
            if (user && verifyPassword(password, user.hashed_password)) {
                return successResponse({ message: 'Sign-in successful', user });
            }
            return errorResponse('Invalid email or password', 401);
        } else {
            const hashedPassword = hashPassword(password);
            const newUser = await createUser({
                email,
                hashed_password: hashedPassword,
                status: 'UNVERIFIED',
                verification_token: verificationToken,
                token_expires_at: tokenExpiresAt,
            });
            return successResponse({ message: 'User was created', newUser }, 201);
        }
    } catch (error) {
        return errorResponse('Error processing request', 500, error);
    }
}

// export async function GET() {
//     return new Promise((resolve) => {
//         db.all(`SELECT email FROM users`, (err, rows) => {
//             if (err) {
//                 resolve(errorResponse('Error fetching users', 500, err));
//             } else {
//                 resolve(successResponse({ users: rows }));
//             }
//         });
//     });
// }

// Type guard for User
// function isUser(obj: unknown): obj is User {
//     return (
//         typeof obj === 'object' &&
//         obj !== null &&
//         'id' in obj &&
//         'email' in obj &&
//         'hashed_password' in obj &&
//         'status' in obj &&
//         'verification_token' in obj &&
//         'token_expires_at' in obj
//     );
// }
