'use client';
import { Confirmation } from '@/components/confirmation';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function VerificationContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const [user, setUser] = useState<{ email: string; id: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [code, setCode] = useState<number | undefined>(undefined);

    // Utility to generate a random 6-digit number
    function generateVerificationCode(): number {
        return Math.floor(100000 + Math.random() * 900000); // Ensures a 6-digit number
    }

    // Function to send the verification code to the webhook
    interface VerificationResponse {
        code?: number;
        error?: string;
    }

    async function sendVerificationCode(userId: number, email: string): Promise<VerificationResponse> {
        const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK;
        const verificationCode = generateVerificationCode();
        let error: string | null = null;

        if (!webhookUrl) {
            console.error("Webhook URL is not defined in environment variables.");
            return { code: undefined, error: "Webhook URL is not defined." };
        }

        try {
            const response = await fetch(
                `${webhookUrl}?userId=${userId}&verificationCode=${verificationCode}&email=${email}`,
                {
                    method: 'GET',
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to send verification code. Status: ${response.status}`);
            }

            console.log(`Verification code ${verificationCode} sent to ${webhookUrl} for user ${userId}`);
            return { code: verificationCode, error: undefined }; // Return the verification code and no error
        } catch (err) {
            if (err instanceof Error) {
                error = err.message;
            } else {
                error = "An unexpected error occurred.";
            }
            return { code: verificationCode, error }; // Return the code and error message
        }
    }

    useEffect(() => {
        if (userId) {
            const fetchUser = async () => {
                try {
                    const response = await fetch(`/api/users/${userId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch user');
                    }
                    const data = await response.json();
                    setUser(data); // Assuming API returns the user object
                } catch (err) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('An unexpected error occurred');
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchUser();
        } else {
            setError('User ID not provided');
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (user) {
            sendVerificationCode(user.id, user.email).then(({ code, error }) => {
                if (error) {
                    console.error('Error sending verification code:', error);
                } else {
                    console.log('Verification code sent:', code);
                    setCode(code);
                }
            });
        }
    }, [user]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    return (
        <div className='flex flex-col justify-center items-center h-screen bg-gray-200'>
            <h1>Verification Page</h1>
            <p>User ID: {userId}</p>
            <p>Email: {user?.email}</p>
            {user && code ? <Confirmation code={code} userId={user.id} /> : <div>Sending the code</div>}
        </div>
    );
}

export default function VerificationPage() {
    return (
        <Suspense fallback={<p>Loading Verification Page...</p>}>
            <VerificationContent />
        </Suspense>
    );
}
