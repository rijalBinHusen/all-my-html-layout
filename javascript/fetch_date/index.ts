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
    "dock2": string
  }

interface dtl {
    "sysdo": string,
    "sys": string,
    "lineno": string,
    "qtydo": string,
    "qtydo2": string,
    "id_muat": string,
    "lineno_split": null,
    "trno": string,
    "description": string,
    "itemid": string,
    "unitid": string,
    "qty": string,
    "locationid": string
  }

interface m_item {
      "sysdo": string,
      "sys": string,
      "lineno": string,
      "qtydo": string,
      "qtydo2": string,
      "id_muat": string,
      "lineno_split": null,
      "locid": null,
      "id_mi": string,
      "id_m": string,
      "awal": string,
      "qty": string,
      "rak": string,
      "expired": string,
      "note": string,
      "approved": string,
      "flag": string,
      "created_by": string
}

interface detailResponse {
    hdr: hdr,
    dtl: dtl[],
    m_item: m_item[]
}

interface result {
    id: number,
    date_transaction: string,
    shift: number
    item_kode: string,
    date_expired: string[]
}


async function startFetch(date1: string, date2: string) {

    const display = document.getElementById("display");

    let result = <result[]>[];

    const retrieve_history = await fetch(`http://192.168.8.7:8080/warehouse/history/get_list_muat?tgl1=${date1}&tgl2=${date2}&nodo=&checklist=&tally=&src=1&flag=2`, {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "x-requested-with": "XMLHttpRequest"
        },
            "referrer": "http://192.168.8.7:8080/warehouse/history/gudang",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        if(retrieve_history.status != 200) return

        const allOutput = await retrieve_history.json() as historyResponse[];

        let count = 0;
        let timer = 700;

        for(let out of allOutput) {

            timer += 70
            await new Promise(resolve => setTimeout(resolve, timer));
            if(timer >= 5000) {
                timer = 700
            }

            if(display) {
                count++
                display.innerHTML = `mendapatkan data ${count} dari ${allOutput.length}`;
            }
            
            const retrieve_detail = await fetch(`http://192.168.8.7:8080/warehouse/history/detail_muat?nodo=${out.nodo}&sysdo=${out.sysdo}&id_muat=${out.id_muat}`, {
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

            if(retrieve_detail.status != 200) return;

            const date_details = out.selesai_muat ? new Date(out.selesai_muat) : new Date();
            const transaction_clock = date_details.getHours();

            let shift = 3;

            // 07 - 14, 15 - 22, 23 - 06
            const isShift1 = transaction_clock >= 7 && transaction_clock <= 14;
            const isShift2 = transaction_clock >= 15 && transaction_clock <= 22;
            // const isShift3 = transaction_clock >= 23 || transaction_clock <= 6;

            // shift
            if(isShift1) shift = 1;
            else if(isShift2) shift = 2;
            else {
                // shift 3
                if(transaction_clock < 7) {
                    // if shift 3 and clock < 7 the date - 1
                    date_details.setDate(date_details.getDate() - 1);
                }
            }

            const detail = await retrieve_detail.json() as detailResponse;

            const dateTransaction = date_details.toISOString().slice(0, 10);

            // if(result.length == 4) continue;

            
            for(let item of detail.m_item) {
                
                // is item exists
                const findIndex = result.findIndex((res) => res.date_transaction === dateTransaction && res.item_kode === detail.dtl[0].itemid && res.shift === shift);
                const isItemOnResult = findIndex > -1;

                if(isItemOnResult) {
                    const isDateExists = result[findIndex].date_expired.includes(item.expired);
                    
                    if(!isDateExists) result[findIndex].date_expired.push(item.expired);
                } 
                
                // item doesn't exists
                else {

                    result.push({
                        id: result.length,
                        date_expired: [item.expired],
                        date_transaction: dateTransaction,
                        item_kode: detail.dtl[0].itemid,
                        shift
                    })
                }
            }
        }

        if(!result.length) return;

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