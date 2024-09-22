interface historyResponse {
    "sysdo": string,
    "trdate": string,
    "jamdo": string,
    "tgl_do2": string,
    "jam_do2": string,
    "nodo": string,
    "nopol": string,
    "nama_sopir": string,
    "jeniskendaraan": string,
    "tujuan": string,
    "flag_priority": null,
    "id_antrian": string,
    "antrian": string,
    "datetime": string,
    "datetime2": string,
    "flag": string,
    "id_muat": string,
    "jam_muat": string,
    "selesai_muat": string,
    "dock": string,
    "checklist": string,
    "signature": string,
    "id_trans": string,
    "nopol2": string,
    "jenis_kendaraan2": string,
    "nama_sopir2": string,
    "jam_in": string,
    "jam_out": string,
    "area": string,
    "id_gudang": string,
    "gudang": string,
    "kode": string,
    "locid": string,
    "area2": string,
    "dock2": string,
    "pic": string
}

interface hdr {
    sysdo: string,
    trdate: string,
    jamdo: string,
    tgl_do2: string,
    jam_do2: string,
    nodo: string,
    nopol: string,
    nama_sopir: string,
    jeniskendaraan: string,
    tujuan: string,
    flag_priority: null,
    id_antrian: string,
    antrian: string,
    datetime: string,
    datetime2: string,
    flag: string,
    id_muat: string,
    jam_muat: string,
    selesai_muat: string,
    dock: string,
    checklist: string,
    signature: string,
    id_trans: string,
    nopol2: string,
    jenis_kendaraan2: string,
    nama_sopir2: string,
    jam_in: string,
    jam_out: string,
    area: string,
    id_gudang: string,
    gudang: string,
    kode: string,
    locid: string,
    area2: string,
    dock2: string
}

interface dtl {
    sysdo: string,
    sys: string,
    lineno: string,
    qtydo: string,
    qtydo2: string,
    id_muat: string,
    lineno_split: null,
    trno: string,
    description: string,
    itemid: string,
    unitid: string,
    qty: string,
    locationid: string
}

interface m_item {
    sysdo: string,
    sys: string,
    lineno: string,
    qtydo: string,
    qtydo2: string,
    id_muat: string,
    lineno_split: string,
    locid: string,
    id_mi: string,
    id_m: string,
    awal: string,
    qty: string,
    rak: string,
    expired: string,
    note: string,
    approved: string,
    flag: string,
    created_by: string
}

interface detailResponse {
    hdr: hdr,
    dtl: dtl[],
    m_item: m_item[],
}

interface result {
    no_do: string,
    date_transaction: string,
    shift: number
    item_kode: string,
    item_name: string
    date_expired: string
    real_date: string
    mulai_muat: string
    selesai_muat: string,
    gudang: string
    tally: string
    karu: string
    qty: number
    no_pol: string
    catatan: string
    fifo_or_not_fifo: string
}

interface list_item_out {
    sysdo: string,
    sys: string,
    lineno: string,
    qtydo: string,
    qtydo2: string,
    id_muat: string,
    lineno_split: null,
    nodo: string,
    trno: string,
    nopol: string,
    description: string,
    itemid: string,
    unitid: string,
    qty: string,
    awal: string,
    selisih: string,
    rak: string,
    expired: string,
    flag: string,
    created_by: string,
    times: string, // start 
    times2: string,
    jam_muat: string, // get in dock
    checklist: string,
    update_by: string,
    custname: string,
    locationid: string
}


