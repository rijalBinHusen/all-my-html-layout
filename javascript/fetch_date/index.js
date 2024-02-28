async function startFetch(date1, date2) {
    let result = [];
    const retrieve_history = await fetch(`${location.origin}/warehouse/history/get_list_muat?tgl1=${date1}&tgl2=${date2}&nodo=&checklist=&tally=&src=1&flag=2`, {
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
        if (timer >= 5000) {
            timer = 700;
        }
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
            const dateTransaction = date_details.toISOString().slice(0, 10);
            // is item exists
            const findIndex = result.findIndex((res) => res.date_transaction === dateTransaction && res.item_kode === detail.dtl[0].itemid && res.shift === shift);
            const isItemOnResult = findIndex > -1;
            const dateExpired = convertToDateCreatedGoods(item.expired);
            if (isItemOnResult) {
                const isDateExists = result[findIndex].date_expired.includes(dateExpired);
                // date doesn't exists
                if (!isDateExists)
                    result[findIndex].date_expired.push(dateExpired);
            }
            // item doesn't exists
            else {
                const findItemIdIndex = detail.dtl.findIndex((d) => d.lineno === item.lineno);
                const item_kode = detail.dtl[findItemIdIndex].itemid;
                result.push({
                    id: result.length,
                    date_expired: [dateExpired],
                    date_transaction: dateTransaction,
                    item_kode,
                    shift,
                    selesai_muat: detail.hdr.selesai_muat,
                    gudang: detail.hdr.gudang
                });
            }
        }
    }
    if (!result.length)
        return;
    const filename = `Tanggal expired transaksi ${date1} sampai dengan ${date2}.json`;
    const jsonStr = JSON.stringify(result);
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
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
