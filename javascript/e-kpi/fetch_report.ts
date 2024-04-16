const users_id = ["485", "556", "557", "558", "559", "560", "561", "562", "563", "564", "565", "566", "567", "568", "569", "570", "572", "573", "574", "575", "576", "577", "1743", "1744", "1745", "1747", "1748", "1749", "1750", "1751", "1976", "1977", "2318", "2319", "2320", "2321", "2322", "2323", "2324", "2325", "2326", "2327", "2328", "2329", "2330", "2331", "2332", "2333", "2334", "2335", "2336", "2337", "2338", "2339", "2340", "2341", "2342", "2343", "2344", "2345", "2346", "2347", "2348", "2349", "2350", "2351", "2352", "2353", "2354", "2355", "2356", "2357", "2358", "2359", "2360", "2361", "2362", "2363", "2364", "2365", "2366", "2367", "2368", "2369", "2370", "2371", "2372", "2373", "2374", "2375", "2376", "2377", "2378", "2379", "2380", "2381", "2382", "2383", "2384", "2385", "2386", "2387", "2388", "2389", "2390", "2391", "2392", "2393", "2394", "2395", "2396", "2397", "2398", "2399", "2400", "2401", "2402", "2403", "2404", "2405", "2406", "2407", "2408", "2409", "2410", "2411", "2412", "2413", "2414", "2415", "2416", "2417", "2418", "2419", "2420", "2421", "2422", "2423", "2424", "2425", "2426", "2427", "2428", "2429", "2430", "2431", "2432", "2433", "2434", "2435", "2436", "2437", "2438", "2439", "2440", "2441", "2442", "2443", "2444", "2445", "2446", "2447", "2448", "2449", "2450", "2451", "2452", "2453", "2454", "2455", "2456", "2457", "2458", "2459", "2460", "2461", "2462", "2463", "2464", "2465", "2466", "2467", "2468", "2469", "2470", "2471", "2472", "2473", "2474", "2475", "2476", "2477", "2478", "2479", "2480", "2481", "2482", "2483", "2484", "2485", "2486", "2487", "2488", "2489", "2490", "2491", "2492", "2493", "2494", "2495", "2496", "2497", "2498", "2499", "2500", "2501", "2502", "2503", "2504", "2505", "2506", "2507", "2508", "2509", "2510", "2511", "2512", "2513", "2514", "2515", "2516", "2517", "2518", "2519", "2520", "2521", "2522", "2523", "2673", "2524", "2525", "2526", "2527", "2528", "2529", "2530", "2531", "2532", "2533", "2534", "2535", "2536", "2537"]


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
    "nama": string,
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

    let timer = 700;
    let counter = 1;
    for(let user of users_id) {
        timer += 12;
        await new Promise(resolve => setTimeout(resolve, timer));
        if (timer >= 5000) timer = 650;

        console.log(`Memasukkan data ${counter++} dari ${users_id.length}`);

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

        const isNotOkeToInsert = !report.nama || report.status.approved == "0";

        if(isNotOkeToInsert) continue;
        
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
                    
        await fetch("http://182.16.186.138:8080/KPI/raport/edit_raport", {
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