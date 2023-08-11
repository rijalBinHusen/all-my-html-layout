

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
    id: string,
    collected: number,
    approval: number,
    status: number,
    shared: number,
    finished: number,
    total_do: number,
    total_kendaraan: number,
    total_waktu: number,
    base_report_file: string,
    is_finished: boolean,
    supervisor_id: string,
    periode: number|string,
    shift: number,
    head_spv_id: string,
    warehouse_id: string,
    is_generated_document: boolean,
    item_variance: number,
    parent: string,
    parent_document: string,
    plan_out: number,
    total_item_keluar: number,
    total_item_moving: number,
    total_product_not_FIFO: number,
    total_qty_in: number,
    total_qty_out: number,
    total_komplain_muat: number
}

interface dataFromServer {
    dailyReport: dailyReport[],
    problem: string[];
}

// function randomNumber (): number {
//     return Math.random() * 1000
// }

async function fetchDataFromServer (): Promise<dataFromServer> {
    let dailyReport:dailyReport[] = [];
    let problem: string[] = [];
    const date = new Date();
    for(let i = 1; i < 7; i ++) {
        date.setDate(date.getDate() + 1);
        dailyReport.push({
            approval: 19238019238,
            base_report_file: "kaljsdh",
            collected: 109238901238,
            finished: 109283019238,
            head_spv_id: "aslkdjhfksjhdfkljsdhfjkh",
            id: "1lksjdf",
            is_finished: true,
            is_generated_document: false,
            item_variance: 0,
            parent: "sldkfj",
            parent_document: "sldkfjskdjf",
            periode: date.getTime(),
            plan_out: 0,
            shared: 10923810293,
            shift: 1,
            status: 2,
            supervisor_id: "sldkfjslkdfj",
            total_do: 123,
            total_item_keluar: 1231,
            total_item_moving: 123,
            total_kendaraan: 234,
            total_product_not_FIFO: 123,
            total_qty_in: 123,
            total_qty_out: 123,
            total_waktu: 123,
            warehouse_id: "1o23809",
            total_komplain_muat: 0
        })

        problem.push("dlskjlakdf skdfj sdlkjs dfkjsad fpowieur pwoersdf lskdfjlk pwoeir laksdjf a;kjf pwoeri")
    }

    return { dailyReport, problem };
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

    const periodeToLocaleString = Number(data.periode) > 0 ? new Date(data.periode).toISOString().slice(0, 10) : data.periode;
    const achievementAkurasiStock = Math.round(((data.total_item_moving - data.item_variance) / data.total_item_moving) * 100);
    const achievementAkurasiFIFO = Math.round(((data.total_item_keluar - data.total_product_not_FIFO) / data.total_item_keluar) * 100);
    const achievementAkurasiProdukTermuat = Math.round(((data.total_qty_out + data.plan_out) / data.total_qty_out) * 100);
    const achievementAkurasiWaktu = data.total_qty_out / 10 > data.total_waktu ? "Not Ok" : "Ok";

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
                    { evaluation_point: "Jumlah Produk sesuai DO", point: data.total_qty_out + data.plan_out },
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
        elmDivProblem.setAttribute("class", "problem-report");

        for(let [index, problem] of problems.entries()) {
            const elmParagraph = document.createElement("p");
            elmParagraph.innerText = index + '. ' + problem;
            
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
            approval: data[0].approval,
            base_report_file: data[0].base_report_file,
            collected: data[0].collected,
            finished: data[0].finished,
            head_spv_id: data[0].head_spv_id,
            id: data[0].id,
            is_finished: data[0].is_finished,
            is_generated_document: data[0].is_generated_document,
            item_variance: data[0].item_variance,
            parent: data[0].parent,
            parent_document: data[0].parent_document,
            periode: "Rata rata point",
            shared: data[0].shared,
            shift: data[0].shift,
            status: data[0].status,
            supervisor_id: data[0].supervisor_id,
            total_kendaraan: data[0].total_kendaraan,
            warehouse_id: data[0].warehouse_id,
            total_komplain_muat: 0,
        };

        for(let datum of data) {
            result.total_qty_in += datum.total_qty_in
            result.total_item_moving += datum.total_item_moving
            result.total_item_keluar += datum.total_item_keluar
            result.total_product_not_FIFO += datum.total_product_not_FIFO
            result.total_do += datum.total_do
            result.total_qty_out += datum.total_qty_out
            result.plan_out += datum.plan_out
            result.total_waktu += datum.total_waktu
            result.total_komplain_muat += datum.total_komplain_muat
        }

        return result;
    }

async function reRenderData () {
    const dataFromServer = await fetchDataFromServer();
    let totalSumReport = totalAllDailyReport(dataFromServer.dailyReport);
    
    dataFromServer.dailyReport.push(totalSumReport);
    let intepretDataFromServer = convertDataToRender(dataFromServer.dailyReport);
    mockData = intepretDataFromServer;
    problems = dataFromServer.problem;
    renderData();
}

reRenderData();