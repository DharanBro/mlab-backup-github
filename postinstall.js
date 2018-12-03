const { exec } = require('child_process');
const path = require('path');
if (process.env.NODE_ENV !== "production") {
    require("dotenv").load();
}
// Clone APSBackup
exec(`git clone ${process.env.GIT_REPO_URL}`, {
    cwd: path.join(__dirname, "./temp/")
}, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
});




