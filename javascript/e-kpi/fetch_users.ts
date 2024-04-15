interface User_response {
    "home2": {
        "id_hierarki": "1731",
        "id_dept": "7",
        "child": "2490",
        "parent": "577",
        "direct": "1",
        "edited_by": "sa",
        "edited_on": "2024-02-16 16:00:00.000",
        "username": "GDJD9",
        "nama": "WAHYU ARDA AGUSTIAN",
        "jabatan": null,
        "id_group": "25",
        "foto": null,
        "id_dept2": "7",
        "dept": "Gudang"
    },
    "home": {
        "id_user": "2490",
        "id_finger": "261132",
        "id_dept": "7",
        "id_group": "25",
        "kode": null,
        "nama": "Samiono  ",
        "username": "samiono_gd",
        "password": "ce0473fe3077fb5bc898829ce164c5d5",
        "email": null,
        "telegram": null,
        "divisi": null,
        "bagian": "Gudang Jadi",
        "jabatan": "Driver Forklift",
        "golongan": null,
        "tmk": null,
        "nik": null,
        "foto": null,
        "last_login": null,
        "ip_address": null,
        "active": "1",
        "edited_by": null,
        "edited_on": null,
        "jk": null,
        "tempat_lahir": null,
        "tgl_lahir": null,
        "agama": null,
        "alamat": null,
        "kota": null,
        "telp": null,
        "dept": "Gudang"
    },
    "user": []
}

interface Result {
    id_user: string
    id_finger: string
    id_dept: string
    id_group: string
    nama: string
    username: string
    bagian: string
    jabatan: string
    departemen: string
}


async function fetch_users(start:number, end: number) {
    let timer = 700;
    const result = <Result[]>[];


    for(let i = start; i <= end; i++) {

        console.log(`Fetching user ${i} dari ${end}, the timeout is ${timer}ms`);

        timer += 12;
        await new Promise(resolve => setTimeout(resolve, timer));
        if (timer >= 3000) timer = 650;

        const retrieve_hierarki = await fetch(`${location.origin}/KPI/hierarki/get_structure?user=${i}`, {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        if (retrieve_hierarki.status == 200) {
            
            const json_response = await retrieve_hierarki.json() as User_response;

            result.push({
                id_finger: json_response.home.id_finger,
                id_user: json_response.home.id_user,
                nama: json_response.home.nama,
                bagian: json_response.home.bagian,
                departemen: json_response.home.dept,
                jabatan: json_response.home.jabatan,
                username: json_response.home.username,
                id_dept: json_response.home.id_dept,
                id_group: json_response.home.id_group,
            })
            
        }
        
    }

    if (!result.length) return;
    const convertedToCSV = objToCsv(result);
    const filename = "Detail user E-kpi";
    downloadAsFile(convertedToCSV, filename + ".csv");

}

function objToCsv(data: any) {
    const headers = Object.keys(data[0]).join();
    const content = data.map(r => Object.values(r).join());
    return [headers].concat(content).join("\n");
}

function downloadAsFile(object: string, filename: string) {
    
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(object));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}