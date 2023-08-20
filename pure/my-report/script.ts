

interface pointReport {
    evaluation_point: string
    point: number | string
    className?: string
}

interface detailReport {
    category_evaluation: string
    data: pointReport[]
}

interface reportToRender {
    className?: string
    date_report: string | number
    data: detailReport[]
}

interface dailyReport {
    total_do: number,
    total_kendaraan: number,
    total_waktu: number,
    periode: number | string,
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

function isEpochTime(number: number): boolean {
    // Check if the number is a string.
    if (typeof number !== "number") {
        return false;
    }

    // Check if the number is a valid Unix epoch time.
    try {
        // Convert the number to a Date object.
        const date = new Date(number);

        // Check if the date is a valid Unix epoch time.
        const millisecondsSinceEpoch = date.getTime();
        const nowTime = new Date().getTime();
        return millisecondsSinceEpoch >= 1664582400000 && millisecondsSinceEpoch <= nowTime;

    } catch (error) {

        return false;
    }
}

async function fetchDataFromServer(): Promise<dataFromServer> {

    const defaultResponse: dataFromServer = {
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
            }
        ]
    };

    const urlSearch = window.location.search;
    const urlSplitted = urlSearch.split('&');
    const responsibleSearch = urlSplitted[0].split("=");
    const isHeadSupervisorMode = responsibleSearch[0] === '?head_supervisor_id';
    const isSupervisorMode = responsibleSearch[0] === '?supervisor_id';
    const responsibleToSearch = responsibleSearch[1];

    const periode1URL = urlSplitted[1].split("=");
    const isRequestPeriode1 = periode1URL[0] === 'periode1';
    const isRequestPeriode1EpochTime = isEpochTime(Number(periode1URL[1]));
    const perioded1ToSearch = Number(periode1URL[1]);

    const periode2URL = urlSplitted[2].split("=");
    const isRequestPeriode2 = periode2URL[0] === 'periode2';
    const isRequestPeriode2EpochTime = isEpochTime(Number(periode2URL[1]));
    const periode2ToSearch = Number(periode2URL[1]);

    const isResponsibleOke = isHeadSupervisorMode || isSupervisorMode;
    const isURLSearchOke = isResponsibleOke && isRequestPeriode1 && isRequestPeriode2 && isRequestPeriode1EpochTime && isRequestPeriode2EpochTime;

    if (!isURLSearchOke) return defaultResponse;

    const backEndURL = "https://www.rijalbinhusen.cloud/myreport/report/weekly_report";
    const urlToFetch = `${backEndURL}${responsibleSearch[0]}=${responsibleToSearch}&periode1=${perioded1ToSearch}&periode2=${periode2ToSearch}`

    let headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json"
    }

    let response = await fetch(urlToFetch, {
        method: "GET",
        headers: headersList
    });

    const is_request_failed = response?.status != 200;

    if (is_request_failed) {

        return defaultResponse;
    }

    let data = await response.json();


    return data?.data as dataFromServer;
}

function convertDataToRender(data: dailyReport[]): reportToRender[] {
    let result = <reportToRender[]>[];
    for (let datum of data) {

        let interpretData = templateDataToRender(datum);

        result.push(interpretData);

    }

    return result;
}