async function startFetch(date1: string, date2: string) {

    let result = <result[]>[];

    // report/get_list_item_out?tgl1=2024-02-29&tgl2=2024-02-29&nodo=&item_tgl1=2024-02-29&item_tgl2=2024-02-29&item_name=&item_id=&src=1
    // const retrieve_history = await fetch(`${location.origin}/warehouse/history/get_list_muat?tgl1=${date1}&tgl2=${date2}&nodo=&checklist=&tally=&src=1&flag=2`, {
    // http://192.168.8.7:8080/warehouse/history/get_list_muat?tgl1=2024-05-07&tgl2=2024-05-07&nodo=&checklist=&tally=&src=1&flag=2
    const retrieve_history = await fetch(`${location.origin}/warehouse/report/get_list_item_out?tgl1=${date1}&tgl2=${date2}&nodo=&item_tgl1=${date1}&item_tgl2=${date2}&item_name=&item_id=&src=1`, {
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

    if (retrieve_history.status != 200) return

    const groupingOutput = <list_item_out[]>[];

    const allOutput = await retrieve_history.json() as list_item_out[];

    for (let output of allOutput) {
        const dateTransaction = convertToDateTransactionAndShift(output.times2);
        const dateExpired = convertToDateCreatedGoods(output.expired);

        result.push({
            date_transaction: dateTransaction.dateTransaction,
            no_do: output.nodo,
            no_pol: output.nopol,
            gudang: output.locationid,
            shift: dateTransaction.shift,
            mulai_muat: output.jam_muat,
            selesai_muat: output.times2,
            item_kode: output.itemid,
            item_name: output.description,
            qty: Number(output.qty),
            date_expired: dateExpired,
            tally: output.created_by,
            karu: output.update_by,
            catatan: "Kosong",
            fifo_or_not_fifo: "FIFO",
            real_date: output.expired
        })

        const isCoretDO = output.qtydo != output.qtydo2;

        if (isCoretDO) {

        }

    }
    // ============== Old concept

    // allOutput.forEach((output) => {
    //     const isOutputPushed = groupingOutput.findIndex((grouped) => grouped.nodo === output.nodo && grouped.sysdo === output.sysdo && grouped.id_muat === output.id_muat);

    //     // record never pushed
    //     if (isOutputPushed === -1) {
    //         groupingOutput.push(output)
    //     }
    // })

    let count = 0;
    let timer = 700;

    // for (let out of groupingOutput) {

    //     timer += 70
    //     await new Promise(resolve => setTimeout(resolve, timer));
    //     if (timer >= 5000) timer = 700;

    //     count++
    //     console.log(`mendapatkan data ${count} dari ${groupingOutput.length}`);

    // sort by item kode
    // sort by end loading
    // @ts-ignore
    result.sort(function (a, b) {
        // Sort by count
        const mulaiMuatA = new Date(a.mulai_muat);
        const mulaiMuatB = new Date(b.mulai_muat);
        var dCount = mulaiMuatA.getTime() - mulaiMuatB.getTime();
        if (dCount) return dCount;

        let x = a.item_kode.toLowerCase();
        let y = b.item_kode.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
    });

    // find fifo or not fifo
    // if expired_date[0] > expired_date[1] 'not fifo'
    for (let out of result) {
        const findIndex = result.findLastIndex((rec) => rec.item_kode === out.item_kode);

        if (findIndex > -1) {

            const record = result[findIndex]

            const firstDateSplit = record.date_expired.split("/");
            const firstExpired = new Date(`${firstDateSplit[1]}/${firstDateSplit[0]}/24`).getTime();

            const currExpSplit = out.date_expired.split("/");
            const currExpired = new Date(`${currExpSplit[1]}/${currExpSplit[0]}/24`).getTime();

            if (currExpired < firstExpired) {
                out.fifo_or_not_fifo = "Not FIFO"
            }
        }
    }


    if (!result.length) return;

    const convertedToCSV = objToCsv(result);
    const filename = `Tanggal expired transaksi ${date1} sampai dengan ${date2}`;
    downloadAsFile(convertedToCSV, filename + ".csv");
    downloadAsFile(JSON.stringify(result), filename + ".json")
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

function convertToDateCreatedGoods(yourDate: string) {
    let now = new Date()
    // date now
    let dateNow = now.getDate()
    // month now
    let monthNow = now.getMonth() + 1
    // gett only 2 string year
    let year = now.getFullYear().toString().slice(2)

    // if value is number
    const convertDate = new Date(yourDate);
    let dateInput = convertDate.getDate();
    // if user input number more than date now
    if (dateInput > dateNow) {
        // return number / month before now / year value
        const monthToReturn = (monthNow - 1) > 0 ? monthNow - 1 : 12
        const yearToReturn = (monthNow - 1) > 0 ? year : Number(year) - 1
        return `${dateInput}/${monthToReturn}/${yearToReturn}`
    }
    // return number / month now / year now
    return `${dateInput}/${monthNow}/${year}`
}

function greatestDate(date1: string, date2: string) {

    const date1Splited = date1.split("/");
    const date2Splited = date2.split("/")
    // compare date and month
    const isDate1Greater = date1Splited[0] > date2Splited[0] && date1Splited[1] >= date2Splited[1];

    return isDate1Greater ? date1 : date2
}

function objToCsv(data: any) {
    const headers = Object.keys(data[0]).join();
    const content = data.map(r => Object.values(r).join());
    return [headers].concat(content).join("\n");
}

const googleScriptURL = "https://script.google.com/macros/s/AKfycbw7QsdSavj5gooDuyiISmDDMMg4y34hSzHxkvXEOV3Y9A5ooXmRRjbTI4TU9X416PHk9A/exec"

function sendToGoogleAppScript(nodo: string, register: string, mulai: string, selesai: string, so: string, item_id: string, item_description: string, qty: number, nopol: string, jenis_kendaraan: string, location_id: string, user_check: string, name_gudang: string, dock: string, next_gudang: string, tujuan: string) {

    const date_finished = new Date(selesai);
    const transaction_clock = date_finished.getHours();
    let shift = 3;

    // 07 - 14, 15 - 22, 23 - 06
    const isShift1 = transaction_clock >= 7 && transaction_clock <= 14;
    const isShift2 = transaction_clock >= 15 && transaction_clock <= 22;

    if (isShift1) shift = 1;
    else if (isShift2) shift = 2;

    const registerMuat = new Date(register);
    const startMuat = new Date(mulai);
    const selesaiMuat = new Date(selesai);

    const lamaMuat = (selesaiMuat.getTime() - startMuat.getTime()) / (1000 * 60);
    const idleMuat = (startMuat.getTime() - registerMuat.getTime()) / (1000 * 60);

    const parameterURLGoogleScript = `?action=insert&nodo=${nodo}&register=${register}&start=${mulai}&finish=${selesai}&noso=${so}&item_id=${item_id}&item_description=${item_description}&qty=${qty}&nopol=${nopol}&jenis_kendaraan=${jenis_kendaraan}&ekspedisi=tidak ditemukan&location_id=${location_id}&user_check=${user_check}&status_muat=done&gudang=${name_gudang}&dock=${dock}&shift=${shift}&lama_muat=${lamaMuat}&idle=${idleMuat}&total_qty=${qty}&id_gudang=${location_id}&next_gudang=${next_gudang}&customer=${tujuan}`;
    return fetch(googleScriptURL + parameterURLGoogleScript, {
        mode: "no-cors"
    });
}

function convertToDateTransactionAndShift(yourDate: string): { dateTransaction: string, shift: number } {

    const date_details = yourDate ? new Date(yourDate) : new Date();
    const transaction_clock = date_details.getHours();

    let shift = 3;

    // 07 - 14, 15 - 22, 23 - 06
    const isShift1 = transaction_clock >= 7 && transaction_clock <= 14;
    const isShift2 = transaction_clock >= 15 && transaction_clock <= 22;
    // const isShift3 = transaction_clock >= 23 || transaction_clock <= 6;

    // shift
    if (isShift1) shift = 1;
    else if (isShift2) shift = 2;
    else {
        // shift 3
        if (transaction_clock < 7) {
            // if shift 3 and clock < 7 the date - 1
            date_details.setDate(date_details.getDate() - 1);
        }
    }


    const dateTransaction = date_details.toLocaleDateString("id-ID");
    return { dateTransaction, shift };
}

async function detailingCoretDO(nodo: string, sysdo: string, id_muat: string): Promise<undefined> {
    // ?action=insert&noDO=${}&register=${}&start=${}&finish=${}&noSO=${}&itemId=${}&qty=${}&nopol=${}&jenisKendaraan=${}&ekspedisi=${}&locationId=${}&userCheck=${}&statusMuat=${}&gudang=${}&dock=${}&shift=${}&lamaMuat=${}&idle=${}&totalQty=${}&idGudang=${}&nextGudang
    const retrieve_detail = await fetch(`${location.origin}/warehouse/history/detail_muat?nodo=${nodo}&sysdo=${sysdo}&id_muat=${id_muat}`, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "upgrade-insecure-requests": "1"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });

    if (retrieve_detail.status != 200) return;

    const detail = await retrieve_detail.json() as detailResponse;

    // await sendToGoogleAppScript(out.nodo, detail.hdr.datetime, detail.hdr.jam_muat,detail.hdr.selesai_muat,out.trno, out.itemid, out.description,Number(detail.dtl[0].qty),detail.hdr.nopol,detail.hdr.jenis_kendaraan2,detail.hdr.locid,detail.m_item[0].created_by,detail.hdr.gudang,detail.hdr.dock2,"tidak ditemukan", detail.hdr.tujuan)

    for (let item of detail.m_item) {

        const date_details = detail.hdr.selesai_muat ? new Date(detail.hdr.selesai_muat) : new Date();
        const transaction_clock = date_details.getHours();

        let shift = 3;

        // 07 - 14, 15 - 22, 23 - 06
        const isShift1 = transaction_clock >= 7 && transaction_clock <= 14;
        const isShift2 = transaction_clock >= 15 && transaction_clock <= 22;
        // const isShift3 = transaction_clock >= 23 || transaction_clock <= 6;

        // shift
        if (isShift1) shift = 1;
        else if (isShift2) shift = 2;
        else {
            // shift 3
            if (transaction_clock < 7) {
                // if shift 3 and clock < 7 the date - 1
                date_details.setDate(date_details.getDate() - 1);
            }
        }


        const dateTransaction = date_details.toLocaleDateString("id-ID");

        const dateExpired = convertToDateCreatedGoods(item.expired);

        const findItemIdIndex = detail.dtl.findIndex((d) => d.lineno === item.lineno);
        const item_kode = detail.dtl[findItemIdIndex].itemid;
        // @ts-ignore
        const item_name = detail.dtl[findItemIdIndex].description.replaceAll(",", "");

    }

// const test = [
//     { date_expect: "22/2/24", test: greatestDate("22/2/24", "8/2/24") },
//     { date_expect: "23/2/24", test: greatestDate("23/2/24", "8/2/24") },
//     { date_expect: "21/2/24", test: greatestDate("21/2/24", "8/2/24") },
//     { date_expect: "20/2/24", test: greatestDate("20/2/24", "8/2/24") },
//     { date_expect: "16/2/24", test: greatestDate("16/2/24", "8/2/24") },
//     { date_expect: "24/3/24", test: greatestDate("21/3/24", "24/3/24") },
//     { date_expect: "21/2/24", test: greatestDate("26/1/24", "21/2/24") },
//     { date_expect: "24/2/24", test: greatestDate("31/1/24", "24/2/24") },
//     { date_expect: "26/4/24", test: greatestDate("23/4/24", "26/4/24") },
//     { date_expect: "28/5/24", test: greatestDate("24/3/24", "28/5/24") },
//     { date_expect: "31/3/24", test: greatestDate("24/2/24", "31/3/24") },
//     { date_expect: "12/7/24", test: greatestDate("23/6/24", "12/7/24") },
//     { date_expect: "14/8/24", test: greatestDate("23/5/24", "14/8/24") },
// ]

// for (let t of test) {
//     console.log(t.test === t.test)
// }