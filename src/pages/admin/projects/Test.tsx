import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";

const Test = () => {

    const token = Cookies.get("token")

    const [users, setUsers] = useState<[]>()
    const [projects, setProjects] = useState<[]>()

    // fetch all users
    const fetchAllUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/all-users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if(response.status === 200) {
                setUsers(response.data.users)
            }
            console.log(`response users: ${response.data.users}`);
            console.log(`All Users: ${users}`);
        } catch (err) {
            console.log('Failed to fetch users');
        }
    }

    // fetch all projects
    const fetchAllProjects = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/projects', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if(response.status === 200) {
                setProjects(response.data.projects)
            }
            console.log(`response projects: ${response.data.projects}`);
            console.log(`All Projects: ${projects}`);
        } catch (err) {
            console.log('Failed to fetch projects');
        }
    }

    return (
        <div>
            <button onClick={fetchAllUsers}>Fetch Users</button>
            <button onClick={fetchAllProjects}>Fetch Projects</button>
        </div>
    )
}

export default Test