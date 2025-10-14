import axios from "axios";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";

interface Roles {
  id: string;
  userId: string;
  roleId: string;
  projectId: string;
  role: Role[];
}

interface Role {
  id: string;
  name: string;
  status: string;
  deletedAt: string;
}

interface User {
  id: string;
  fname: string;
  lname: string;
  email: string;
  isAdmin: string;
  createdAt: string;
  roles: Roles[];
}

interface Leader {
    id: string
    fname: string
    lname: string
    email: string
}

interface Member {
    id: string
    projectId: string
    userId: string
    roleName: string
    user: User
}

interface IssueCreater {
    id: string
    fname: string
    lname: string
}

interface Issue {
    id: string
    title: string
    description: string
    type: string
    status: string
    projectId: string
    assignedTo: string
    devType: string
    createdBy: IssueCreater
}

interface Project {
    id: string
    title: string
    description: string
    leader: Leader
    members: Member[]
    issues: Issue[]
}

function RolesManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false);

  const token = Cookies.get("token");

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const res = await axios.get("http://localhost:3000/api/all-users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        console.log(res.data.users);
        console.log("=================\n");
        if (res.data.users) {
          setUsers(res.data.users);
          console.log(users);
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.log(`Failed to fetch users: ${err.message}`);
    }
  };

  const fetchProjects = async () => {
    setLoading(true)
    try {
        const res = await axios.get('http://localhost:3000/api/projects', {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if(res.status === 200) {
            console.log(res.data.projects);
            console.log("=================\n")
            if(res.data.projects) {
                setProjects(res.data.projects)
                console.log(projects);
                setLoading(false)
            }
        }
    }
    catch (err: any) {
        console.log(`Failed to fetch projects: ${err.message}`);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchProjects()
  }, []);

  const roleMap: Record<string, string> = {
    DEVELOPER_FRONTEND: "Frontend Developer",
    DEVELOPER_BACKEND: "Backend Developer",
    TESTER: "Tester",
  };

  const transformRoleName = (roleName: string): string => {
    return (
      roleMap[roleName] ||
      roleName
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  return (
    <div>
      <h1>Users</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.fname} {user.lname} - {user.email} -{" "}
              {
                transformRoleName(user.roles
                  .flatMap((role) => role.role)
                  .map((r) => r.name)
                  .join(", "))
              }
            </li>
          ))}
        </ul>
      )}


      <h1>Projects</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              {project.title} - {project.leader.fname} {project.leader.lname}
              <ul>
                {project.members.map((member) => (
                  <li key={member.id}>
                    {member.user.fname} {member.user.lname} - {member.roleName}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RolesManagement;
