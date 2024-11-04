'use client'

import { Button } from "./ui/button"
import { useUser } from "@/contexts/user_context"

function UserInfo() {

    const { setUserId, userId } = useUser();

    function signOut() {
        setUserId(null)
    }
    return (
        <div className="flex flex-col spacey-5 justify-center">
            <h1 className="text-3xl">User Information</h1>
            <p className="text-xl">{`use id: ${userId}`}</p>
            <Button className="h-[44px] w-[200px]" onClick={() => signOut}>sign out</Button>

        </div>

    )
}

export default UserInfo