    import { useNavigate } from "react-router-dom"
    import Cookies from "js-cookie"
    function Dashboard() {
        const navigate = useNavigate()
        const handleLogout = () => {
        // localStorage.removeItem("token")
        Cookies.remove("token")
        navigate("/login")
    }
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Dashboard</h1>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleLogout}>Logout</button>
        </div>
    )
    }

    export default Dashboard