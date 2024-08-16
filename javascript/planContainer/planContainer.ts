interface listPlanContainerResponse {
    range: string,
    majorDimension: string,
    values: string[][]
}

let actionGoogleAppScript = "";
let tokenGoogleAppScript = "";

let spreadsheetAPIKey = '';
let spreadsheetId = '';
let range = ''; // Replace with your desired range

async function getPlanContainer(): Promise<undefined|string[][]> {

    const warningDOdidntExists = "Tidak ada nomor do di google spreadsheet plan";
    const doExists = "Berhasil mendapatkan nomor DO sebanyak: "
    
    // Construct the URL for the Google Sheets API request
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${spreadsheetAPIKey}`;
    
    // Fetch the data from the spreadsheet
    const getData = await fetch(url);
  
    const listNomorDO = await getData.json() as listPlanContainerResponse;
    
    if(listNomorDO.values.length) {
        console.log(doExists + listNomorDO.values.length)
        return listNomorDO.values
    }

    else {
        console.log(warningDOdidntExists);
    }
}

interface getDetailDO {
    hdr: {
        SysDO: string
        TrDate: string
        NoDo: string
        NoPol: string
        TglKirim: string
        JenisKendaraan: string
        Keterangan: string
        JamDO: string
        nama_sopir: string
        no_sopir: string
        jam_do2: string
        ekspedisi: string
        kubikasi: string
        tgl_do2: string
        input_by: string
        bongkar: string
        id_trans_area: string
        next_gd: string
        flag_muat: string
        update_by: string
        jam_izin: string
        flag_stapel: string
        tujuan: string
        jam_stapel: string
        selesai_stapel: string
        flag_tujuan: string
        sampai_tujuan: string
        void: string
        tonase: string
        flag_priority: string
        reason_priority: string
        nama_customer: string
        date_priority: string
        tujuan2: string
        totalCetak: string
        no_seal: string
        no_cont: string
        reason_sj: string
        flag_kendaraan: string
        flag_approv: string
        tgl_approv: string
        idReason: string
        idReasonExpectedDlv: string
    },
    dtl: {
            trno: string
            custname: string
            sysdo: string
            sys: string
            lineno: string
            qtydo: string
            qtydo2: string
            id_muat: string
            lineno_split: string
            locid: string
            description: string
            itemid: string
            unitid: string
            locationid: string
        }[],
}

async function getDetailDO(nodo: string): Promise<getDetailDO|undefined> {
    const successMessage = "Berhasil mendapatkan delivery order detail nomor: " + nodo;

    const getData = await fetch(`http://192.168.8.7:8080/warehouse/change/get_change?nodo=${nodo}&src=1`, {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": "http://192.168.8.7:8080/warehouse/change",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    
    if(getData.status !== 200) return;
    const responseJSON = await getData.json() as getDetailDO;
    console.log(successMessage)
    if(responseJSON.dtl.length) return responseJSON
}

function sendDetailDOToGoogleAppScript(nodo: string, noso: string, customer: string, gudang: string, item: string, qty: string): Promise<Response> {
    const url = `https://script.google.com/macros/s/AKfycbxC8Szkb_pqJPiXPTsGGoAeTYqtGMWVKFouAi5BrAMsyce9kYtlLGZG_4jjOW1DhzSg4g/exec`;
    const parameter = `?action=${actionGoogleAppScript}&token=${tokenGoogleAppScript}&nodo=${nodo}&noso=${noso}&customer=${customer}&gudang=${gudang}&item=${encodeURIComponent(item)}&qty=${qty}`;
    console.log(`Mengirim do detail ke google spreadsheet nomorDO ${nodo}, item: ${item}`)
    return fetch(url + parameter, {
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-site": "cross-site",
        "x-client-data": "CIi2yQEIpbbJAQipncoBCMuBywEIkqHLAQid/swBCP2YzQEIhaDNAQiZn84BCIuozgE="
    },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "no-cors",
        "credentials": "omit"
    });
}

function wait () {
    return new Promise((resolve) => {
        setTimeout(() => resolve, 1000 * 60 * 45)
    })
}

async function startCrawler() {
    const getListDO = await getPlanContainer();
    if( !getListDO || !getListDO?.length) return;

    let index = 1;
    const doPushed = <string[]>[];
    for(let nodo of getListDO) {
        if(!nodo.length || !nodo[0]) continue;
        console.log(`Mendapatkan informasi DO ${index} dari ${getListDO.length}`);
        
        if(doPushed.includes(nodo[0])) continue;
        const getDODetail = await getDetailDO(nodo[0]);
        if(!getDODetail) continue;

        for(let doDetail of getDODetail.dtl) {
           await sendDetailDOToGoogleAppScript(getDODetail.hdr.NoDo, doDetail.trno, doDetail.custname, doDetail.locationid, doDetail.description, doDetail.qtydo)
        }
    }
    index += 1
}