interface Kuantitatif {
    "id_kuanti": string,
    "id_user": string,
    "desk": string,
    "indikator": string,
    "params": string,
    "bobot": string,
    "draft": string,
    "active": string,
    "edited_by": string,
    "edited_on": string
}

interface Kualitatif {
    "id_kuali": string,
    "id_user": string,
    "desk": string,
    "params": string,
    "bobot": string,
    "draft": string,
    "active": string,
    "edited_by": string,
    "edited_on": string
}

interface Report_response {
    "nama": string,
    "status": {
        "approved": null,
        "number": null,
        "draft": null
    },
    "doc": [],
    "s_apv": {
        "number": null,
        "number2": null
    },
    "kuanti": Kuantitatif[],
    "kuali": Kualitatif[],
    "ansum1": "",
    "ansum2": ""
}


interface Users_and_details {
    name: string,
    username: string,
    password: string,
    id_user: string
}

async function login(username: string, password: string): Promise<boolean> {

    const login = await fetch(location.origin + "/KPI/auth/login", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "upgrade-insecure-requests": "1"
        },
            "referrer": location.origin + "/KPI/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": `username=${username}&password=${password}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        return login.url === location.origin + "/KPI/raport"
}

function logout() {
    return fetch(location.origin + "/KPI/auth/logout")
}

async function insert_kpi(user_id: string, periode1: string, periode2: string, kuantitatifPoint: pointKPI[], kualitatifPoint: pointKPI[]) {

    const response_report = await fetch(location.origin + `/KPI/raport/detail_raport?id=${user_id}&dept=7&raport=&tgl1=${periode1}&tgl2=${periode2}`, {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": location.origin + "/KPI/raport",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });

    if(response_report.status !== 200) return false;

    const report = await response_report.json() as Report_response;

    const isNotOkeToInsert = !report.nama || report.status.approved == "0";

    if(isNotOkeToInsert) {
        console.log("data sudah di input")
        return false;
    }
    
    const formData = new FormData();

    // add kuantitatif
    for(let [index, kuan] of report.kuanti.entries()) {
        formData.append(`real1[${index}]`, kuantitatifPoint[index].points + '');
        formData.append(`target1[${index}]`, '100');
        formData.append(`id1[${index}]`, '');
        formData.append(`desk1[${index}]`, kuan.desk);
        formData.append(`indikator1[${index}]`, kuan.indikator);
        formData.append(`params1[${index}]`, kuan.params);
        formData.append(`bobot1[${index}]`, kuan.bobot);
        formData.append(`ach1[${index}]`, kuantitatifPoint[index].points + '');
    }

    let index = 0;
    // add kualitatif
    for(let kual of report.kuali) {
        formData.append(`target2[]`, '100');
        formData.append(`real2[]`, kualitatifPoint[index].points + '');
        formData.append(`id2[]`, '');
        formData.append(`desk2[]`, kual.desk);
        formData.append(`params2[]`, kual.params);
        formData.append(`bobot2[]`, kual.bobot);
        formData.append(`ach2[]`, kualitatifPoint[index].points + '');
        index++;
    }

    formData.append("document[]", "(binary)");
    formData.append("id_user", user_id);
    formData.append("id_dept", "7");
    formData.append("id_raport", "");
    formData.append("tgl_awal", periode1);
    formData.append("tgl_akhir", periode2);
    formData.append("nama", report.nama);
    
    await fetch(location.origin + "/KPI/raport/edit_raport", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "upgrade-insecure-requests": "1"
        },
        "referrer": location.origin + "/KPI/raport",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": formData,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });

    return true
}

interface spreadsheetReponse {
    range: string,
    majorDimension: string,
    values: string[][]
}

// let spreadsheetId = "";
// let range = "";
// let spreadsheetAPIKey = "";

async function getUsersEKPI(): Promise<Users_and_details[]|false> {
    
    // Construct the URL for the Google Sheets API request
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${spreadsheetAPIKey}`;
    
    // Fetch the data from the spreadsheet
    const getData = await fetch(url);
  
    const listUser = await getData.json() as spreadsheetReponse;
    
    if(listUser?.values && listUser.values.length) {
        const userList:Users_and_details[] = listUser.values.map((rec) => ({
            name: rec[0],
            username: rec[1],
            password: rec[2],
            id_user: rec[3]
        }));
        return userList
    }

    return false
}

