

interface pointReport {
    evaluation_point: string
    point: number|string
}

interface detailReport {
    category_evaluation: string
    data: pointReport[]
}

interface reportToRender {
    date_report: string|number
    data: detailReport[]
}

interface dailyReport {
    total_do: number,
    total_kendaraan: number,
    total_waktu: number,
    periode: number|string,
    shift: number,
    is_generated_document: boolean,
    item_variance: number,
    plan_out: number,
    total_item_keluar: number,
    total_item_moving: number,
    total_product_not_FIFO: number,
    total_qty_in: number,
    total_qty_out: number,
    total_komplain_muat: number
}

interface dataFromServer {
    daily_reports: dailyReport[],
    problems: [{
        periode: string,
        masalah: string,
        sumber_masalah: string,
        solusi: string,
        pic: string,
        dead_line: string
    }];
}

async function fetchDataFromServer (): Promise<dataFromServer> {
    let headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "JWT-Authorization": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2OTE2NDEwNzksIm5iZiI6MTY5MTY0MTA3OSwiZXhwIjoxNjkxNzI3NDc5LCJqdGkiOiJSQU5ET00gVE9LRU4gVE9LRU4gUkFORE9NIiwiaXNzIjoiam9obmRvZSIsImF1ZCI6InNpdGUuY29tIiwiZGF0YSI6eyJpZCI6IjEifX0.ZXRvx95Hq4fzg0tFAie1x6X2EH6RI_hMPYMA4Bqytk0",
        "Content-Type": "application/json"
       }
       
       let response = await fetch("http://localhost/rest-php/myreport/report/weekly_report?supervisor_id=nme22030008&periode1=1688317200000&periode2=1688749200000", { 
         method: "GET",
         headers: headersList
       });

       const is_request_failed = response?.status != 200;

       if(is_request_failed) {
        return {
            problems: [
            {
                periode: "1690300000000",
                masalah: "Report tidak ditemukan",
                sumber_masalah: "Report tidak ditemukan",
                solusi: "Report tidak ditemukan",
                pic: "Report tidak ditemukan",
                dead_line: "1690300000000"
            },
        ],
        "daily_reports": [
            {
                total_do: 11,
                total_kendaraan: 11,
                total_waktu: 180,
                periode: "1689008400000",
                shift: 1,
                is_generated_document: false,
                item_variance: 0,
                plan_out: 0,
                total_item_keluar: 0,
                total_item_moving: 0,
                total_product_not_FIFO: 0,
                total_qty_in: 0,
                total_qty_out: 0,
                total_komplain_muat: 0
            }]
            }
       }
       
       let data = await response.json();
       

       return data?.data as dataFromServer;
}

function convertDataToRender(data: dailyReport[]): reportToRender[] {
    let result = <reportToRender[]>[];
    for(let datum of data) {

        let interpretData = templateDataToRender(datum);

        result.push(interpretData);

    }

    return result;
}

