interface data {
    supervisor_name: string
    documents: {
        date: string
        warehouse: string
    }[]
}

const mockData = <data[]>[
    {
        supervisor_name: "001",
        documents: [
            {"date":"2023/04/28","warehouse":"Russia"},
            {"date":"2023/07/13","warehouse":"China"},
            {"date":"2023/03/23","warehouse":"Indonesia"},
            {"date":"2023/01/19","warehouse":"Indonesia"},
            {"date":"2023/03/20","warehouse":"China"},
        ]
    },
    {
        supervisor_name: "002",
        documents: [
            {"date":"2023/08/25","warehouse":"Indonesia"},
            {"date":"2023/12/12","warehouse":"Brazil"},
            {"date":"2023/04/02","warehouse":"Peru"},
            {"date":"2023/03/19","warehouse":"Cameroon"},
            {"date":"2023/07/16","warehouse":"China"},
        ]
    },
    {
        supervisor_name: "003",
        documents: [
            {"date":"2023/12/22","warehouse":"Sweden"},
            {"date":"2023/10/16","warehouse":"Russia"},
            {"date":"2023/10/14","warehouse":"Senegal"},
            {"date":"2023/03/30","warehouse":"China"},
        ]
    },
    {
        supervisor_name: "004",
        documents: [
            {"date":"2023/06/26","warehouse":"China"},
            {"date":"2023/01/22","warehouse":"Russia"},
            {"date":"2023/06/24","warehouse":"Sweden"},
            {"date":"2023/07/19","warehouse":"China"},
            {"date":"2023/05/29","warehouse":"China"},
            {"date":"2023/05/12","warehouse":"Georgia"},
        ]
    },
    {
        supervisor_name: "005",
        documents: [
            {"date":"2023/05/02","warehouse":"Portugal"},
            {"date":"2023/09/14","warehouse":"China"},
            {"date":"2023/05/10","warehouse":"China"},
            {"date":"2023/09/23","warehouse":"Peru"},
        ]
    },
    {
        supervisor_name: "006",
        documents: [
            {"date":"2023/10/09","warehouse":"Indonesia"},
            {"date":"2023/04/22","warehouse":"Greece"},
            {"date":"2023/09/03","warehouse":"Philippines"}
        ]
    },
    {
        supervisor_name: "007",
        documents: [
            {"date":"2023/06/07","warehouse":"Honduras"},
            {"date":"2023/06/19","warehouse":"France"},
            {"date":"2023/08/13","warehouse":"China"},
        ]
    }
]

function renderData(data: data[]) {

    const body = document.querySelector("body");

    if(body === null) return;

    // loop data
    for(let datum of data) {
        // create p tag for wraper supervisor name
        let spvElm = document.createElement("p");
        spvElm.innerText = datum.supervisor_name
        // append spvElm to body
        body.appendChild(spvElm);

        // create table for documents
        let documents = document.createElement("table");
        
        const thead = document.createElement("thead")
        const th1 = document.createElement("th");
        th1.innerHTML = "Tanggal"
        thead.appendChild(th1)

        const th2 = document.createElement("th");
        th2.innerHTML = "Gudang"
        thead.appendChild(th2)

        const th3 = document.createElement("th");
        th3.innerHTML = "Selisih hari"
        thead.appendChild(th3)

        // append th to table
        documents.append(thead);

        // create td for table body
        for(let documentData of datum.documents) {
            const periode = new Date(documentData.date).getTime();
            const current = new Date().getTime();
            const varianceDay = Math.floor((current - periode) / (1000 * 60 * 60 * 24));

            const tbody = document.createElement("tbody");

            const td1 = document.createElement("td");
            td1.innerHTML = documentData.date;
            tbody.appendChild(td1)

            const td2 = document.createElement("td");
            td2.innerHTML = documentData.warehouse;
            tbody.appendChild(td2)

            const td3 = document.createElement("td");
            td3.innerHTML = `H+ ${varianceDay} Hari`;
            tbody.appendChild(td3)

            // append td to table
            documents.append(tbody)
        }
        
        body.append(documents);
        // append table to body
    }
}

renderData(mockData);