interface pointKPI {
    points: number,
    KRA:  string
}

interface pointsEKPI {
    [username: string]: {
        kuali: pointKPI[],
        kuanti: pointKPI[]
    }

}

async function getPointEKPI(): Promise<pointsEKPI|false> {
    const pointAlphabet = {
        B: 100,
        C: 80,
        K: 60
    }
    // Construct the URL for the Google Sheets API request
    const urlKuanti = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetIdEKPI}/values/${rangeKuantiEKPI}?key=${spreadsheetAPIKey}`;
    // Fetch the data from the spreadsheet
    const getData = await fetch(urlKuanti);
    const kuantitatifPoint = await getData.json() as spreadsheetReponse;
    const pointsEKPI:pointsEKPI = {};
    
    if(kuantitatifPoint?.values && kuantitatifPoint.values.length) {
        for(let i = 0; i < kuantitatifPoint.values.length; i++) {
            const kuan = kuantitatifPoint.values[i];
            const kuantiUsername = kuan[0];
            const kuantiParam = kuan[8];
            const KRA =  kuan[2];
            // if point is exists
            if(kuantiParam && Object.keys(pointAlphabet).includes(kuantiParam)) {
                const isUsernameInitialized = pointsEKPI && pointsEKPI[kuantiUsername];
                
                if(isUsernameInitialized) {
                    pointsEKPI[kuantiUsername]['kuanti'].push({
                        points: pointAlphabet[kuantiParam],
                        KRA
                    })
                }
                else {
                    pointsEKPI[kuantiUsername] = {
                            kuanti: [{
                                points: pointAlphabet[kuantiParam],
                                KRA
                            }],
                            kuali: []
                    }
                }
            }
        }
    }

    
    const urlKuali = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetIdEKPI}/values/${rangeKualiEKPI}?key=${spreadsheetAPIKey}`;
    // Fetch the data from the spreadsheet
    const getKuali = await fetch(urlKuali);
    const kualitatifPoint = await getKuali.json() as spreadsheetReponse;

    if(kualitatifPoint?.values && kualitatifPoint.values.length) {
        for(let i = 0; i < kualitatifPoint.values.length; i++) {
            const kual = kualitatifPoint.values[i];
            const kualiUsername = kual[0];
            const kualiKRA = kual[2];
            const kualiPoint = Number(kual[6]) < 60 ? 0 : Number(kual[6]);
            // if point is exists
            if(kualiKRA) {
                const isUsernameInitialized = pointsEKPI && pointsEKPI[kualiUsername];

                if(isUsernameInitialized) {
                    pointsEKPI[kualiUsername]['kuali'].push({
                        points: kualiPoint,
                        KRA: kualiKRA
                    })
                }
            }
        }
    }

    return pointsEKPI
}

async function startProcess() {
    const users = await getUsersEKPI();
    if(!users) {
        console.log("Gagal mendapatkan users");
        return;
    }

     const periode1 = "2024-10-27";
     const periode2 = "2024-11-02";
    
    let timer = 700;
    let counter = 1;

    for(let user of users) {
        if(!user.id_user || !user.name || !user.password || !user.username) continue;
        timer += 12;
        await new Promise(resolve => setTimeout(resolve, timer));
        if (timer >= 5000) timer = 650;

        console.log(`Melakukan input raport ${user.name}, data ke ${counter++} dari ${users.length}`);

        // login
        const isLoginSuccess = await login(user.username, user.password);
        if(!isLoginSuccess) {
            console.log(`Gagal login ${user.name}`);
            continue;
        }

        const pointsKPI = await getPointEKPI();
        if(!pointsKPI) {
            console.log(`Gagal melakukan input E-KPI karena semua point E-KPI tidak ditemukan`);
            return
        }
        
        const isEKPIPointExists = pointsKPI[user.name];
        
        if(!isEKPIPointExists) {
            console.log(`Gagal melakukan input E-KPI ${user.name} karena nilai tidak ditemukan`);
            continue;
        }
        // insert kpi
        await insert_kpi(user.id_user, periode1, periode2, pointsKPI[user.name].kuanti, pointsKPI[user.name].kuali);
        // logout
        await logout();
    }
}

startProcess()