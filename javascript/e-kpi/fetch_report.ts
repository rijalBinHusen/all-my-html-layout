
interface Kuantitatif {
    "id_kuanti": string,
    "id_user": string,
    "desk": string,
    "indikator": string,
    "params": string,
    "bobot": string,
    "draft": string,
    "active": string,
    "edited_by": string,
    "edited_on": string
}

interface Kualitatif {
    "id_kuali": string,
    "id_user": string,
    "desk": string,
    "params": string,
    "bobot": string,
    "draft": string,
    "active": string,
    "edited_by": string,
    "edited_on": string
}

interface Report_response {
    "nama": "Saiful Rizal ",
    "status": {
        "approved": null,
        "number": null,
        "draft": null
    },
    "doc": [],
    "s_apv": {
        "number": null,
        "number2": null
    },
    "kuanti": Kuantitatif[],
    "kuali": Kualitatif[],
    "ansum1": "",
    "ansum2": ""
}


async function insert_kpi(users_id: string[], periode1: string, periode2: string) {

    // const users_id = ["2525","2530","2498","2499","2415","2495","2411","2527","2407","2501","2455","2417","2433","2431","2534","2478","2448","2521","2409","2423","2519","2526","2503","2518","2497","2435","2506","2493","2522","2426","2490","2486","2473","2504","2465","2476","2458","2482","2508","2469","2533","2677","2672","2673","2507","2430","2509","2450","2531","2532","2513","2459","2512","2462","2416","2457","2429","2524","2424","2471","2449","2480","2528","2410","2461","2470","2517","2472","2510","2425","2537","2440","2419","2475","2420","2535","2434","2502","2452","2412","2437","2536","2500","2463","2511","2405","2444","2505","2487","2464","2438","2427","2454","2413","2421","2447","2436","2422","2414","2418","2516","2468","2403","2406","2488","2408","2400","2477","2443","2401","2520","2439","2442","2479","2446","2515","2494","2484","2402","2466","2467","2451","2441","2460","2453","2432","2485","2529","2481","2445","2514","2483","2456","2489","2404","2492","2428","2523","2474","2496","2491","2674"];

    for(let user of users_id) {

        const response_report = await fetch(`http://182.16.186.138:8080/KPI/raport/detail_raport?id=${user}&dept=7&raport=&tgl1=${periode1}&tgl2=${periode2}`, {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrer": "http://182.16.186.138:8080/KPI/raport",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        if(response_report.status !== 200) continue;

        const report = await response_report.json() as Report_response;
        
        if(report.nama) {

            const formData = new FormData();

            // add kuantitatif
            for(let [index, kuan] of report.kuanti.entries()) {
                formData.append(`target1[${index}]`, '100');
                formData.append(`real1[${index}]`, '100');
                formData.append(`id1[${index}]`, '');
                formData.append(`indikator1[${index}]`, kuan.indikator);
                formData.append(`params1[${index}]`, kuan.params);
                formData.append(`bobot1[${index}]`, kuan.bobot);
                formData.append(`ach1[${index}]`, '100');
            }

            // add kualitatif
            for(let kual of report.kuali) {
                formData.append(`target2[]`, '100');
                formData.append(`real2[]`, '100');
                formData.append(`id2[]`, '');
                formData.append(`desk2[]`, kual.desk);
                formData.append(`params2[]`, kual.params);
                formData.append(`bobot2[]`, kual.bobot);
                formData.append(`ach2[]`, '100');
            }

            formData.append("document[]", "(binary)");
            formData.append("id_user", user);
            formData.append("id_dept", "7");
            formData.append("id_raport", "");
            formData.append("tgl_awal", periode1);
            formData.append("tgl_akhir", periode2);
            formData.append("nama", report.nama);
                        
            fetch("http://182.16.186.138:8080/KPI/raport/edit_raport", {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "max-age=0",
                    "upgrade-insecure-requests": "1"
                },
                "referrer": "http://182.16.186.138:8080/KPI/raport",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": formData,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            });
        }
    }
}