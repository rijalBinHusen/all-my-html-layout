let telegramBotToken = 0;
let telegramBotAction = "";
let telegramBotSubscriber = "";

async function fetchDashboard (): Promise<string|undefined> {

    const getDashboard = await fetch("http://192.168.8.7:8080/antrian2/dashboard2", {
    "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "upgrade-insecure-requests": "1"
    },
    "referrer": "http://192.168.8.7:8080/antrian2/dashboard2",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
    });

    if(getDashboard.status !== 200) return;
    const textResponse = await getDashboard.text();
    return textResponse;

}

async function parseDashboardResponse(html: string): Promise<string[]|undefined> {
    const parser = new DOMParser();
    const parsedHTML = parser.parseFromString(html, "text/html");
    const areas = parsedHTML.querySelectorAll(".row");
    let data = <string[]>[];
    
    for(let area of areas) {
        let areaTitleElment = area.querySelector("h3.text-center");
        if(!areaTitleElment) continue;
        const areaTitle = areaTitleElment.innerHTML.replace(/\t|\n/g, "").split("    ")[0].replace("/<span>∞</span>", "");
        data.push(areaTitle);
    }
    return data;
}


const timeWaiting = 1000 * 60 * 8;

function wait () {
    return new Promise((resolve) => {
        setTimeout(() => resolve(""), timeWaiting)
    })
}

async function runOurDashboard() {
    const dashboardString = await fetchDashboard();
    if(!dashboardString) return;
    const dataLocation = await parseDashboardResponse(dashboardString);
    if(!dataLocation) return;
    const message = `Dashboard antrian gudang\n\n${dataLocation.join("\n")}`
    notifyToTelegram(message);
    await wait();
    runOurDashboard()
}

function notifyToTelegram(message: string) {
    var url = 'https://script.google.com/macros/s/AKfycbzj451vW2mjR1q0SrGc0JTEIlT-P2oyvMFn-7_WAfPDdpGfzEwUQXaoqF30IX_wLY-I1Q/exec'; // Replace with your target URL
    const parameter = `?action=${telegramBotAction}&token=${telegramBotToken}&subscriber=${telegramBotSubscriber}&message=` + encodeURIComponent(message)
    fetch(url + parameter, { mode: 'no-cors' });
}

runOurDashboard()