function templateDataToRender(data: dailyReport): reportToRender {

    const periodeToLocaleString = Number(data.periode) > 0 ? new Date(Number(data.periode)).toLocaleDateString() : data.periode;

    const achievementAkurasiStock = ((data.total_item_moving - data.item_variance) / data.total_item_moving) * 100;
    const achievementAkurasiFIFO = ((data.total_item_keluar - data.total_product_not_FIFO) / data.total_item_keluar) * 100;
    const achievementAkurasiProdukTermuat = ((Number(data.total_qty_out) + Number(data.plan_out)) / data.total_qty_out) * 100;
    const achievementAkurasiWaktu = (data.total_qty_out / 10) < data.total_waktu ? "Not Ok" : "Ok";

    const scoreAkurasiStock = achievementAkurasiStock < 97 ? 5 : achievementAkurasiStock < 100 ? 6 : 7;
    const scoreAkurasiFIFO = achievementAkurasiFIFO < 97 ? 5 : achievementAkurasiFIFO < 100 ? 6 : 7;
    const scoreAkurasiProdukTermuat = ((100 + achievementAkurasiProdukTermuat) / 2) >= 100 ? 7 : ((100 + achievementAkurasiProdukTermuat) / 2) < 97 ? 6 : 5;
    const scoreAkurasiWaktu = achievementAkurasiWaktu == 'Ok' ? 7 : 5;
    const scoreKomplainMuat = data.total_komplain_muat == 0 ? 7 : 5;
    const scoreRataRata = (scoreAkurasiStock + scoreAkurasiFIFO + scoreAkurasiProdukTermuat + scoreAkurasiWaktu + scoreKomplainMuat) / 5;

    const classNameScoreAkurasiStock = achievementAkurasiStock < 97 ? 'red' : achievementAkurasiStock < 100 ? 'yellow' : 'green';
    const classNameScoreAkurasiFIFO = achievementAkurasiFIFO < 97 ? 'red' : achievementAkurasiFIFO < 100 ? 'yellow' : 'green';
    const classNameScoreAkurasiProdukTermuat = ((100 + achievementAkurasiProdukTermuat) / 2) >= 100 ? 'green' : ((100 + achievementAkurasiProdukTermuat) / 2) < 97 ? 'yellow' : 'red';
    const classNameScoreAkurasiWaktu = achievementAkurasiWaktu == 'Ok' ? 'green' : 'red';
    const classNameScoreKomplainMuat = data.total_komplain_muat == 0 ? 'green' : 'red';
    const classNameScoreRataRata = scoreRataRata < 6 ? 'red' : scoreRataRata < 7 ? 'yellow' : 'green';

    let result: reportToRender = {
        className: classNameScoreRataRata,
        date_report: periodeToLocaleString,
        data: [
            {
                category_evaluation: "Akurasi stock",
                data: [
                    { evaluation_point: "Total produk masuk gudang", point: data.total_qty_in },
                    { evaluation_point: "Jumlah item produk yang moving", point: data.total_item_moving },
                    { evaluation_point: "Jumlah item produk yang ada variance", point: data.item_variance },
                    { evaluation_point: "Pencapaian", point: achievementAkurasiStock.toFixed(2) + '%', className: classNameScoreAkurasiStock },
                ]
            },
            {
                category_evaluation: "Akurasi FIFO",
                data: [
                    { evaluation_point: "Jumlah Item Produk yg Keluar (diShipment)", point: data.total_item_keluar },
                    { evaluation_point: "Jumlah Item Produk yg Tidak FIFO", point: data.total_product_not_FIFO },
                    { evaluation_point: "Pencapaian", point: achievementAkurasiFIFO.toFixed(2) + '%', className: classNameScoreAkurasiFIFO },
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
                    { evaluation_point: "Pencapaian", point: achievementAkurasiProdukTermuat.toFixed(2) + '%', className: classNameScoreAkurasiProdukTermuat },
                ]
            },
            {
                category_evaluation: "Akurasi waktu muat",
                data: [
                    { evaluation_point: "Standard Waktu Muat (Menit)", point: data.total_qty_out / 10 },
                    { evaluation_point: "Realisasi Waktu Muat (Menit)", point: data.total_waktu },
                    { evaluation_point: "Pencapaian", point: achievementAkurasiWaktu, className: classNameScoreAkurasiWaktu },
                ]
            },
            {
                category_evaluation: "JUMLAH KOMPLAIN CUSTOMER",
                data: [
                    { evaluation_point: "Total komplain", point: data.total_komplain_muat, className: classNameScoreKomplainMuat },
                ]
            },
            {
                category_evaluation: "Score kuantitatif",
                data: [
                    { evaluation_point: "AKURASI STOK", point: scoreAkurasiStock, className: classNameScoreAkurasiStock },
                    { evaluation_point: "AKURASI FIFO", point: scoreAkurasiFIFO, className: classNameScoreAkurasiFIFO },
                    { evaluation_point: "AKURASI MUAT (DO)", point: scoreAkurasiProdukTermuat, className: classNameScoreAkurasiProdukTermuat },
                    { evaluation_point: "AKURASI WAKTU MUAT", point: scoreAkurasiWaktu, className: classNameScoreAkurasiWaktu },
                    { evaluation_point: "JUMLAH KOMPLAIN QUANTITY (t/-) DARI CUSTOMER", point: scoreKomplainMuat, className: classNameScoreKomplainMuat },
                    { evaluation_point: "Rata rata score", point: scoreRataRata, className: classNameScoreRataRata },
                ]
            },
        ]
    }

    return result;
}

let mockData = <reportToRender[]>[];
let problems: string[] = [];

