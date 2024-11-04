// utils/authHelpers.ts
import { randomBytes, createHash } from 'crypto';

export function hashPassword(password: string): string {
    // Generate a random salt
    const salt = randomBytes(16).toString('hex')
    // Create a hashed password using SHA-256 with the salt
    const hash = createHash('sha256').update(password + salt).digest('hex')
    return `${salt}:${hash}` // Return salt and hash together
}

export function generateToken(): string {
    return randomBytes(32).toString('hex') // Generate a random token
}

export function generateTokenExpiry(hours = 48): string {
    const expiryDate = new Date(Date.now() + hours * 60 * 60 * 1000);
    return expiryDate.toISOString() // Return the expiration date as a string
}
//for testing
export function generateInvalidTokenExpiry(hours = 48): string {
    const expiryDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    return expiryDate.toISOString() // Return the expiration date as a string
}

export function isTokenValid(expiryDateString: string): boolean {
    // Convert the expiration date string to a Date object
    const expiryDate = new Date(expiryDateString)
    // Get the current date and time
    const now = new Date()
    // Check if the current date is before the expiry date
    return now < expiryDate
}


export function verifyPassword(inputPassword: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':') // Extract salt and hash
    const inputHash = createHash('sha256').update(inputPassword + salt).digest('hex') // Hash input with the same salt
    return inputHash === hash // Compare the hashes
}



export function apiHeaders() {
    const token = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN
    if (!token) throw Error('Token require for this call')
    return {
        Authorization: `Bearer ${token}`,
    }
}


