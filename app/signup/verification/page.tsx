'use client';
import { Confirmation } from '@/components/confirmation';
// import { Confirmation } from '@/components/confirmation';
import { isTokenValid } from '@/utils/authHelpers';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function VerificationPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const [user, setUser] = useState<{ email: string; id: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [code, setCode] = useState<number | undefined>(undefined);

    // Utility to generate a random 6-digit number
    function generateVerificationCode(): number {
        return Math.floor(100000 + Math.random() * 900000); // Ensures a 6-digit number
    }

    // Function to send the verification code to the webhook
    async function sendVerificationCode(userId: number, email: string): Promise<{ code?: number; error?: string }> {
        const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK;
        const verificationCode = generateVerificationCode();

        if (!webhookUrl) {
            console.error("Webhook URL is not defined in environment variables.");
            return { error: "Webhook URL is not defined." };
        }

        try {
            const response = await fetch(`${webhookUrl}?userId=${userId}&verificationCode=${verificationCode}&email=${email}`, {
                method: 'GET',
            });
            if (!response.ok) throw new Error(`Failed to send verification code. Status: ${response.status}`);

            console.log(`Verification code ${verificationCode} sent to ${webhookUrl} for user ${userId}`);
            return { code: verificationCode };
        } catch (err) {
            const error = err instanceof Error ? err.message : "An unexpected error occurred.";
            return { error };
        }
    }

    useEffect(() => {
        if (!userId) {
            setError('User ID not provided');
            return;
        }

        let didCancel = false;

        const fetchUserAndSendVerification = async (options: RequestInit = {}) => {
            const token = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN;
            try {
                const headers = {
                    ...options.headers,
                    'authorization': `Bearer ${token}`,
                };


                const response = await fetch(`/api/users/${userId}`, {
                    ...options,
                    headers,
                });
                if (!response.ok) throw new Error('Failed to fetch user');

                const data = await response.json();
                if (didCancel) return; // Prevent further action if canceled


                //make sure the unverified user is still valid 
                const isValid = isTokenValid(data.token_expires_at)

                if (!isValid) {
                    await fetch(`/api/users/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': `Bearer ${token}`,
                        },
                    })
                    setError('user is not valid anymore.sign up again')
                    return
                }


                setUser(data);


                const { code, error } = await sendVerificationCode(data.id, data.email);
                if (didCancel) return;

                if (error) {
                    console.error('Error sending verification code:', error);
                    setError(error);
                } else {
                    setCode(code);
                }
            } catch (err) {
                if (!didCancel) {
                    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
                    setError(errorMessage);
                }
            }
        };

        fetchUserAndSendVerification();

        return () => {
            didCancel = true; // Cancel ongoing requests on unmount
        };
    }, [userId]);

    if (!user && !error) return (<p>Loading...</p>);
    if (error) return (
        <div className='flex flex-col h-screen justify-center items-center'>
            <p>Error: {error}</p>
            <a className='text-xl underline' href='/signup'>Back to sign up</a>
        </div>)

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-200">
            <h1>Verification Page</h1>
            <p>User ID: {userId}</p>
            <p>Email: {user?.email}</p>
            {user && code ? <Confirmation code={code} userId={user.id} /> : <div>Sending the code...</div>}
        </div>
    );
}


export default VerificationPage
