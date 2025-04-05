const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// Configuration
const DB_CONFIG = {
    host: "database-1.cheks8auktyz.ap-south-1.rds.amazonaws.com",
    port: 3306,
    user: "blackcherie",
    password: "B!llion$Dreams#",
    database: "banarasi_baithak",
};

const BACKUP_DIR = path.join(__dirname, "..", "backups");

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Function to get all table names from the database
async function getTableNames(connection) {
    try {
        const [rows] = await connection.execute("SHOW TABLES");
        return rows.map((row) => Object.values(row)[0]);
    } catch (error) {
        console.error("Error getting table names:", error.message);
        return [];
    }
}

// Function to fetch data from a table
async function fetchTableData(connection, tableName) {
    try {
        const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
        return rows;
    } catch (error) {
        console.error(`Error fetching table ${tableName}:`, error.message);
        return null;
    }
}

// Function to save data to a file
function saveData(tableName, data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = path.join(BACKUP_DIR, `${tableName}_${timestamp}.json`);

    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Backed up table ${tableName} to ${filename}`);
}

// Main function to run the backup
async function runBackup() {
    console.log("Starting backup...");

    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);
        console.log("Connected to database successfully");

        // Get all table names from the database
        const tables = await getTableNames(connection);
        console.log("Found tables:", tables);

        for (const table of tables) {
            console.log(`Backing up table ${table}...`);
            const data = await fetchTableData(connection, table);

            if (data) {
                saveData(table, data);
            }
        }

        console.log("Backup completed!");
    } catch (error) {
        console.error("Backup failed:", error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the backup
runBackup();
