const CURRENT_VERSION = 2; // Increment this whenever you change data structures

function initializeAndMigrateData() {
    // 1. Check if they are a completely new user
    if (!localStorage.getItem('game_data')) {
        const defaultData = {
            version: CURRENT_VERSION,
            score: 0,
            inventory: [], // New feature added in version 2
            unlockedLevels: [1]
        };
        localStorage.setItem('game_data', JSON.stringify(defaultData));
        console.log("New user data initialized.");
        return defaultData;
    }

    // 2. Fetch existing user data
    let userData = JSON.parse(localStorage.getItem('game_data'));

    // 3. Automatically upgrade existing users if their data is outdated
    if (!userData.version || userData.version < CURRENT_VERSION) {
        console.log("Outdated data found. Migrating...");

        // Migrate from Version 1 to Version 2
        if (userData.version === 1 || !userData.version) {
            // Safely inject new properties without deleting their old score
            userData.inventory = []; 
            userData.unlockedLevels = userData.unlockedLevels || [1];
            userData.version = 2; // Upgrade version tracker
        }

        // Save the newly migrated data back to localStorage
        localStorage.setItem('game_data', JSON.stringify(userData));
        console.log("Data successfully migrated to Version " + CURRENT_VERSION);
    }

    return userData;
}

// Run this as soon as the page loads
const gameData = initializeAndMigrateData();
