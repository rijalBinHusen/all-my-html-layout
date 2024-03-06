async function startFetch(date1, date2) {
    let result = [];
    // report/get_list_item_out?tgl1=2024-02-29&tgl2=2024-02-29&nodo=&item_tgl1=2024-02-29&item_tgl2=2024-02-29&item_name=&item_id=&src=1
    // const retrieve_history = await fetch(`${location.origin}/warehouse/history/get_list_muat?tgl1=${date1}&tgl2=${date2}&nodo=&checklist=&tally=&src=1&flag=2`, {
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
    if (retrieve_history.status != 200)
        return;
    const groupingOutput = [];
    const allOutput = await retrieve_history.json();
    allOutput.forEach((output) => {
        const isOutputPushed = groupingOutput.findIndex((grouped) => grouped.nodo === output.nodo && grouped.sysdo === output.sysdo && grouped.id_muat === output.id_muat);
        // record never pushed
        if (isOutputPushed === -1) {
            groupingOutput.push(output);
        }
    });
    let count = 0;
    let timer = 700;
    for (let out of groupingOutput) {
        timer += 70;
        await new Promise(resolve => setTimeout(resolve, timer));
        if (timer >= 5000)
            timer = 700;
        count++;
        console.log(`mendapatkan data ${count} dari ${groupingOutput.length}`);
        const retrieve_detail = await fetch(`${location.origin}/warehouse/history/detail_muat?nodo=${out.nodo}&sysdo=${out.sysdo}&id_muat=${out.id_muat}`, {
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
        if (retrieve_detail.status != 200)
            return;
        const detail = await retrieve_detail.json();
        for (let item of detail.m_item) {
            const date_details = detail.hdr.selesai_muat ? new Date(detail.hdr.selesai_muat) : new Date();
            const transaction_clock = date_details.getHours();
            let shift = 3;
            // 07 - 14, 15 - 22, 23 - 06
            const isShift1 = transaction_clock >= 7 && transaction_clock <= 14;
            const isShift2 = transaction_clock >= 15 && transaction_clock <= 22;
            // const isShift3 = transaction_clock >= 23 || transaction_clock <= 6;
            // shift
            if (isShift1)
                shift = 1;
            else if (isShift2)
                shift = 2;
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
            result.push({
                date_transaction: dateTransaction,
                no_do: out.nodo,
                no_pol: detail.hdr.nopol,
                gudang: detail.hdr.gudang,
                shift,
                mulai_muat: detail.hdr.jam_muat,
                selesai_muat: detail.hdr.selesai_muat,
                item_kode,
                item_name,
                qty: Number(item.qty),
                date_expired: dateExpired,
                tally: item.created_by,
                karu: out.update_by,
                catatan: item.note.replaceAll(",", ""),
                fifo_or_not_fifo: "FIFO",
                real_date: item.expired
            });
        }
    }
    // sort by item kode
    // sort by end loading
    // @ts-ignore
    result.sort(function (a, b) {
        // Sort by count
        const mulaiMuatA = new Date(a.mulai_muat);
        const mulaiMuatB = new Date(b.mulai_muat);
        var dCount = mulaiMuatA.getTime() - mulaiMuatB.getTime();
        if (dCount)
            return dCount;
        let x = a.item_kode.toLowerCase();
        let y = b.item_kode.toLowerCase();
        if (x < y) {
            return -1;
        }
        if (x > y) {
            return 1;
        }
        return 0;
    });
    // find fifo or not fifo
    // if expired_date[0] > expired_date[1] 'not fifo'
    for (let out of result) {
        const findRerod = result.find((rec) => rec.item_kode === out.item_kode);
        if (findRerod) {
            const firstExpired = new Date(findRerod.date_expired).getTime();
            const currExpired = new Date(out.date_expired).getTime();
            if (currExpired < firstExpired) {
                out.fifo_or_not_fifo = "Not FIFO";
            }
        }
    }
    if (!result.length)
        return;
    const convertedToCSV = objToCsv(result);
    const filename = `Tanggal expired transaksi ${date1} sampai dengan ${date2}`;
    downloadAsFile(convertedToCSV, filename + ".csv");
    downloadAsFile(JSON.stringify(result), filename + ".json");
}
function downloadAsFile(object, filename) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(object));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
function convertToDateCreatedGoods(yourDate) {
    let now = new Date();
    // date now
    let dateNow = now.getDate();
    // month now
    let monthNow = now.getMonth() + 1;
    // gett only 2 string year
    let year = now.getFullYear().toString().slice(2);
    // if value is number
    const convertDate = new Date(yourDate);
    let dateInput = convertDate.getDate();
    // if user input number more than date now
    if (dateInput > dateNow) {
        // return number / month before now / year value
        const monthToReturn = (monthNow - 1) > 0 ? monthNow - 1 : 12;
        const yearToReturn = (monthNow - 1) > 0 ? year : Number(year) - 1;
        return `${dateInput}/${monthToReturn}/${yearToReturn}`;
    }
    // return number / month now / year now
    return `${dateInput}/${monthNow}/${year}`;
}
function greatestDate(date1, date2) {
    const date1Splited = date1.split("/");
    const date2Splited = date2.split("/");
    // compare date and month
    const isDate1Greater = date1Splited[0] > date2Splited[0] && date1Splited[1] >= date2Splited[1];
    return isDate1Greater ? date1 : date2;
}
function objToCsv(data) {
    const headers = Object.keys(data[0]).join();
    const content = data.map(r => Object.values(r).join());
    return [headers].concat(content).join("\n");
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
