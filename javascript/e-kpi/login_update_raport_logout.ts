interface GetReportList {
    raport: [
        {
            id_user?: string,
            id_dept?: string,
            nama?: string,
            dept?: string,
            id_hierarki?: string,
            child?: string,
            parent?: string,
            direct?: string,
            id_raport?: string,
            tgl_awal?: string,
            tgl_akhir?: string
        }
    ],
    periode: {
        id_periode?: string,
        nama?: string,
        tgl_awal?: string,
        tgl_akhir?: string,
        edited_by?: string,
        edited_on?: string
    }
}

interface Kuantitatif {
    id: string
    id_raport: string
    desk: string
    indikator: string
    params: string
    bobot: string
    target: string
    real: string
    ach: string
    n_real: string,
    n_ach: string,
    selected: string
}

interface Kualitatif {
    id: string,
    id_raport: string,
    desk: string,
    params: string,
    bobot: string,
    target: string,
    real: string,
    ach: string,
    n_real: string,
    n_ach: string,
    selected: string
}

interface Report_details_response {
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
    Nama: string,
    username: string,
    password: string,
    kuantitatif_index: string,
    nilai_kuantitatif: string,
    kualitatif_index: string,
    nilai_kualitatif: string
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

async function get_raport_list(periode1: string, periode2: string): Promise<GetReportList> {

    const retrieve_raport = await fetch(`http://182.16.186.138:8080/KPI/raport/show_raport?tgl1=${periode1}&tgl2=${periode2}`, {
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

    if(retrieve_raport.status != 200) {
        return {
            raport: [
                {
                    id_user: undefined,
                    id_dept: undefined,
                    nama: undefined,
                    dept: undefined,
                    id_hierarki: undefined,
                    child: undefined,
                    parent: undefined,
                    direct: undefined,
                    id_raport: undefined,
                    tgl_awal: undefined,
                    tgl_akhir: undefined
                }
            ],
            periode: {
                id_periode: undefined,
                nama: undefined,
                tgl_awal: undefined,
                tgl_akhir: undefined,
                edited_by: undefined,
                edited_on: undefined
            }
        }
    }

    const responseJSON = await retrieve_raport.json() as GetReportList;

    return responseJSON
}

async function get_raport_details(id_user: string, id_raport: string, periode1: string, periode2: string): Promise<Report_details_response> {

    const get_raport_detail = await fetch(`http://182.16.186.138:8080/KPI/raport/detail_raport?id=${id_user}&dept=7&raport=${id_raport}&tgl1=${periode1}&tgl2=${periode2}`, {
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

    const response_json = await get_raport_detail.json() as Report_details_response;

    return response_json;
}

function update_raport(data: FormData) {
    
                    
        return fetch("http://182.16.186.138:8080/KPI/raport/edit_raport", {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "upgrade-insecure-requests": "1"
            },
            "referrer": "http://182.16.186.138:8080/KPI/raport",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": data,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
}

async function start_update(users: Users_and_details[], periode1: string, periode2: string) {
    
    let timer = 700;
    let counter = 1;

    for(let user of users) {
        
        timer += 12;
        await new Promise(resolve => setTimeout(resolve, timer));
        if (timer >= 5000) timer = 650;

        console.log(`Melakukan update raport ${user.Nama}, data ke ${counter++} dari ${users.length}`);

        // login
        const isLoginSuccess = await login(user.username, user.password);
        if(!isLoginSuccess) continue;

        // show raport list
        const getRaport = await get_raport_list(periode1, periode2);
        if(getRaport.raport[0].id_raport == "") continue;

        // get detail based on id=id_user, dept=7, raport=id_raport, tgl1, tgl2
        const id_user_ = getRaport.raport[0].id_user;
        const id_raport_ = getRaport.raport[0].id_raport;
        // @ts-ignore
        const raportDeatils = await get_raport_details(id_user_, id_raport_, periode1, periode2);
        const isNotOkeToInsert = !raportDeatils.nama || raportDeatils.status.approved != "0";
        if(isNotOkeToInsert) continue;

        // update the raport
        const formData = new FormData();

        // add kuantitatif
        for(let [index, kuan] of raportDeatils.kuanti.entries()) {
            const isNeedToUpdate = user.kuantitatif_index != "" && index === Number(user.kuantitatif_index);

            formData.append(`target1[${index}]`, kuan.target);
            formData.append(`real1[${index}]`, isNeedToUpdate ? user.nilai_kuantitatif : kuan.real);
            formData.append(`id1[${index}]`, kuan.id);
            formData.append(`indikator1[${index}]`, kuan.indikator);
            formData.append(`params1[${index}]`, kuan.params);
            formData.append(`bobot1[${index}]`, kuan.bobot);
            formData.append(`ach1[${index}]`, isNeedToUpdate ? user.nilai_kuantitatif : kuan.real);
        }

        // add kualitatif
        for(let [index, kual] of raportDeatils.kuali.entries()) {
            const isNeedToUpdate = user.kualitatif_index != "" && index === Number(user.kualitatif_index);

            formData.append(`target2[]`, kual.target);
            formData.append(`real2[]`, isNeedToUpdate ? user.nilai_kualitatif : kual.real);
            formData.append(`id2[]`, kual.id);
            formData.append(`desk2[]`, kual.desk);
            formData.append(`params2[]`, kual.params);
            formData.append(`bobot2[]`, kual.bobot);
            formData.append(`ach2[]`, isNeedToUpdate ? user.nilai_kualitatif : kual.ach);
        }

        formData.append("document[]", "(binary)");
        formData.append("id_user", id_user_ + "");
        formData.append("id_dept", "7");
        formData.append("id_raport", id_raport_ + "");
        formData.append("tgl_awal", periode1);
        formData.append("tgl_akhir", periode2);
        formData.append("nama", raportDeatils.nama);

        await update_raport(formData);

        // logout
        await logout();
    }
}

// copy script
// copy user.json
// periode should be 2023-02-19 (YYYY-MM-dd)
// start_update()