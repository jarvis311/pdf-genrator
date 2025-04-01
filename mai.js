export const checkUpdateRcValidation = async (owenDBfields, fieldName) => {
    try {
        // Destructure all possible fields from the input object
        const updateDataArray = {};

        const {
            regn_dt,               // Vehicle registration date (e.g., "15-JAN-2020")
            chasi_no,              // Vehicle chassis number (e.g., "MAJFCHS1234567890")
            engine_no,             // Vehicle engine number (e.g., "EN1234567890")
            owner_sr_no,           // Owner serial number (e.g., 1)
            owner_name,            // Owner's full name (e.g., "John Doe")
            father_name,           // Owner's father's name (e.g., "Robert Doe")
            address,               // Owner's address (e.g., "123 Main St, City")
            regn_at,               // Registration RTO location (e.g., "RTO-Delhi")
            fuel_type,             // Fuel type (e.g., "PETROL", "DIESEL")
            maker_modal,           // Vehicle model (e.g., "SWIFT-DZIRE")
            maker,                 // Vehicle manufacturer (e.g., "MARUTI")
            cubic_cap,             // Engine cubic capacity (e.g., "1197 CC")
            vehicle_color,         // Vehicle color (e.g., "WHITE")
            fitness_upto,          // Fitness certificate expiry (e.g., "15-JAN-2025")
            financer_details,      // Financer information if financed (e.g., "HDFC Bank")
            fuel_norms,            // Fuel norm compliance (e.g., "BS-IV")
            blacklist_status,      // Blacklist status (e.g., "CLEAN")
            noc_details,           // NOC details if any (e.g., "NOC for state transfer")
            insurance_comp,        // Insurance company name (e.g., "ICICI Lombard")
            body_type_desc,        // Vehicle body type (e.g., "SEDAN")
            puc_upto,              // PUC certificate expiry (e.g., "15-JAN-2024")
            insurance_upto,        // Insurance expiry date (e.g., "15-JAN-2024")
            veh_class,             // Vehicle class (e.g., "LMV")
            manufacturer_month_yr, // Manufacturing month/year (e.g., "JAN-2020")
            policy_no,             // Insurance policy number (e.g., "POL12345678")
            mobile_no,              // Owner's mobile number (e.g., "9876543210")
            puc_no,                // PUC certificate number (e.g., "PUC123456")
            no_of_seats,           // Number of seats (e.g., "5")
            gvw,                   // Gross Vehicle Weight (e.g., "1500 KG")
            no_of_cyl,             // Number of cylinders (e.g., "4")
            sleeper_cap,           // Sleeper capacity (for commercial vehicles) (e.g., "2")
            stand_cap,             // Standing capacity (for buses) (e.g., "0")
            wheelbase,             // Wheelbase measurement (e.g., "2450 MM")
            permit_no,             // Permit number (e.g., "PER123456")
            permit_issue_date,     // Permit issue date (e.g., "15-JAN-2020")
            permit_from,           // Permit valid from date (e.g., "15-JAN-2020")
            permit_upto,           // Permit expiry date (e.g., "15-JAN-2025")
            permit_type,           // Permit type (e.g., "NATIONAL PERMIT")
            tax_upto,              // Tax paid upto date (e.g., "15-JAN-2025")
            rc_np_no,              // RC/NP number (e.g., "NP123456")
            rc_np_upto,            // RC/NP valid upto date (e.g., "15-JAN-2025")
            rc_np_issued_by,       // RC/NP issuing authority (e.g., "RTO-Delhi")
            rc_unld_wt,
            vehicle_age,
            vehicle_model             // Unladen weight (e.g., "1000 KG")
        } = fieldName;


        // Iterate over the keys of staticField
        // for (const key in staticField) {
        //     if (Object.prototype.hasOwnProperty.call(staticField, key)) {
        //         if (owenDBfields[key] == null) {
        //             // Update owenDBfields with the value from staticField
        //             updateDataArray[key] = staticField[key];
        //         }
        //     }
        // }


        updateDataArray['source'] = fieldName.source
        updateDataArray['updated_at'] = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        // Reference to existing database fields
        let exist = owenDBfields;

        // 1. Registration Date
        // Update if existing field is missing or invalid
        if (!exist?.regn_dt || exist?.regn_dt == "NA" || exist?.regn_dt == "null") {
            if (regn_dt && regn_dt != "NA" && moment(regn_dt).isValid()) {
                updateDataArray['regn_dt'] = regn_dt; // e.g., "15-JAN-2020"
            }
        }

        // 2. Chassis Number
        // Update if existing field is missing, contains placeholders, or is invalid : // e.g., "MAJFCHS1234567890"
        // if (isInvalidString(exist?.chasi_no) || exist?.chasi_no?.includes("XXXXXX") || exist?.chasi_no?.includes("XXXX") && chasi_no) {
        //     if (isValidString(chasi_no) && !chasi_no?.includes("XXXXXX") && !chasi_no?.includes("XXXX") && !chasi_no?.includes("**")) {
        //         updateDataArray['chasi_no'] = chasi_no;
        //     } else if (chasi_no && !chasi_no?.substr(chasi_no?.length - 5)?.includes("XXXXXX") && !chasi_no?.includes("**")) {
        //         updateDataArray['chasi_no'] = chasi_no;
        //     }
        // } else {
        //     // Special case: if existing chassis number is too short (5 chars) and new one is longer and valid
        //     if ((exist?.chasi_no?.length == 5) && chasi_no?.length > 5 && !chasi_no?.includes('XXXX')) {
        //         updateDataArray['chasi_no'] = chasi_no;
        //     }
        // }

        if (validateAndUpdateChassieEngineField(exist?.chasi_no, chasi_no, "chasi_no")) {
            updateDataArray["chasi_no"] = chasi_no;
        }
        // 3. Engine Number
        // Similar logic to chassis number
        // if ((!exist?.engine_no || exist?.engine_no == "null" || exist?.engine_no?.includes("XXXXXX") || exist?.engine_no?.includes("XXXX")) && engine_no) {
        //     if (engine_no && !engine_no?.includes("XXXXXX") && !engine_no?.includes("XXXX")) {
        //         updateDataArray['engine_no'] = engine_no; // e.g., "EN1234567890"
        //     } else if (engine_no && !engine_no?.substr(engine_no?.length - 5)?.includes("XXXXXX")) {
        //         updateDataArray['engine_no'] = engine_no;
        //     }
        // } else {
        //     if (exist?.engine_no?.length == 5 && engine_no?.length > 5 && !engine_no?.includes('XXXX')) {
        //         updateDataArray['engine_no'] = engine_no;
        //     }
        // }
        if (validateAndUpdateChassieEngineField(exist?.engine_no, engine_no, "engine_no")) {
            updateDataArray["engine_no"] = engine_no;
        }
        // 4. Policy Number

        if (validateAndUpdateCommonField(exist?.policy_no, policy_no)) {
            if (exist?.policy_no !== policy_no) {
                updateDataArray['policy_no'] = policy_no; // e.g., "POL12345678"
            }
        } else {
            if (policy_no && !policy_no?.includes("XXXXX") && policy_no !== "NA") {
                if (exist?.policy_no !== policy_no) {
                    // Only update if new policy number is longer (more complete)
                    if (policy_no?.length > exist?.policy_no?.length) {
                        updateDataArray['policy_no'] = policy_no;
                    }
                }
            }
        }

        // 5. Mobile Number
        // Update if missing or invalid, and new number is valid 10-digit
        if (isInvalidString(exist?.mobile_no) && isValidString(mobile_no) && mobile_no?.length == 10) {
            updateDataArray['mobile_no'] = mobile_no; // e.g., "9876543210"
        }

        // 6. Owner Information Block
        // This includes owner serial number, name, father's name, address, and RTO
        if ((!exist?.owner_sr_no && owner_sr_no) || ((exist?.owner_sr_no && owner_sr_no) && exist?.owner_sr_no < owner_sr_no)) {
            updateDataArray['owner_sr_no'] = owner_sr_no; // e.g., 1

            // Update related owner information if serial number is being updated
            if (owner_name && owner_name !== "NA") {
                updateDataArray['owner_name'] = owner_name; // e.g., "John Doe"
            }
            if (father_name && father_name != "" && father_name !== "NA" && father_name !== ".") {
                updateDataArray['father_name'] = father_name; // e.g., "Robert Doe"
            }
            if (address && address !== "NA") {
                updateDataArray['address'] = address; // e.g., "123 Main St, City"
            }
            if (regn_at && regn_at !== "NA") {
                updateDataArray['rto'] = regn_at; // e.g., "RTO-Delhi"
                updateDataArray['regn_at'] = regn_at;
            }
        } else {
            // If not updating by serial number, check individual fields
            // Owner Name
            if ((!exist?.owner_name || exist?.owner_name === "NA" || exist?.owner_name?.includes("*") || exist?.owner_name == "null") && owner_name) {
                if (owner_name && owner_name != "NA") {
                    if (!checkString(owner_name)) { // Assuming checkString verifies if string is masked
                        updateDataArray['owner_name'] = owner_name;
                    }
                }
            } else {
                let maskOwnername = convertString(exist?.owner_name); // Assuming convertString masks a string
                if (exist?.owner_name.includes("*") && (exist?.owner_name && owner_name && owner_name != "NA" && owner_name != "") && maskOwnername != owner_name) {
                    if (!checkString(owner_name)) {
                        updateDataArray['owner_name'] = owner_name;
                    }
                }
            }

            // Father's Name
            if (!exist?.father_name || exist?.father_name?.includes("*") || exist?.father_name === "NA") {
                if (father_name && father_name !== "NA" && father_name !== "." && father_name != "") {
                    if (!checkString(father_name)) {
                        updateDataArray['father_name'] = father_name;
                    }
                }
            } else {
                let maskfather_name = convertString(exist?.father_name);
                if (exist?.father_name?.includes("*") && (exist?.father_name && father_name && father_name != "NA" && father_name != "") && maskfather_name != father_name) {
                    if (!checkString(father_name)) {
                        updateDataArray['father_name'] = father_name;
                    }
                }
            }

            // Address
            if ((!exist?.address || exist?.address === "NA" || exist?.address == "null") && address && address !== "NA" && exist?.address != address) {
                updateDataArray['address'] = address;
            }

            // RTO
            if ((!exist?.rto || exist?.rto == "null" || exist?.rto == "NA") && regn_at && regn_at != "" && regn_at !== "NA") {
                updateDataArray['rto'] = regn_at;
            }
        }

        // 7. Fuel Type
        if (isInvalidString(exist?.fuel_type) && isValidString(fuel_type) && fuel_type != "Not Available") {
            if (exist?.fuel_type !== fuel_type) {
                updateDataArray['fuel_type'] = fuel_type; // e.g., "PETROL"
            }
        }

        // 8. Maker/Model
        if (isInvalidString(exist?.maker_modal) && isValidString(maker_modal)) {
            if (exist?.maker_modal !== maker_modal && maker_modal?.length > exist?.maker_modal?.length) {
                updateDataArray['maker_modal'] = maker_modal; // e.g., "SWIFT-DZIRE"
            }
        }

        // 19. PUC Upto
        if (isInvalidString(exist?.puc_upto) && isValidString(puc_upto)) {
            updateDataArray['puc_upto'] = puc_upto;
        } else if (isValidString(puc_upto) && isValidString(exist?.puc_upto)) {
            const existPuc = moment(exist?.puc_upto, ['DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'], true);
            const newPuc = moment(puc_upto, ['DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'], true);
            if (newPuc.isAfter(existPuc)) {
                updateDataArray['puc_upto'] = convertDateFormat(puc_uptos, 'DD-MM-YYYY');; // e.g., "15-JAN-2024"
            }
        }

        // 20. Insurance Upto 
        //exist?.insUpto 27-Jan-2035, insurance_upto = 27-Jan-2036(any format)
        if (isInvalidString(exist?.insUpto) && isValidString(insurance_upto)) {
            updateDataArray['insUpto'] = convertDateFormat(insurance_upto, 'DD-MM-YYYY'); // e.g., "15-JAN-2024" // format :  27-Jan-2035()
        } else if (isValidString(insurance_upto) && isValidString(exist?.insUpto)) {
            const existInsurence = moment(exist?.insUpto, ['DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'], true);
            const invisiableInsurence = moment(insurance_upto, ['DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'], true);
            if (invisiableInsurence.isAfter(existInsurence)) {
                updateDataArray['insUpto'] = convertDateFormat(insurance_upto, 'DD-MM-YYYY'); // e.g., "15-JAN-2024" // format :  27-Jan-2035()

            }
        }

        // 12. Fitness Upto
        if (isInvalidString(exist?.fitness_upto) && isValidString(fitness_upto)) {
            updateDataArray['fitness_upto'] = convertDateFormat(fitness_upto, 'DD-MM-YYYY');; // e.g., "15-JAN-2025"
        } else if (isValidString(fitness_upto) && isValidString(exist?.fitness_upto)) {
            const existFitness = moment(exist?.fitness_upto, ['DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'], true);
            const newFitness = moment(fitness_upto, ['DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'], true);
            // Only update if new date is later than existing date
            if (newFitness.isAfter(existFitness)) {
                updateDataArray['fitness_upto'] = convertDateFormat(fitness_upto, 'DD-MM-YYYY');; // e.g., "15-JAN-2025"

            }
        }

        // 17. Insurance Company
        if (isInvalidString(exist?.insurance_comp) && isValidString(insurance_comp)) {
            if (exist?.insurance_comp !== insurance_comp) {
                if (insurance_comp?.length > exist?.insurance_comp?.length) {
                    updateDataArray['insurance_comp'] = insurance_comp;
                }
            }
        }
        // 22. Manufacturer Month/Year
        if (isInvalidString(exist?.manufacturer_month_yr) && isValidString(manufacturer_month_yr)) {
            updateDataArray['manufacturer_month_yr'] = convertDateFormat(manufacturer_month_yr, 'DD-MM-YYYY') // e.g., "10/2019"
        }


        // 9. Maker
        if (!exist?.maker || exist?.maker == "null" || exist?.maker?.includes("XXXXXXXX") || exist?.maker === "NA") {
            if (maker && !maker?.includes("XXXXXXXX") && maker !== "NA") {
                updateDataArray['maker'] = maker; // e.g., "MARUTI"
            }
        } else {
            if (maker && !maker?.includes("XXXXXXXX") && maker !== "NA") {
                if (exist?.maker !== maker) {
                    if (maker?.length > exist?.maker?.length) {
                        updateDataArray['maker'] = maker;
                    }
                }
            }
        }

        // 10. Cubic Capacity
        if ((exist?.cubic_cap === "NA" || exist?.cubic_cap == "null" || !exist?.cubic_cap) && cubic_cap && cubic_cap !== "NA") {
            updateDataArray['cubic_cap'] = cubic_cap; // e.g., "1197 CC"
        }

        // 11. Vehicle Color
        if ((exist?.vehicle_color === "NA" || exist?.vehicle_color == "null" || !exist?.vehicle_color) && vehicle_color && vehicle_color !== "NA") {
            updateDataArray['vehicle_color'] = vehicle_color; // e.g., "WHITE"
        }

        // 13. Financer Details
        if ((exist?.financer_details == "NA" || exist?.financer_details == "null" || !exist?.financer_details) && financer_details && financer_details !== "NA") {
            updateDataArray['financer_details'] = financer_details; // e.g., "HDFC Bank"
        }

        // 14. Fuel Norms
        if ((!exist?.fuel_norms || exist?.fuel_norms === "NA" || exist?.fuel_norms === "null") && fuel_norms && fuel_norms !== "NA" && fuel_norms !== "Not Available") {
            updateDataArray['fuel_norms'] = fuel_norms; // e.g., "BS-IV"
        } else {
            if (fuel_norms !== "NA") {
                if (exist?.fuel_norms !== fuel_norms) {
                    if (fuel_norms?.length > exist?.fuel_norms?.length) {
                        updateDataArray['fuel_norms'] = fuel_norms;
                    }
                }
            }
        }

        // 15. Blacklist Status
        if (!exist?.blacklist_status || exist?.blacklist_status === 'NA' || !exist?.blacklist_status == "null") {
            if (blacklist_status && blacklist_status !== "NA") {
                updateDataArray['blacklist_status'] = blacklist_status; // e.g., "CLEAN"
            }
        } else {
            if (blacklist_status !== "NA") {
                if (exist?.blacklist_status !== blacklist_status) {
                    if (blacklist_status?.length > exist?.blacklist_status?.length) {
                        updateDataArray['blacklist_status'] = blacklist_status;
                    }
                }
            }
        }

        // 16. NOC Details
        if (!exist?.noc_details || exist?.noc_details === 'NA' || exist?.noc_details == "null") {
            if (noc_details && noc_details !== "NA") {
                updateDataArray['noc_details'] = noc_details; // e.g., "NOC for state transfer"
            }
        } else {
            if (noc_details && noc_details !== "NA") {
                if (exist?.noc_details !== noc_details) {
                    if (noc_details?.length > exist?.noc_details?.length) {
                        updateDataArray['noc_details'] = noc_details;
                    }
                }
            }
        }

        // 18. Body Type Description
        if ((!exist?.body_type_desc || exist?.body_type_desc === "NA" || exist?.body_type_desc == "null") && body_type_desc && body_type_desc !== "NA") {
            updateDataArray['body_type_desc'] = body_type_desc; // e.g., "SEDAN"
        } else {
            if (body_type_desc && body_type_desc !== "NA" && body_type_desc) {
                if (exist?.body_type_desc !== body_type_desc) {
                    if (body_type_desc?.length > exist?.body_type_desc?.length) {
                        updateDataArray['body_type_desc'] = body_type_desc;
                    }
                }
            }
        }


        // 21. Vehicle Class
        if (!exist?.vh_class || exist?.vh_class?.includes("XXXXXXXX") || exist?.vh_class == "null") {
            if (veh_class && !veh_class?.includes("XXXXXXXX") && veh_class !== "NA") {
                updateDataArray['vh_class'] = veh_class; // e.g., "LMV"
            }
        } else {
            if (veh_class && !veh_class?.includes("XXXXXXXX") && veh_class !== "NA") {
                if (exist?.vh_class != veh_class) {
                    if (veh_class?.length > exist?.vh_class?.length) {
                        updateDataArray['vh_class'] = veh_class;
                    }
                }
            }
        }



        // 23. PUC Number
        if (!exist?.puc_no || exist?.puc_no?.toUpperCase() === 'NA' || exist?.puc_no == "" || exist?.puc_no == "null") {
            if (puc_no && puc_no?.toUpperCase() !== "NA") {
                updateDataArray['puc_no'] = puc_no; // e.g., "PUC123456"
            }
        }

        // 24. Number of Seats
        if (!exist?.no_of_seats || exist?.no_of_seats == "null" || exist?.no_of_seats == "" && no_of_seats == 0) {
            if (!no_of_seats == "" && no_of_seats && no_of_seats != 0) {
                updateDataArray['no_of_seats'] = no_of_seats // e.g., "5"
            }
        }

        // 25. Gross Vehicle Weight
        if (!exist?.gvw || exist?.gvw == "null" || exist?.gvw?.toUpperCase() == 'NA' || exist?.gvw == "") {
            if (!gvw == "" && gvw && gvw?.toUpperCase() !== "NA") {
                updateDataArray['gvw'] = no_of_seats // e.g., "1500 KG"
            }
        }

        // 26. Number of Cylinders
        if (!exist?.no_of_cyl || exist?.no_of_cyl == "null" || exist?.no_of_cyl?.toUpperCase() == 'NA' || exist?.no_of_cyl == "") {
            if (!no_of_cyl == "" && no_of_cyl && no_of_cyl?.toUpperCase() !== "NA") {
                updateDataArray['no_of_cyl'] = no_of_cyl // e.g., "4"
            }
        }

        // 27. Sleeper Capacity
        if (!exist?.sleeper_cap || exist?.sleeper_cap == "null" || exist?.sleeper_cap?.toUpperCase() == 'NA' || exist?.sleeper_cap == "") {
            if (!sleeper_cap == "" && sleeper_cap && sleeper_cap?.toUpperCase() !== "NA") {
                updateDataArray['sleeper_cap'] = sleeper_cap // e.g., "2"
            }
        }

        // 28. Standing Capacity
        if (!exist?.stand_cap || exist?.stand_cap == "null" || exist?.stand_cap?.toUpperCase() == 'NA' || exist?.stand_cap == "") {
            if (!stand_cap == "" && stand_cap && stand_cap?.toUpperCase() !== "NA") {
                updateDataArray['stand_cap'] = stand_cap // e.g., "0"
            }
        }

        // 29. Wheelbase
        if (!exist?.wheelbase || exist?.wheelbase == "null" || exist?.wheelbase?.toUpperCase() == 'NA' || exist?.wheelbase == "") {
            if (!wheelbase == "" && wheelbase && wheelbase?.toUpperCase() !== "NA") {
                updateDataArray['wheelbase'] = wheelbase // e.g., "2450 MM"
            }
        }

        // 30. Permit Number
        if (!exist?.permit_no || exist?.permit_no == "null" || exist?.permit_no?.toUpperCase() == 'NA' || exist?.permit_no == "") {
            if (!permit_no == "" && permit_no && permit_no?.toUpperCase() !== "NA") {
                updateDataArray['permit_no'] = permit_no // e.g., "PER123456"
            }
        }

        // 31. Permit Issue Date
        if (!exist?.permit_issue_date || exist?.permit_issue_date == "null" || exist?.permit_issue_date?.toUpperCase() == 'NA' || exist?.permit_issue_date == "") {
            if (!permit_issue_date == "" && permit_issue_date && permit_issue_date?.toUpperCase() !== "NA") {
                updateDataArray['permit_issue_date'] = permit_issue_date // e.g., "15-JAN-2020"
            }
        }

        // 32. Permit From Date
        if (!exist?.permit_from || exist?.permit_from == "null" || exist?.permit_from?.toUpperCase() == 'NA' || exist?.permit_from == "") {
            if (!permit_from == "" && permit_from && permit_from?.toUpperCase() !== "NA") {
                updateDataArray['permit_from'] = permit_from // e.g., "15-JAN-2020"
            }
        }

        // 33. Permit Upto Date
        if (!exist?.permit_upto || exist?.permit_upto == "null" || exist?.permit_upto?.toUpperCase() == 'NA' || exist?.permit_upto == "") {
            if (!permit_upto == "" && permit_upto && permit_upto?.toUpperCase() !== "NA") {
                updateDataArray['permit_upto'] = permit_upto // e.g., "15-JAN-2025"
            }
        }

        // 34. Permit Type
        if (!exist?.permit_type || exist?.permit_type == "null" || exist?.permit_type?.toUpperCase() == 'NA' || exist?.permit_type == "") {
            if (!permit_type == "" && permit_type && permit_type?.toUpperCase() !== "NA") {
                updateDataArray['permit_type'] = permit_type // e.g., "NATIONAL PERMIT"
            }
        }

        // 35. Tax Upto Date
        if (!exist?.tax_upto || exist?.tax_upto == "null" || exist?.tax_upto?.toUpperCase() == 'NA' || exist?.tax_upto == "") {
            if (!tax_upto == "" && tax_upto && tax_upto?.toUpperCase() !== "NA") {
                updateDataArray['tax_upto'] = tax_upto // e.g., "15-JAN-2025"
            }
        }

        // 36. RC/NP Number
        if (!exist?.rc_np_no || exist?.rc_np_no == "null" || exist?.rc_np_no?.toUpperCase() == 'NA' || exist?.rc_np_no == "") {
            if (!rc_np_no == "" && rc_np_no && rc_np_no?.toUpperCase() !== "NA") {
                updateDataArray['rc_np_no'] = rc_np_no // e.g., "NP123456"
            }
        }

        // 37. RC/NP Upto Date
        if (!exist?.rc_np_upto || exist?.rc_np_upto == "null" || exist?.rc_np_upto?.toUpperCase() == 'NA' || exist?.rc_np_upto == "") {
            if (!rc_np_upto == "" && rc_np_upto && rc_np_upto?.toUpperCase() !== "NA") {
                updateDataArray['rc_np_upto'] = rc_np_upto // e.g., "15-JAN-2025"
            }
        }

        // 38. RC/NP Issued By
        if (!exist?.rc_np_issued_by || exist?.rc_np_issued_by == "null" || exist?.rc_np_issued_by?.toUpperCase() == 'NA' || exist?.rc_np_issued_by == "") {
            if (!rc_np_issued_by == "" && rc_np_issued_by && rc_np_issued_by?.toUpperCase() !== "NA") {
                updateDataArray['rc_np_issued_by'] = rc_np_issued_by // e.g., "RTO-Delhi"
            }
        }

        // 39. RC Unladen Weight
        if (!exist?.rc_unld_wt || exist?.rc_unld_wt == "null" || exist?.rc_unld_wt?.toUpperCase() == 'NA' || exist?.rc_unld_wt == "") {
            if (!rc_unld_wt == "" && rc_unld_wt && rc_unld_wt?.toUpperCase() !== "NA") {
                updateDataArray['rc_unld_wt'] = rc_unld_wt // e.g., "1000 KG"
            }
        }
        if (!exist?.vehicle_age || exist?.vehicle_age == "null" || exist?.vehicle_age?.toUpperCase() == 'NA' || exist?.vehicle_age == "") {
            if (!vehicle_age == "" && vehicle_age && vehicle_age?.toUpperCase() !== "NA") {
                updateDataArray['vehicle_age'] = vehicle_age // e.g., "1000 KG"
            }
        }
        if (!exist?.vehicle_model || exist?.vehicle_model == "null" || exist?.vehicle_model?.toUpperCase() == 'NA' || exist?.vehicle_model == "") {
            if (!vehicle_model == "" && vehicle_model && vehicle_model?.toUpperCase() !== "NA") {
                updateDataArray['vehicle_model'] = vehicle_model // e.g., "PLATINA 100 ES (CBS)" "
            }
        }

        // Return the object containing all fields that need updating
        return updateDataArray;

    } catch (error) {
        console.log("== error", error)
        // In production, you might want to handle this error more gracefully
        throw error; // or return some error object
    }
}
