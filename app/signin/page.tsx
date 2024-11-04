import SignInForm from "@/components/forms/sign_in_form"

function SignInPage() {
    return (
        <div className='flex flex-col items-center justify-center h-screen w-screen'>
            <SignInForm />
            <span>Don't have a user?<a className="underline" href="/signup">Click here to sign up</a> </span>
        </div>
    )
}

export default SignInPage