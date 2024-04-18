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

    const login = await fetch("http://182.16.186.138:8080/KPI/auth/login", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "upgrade-insecure-requests": "1"
        },
            "referrer": "http://182.16.186.138:8080/KPI/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": `username=${username}&password=${password}`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        return login.url === "http://182.16.186.138:8080/KPI/raport"
}

function logout() {
    return fetch("http://182.16.186.138:8080/KPI/auth/logout")
}

async function insert_kpi(user_id: string, periode1: string, periode2: string) {

    const response_report = await fetch(`http://182.16.186.138:8080/KPI/raport/detail_raport?id=${user_id}&dept=7&raport=&tgl1=${periode1}&tgl2=${periode2}`, {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": "http://182.16.186.138:8080/KPI/raport",
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
        formData.append(`target1[${index}]`, '100');
        formData.append(`real1[${index}]`, '100');
        formData.append(`id1[${index}]`, '');
        formData.append(`indikator1[${index}]`, kuan.indikator);
        formData.append(`params1[${index}]`, kuan.params);
        formData.append(`bobot1[${index}]`, kuan.bobot);
        formData.append(`ach1[${index}]`, '100');
    }

    // add kualitatif
    for(let kual of report.kuali) {
        formData.append(`target2[]`, '100');
        formData.append(`real2[]`, '100');
        formData.append(`id2[]`, '');
        formData.append(`desk2[]`, kual.desk);
        formData.append(`params2[]`, kual.params);
        formData.append(`bobot2[]`, kual.bobot);
        formData.append(`ach2[]`, '100');
    }

    formData.append("document[]", "(binary)");
    formData.append("id_user", user_id);
    formData.append("id_dept", "7");
    formData.append("id_raport", "");
    formData.append("tgl_awal", periode1);
    formData.append("tgl_akhir", periode2);
    formData.append("nama", report.nama);
                
    await fetch("http://182.16.186.138:8080/KPI/raport/edit_raport", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "upgrade-insecure-requests": "1"
        },
        "referrer": "http://182.16.186.138:8080/KPI/raport",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": formData,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });

    return true
}


async function start_insert(users: Users_and_details[], periode1: string, periode2: string) {
    
    let timer = 700;
    let counter = 1;

    for(let user of users) {
        
        timer += 12;
        await new Promise(resolve => setTimeout(resolve, timer));
        if (timer >= 5000) timer = 650;

        console.log(`Melakukan input raport ${user.name}, data ke ${counter++} dari ${users.length}`);

        // login
        const isLoginSuccess = await login(user.username, user.password);
        if(!isLoginSuccess) continue;

        // insert kpi
        await insert_kpi(user.id_user, periode1, periode2)
        // logout
        await logout();
    }
}