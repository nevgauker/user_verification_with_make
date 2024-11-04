import { generateInvalidTokenExpiry, generateToken, generateTokenExpiry, hashPassword } from '@/utils/authHelpers';
// app/api/users/route.ts
import { db } from '@/db/db'
import { verifyPassword } from '@/utils/authHelpers';
import { NextResponse } from 'next/server'


interface User {
    id: number;
    email: string;
    hashed_password: string;
    status: string;
    verification_token: string;
    token_expires_at: string;
}


export async function POST(request: Request) {
    const { email, password, isSignIn = false } = await request.json()
    const verificationToken = generateToken()
    const tokenExpiresAt = generateInvalidTokenExpiry()//   generateTokenExpiry()
    return new Promise((resolve) => {

        if (isSignIn) {
            db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user: unknown) => {
                if (err) {
                    console.error('Error fetching user:', err);
                    return resolve(NextResponse.json({ message: 'Error fetching user', err }, { status: 500 }));
                }
                if (user && isUser(user)) {

                    const theUser: User = {
                        id: user.id,
                        email: user.email,
                        hashed_password: user.hashed_password,
                        status: user.status,
                        verification_token: user.verification_token,
                        token_expires_at: user.token_expires_at,
                    }
                    // Verify password
                    const isPasswordCorrect = verifyPassword(password, theUser.hashed_password)
                    if (isPasswordCorrect) {
                        resolve(NextResponse.json({ message: 'Sign-in successful', user: theUser }, { status: 200 }));
                    } else {
                        resolve(NextResponse.json({ message: 'Invalid email or password' }, { status: 401 }));
                    }
                } else {
                    resolve(NextResponse.json({ message: 'User not found' }, { status: 404 }));
                }
            });
        } else {
            const hashedPassword = hashPassword(password)
            db.run(
                `INSERT INTO users (email, hashed_password, status, verification_token, token_expires_at) VALUES (?, ?, ?, ?, ?)`,
                [email, hashedPassword, 'UNVERIFIED', verificationToken, tokenExpiresAt],
                function (err) {
                    if (err) {
                        console.error('Error creating user:', err);
                        return resolve(NextResponse.json({ message: 'Error saving user', err }, { status: 500 }))
                    } else {
                        const newUser: User = {
                            id: this.lastID,
                            email,
                            hashed_password: hashedPassword,
                            status: 'UNVERIFIED',
                            verification_token: verificationToken,
                            token_expires_at: tokenExpiresAt,
                        }
                        return resolve(NextResponse.json({ message: "User was created", newUser, status: 201 }));
                    }
                }
            )
        }
    })
}


export async function GET() {
    return new Promise((resolve) => {
        db.all(`SELECT email FROM users`, (err, rows) => {
            if (err) {
                resolve(NextResponse.json({ message: 'Error fetching users', error: err }, { status: 500 }));
            } else {
                resolve(NextResponse.json({ users: rows }, { status: 200 }));
            }
        });
    });
}

// Type guard for User
function isUser(obj: unknown): obj is User {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'email' in obj &&
        'hashed_password' in obj &&
        'status' in obj &&
        'verification_token' in obj &&
        'token_expires_at' in obj
    )
}