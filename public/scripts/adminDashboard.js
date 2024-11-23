const API_ENDPOINT = "/api/admin/dashboard";

class AdminDashboard
{
    
    constructor()
    {
        this.init();
    }

    init()
    {
        this.getUserDashboardData().then((data) => {
            if (data)
            {
                console.log(data);
                new TableFactory("userTable", data.users.map((element) => {
                    return { username: element.user.username, email: element.user.email }
                }));
                new TableFactory("role-table", data.users.map((element) => {
                    return { role: element.role.role }
                }));
                new TableFactory("apiUsage-table", data.users.map((element) => {
                    return { apiUsage: element.apiUsage.count }
                }));
                new TableFactory("endpoints-table", data.endpoints);
            }
        })
    }

    getUserDashboardData = async () => {
        const payload = await Utils.GetFetch(`${API_URL}${API_ENDPOINT}`);
        if (payload.ok)
        {
            let data = await payload.json();
            return {
                endpoints: data.endpoints,
                users: data.data
            }
        }
        return null;
    }
}


class TableFactory
{
    constructor(tableName, data)
    {
        this.table = document.getElementById(tableName);
        this.data = data;
        this.init();
    }

    init = () => {
        switch (this.table.id)
        {
            case "userTable":
                this.createUserTable();
                break;
            case "role-table":
                this.createRoleTable();
                break;
            case "apiUsage-table":
                this.createApiUsageTable();
                break;
            case "endpoints-table":
                this.createEndPointsTable();
                break;
            default:
                break
        }
    }

    createUserTable = () => {
        // define template
        const template = document.getElementById("user-table-template");
        this.data.forEach((record, index) => {
            let clone = template.content.cloneNode(true);
            clone.querySelector(".user-id").textContent = ++index;
            clone.querySelector(".user-name").textContent = record.username;
            clone.querySelector(".user-email").textContent = record.email;
            this.table.appendChild(clone);;
        })
    }

    createRoleTable = () => 
    {
        const template = document.getElementById("role-table-template");
        this.data.forEach((record, index) => {
            let clone = template.content.cloneNode(true);
            clone.querySelector(".user-id").textContent = ++index;
            clone.querySelector(".role").textContent = record.role;
            this.table.appendChild(clone);
        })
    }

    createApiUsageTable = () =>
    {
        const template = document.getElementById("apiUsage-table-template");
        this.data.forEach((record, index) => {
            let clone = template.content.cloneNode(true);
            clone.querySelector(".user-id").textContent = ++index;
            clone.querySelector(".api-count").textContent = record.apiUsage;
            this.table.appendChild(clone);
        })
    }

    createEndPointsTable = () =>
    {
        const template = document.getElementById("endpoints-table-template");
        this.data.forEach((record) => {
            let clone = template.content.cloneNode(true);
            clone.querySelector(".endpoint-method").textContent = record.method
            clone.querySelector(".endpoint-name").textContent = record.endpoint;
            clone.querySelector(".endpoint-count").textContent = record.count;
            this.table.appendChild(clone);
        })
    }
}
export { AdminDashboard };