function templateDataToRender(data: dailyReport): reportToRender {

    const periodeToLocaleString = Number(data.periode) > 0 ? new Date(Number(data.periode)).toLocaleDateString() : data.periode;
    const achievementAkurasiStock = Math.round(((data.total_item_moving - data.item_variance) / data.total_item_moving) * 100);
    const achievementAkurasiFIFO = Math.round(((data.total_item_keluar - data.total_product_not_FIFO) / data.total_item_keluar) * 100);
    const achievementAkurasiProdukTermuat = Math.round(((Number(data.total_qty_out) + Number(data.plan_out)) / data.total_qty_out) * 100);
    const achievementAkurasiWaktu = (data.total_qty_out / 10) < data.total_waktu ? "Not Ok" : "Ok";

    const scoreAkurasiStock = achievementAkurasiStock < 97 ? 5 : achievementAkurasiStock < 100 ? 6 : 7;
    const scoreAkurasiFIFO = achievementAkurasiFIFO < 97 ? 5 : achievementAkurasiFIFO < 100 ? 6 : 7;
    const scoreAkurasiProdukTermuat = ((100 + achievementAkurasiProdukTermuat)/2) >= 100 ? 7 : ((100 + achievementAkurasiProdukTermuat)/2) < 97 ? 6 : 5 ;
    const scoreAkurasiWaktu = achievementAkurasiWaktu == 'Ok' ? 7 : 5;
    const scoreKomplainMuat = data.total_komplain_muat == 0 ? 7 : 5;
    const scoreRataRata = (scoreAkurasiStock + scoreAkurasiFIFO + scoreAkurasiProdukTermuat +scoreAkurasiWaktu + scoreKomplainMuat) / 5;

    let result:reportToRender = {
        date_report: periodeToLocaleString,
        data: [
            { 
                category_evaluation: "Akurasi stock",
                data: [
                    { evaluation_point: "Total produk masuk gudang", point: data.total_qty_in },
                    { evaluation_point: "Jumlah item produk yang moving", point: data.total_item_moving },
                    { evaluation_point: "Jumlah item produk yang ada variance", point: data.item_variance },
                    { evaluation_point: "Pencapaian", point: achievementAkurasiStock  + '%'},
                ]
            },
            { 
                category_evaluation: "Akurasi FIFO",
                data: [
                    { evaluation_point: "Jumlah Item Produk yg Keluar (diShipment)", point: data.total_item_keluar },
                    { evaluation_point: "Jumlah Item Produk yg Tidak FIFO", point: data.total_product_not_FIFO },
                    { evaluation_point: "Pencapaian", point: achievementAkurasiFIFO  + '%'},
                ]
            },
            { 
                category_evaluation: "Akurasi muat (DO)",
                data: [
                    { evaluation_point: "Jumlah DO dari Logistik", point: data.total_do },
                    { evaluation_point: "Jumlah DO yg termuat", point: data.total_do },
                    { evaluation_point: "Pencapaian", point: '100%' },
                    { evaluation_point: "Jumlah Produk sesuai DO", point: Number(data.total_qty_out) + Number(data.plan_out) },
                    { evaluation_point: "Jumlah Produk yg termuat", point: data.total_qty_out },
                    { evaluation_point: "Pencapaian", point: achievementAkurasiProdukTermuat  + '%'},
                ]
            },
            { 
                category_evaluation: "Akurasi waktu muat",
                data: [
                    { evaluation_point: "Standard Waktu Muat (Menit)", point: data.total_qty_out / 10 },
                    { evaluation_point: "Realisasi Waktu Muat (Menit)", point: data.total_waktu },
                    { evaluation_point: "Pencapaian", point: achievementAkurasiWaktu },
                ]
            },
            { 
                category_evaluation: "JUMLAH KOMPLAIN CUSTOMER",
                data: [
                    { evaluation_point: "Total komplain", point: data.total_komplain_muat },
                ]
            },
            { 
                category_evaluation: "Score kuantitatif",
                data: [
                    { evaluation_point: "AKURASI STOK", point: scoreAkurasiStock },
                    { evaluation_point: "AKURASI FIFO", point: scoreAkurasiFIFO },
                    { evaluation_point: "AKURASI MUAT (DO)", point: scoreAkurasiProdukTermuat},
                    { evaluation_point: "AKURASI WAKTU MUAT", point: scoreAkurasiWaktu },
                    { evaluation_point: "JUMLAH KOMPLAIN QUANTITY (t/-) DARI CUSTOMER", point: scoreKomplainMuat },
                    { evaluation_point: "Rata rata score", point: scoreRataRata },
                ]
            },
        ]
    }

    return result;
}

    let mockData = <reportToRender[]>[
        {
            date_report: "14-Jul-2023",
            data: [
                { 
                    category_evaluation: "Akurasi stock",
                    data: [
                        { evaluation_point: "Total produk masuk gudang", point: 134891 },
                        { evaluation_point: "Jumlah item produk yang moving", point: 214 },
                        { evaluation_point: "Jumlah item produk yang ada variance", point: 0 },
                        { evaluation_point: "Pencapaian", point: 100 },
                    ]
                },
                { 
                    category_evaluation: "Akurasi FIFO",
                    data: [
                        { evaluation_point: "Jumlah Item Produk yg Keluar (diShipment)", point: 252 },
                        { evaluation_point: "Jumlah Item Produk yg Tidak FIFO", point: 0 },
                        { evaluation_point: "Pencapaian", point: 100 },
                    ]
                },
                { 
                    category_evaluation: "Akurasi muat (DO)",
                    data: [
                        { evaluation_point: "Jumlah DO dari Logistik", point: 237 },
                        { evaluation_point: "Jumlah DO yg termuat", point: 237 },
                        { evaluation_point: "Jumlah Produk sesuai DO", point: 146932 },
                        { evaluation_point: "JumlahProduk yg termuat", point: 146932 },
                        { evaluation_point: "Pencapaian", point: 100 },
                    ]
                },
                { 
                    category_evaluation: "Akurasi waktu muat",
                    data: [
                        { evaluation_point: "Standard Waktu Muat (Menit)", point: 14693.2 },
                        { evaluation_point: "Realisasi Waktu Muat (Menit)", point: 9644 },
                        { evaluation_point: "Pencapaian", point: "OK" },
                    ]
                },
                { 
                    category_evaluation: "JUMLAH KOMPLAIN CUSTOMER",
                    data: [
                        { evaluation_point: "Total komplain", point: 0 },
                    ]
                },
                { 
                    category_evaluation: "Score kuantitatif",
                    data: [
                        { evaluation_point: "AKURASI STOK", point: 7 },
                        { evaluation_point: "AKURASI FIFO", point: 7 },
                        { evaluation_point: "AKURASI MUAT (DO)", point: 7 },
                        { evaluation_point: "AKURASI WAKTU MUAT", point: 7 },
                        { evaluation_point: "JUMLAH KOMPLAIN QUANTITY (t/-) DARI CUSTOMER", point: 7 },
                        { evaluation_point: "Rata rata score", point: 7 },
                    ]
                },
            ]
        }
    ]
    let problems: string[] = [];

    function renderData () {

        const reportWrapper = document.getElementById("report-wraper");
    
        for (let [index, report] of mockData.entries()) {

            const divElmReportWraper = document.createElement("div");
            divElmReportWraper.setAttribute("class", "report-wraper");

            const divElmReportDate = document.createElement("div");
            divElmReportDate.setAttribute("class", "report-date");

            const spanElmDateReport = document.createElement("span");
            spanElmDateReport.innerText = report.date_report + '';

            divElmReportDate.appendChild(spanElmDateReport);
            divElmReportWraper.appendChild(divElmReportDate);

            const divElmDetailReportWrapper = document.createElement("div");
            const classToSet = index + 1 == mockData.length ? "detail-report-wrapper" : "detail-report-wrapper hide-content";
            divElmDetailReportWrapper.setAttribute("class", classToSet);

            divElmReportDate.addEventListener('click', () => {
                toggleHideContent(divElmDetailReportWrapper);
            }, true);

            // looping data
            for(let eval of report.data) {
            
                const divElmDetailReport = document.createElement("div");
                divElmDetailReport.setAttribute("class", "detail-report");
            
                const table = document.createElement("table");

                const tableHead = document.createElement("thead");
                const tableHeadRow = document.createElement("tr");
                const tableHeadCol = document.createElement("th");
                tableHeadCol.setAttribute("colspan", "2")
                tableHeadCol.innerText = eval.category_evaluation;

                tableHeadRow.append(tableHeadCol);
                tableHead.append(tableHeadRow)
                table.append(tableHead);


                const tableBody = document.createElement("tbody");
                for(let evalPoint of eval.data) {
                    const tableBodyRow = document.createElement("tr");
                    const tableBodyCol1 = document.createElement("td");
                    const tableBodyCol2 = document.createElement("td");

                    tableBodyCol1.innerText = evalPoint.evaluation_point;
                    tableBodyCol2.innerText = evalPoint.point + '';
                    tableBodyCol2.setAttribute("class", "point");

                    tableBodyRow.appendChild(tableBodyCol1);
                    tableBodyRow.appendChild(tableBodyCol2);

                    tableBody.appendChild(tableBodyRow);
                }
                
                table.appendChild(tableBody);

                divElmDetailReport.appendChild(table);

                divElmDetailReportWrapper.appendChild(divElmDetailReport)

            }

            divElmReportWraper.appendChild(divElmDetailReportWrapper);

            if(reportWrapper == null) return;

            reportWrapper.appendChild(divElmReportWraper);
        }

        const elmDivProblem = document.createElement("div");
        elmDivProblem.setAttribute("class", "report-problem");

        const titleReportProblem = document.createElement("h2");
        titleReportProblem.innerText = "Penjelasan atas target output yang tidak cerpai:"

        elmDivProblem.appendChild(titleReportProblem);

        for(let [index, problem] of problems.entries()) {
            const elmParagraph = document.createElement("p");
            elmParagraph.innerText = index + 1 + '. ' + problem;
            
            elmDivProblem.appendChild(elmParagraph);
        }

        reportWrapper?.appendChild(elmDivProblem);

    }

    function toggleHideContent(element: HTMLDivElement) {

        
        const isContentHidden = element.className.includes("hide-content");
        
        if(isContentHidden) {
            
            const getAllDetailReportWraper = document.getElementsByClassName("detail-report-wrapper");
    
            for(let DailyWraperelm of getAllDetailReportWraper) {
    
                DailyWraperelm.classList.add("hide-content");
    
            }
            element.classList.remove("hide-content");
        } else {
            
            element.classList.add("hide-content")
        }
    }

    function totalAllDailyReport (data: dailyReport[]): dailyReport {
        let result:dailyReport = {
            total_qty_in: 0,
            total_item_moving: 0,
            total_item_keluar: 0,
            total_product_not_FIFO: 0,
            total_do: 0,
            total_qty_out: 0,
            plan_out: 0,
            total_waktu: 0,
            is_generated_document: data[0].is_generated_document,
            item_variance: data[0].item_variance,
            periode: "Rata rata point",
            shift: data[0].shift,
            total_kendaraan: data[0].total_kendaraan,
            total_komplain_muat: 0,
        };

        for(let datum of data) {
            result.total_qty_in += Number(datum.total_qty_in)
            result.total_item_moving += Number(datum.total_item_moving)
            result.total_item_keluar += Number(datum.total_item_keluar)
            result.total_product_not_FIFO += Number(datum.total_product_not_FIFO)
            result.total_do += Number(datum.total_do)
            result.total_qty_out += Number(datum.total_qty_out)
            result.plan_out += Number(datum.plan_out)
            result.total_waktu += Number(datum.total_waktu)
            result.total_komplain_muat += Number(datum.total_komplain_muat)
        }

        return result;
    }

async function reRenderData () {
    const dataFromServer = await fetchDataFromServer();
    let totalSumReport = totalAllDailyReport(dataFromServer.daily_reports);
    
    dataFromServer.daily_reports.push(totalSumReport);
    let intepretDataFromServer = convertDataToRender(dataFromServer.daily_reports);

    mockData = intepretDataFromServer;
    dataFromServer.problems.forEach((rec) => {
        const periodeProblem = new Date(Number(rec.periode)).toLocaleDateString();

        const stringToPush = `${periodeProblem} ${rec.masalah} ${rec.sumber_masalah} ${rec.solusi}`;

        problems.push(stringToPush);
    });
    renderData();
}

reRenderData();