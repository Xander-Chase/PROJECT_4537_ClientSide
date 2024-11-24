const API_ENDPOINT = "/api/admin/dashboard";
const API_DELETE_USER = "/api/admin/deleteUser";
const TABLENAMES = {
    USER_TABLE: "userTable",
    ROLE_TABLE: "role-table",
    API_USAGE_TABLE: "apiUsage-table",
    ENDPOINTS_TABLE: "endpoints-table"
}
class AdminDashboard
{
    // Call init
    constructor()
    {
        this.init();
    }

    // Start up the admin dashboard
    init = () =>
    {
        // Get all required admin data and populate tables
        this.getUserDashboardData().then((data) => {
            if (data)
            {
                // Factory pattern to create tables
                
                // This is to ensure that the current user is not deleted
                const currentUserId = JSON.parse(localStorage.getItem(localStorageNames.data)).user._id;
                
                // User table
                new TableFactory(TABLENAMES.USER_TABLE, data.users.map((element) => {
                    return { 
                        current: currentUserId,
                        id: element.user._id,
                        username: element.user.username, email: element.user.email }
                }));

                // Role table
                new TableFactory(TABLENAMES.ROLE_TABLE, data.users.map((element) => {
                    return { role: element.role.role }
                }));

                // API Usage table
                new TableFactory(TABLENAMES.API_USAGE_TABLE, data.users.map((element) => {
                    return { apiUsage: element.apiUsage.count }
                }));

                // Endpoints table
                new TableFactory(TABLENAMES.ENDPOINTS_TABLE, data.endpoints);
            }
        })
    }

    // Get all required admin data, from server
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

// Factory pattern to create tables
// Takes in the table name and data to seed into the table
class TableFactory
{
    // Assign values and call init
    constructor(tableName, data)
    {
        this.table = document.getElementById(tableName);
        this.data = data;
        this.init();
    }

    // Start up the creation of the table
    init = () => {
        switch (this.table.id)
        {
            case TABLENAMES.USER_TABLE:
                this.createUserTable();
                break;
            case TABLENAMES.ROLE_TABLE:
                this.createRoleTable();
                break;
            case TABLENAMES.API_USAGE_TABLE:
                this.createApiUsageTable();
                break;
            case TABLENAMES.ENDPOINTS_TABLE:
                this.createEndPointsTable();
                break;
            default:
                break
        }
    }

    /// Create the user table
    createUserTable = () => {
        // define template
        const template = document.getElementById("user-table-template");
        
        // loop through data and create table
        // Populate the table with the data
        this.data.forEach((record, index) => {
            // Duplicate the template as a node
            let clone = template.content.cloneNode(true);

            // Cell is to represent the row and indicate that a user has been deleted once pressed
            const cell = clone.querySelector(".cell");

            // Populate the table with the data
            clone.querySelector(".user-id").textContent = ++index;
            clone.querySelector(".user-name").textContent = record.username;
            clone.querySelector(".user-email").textContent = record.email;

            // Delete button
            clone.querySelector(".deletion").onclick = async (event) => {
                event.currentTarget.disabled = true;
                if (record.current === record.id)
                {
                    event.currentTarget.innerHTML = CURRENT_USER; // en.js
                    return;
                }

                // call delete fetch api
                const response = await Utils.DeleteFetch(`${API_URL}${API_DELETE_USER}`, { id: record.id });
                if (response.ok)
                {
                    // add the style
                    cell.classList.add("deleted");
                    return;
                }
                else
                    alert(FAILURE_DELETION); // en.js

                event.currentTarget.disabled = false;
            }
            this.table.appendChild(clone);
        })
    }

    // Create the role table
    createRoleTable = () => 
    {
        // define template
        const template = document.getElementById("role-table-template");

        // loop through data and create table
        // Populate the table with the data
        this.data.forEach((record, index) => {
            // Duplicate the template as a node
            let clone = template.content.cloneNode(true);
            clone.querySelector(".user-id").textContent = ++index;
            clone.querySelector(".role").textContent = record.role;
            this.table.appendChild(clone);
        })
    }

    // Create the API usage table
    createApiUsageTable = () =>
    {
        // define template
        const template = document.getElementById("apiUsage-table-template");
        
        // loop through data and create table
        // Populate the table with the data
        this.data.forEach((record, index) => {
            // Duplicate the template as a node
            let clone = template.content.cloneNode(true);
            clone.querySelector(".user-id").textContent = ++index;
            clone.querySelector(".api-count").textContent = record.apiUsage;
            this.table.appendChild(clone);
        })
    }

    // Create the endpoints table
    createEndPointsTable = () =>
    {
        // define template
        const template = document.getElementById("endpoints-table-template");

        // loop through data and create table
        // Populate the table with the data
        this.data.forEach((record) => {
            // Duplicate the template as a node
            let clone = template.content.cloneNode(true);
            clone.querySelector(".endpoint-method").textContent = record.method
            clone.querySelector(".endpoint-name").textContent = record.endpoint;
            clone.querySelector(".endpoint-count").textContent = record.count;
            this.table.appendChild(clone);
        })
    }
}

// Export class to be used in adminDashboard.html
export { AdminDashboard };