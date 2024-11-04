'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useUser } from "@/contexts/user_context"
import { useState } from "react"
import { useRouter } from "next/navigation"

const FormSchema = z.object({
    pin: z.string().min(6, {
        message: "Your one-time password must be 6 characters.",
    }),
})

export function Confirmation({ code, userId }: { code: number, userId: number }) {
    const { setUserId } = useUser();
    const router = useRouter()

    const [error, setError] = useState<string | undefined>(undefined)
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const pinNumber = Number(data.pin)

        if (code && code === pinNumber) {
            console.log('code match!')
            const token = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN;
            try {

                // Send a PATCH request to update user status to "VERIFIED"
                const response = await fetch(`/api/users/${userId}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status: 'VERIFIED',
                    }),
                })

                if (!response.ok) {
                    setError('Failed to update user status')
                    //throw new Error('Failed to update user status');
                } else {
                    const result = await response.json()
                    console.log('User status updated:', result)
                    setUserId(userId)
                    router.replace('/')
                }
                // Set the userId in the context to signify the user is now authenticated
            } catch (error) {
                console.error('Error updating user status:', error)
                setError(`Error updating user status: ${error}`)
            }
        } else {
            console.log('code does not match!')
            setError('code does not match!')
        }
    }


    return (<div className="p-4 bg-white rounded-md border border-gray-400">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>One-Time Password</FormLabel>
                            <FormControl>
                                <InputOTP maxLength={6} {...field}>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </FormControl>
                            <FormDescription>
                                Please enter the one-time password sent to your email.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Send</Button>
            </form>
        </Form>
        {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>

    )
}



