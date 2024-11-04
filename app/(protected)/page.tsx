import UserInfo from "@/components/user_info";

function Home() {
    return (
        <main className="flex flex-col justify-center items-center h-screen space-y-5">
            <h1 className="text-2xl">This is the main page</h1>
            <UserInfo />
        </main>

    );
}

export default Home