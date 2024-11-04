import SignUpForm from "@/components/forms/sign_up_form"

function SignUpPage() {
    return (
        <div className='flex flex-col items-center justify-center h-screen w-screen'>
            <SignUpForm />
            <span>Already have a user?<a className="underline" href="/signin">Click here to sign in</a> </span>
        </div>
    )
}

export default SignUpPage