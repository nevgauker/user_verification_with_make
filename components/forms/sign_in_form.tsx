"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from 'next/navigation';
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


import { Input } from "@/components/ui/input"
import { generateToken, generateTokenExpiry, hashPassword } from "@/utils/authHelpers"
import { useState } from "react"
import Spinner from "../spinner";
import { signInFormSchema } from "./sign_in_form_schema";
import { useUser } from "@/contexts/user_context"


function SignInForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { setUserId } = useUser();



    const form = useForm<z.infer<typeof signInFormSchema>>({
        resolver: zodResolver(signInFormSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })


    async function onSubmit(values: z.infer<typeof signInFormSchema>) {
        setLoading(true)

        // Delay submission for 3 seconds
        setTimeout(async () => {
            const token = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN;
            try {
                // Prepare data
                const password = values.password
                const email = values.email
                const isSignIn = true
                // // Send POST request to API to create user
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        isSignIn
                    }),
                })

                const res = await response.json();
                console.log(res)
                if (response.ok && res.user) {
                    console.log(res.message)
                    if (res.user.status === 'UNVERIFIED') {
                        console.log('user is not verified')
                        router.push(`/signup/verification?userId=${res.user.id}`)
                    } else {
                        setUserId(res.user.id)
                        router.replace(`/`)
                    }

                } else {
                    console.error('User not created:', res.error || res.message)
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error handling form submission:', error)
                setLoading(false)
            }
        }, 3000);
    }

    return (
        <div className="w-screen md:w-[400px] p-3 border border-gray-500 rounded-md">
            {loading ? <Spinner /> :
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="example@gmail.com" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is your email.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is your password.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            }

        </div>
    )
}

export default SignInForm

