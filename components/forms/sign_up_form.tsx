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
import { useState } from "react"
import Spinner from "../spinner";
import { signInFormSchema } from "./sign_in_form_schema";


function SignUpForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

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
            try {
                const token = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN;
                // Prepare data
                const password = values.password
                const email = values.email
                // // Send POST request to API to create user
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'authorization': `Bearer ${token}`, },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                })

                const res = await response.json();

                if (response.ok) {
                    console.log('User created:', res.message)
                    router.push(`/signup/verification?userId=${res.newUser.id}`)
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

export default SignUpForm