function renderData() {

    const reportWrapper = document.getElementById("report-wraper");

    for (let i = 0; i < mockData.length; i++) {

        let report = mockData[i];

        const divElmReportWraper = document.createElement("div");
        divElmReportWraper.setAttribute("class", "report-wraper");

        const divElmReportDate = document.createElement("div");
        divElmReportDate.setAttribute("class", "report-date " + report.className);

        const spanElmDateReport = document.createElement("span");
        spanElmDateReport.innerText = report.date_report + '';

        divElmReportDate.appendChild(spanElmDateReport);
        divElmReportWraper.appendChild(divElmReportDate);

        const divElmDetailReportWrapper = document.createElement("div");
        const classToSet = i === mockData.length ? "detail-report-wrapper" : "detail-report-wrapper hide-content";
        divElmDetailReportWrapper.setAttribute("class", classToSet);

        divElmReportDate.addEventListener('click', () => {
            toggleHideContent(divElmDetailReportWrapper);
        }, true);


        // looping data
        for (let eval of report.data) {

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
            for (let evalPoint of eval.data) {

                const tableBodyRow = document.createElement("tr");
                tableBodyRow.setAttribute("class", evalPoint.className || "no-class");

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

        if (reportWrapper == null) return;

        reportWrapper.appendChild(divElmReportWraper);
    }

    const elmDivProblem = document.createElement("div");
    elmDivProblem.setAttribute("class", "report-problem");

    const titleReportProblem = document.createElement("h2");
    titleReportProblem.innerText = "Penjelasan atas target output yang tidak cercapai:"

    elmDivProblem.appendChild(titleReportProblem);

    for (let problem of problems) {
        const elmParagraph = document.createElement("p");
        elmParagraph.innerHTML = problem;

        elmDivProblem.appendChild(elmParagraph);
    }

    reportWrapper?.appendChild(elmDivProblem);

}

function toggleHideContent(element: HTMLDivElement) {

    // scroll to top
    window.scrollTo(0, 0);

    const isContentHidden = element.className.includes("hide-content");

    if (isContentHidden) {

        const getAllDetailReportWraper = document.getElementsByClassName("detail-report-wrapper");

        for (let DailyWraperelm of getAllDetailReportWraper) {

            DailyWraperelm.classList.add("hide-content");

        }
        element.classList.remove("hide-content");
    } else {

        element.classList.add("hide-content")
    }
}

function totalAllDailyReport(data: dailyReport[]): dailyReport {
    let result: dailyReport = {
        total_qty_in: 0,
        total_item_moving: 0,
        total_item_keluar: 0,
        total_product_not_FIFO: 0,
        total_do: 0,
        total_qty_out: 0,
        plan_out: 0,
        total_waktu: 0,
        is_generated_document: data[0].is_generated_document,
        item_variance: 0,
        periode: "Grand total",
        shift: data[0].shift,
        total_kendaraan: data[0].total_kendaraan,
        total_komplain_muat: 0,
    };

    for (let datum of data) {
        result.total_qty_in += Number(datum.total_qty_in)
        result.total_item_moving += Number(datum.total_item_moving)
        result.total_item_keluar += Number(datum.total_item_keluar)
        result.total_product_not_FIFO += Number(datum.total_product_not_FIFO)
        result.total_do += Number(datum.total_do)
        result.total_qty_out += Number(datum.total_qty_out)
        result.plan_out += Number(datum.plan_out)
        result.total_waktu += Number(datum.total_waktu)
        result.total_komplain_muat += Number(datum.total_komplain_muat)
        result.item_variance += Number(datum.item_variance)
    }

    return result;
}

async function reRenderData() {
    const dataFromServer = await fetchDataFromServer();
    let totalSumReport = totalAllDailyReport(dataFromServer.daily_reports);

    dataFromServer.daily_reports.push(totalSumReport);
    let intepretDataFromServer = convertDataToRender(dataFromServer.daily_reports);

    mockData = intepretDataFromServer;
    dataFromServer.problems.forEach((rec) => {
        const periodeProblem = new Date(Number(rec.periode)).toLocaleDateString();

        let stringToPush = `<b>Periode: ${periodeProblem}</b> <br/>`
        stringToPush += `<b>Masalah: </b>${rec.masalah} <br/>`;
        stringToPush += `<b>Sumber masalah: </b> ${rec.sumber_masalah}<br/>`;
        stringToPush += `<b>Solusi: </b> ${rec.solusi}`;

        problems.push(stringToPush);
    });
    renderData();
}

reRenderData();