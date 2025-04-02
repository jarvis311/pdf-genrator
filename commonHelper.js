import axios from "axios";
import db from "../config/database.js"
import { Op, Sequelize } from "sequelize";
import { GoogleAuth } from "google-auth-library";
import admin from "firebase-admin";
import MobileScriptCallingInfo from "../models/MobileScriptCallingInfo.js";
import ViHomeInfo from "../models/ViHomeInfo.js"
import moment from "moment";
import utils from "./utils.js";
import scrapping from "./scrapping.js";
import stateArray from "./allStates.js";
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert('./public/firebase/serviceAccountKey.json'), // Correct path to service account
    });
}

function checkString(str) {
    // Check if the first and last characters are not '*'
    // and the string contains at least one occurrence of '**'
    if (str.length > 2 && str[0] !== '*' && str[str.length - 1] !== '*' && str.includes('**')) {
        return true
    } // Ensures at least one occurrence of '**'
    if (str.length == 3 && str[0] !== '*' && str[str.length - 1] !== '*' && str[1] == "*") {
        return true
    }
    return false
}
export const old_checkUpdateRcValidation = async (owenDBfields, fieldName) => {
    try {
        const {
            regn_dt,
            chasi_no,
            engine_no,
            owner_sr_no,
            owner_name,
            father_name,
            address,
            regn_at,
            fuel_type,
            maker_modal,
            maker,
            cubic_cap,
            vehicle_color,
            fitness_upto,
            financer_details,
            fuel_norms,
            blacklist_status,
            noc_details,
            insurance_comp,
            body_type_desc,
            puc_upto,
            insurance_upto,
            veh_class,
            manufacturer_month_yr,
            policy_no,
            source,
            mobileNo
        } = fieldName
        const updateDataArray = {};
        let exist = owenDBfields
        if (!exist?.regn_dt || exist?.regn_dt == "NA") {
            if (regn_dt && regn_dt != "NA") {
                updateDataArray['regn_dt'] = regn_dt;
            }
        }
        if (!exist?.chasi_no || exist?.chasi_no?.includes("XXXXXX") || exist?.chasi_no?.includes("XXXX") && chassisNo) {
            if (chassisNo && !chassisNo?.includes("XXXXXX") && !chassisNo?.includes("XXXX") && !chassisNo?.includes("**")) {
                updateDataArray['chasi_no'] = chassisNo;
            } else if (chassisNo && !chassisNo?.substr(chassisNo?.length - 5)?.includes("XXXXXX") && !chassisNo?.includes("**")) {
                updateDataArray['chasi_no'] = chassisNo;
            }
        } else {
            if ((exist?.chasi_no?.length == 5) && chassisNo?.length > 5 && !chassisNo?.includes('XXXX') && !chassisNo?.includes('**')) {
                updateDataArray['chasi_no'] = chassisNo;
            }
        }
        if ((!exist?.engine_no || exist?.engine_no?.includes("XXXXXX") || exist?.engine_no?.includes("XXXX")) && engineNo) {
            if (engineNo && !engineNo?.includes("XXXXXX") && !engineNo?.includes("XXXX") && !engineNo?.includes("**")) {
                updateDataArray['engine_no'] = engineNo;
            } else if (engineNo && !engineNo?.substr(engineNo?.length - 5)?.includes("XXXXXX") && !engineNo?.includes("**")) {
                updateDataArray['engine_no'] = engineNo;
            }
        } else {
            if (exist?.engine_no?.length == 5 && engineNo?.length > 5 && !engineNo?.includes('XXXX') && !engineNo?.includes("**")) {
                updateDataArray['engine_no'] = engineNo;
            }
        }
        if ((!exist?.owner_sr_no && owner_sr_no) || exist?.owner_sr_no < owner_sr_no) {
            //console.log("exist?.owner_sr_no && owner_sr_no")
            updateDataArray['owner_sr_no'] = owner_sr_no;

            if (owner_name && owner_name !== "NA") {
                updateDataArray['owner_name'] = owner_name;
            }
            if (father_name && father_name != "" && father_name !== "NA" && father_name !== ".") {
                updateDataArray['father_name'] = father_name;
            }
            if (address && address !== "NA") {
                updateDataArray['address'] = address;
            }
            if (regn_at && regn_at !== "NA") {
                updateDataArray['rto'] = regn_at;
                updateDataArray['regn_at'] = regn_at;
            }
        } else {
            //console.log(" if (owner_name && owner_name !==) ", exist?.owner_name)
            //console.log(" owner_name", owner_name)

            if ((!exist?.owner_name || exist?.owner_name === "NA" || exist?.owner_name?.includes("*")) && owner_name) {
                if (owner_name && owner_name != "NA") {
                    if (!checkString(owner_name)) {
                        updateDataArray['owner_name'] = owner_name;
                    }
                }
            } else {
                let maskOwnername = convertString(exist?.owner_name)
                if ((exist?.owner_name && owner_name && owner_name != "NA" && owner_name != "") && maskOwnername != owner_name) {
                    if (!checkString(owner_name)) {
                        updateDataArray['owner_name'] = owner_name;
                    }
                }
            }
            if (!exist?.father_name || exist?.father_name?.includes("*") || exist?.father_name === "NA") {
                if (father_name && father_name !== "NA" && father_name !== "." && father_name != "") {
                    if (!checkString(father_name)) {
                        updateDataArray['father_name'] = father_name;
                    }
                }
            } else {
                let maskfather_name = convertString(exist?.father_name)
                if ((exist?.father_name && father_name) && maskfather_name != father_name) {
                    if (!checkString(father_name)) {
                        updateDataArray['father_name'] = father_name;
                    }
                }
            }
            if ((!exist?.address || exist?.address === "NA") && address && address !== "NA") {
                updateDataArray['address'] = address;
            }
            if ((!exist?.rto || exist?.rto == "NA") && regn_at && regn_at != "" && regn_at !== "NA") {
                updateDataArray['rto'] = regn_at;
            }
        }
        //console.log('updateDataArray', updateDataArray['owner_name'])
        if (!exist?.fuel_type || exist?.fuel_type?.includes("XXXXXXXX")) {
            if (!fuel_type?.includes("XXXXXXXX") || fuel_type != "Not Available") {
                updateDataArray['fuel_type'] = fuel_type;
            }
        } else {
            if (fuel_type && !fuel_type?.includes("XXXXXXXX") && fuel_type != "Not Available") {
                if (exist?.fuel_type !== fuel_type) {
                    if (fuel_type?.length > exist?.fuel_type?.length) {
                        updateDataArray['fuel_type'] = fuel_type;
                        // if (fuel_type?.includes(exist?.fuel_type)) {
                        //     updateDataArray['fuel_type'] = fuel_type;
                        // } else {
                        //     updateDataArray['fuel_type'] = fuel_type;
                        // }
                    }
                }
            }
        }






        if (!exist?.maker_modal || exist?.maker_modal?.includes("XXXXXXXX") || exist?.maker_modal === "NA") {
            if (maker && !maker_modal?.includes("XXXXXXXX") && maker_modal !== "NA") {
                updateDataArray['maker_modal'] = maker_modal;
            }
        } else {
            if (maker && !maker_modal?.includes("XXXXXXXX") && maker_modal !== "NA") {
                if (exist?.maker_modal !== maker_modal) {
                    if (maker_modal?.length > exist?.maker_modal?.length) {
                        updateDataArray['maker_modal'] = maker_modal;
                        // if (maker_modal?.includes(exist?.maker_modal)) {
                        //     updateDataArray['maker_modal'] = maker_modal;
                        // } else {
                        //     updateDataArray['maker_modal'] = maker_modal;
                        // }
                    }
                }
            }
        }

        if (!exist?.maker || exist?.maker?.includes("XXXXXXXX") || exist?.maker === "NA") {
            if (maker && !maker?.includes("XXXXXXXX") && maker !== "NA") {
                updateDataArray['maker'] = maker;
            }
        } else {
            if (maker && !maker?.includes("XXXXXXXX") && maker !== "NA") {
                if (exist?.maker !== maker) {
                    if (maker?.length > exist?.maker?.length) {
                        updateDataArray['maker'] = maker;
                        // if (maker?.includes(exist?.maker)) {
                        //     updateDataArray['maker'] = maker;
                        // } else {
                        //     updateDataArray['maker'] = maker;
                        // }
                    }
                }
            }
        }

        if ((exist?.cubic_cap === "NA" || !exist?.cubic_cap) && cubic_cap && cubic_cap !== "NA") {
            updateDataArray['cubic_cap'] = cubic_cap;
        }

        if ((exist?.mobile_no == "NA" || !exist?.mobile_no) && mobileNo && mobileNo !== "NA" && mobileNo?.length == 10) {
            updateDataArray['mobile_no'] = mobileNo;
        }
        if ((exist?.vehicle_color === "NA" || !exist?.vehicle_color) && vehicle_color && vehicle_color !== "NA") {
            updateDataArray['vehicle_color'] = vehicle_color;
        }

        if ((exist?.fitness_upto === "NA" || !exist?.fitness_upto) && fitness_upto && fitness_upto !== "NA") {
            updateDataArray['fitness_upto'] = fitness_upto;
        } else {
            if (fitness_upto && fitness_upto !== "NA") {
                const existFitness = new Date(exist?.fitness_upto).getTime();
                const invisiableFitness = new Date(fitness_upto).getTime();
                if (invisiableFitness > existFitness) {
                    updateDataArray['fitness_upto'] = fitness_upto;
                }
            }
        }

        if ((exist?.financer_details === "NA" || !exist?.financer_details) && financer_details && financer_details !== "NA") {
            updateDataArray['financer_details'] = financer_details;
        } else if (exist?.financer_details && financer_details && exist?.financer_details != "NA" && financer_details != "NA" && exist?.financer_details?.toUpperCase() != financer_details?.toUpperCase()) {
            updateDataArray['financer_details'] = financer_details;
        }

        if (exist?.fuel_norms === "NA" && fuel_norms && fuel_norms !== "NA" && fuel_norms !== "Not Available") {
            updateDataArray['fuel_norms'] = fuel_norms;
        } else {
            if (fuel_norms !== "NA") {
                if (exist?.fuel_norms !== fuel_norms) {
                    if (fuel_norms?.length > exist?.fuel_norms?.length) {
                        updateDataArray['fuel_norms'] = fuel_norms;
                        // if (fuel_norms?.includes(exist?.fuel_norms)) {
                        //     updateDataArray['fuel_norms'] = fuel_norms;
                        // } else {
                        //     updateDataArray['fuel_norms'] = fuel_norms;
                        // }
                    }
                }
            }
        }

        if (exist?.blacklist_status != "" && exist?.blacklist_status != "NA" && blacklist_status == "NA") {
            updateDataArray['blacklist_status'] = "";
        }
        // else if (!exist?.blacklist_status || exist?.blacklist_status == 'NA') {
        //     if (blacklist_status && blacklist_status !== "NA") {
        //         updateDataArray['blacklist_status'] = blacklist_status;
        //     }
        // }
        else {
            if (blacklist_status !== "NA" && blacklist_status != "") {
                if (exist?.blacklist_status !== blacklist_status) {
                    if (blacklist_status?.length > exist?.blacklist_status?.length) {
                        updateDataArray['blacklist_status'] = blacklist_status;
                        // if (blacklist_status?.includes(exist?.blacklist_status)) {
                        //     updateDataArray['blacklist_status'] = blacklist_status;
                        // } else {
                        //     updateDataArray['blacklist_status'] = blacklist_status;
                        // }
                    }
                }
            }
        }

        if (!exist?.noc_details || exist?.noc_details === 'NA') {
            if (noc_details && noc_details !== "NA") {
                updateDataArray['noc_details'] = noc_details;
            }
        } else {
            if (noc_details && noc_details !== "NA") {
                if (exist?.noc_details !== noc_details) {
                    if (noc_details?.length > exist?.noc_details?.length) {
                        updateDataArray['noc_details'] = noc_details;
                        // if (noc_details?.includes(exist?.noc_details)) {
                        //     updateDataArray['noc_details'] = noc_details;
                        // } else {
                        //     updateDataArray['noc_details'] = noc_details;
                        // }
                    }
                }
            }
        }

        if (!exist?.insurance_comp || exist?.insurance_comp?.includes("XXXXXXXX") || exist?.insurance_comp === "NA") {
            if (insurance_comp && !insurance_comp?.includes("XXXXXXXX") && insurance_comp !== "NA") {
                updateDataArray['insurance_comp'] = insurance_comp;
            }
        } else {
            if (insurance_comp && !insurance_comp?.includes("XXXXXXXX") && insurance_comp !== "NA") {
                if (exist?.insurance_comp !== insurance_comp) {
                    if (insurance_comp?.length > exist?.insurance_comp?.length) {
                        updateDataArray['insurance_comp'] = insurance_comp;
                        // if (insurance_comp?.includes(exist?.insurance_comp)) {
                        //     updateDataArray['insurance_comp'] = insurance_comp;
                        // } else {
                        //     updateDataArray['insurance_comp'] = insurance_comp;
                        // }
                    }
                }
            }
        }

        if ((!exist?.body_type_desc || exist?.body_type_desc === "NA") && body_type_desc && body_type_desc !== "NA") {
            updateDataArray['body_type_desc'] = body_type_desc;
        } else {
            if (body_type_desc && body_type_desc !== "NA" && body_type_desc) {
                if (exist?.body_type_desc !== body_type_desc) {
                    if (body_type_desc?.length > exist?.body_type_desc?.length) {
                        updateDataArray['body_type_desc'] = body_type_desc;
                        // if (body_type_desc?.includes(exist?.body_type_desc)) {
                        //     updateDataArray['body_type_desc'] = body_type_desc;
                        // } else {
                        //     updateDataArray['body_type_desc'] = body_type_desc;
                        // }
                    }
                }
            }
        }

        if (!exist?.puc_upto || exist?.puc_upto?.includes("XXXXXXXX")) {
            if (!puc_upto?.includes("XXXXXXXX") && puc_upto !== "NA") {
                updateDataArray['puc_upto'] = puc_upto;
            }
        } else {
            if (puc_upto && !puc_upto?.includes("XXXXXXXX") && puc_upto !== "NA") {
                // const existPuc = new Date(exist?.puc_upto).getTime();
                // const invisiablePuc = new Date(puc_upto).getTime();
                const existPuc = moment(exist?.puc_upto, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], true);
                const invisiablePuc = moment(puc_upto, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], true);
                // if (invisiablePuc > existPuc) {
                //     updateDataArray['puc_upto'] = puc_upto;
                // }
                if (invisiablePuc.isAfter(existPuc)) {
                    updateDataArray['puc_upto'] = puc_upto;
                }
            }
        }

        if (!exist?.insUpto || exist?.insUpto?.includes("XXXXXXXX")) {
            if (insurance_upto && !insurance_upto?.includes("XXXXXXXX") && insurance_upto !== "NA") {
                updateDataArray['insUpto'] = insurance_upto;
            }
        } else {
            if (insurance_upto && !insurance_upto?.includes("XXXXXXXX") && insurance_upto !== "NA") {
                const existInsurence = moment(exist?.insUpto, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], true);
                const invisiableInsurence = moment(insurance_upto, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], true);
                // const existInsurence = new Date(exist?.insUpto).getTime();
                // const invisiableInsurence = new Date(insurance_upto).getTime();
                // if (invisiableInsurence > existInsurence) {
                //     updateDataArray['insUpto'] = insurance_upto;
                // }
                if (invisiableInsurence.isAfter(existInsurence)) {
                    updateDataArray['insUpto'] = insurance_upto;
                }
            }
        }

        if (!exist?.vh_class || exist?.vh_class?.includes("XXXXXXXX")) {
            if (veh_class && !veh_class?.includes("XXXXXXXX") && veh_class !== "NA") {
                updateDataArray['vh_class'] = veh_class;
            }
        } else {
            if (veh_class && !veh_class?.includes("XXXXXXXX") && veh_class !== "NA") {
                if (exist?.vh_class !== veh_class) {
                    if (veh_class?.length > exist?.vh_class?.length) {
                        updateDataArray['vh_class'] = veh_class;
                        // if (veh_class?.includes(exist?.vh_class)) {
                        //     updateDataArray['vh_class'] = veh_class;
                        // } else {
                        //     updateDataArray['vh_class'] = veh_class;
                        // }
                    }
                }
            }
        }
        //policy_no
        if (!exist?.policy_no || exist?.policy_no?.includes("XXXXX") || exist?.policy_no == "NA") {
            if (policy_no && !policy_no?.includes("XXXXX") && policy_no !== "NA") {
                updateDataArray['policy_no'] = policy_no;
            }
        } else {
            if (policy_no && !policy_no?.includes("XXXXX") && policy_no !== "NA") {
                if (exist?.policy_no !== policy_no) {
                    if (policy_no?.length > exist?.policy_no?.length) {
                        updateDataArray['policy_no'] = policy_no;
                    }
                }
            }
        }
        if (!exist?.manufacturer_month_yr || exist?.manufacturer_month_yr?.toUpperCase() === 'NA') {
            if (manufacturer_month_yr && manufacturer_month_yr?.toUpperCase() !== "NA") {
                updateDataArray['manufacturer_month_yr'] = manufacturer_month_yr;
            }
        }
        return updateDataArray

    } catch (error) {
        console.log("== error", error)
    }
}

function isInvalidString(value) {
    if (!value?.toString() || value == null || value === undefined || (value && typeof (value) == 'string' && value?.toUpperCase() == 'NA') || value == '' || value == '0' || value == "null" || (value && (typeof (value) == 'string' && (value?.includes("XXXX") || value?.toString()?.includes("**"))))) {
        return true;
    } else {
        return false;
    }
}



function isValidString(value, isdynemic) {
    let validatedynemic = isdynemic ? !value?.includes("XXXX") && !value?.includes("**") : true
    if (value && value != null && value != undefined && value?.toString()?.trim()?.toUpperCase() != 'NA' && value?.toString()?.trim() != '' && validatedynemic && value != "null" && value != "0" && (value?.length && !value?.toString()?.split('')?.every(char => char == '*'))) {
        return true
    } else {
        return false;
    }
}
export function removeEmptyProperties(obj) {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([_, value]) => {
                if (typeof value == 'string') {
                    return value?.trim() !== '';
                }
                return value !== null && value !== undefined && value != 0;
            })
    );
}
const validateAndUpdateChassieEngineField = (existingValue, newValue, fieldName) => {
    if (!existingValue || existingValue === "null" || existingValue.includes("XXXX")) {
        if ((!existingValue || existingValue === "null") && newValue && newValue != "NA" && newValue != "") {
            return true
        } else if (newValue && newValue?.length >= 5 && !newValue.substr(newValue.length - 5).includes("XXXX") && !newValue.includes("*")) {
            // updateDataArray[fieldName] = newValue;
            return true
        }
    } else {
        if (existingValue?.includes("*") && newValue && !newValue.includes("*") && !newValue.includes("XXXX")) {
            return true
        } else if (existingValue.length === 5 && newValue.length > 5 && !newValue.includes("XXXX")) {
            // updateDataArray[fieldName] = newValue;
            return true
        }
    }
    return false
};
const validateAndUpdateCommonField = (existingValue, newValue, isfullsource, isdynemic) => {
    if (existingValue == "SGFJGXXXXX") {
        console.log((isValidString(newValue, isdynemic)))
        console.log(isInvalidString(existingValue))
    }
    if ((isInvalidString(existingValue) || isfullsource) && isValidString(newValue, isdynemic)) {
        return true
    } else {
        return false
    }
};

export const checkIsBefore = (startdate, enddate) => {
    if (moment(startdate, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD']).isSameOrBefore(moment(enddate, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD']))) {
        return true
    } else {
        return false
    }
}

export const checkUpdateRcValidation = async (owenDBfields, sourcefieldName, isMobileRequire) => {
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
            puc_upto,
            insUpto,               // PUC certificate expiry (e.g., "15-JAN-2024")
            insurance_upto,        // Insurance expiry date (e.g., "15-JAN-2024")
            vh_class,             // Vehicle class (e.g., "LMV")
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
        } = sourcefieldName;

        updateDataArray['source'] = sourcefieldName.source
        updateDataArray['updated_at'] = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        // Reference to existing database fields
        let exist = owenDBfields;
        let isFullResponse = false
        if (sourcefieldName?.source == "VI_SOURCE_FULL") {
            isFullResponse = true
        }
        // 1. Registration Date
        // Update if existing field is missing or invalid
        if (validateAndUpdateCommonField(exist?.regn_dt, regn_dt, isFullResponse)) {
            updateDataArray['regn_dt'] = regn_dt; // e.g., "15-JAN-2020"
        }

        // 2. Chassis Number
        if (validateAndUpdateChassieEngineField(exist?.chasi_no, chasi_no, "chasi_no")) {
            updateDataArray["chasi_no"] = chasi_no;
        }
        // 3. Engine Number
        if (validateAndUpdateChassieEngineField(exist?.engine_no, engine_no, "engine_no")) {
            updateDataArray["engine_no"] = engine_no;
        }
        // 4. Policy Number
        if (validateAndUpdateCommonField(exist.policy_no, policy_no, isFullResponse, true)) {
            updateDataArray['policy_no'] = policy_no; // e.g., "POL12345678"
        } else {
            if (isValidString(policy_no, true) && isValidString(exist?.policy_no, true)) {
                if (exist?.policy_no !== policy_no) {
                    updateDataArray['policy_no'] = policy_no;
                }
            }
        }
        // 5. Mobile Number
        // Update if missing or invalid, and new number is valid 10-digit
        if (validateAndUpdateCommonField(exist?.mobile_no, mobile_no, isFullResponse) && (mobile_no?.length == 10 || mobile_no?.length == 12)) {
            updateDataArray['mobile_no'] = mobile_no; // e.g., "9876543210"
        } else if (isValidString(mobile_no) && isValidString(exist?.mobile_no) && (mobile_no?.length == 10 || mobile_no?.length == 12) && (mobile_no?.length != exist?.mobile_no)) {
            updateDataArray['mobile_no'] = mobile_no; // e.g., "9876543210"
        } else if ((isMobileRequire == true) && isInvalidString(exist?.mobile_no) && (isInvalidString(mobile_no) || mobile_no?.length == 2)) {
            const mobileNumber = await findRCMobile(exist.reg_no, "testxx");
            if (mobileNumber && mobileNumber.toString().length == 10) {
                updateDataArray['mobile_no'] = mobileNumber; // e.g., "9876543210"
            }
        }

        // 6. Owner Information Block
        // This includes owner serial number, name, father's name, address, and RTO
        if ((!exist?.owner_sr_no && owner_sr_no) || ((exist?.owner_sr_no && owner_sr_no) && exist?.owner_sr_no < owner_sr_no)) {
            updateDataArray['owner_sr_no'] = owner_sr_no; // e.g., 1

            // Update related owner information if serial number is being updated
            if (isValidString(owner_name)) {
                updateDataArray['owner_name'] = owner_name; // e.g., "John Doe"
            }
            if (isValidString(father_name) && father_name !== ".") {
                updateDataArray['father_name'] = father_name; // e.g., "Robert Doe"
            }
            if (address && address !== "NA") {
                updateDataArray['address'] = address; // e.g., "123 Main St, City"
            }
            // if (isValidString(regn_at)) {
            //     updateDataArray['rto'] = regn_at; // e.g., "RTO-Delhi"
            //     updateDataArray['regn_at'] = regn_at;
            // }
        } else {
            // If not updating by serial number, check individual fields
            // Owner Name
            if (exist?.owner_sr_no == owner_sr_no) {
                if ((isInvalidString(exist?.owner_name) || exist?.owner_name?.includes("*")) && isValidString(owner_name)) {
                    if (!checkString(owner_name)) { // Assuming checkString verifies if string is masked
                        updateDataArray['owner_name'] = owner_name;
                    }
                }
                // Father's Name
                if ((isInvalidString(exist?.father_name) || exist?.father_name?.includes("*")) && isValidString(father_name) && father_name !== ".") {
                    if (!checkString(father_name)) {
                        updateDataArray['father_name'] = father_name;
                    }
                }
                // Address
                if (isInvalidString(exist?.address) && isValidString(address) && exist?.address != address) {
                    updateDataArray['address'] = address;
                }
                // RTO
                // if (isInvalidString(exist?.rto) && isValidString(regn_at)) {
                //     updateDataArray['rto'] = regn_at;
                // }
            }
        }

        if (validateAndUpdateCommonField(exist?.rto, regn_at, isFullResponse)) {
            updateDataArray['rto'] = regn_at;
        }
        // 7. Fuel Type
        if (validateAndUpdateCommonField(exist?.fuel_type, fuel_type, isFullResponse) && fuel_type != "Not Available") {
            if (exist?.fuel_type?.toUpperCase() != fuel_type?.toUpperCase()) {
                updateDataArray['fuel_type'] = fuel_type; // e.g., "PETROL"
            }
        }

        // 8. Maker/Model
        if (validateAndUpdateCommonField(exist?.maker_modal, maker_modal)) {
            updateDataArray['maker_modal'] = maker_modal; // e.g., "SWIFT-DZIRE"
        }

        // 19. PUC Upto
        if (validateAndUpdateCommonField(exist?.puc_upto, puc_upto)) {
            updateDataArray['puc_upto'] = puc_upto;
        } else if (isValidString(puc_upto) && isValidString(exist?.puc_upto)) {
            const existPuc = moment(exist?.puc_upto, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], true);
            const newPuc = moment(puc_upto, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], true);
            if (newPuc.isAfter(existPuc)) {
                updateDataArray['puc_upto'] = convertDateFormat(puc_upto, 'DD-MM-YYYY');; // e.g., "15-JAN-2024"
            }
        }

        // 20. Insurance Upto 
        //exist?.insUpto 27-Jan-2035, insurance_upto = 27-Jan-2036(any format)
        if (validateAndUpdateCommonField(exist?.insUpto, insUpto, isFullResponse)) {
            updateDataArray['insUpto'] = convertDateFormat(insUpto, 'DD-MM-YYYY'); // e.g., "15-JAN-2024" // format :  27-Jan-2035()
        } else if (isValidString(insUpto) && isValidString(exist?.insUpto)) {
            const existInsurence = moment(exist?.insUpto, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], true);
            const invisiableInsurence = moment(insUpto, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], true);
            // Only update if new date is later than existing date
            if (invisiableInsurence.isAfter(existInsurence)) {
                updateDataArray['insUpto'] = convertDateFormat(invisiableInsurence, 'DD-MMM-YYYY'); // e.g., "15-JAN-2024" // format :  27-Jan-2035()
            }
        }

        // 12. Fitness Upto
        if (validateAndUpdateCommonField(exist?.fitness_upto, fitness_upto, isFullResponse)) {
            updateDataArray['fitness_upto'] = convertDateFormat(fitness_upto, 'DD-MM-YYYY');; // e.g., "15-JAN-2025"
        } else if (isValidString(fitness_upto) && isValidString(exist?.fitness_upto)) {
            const existFitness = moment(exist?.fitness_upto, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], true);
            const newFitness = moment(fitness_upto, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], true);
            // Only update if new date is later than existing date
            if (newFitness.isAfter(existFitness)) {
                updateDataArray['fitness_upto'] = convertDateFormat(fitness_upto, 'DD-MM-YYYY');; // e.g., "15-JAN-2025"
            }
        }

        // 17. Insurance Company
        if (validateAndUpdateCommonField(exist?.insurance_comp, insurance_comp, isFullResponse)) {
            updateDataArray['insurance_comp'] = insurance_comp;
        } else {
            if (isValidString(insurance_comp, true) && isValidString(exist?.insurance_comp, true) && exist?.insurance_comp !== insurance_comp) {
                updateDataArray['insurance_comp'] = insurance_comp;
            }
        }
        // 22. Manufacturer Month/Year
        if (validateAndUpdateCommonField(exist?.manufacturer_month_yr, manufacturer_month_yr, isFullResponse)) {
            updateDataArray['manufacturer_month_yr'] = convertDateFormat(manufacturer_month_yr, 'MM/YYYY') // e.g., "10/2019"
        }
        // 9. Maker
        if (validateAndUpdateCommonField(exist?.maker, maker, isFullResponse)) {
            updateDataArray['maker'] = maker; // e.g., "MARUTI"  
        }

        // 10. Cubic Capacity
        if (validateAndUpdateCommonField(exist?.cubic_cap, cubic_cap, isFullResponse)) {
            updateDataArray['cubic_cap'] = cubic_cap; // e.g., "1197 CC"
        }

        // 11. Vehicle Color
        if (validateAndUpdateCommonField(exist?.vehicle_color, vehicle_color, isFullResponse)) {
            updateDataArray['vehicle_color'] = vehicle_color; // e.g., "WHITE"
        }

        // 13. Financer Details
        if (validateAndUpdateCommonField(exist?.financer_details, financer_details, isFullResponse)) {
            updateDataArray['financer_details'] = financer_details; // e.g., "HDFC Bank"
        } else {
            if (isValidString(exist?.financer_details, true) && isValidString(financer_details, true) && exist?.financer_details != financer_details) {
                updateDataArray['financer_details'] = financer_details; // e.g., "CANERA Bank"
            }
        }

        // 14. Fuel Norms
        if (validateAndUpdateCommonField(exist?.fuel_norms, fuel_norms) && fuel_norms !== "Not Available") {
            if (fuel_norms?.length != exist?.fuel_norms?.length) {
                updateDataArray['fuel_norms'] = fuel_norms; // e.g., "BS-IV"
            }
        }

        // 15. Blacklist Status Need to varify
        if (validateAndUpdateCommonField(exist?.blacklist_status, blacklist_status, isFullResponse)) {
            updateDataArray['blacklist_status'] = blacklist_status; // e.g., "ACTIVE" 
        } else {
            if (isValidString(blacklist_status) && isValidString(exist?.blacklist_status)) {
                updateDataArray['blacklist_status'] = blacklist_status;
            } else if (blacklist_status == "NA") {
                updateDataArray['blacklist_status'] = "NA";
            }
        }

        // 16. NOC Details
        if (validateAndUpdateCommonField(exist?.noc_details, noc_details, isFullResponse)) {
            updateDataArray['noc_details'] = noc_details; // e.g., "NOC for state transfer"
        } else {
            if (isValidString(noc_details, true) && isValidString(exist?.noc_details, true)) {
                if (exist?.noc_details !== noc_details) {
                    updateDataArray['noc_details'] = noc_details;
                }
            }
        }

        // 18. Body Type Description
        if (validateAndUpdateCommonField(exist?.body_type_desc, body_type_desc, isFullResponse)) {
            updateDataArray['body_type_desc'] = body_type_desc; // e.g., "SEDAN"
        }

        // 21. Vehicle Class
        if (validateAndUpdateCommonField(exist?.vh_class, vh_class, isFullResponse, true)) {
            updateDataArray['vh_class'] = vh_class; // e.g., "LMV"
        }

        // 23. PUC Number
        if (validateAndUpdateCommonField(exist?.puc_no, puc_no, isFullResponse)) {
            updateDataArray['puc_no'] = puc_no; // e.g., "PUC123456"
        } else {
            if (isValidString(puc_no, true) && isValidString(exist?.puc_no, true)) {
                if (exist?.puc_no !== puc_no) {
                    updateDataArray['puc_no'] = puc_no;
                }
            }
        }

        // 24. Number of Seats
        if (exist?.no_of_seats == 0 && Number(no_of_seats) > 0 && Number(no_of_seats) != "") {
            updateDataArray['no_of_seats'] = Number(no_of_seats) // e.g., "5"
        }

        // 25. Gross Vehicle Weight
        if (validateAndUpdateCommonField(exist?.gvw?.toString(), gvw?.toString(), isFullResponse)) {
            updateDataArray['gvw'] = gvw // e.g., "1500 KG"
        }

        // 26. Number of Cylinders
        if (validateAndUpdateCommonField(exist?.no_of_cyl, no_of_cyl, isFullResponse)) {
            updateDataArray['no_of_cyl'] = no_of_cyl // e.g., "4"
        }

        // 27. Sleeper Capacity
        if (validateAndUpdateCommonField(exist?.sleeper_cap, sleeper_cap, isFullResponse)) {
            updateDataArray['sleeper_cap'] = sleeper_cap // e.g., "2"
        }

        // 28. Standing Capacity
        if (validateAndUpdateCommonField(exist?.stand_cap, stand_cap, isFullResponse)) {
            updateDataArray['stand_cap'] = stand_cap // e.g., "0"
        }

        // 29. Wheelbase
        if (validateAndUpdateCommonField(exist?.wheelbase, wheelbase, isFullResponse)) {
            updateDataArray['wheelbase'] = wheelbase // e.g., "2450 MM"
        }

        // 30. Permit Number
        if (validateAndUpdateCommonField(exist?.permit_no, permit_no, isFullResponse)) {
            updateDataArray['permit_no'] = permit_no // e.g., "PER123456"
        }

        // 31. Permit Issue Date

        if (validateAndUpdateCommonField(exist?.permit_issue_date, permit_issue_date, isFullResponse)) {
            updateDataArray['permit_issue_date'] = permit_issue_date // e.g., "15-JAN-2020"
            if (validateAndUpdateCommonField(exist?.permit_from, permit_from, isFullResponse) && checkIsBefore(permit_issue_date, permit_from)) {
                updateDataArray['permit_from'] = permit_from // e.g., "15-JAN-2020"
                // 33. Permit Upto Date
                console.log('moment(permit_from).isAfter(permit_upto)', moment(permit_from).isAfter(permit_upto))
                if (validateAndUpdateCommonField(exist?.permit_upto, permit_upto, isFullResponse) && checkIsBefore(permit_from, permit_upto)) {
                    updateDataArray['permit_upto'] = permit_upto // e.g., "15-JAN-2025"
                }
            }
        } else {
            if (isValidString(exist?.permit_issue_date) && isValidString(permit_issue_date) && checkIsBefore(exist?.permit_issue_date, permit_issue_date) && checkIsBefore(permit_issue_date, permit_from)) {
                // Only update if new policy number is longer (more complete)
                // if (exist?.permit_issue_date != permit_issue_date) {
                updateDataArray['permit_issue_date'] = permit_issue_date;
                if (isValidString(permit_from) && checkIsBefore(permit_issue_date, permit_from)) {
                    updateDataArray['permit_from'] = permit_from;
                    if (isValidString(permit_upto) && checkIsBefore(permit_from, permit_upto)) {
                        updateDataArray['permit_upto'] = permit_upto;
                    }
                }
                // }
            }
        }

        // 32. Permit From Date
        // if (validateAndUpdateCommonField(exist?.permit_from, permit_from, isFullResponse)) {
        //     updateDataArray['permit_from'] = permit_from // e.g., "15-JAN-2020"
        // } else {
        //     if (isValidString(exist?.permit_from) && isValidString(permit_from)) {
        //         // Only update if new policy number is longer (more complete)
        //         if (exist?.permit_from !== permit_from) {
        //             updateDataArray['permit_from'] = permit_from;
        //         }
        //     }
        // }

        // 33. Permit Upto Date
        // if (validateAndUpdateCommonField(exist?.permit_upto, permit_upto, isFullResponse)) {
        //     updateDataArray['permit_upto'] = permit_upto // e.g., "15-JAN-2025"
        // } else {
        //     if (isValidString(exist?.permit_upto) && isValidString(permit_upto)) {
        //         // Only update if new policy number is longer (more complete)
        //         if (exist?.permit_upto !== permit_upto) {
        //             updateDataArray['permit_upto'] = permit_upto;
        //         }
        //     }
        // }

        // 34. Permit Type
        if (validateAndUpdateCommonField(exist?.permit_type, permit_type, isFullResponse)) {
            updateDataArray['permit_type'] = permit_type // e.g., "NATIONAL PERMIT"
        }

        // 35. Tax Upto Date
        if (validateAndUpdateCommonField(exist?.tax_upto, tax_upto, isFullResponse)) {
            if (tax_upto?.toUpperCase() == 'LTT') {
                updateDataArray['tax_upto'] = "LTT" // e.g., "15-JAN-2025"
            } else {
                updateDataArray['tax_upto'] = tax_upto // e.g., "15-JAN-2025"
            }
        } else {
            const existTax = moment(exist?.tax_upto, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], true);
            const newTax = moment(tax_upto, ['DD-MM-YYYY', 'DD-MMM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], true);
            // Only update if new date is later than existing date
            if (tax_upto?.toUpperCase() == 'LTT') {
                updateDataArray['tax_upto'] = "LTT" // e.g., "15-JAN-2025"
            }
            if (newTax.isAfter(existTax)) {
                updateDataArray['tax_upto'] = convertDateFormat(newTax, 'DD-MMM-YYYY'); // e.g., "15-JAN-2024" // format :  27-Jan-2035()
            }

        }


        // 36. RC/NP Number
        if (validateAndUpdateCommonField(exist?.rc_np_no, rc_np_no, isFullResponse)) {
            updateDataArray['rc_np_no'] = rc_np_no // e.g., "NP123456"
        }


        // if (validateAndUpdateCommonField(exist?.rc_np_upto, rc_np_upto, isFullResponse)) {
        //     updateDataArray['rc_np_upto'] = rc_np_upto // e.g., "15-JAN-2025"
        // } else {

        // }
        // // 38. RC/NP Issued By
        // if (validateAndUpdateCommonField(exist?.rc_np_issued_by, rc_np_issued_by, isFullResponse)) {
        //     updateDataArray['rc_np_issued_by'] = rc_np_issued_by // e.g., "RTO-Delhi"
        // }

        //////////////////

        // 37. RC/NP Upto Date &&         // 38. RC/NP Issued By
        if (validateAndUpdateCommonField(exist?.rc_np_issued_by, rc_np_issued_by, isFullResponse)) {
            updateDataArray['rc_np_issued_by'] = rc_np_issued_by // e.g., "15-JAN-2020"
            if (validateAndUpdateCommonField(exist?.rc_np_upto, rc_np_upto, isFullResponse) && checkIsBefore(rc_np_issued_by, rc_np_upto)) {
                updateDataArray['rc_np_upto'] = rc_np_upto // e.g., "15-JAN-2020"
            }
        } else {
            if (isValidString(exist?.rc_np_issued_by) && isValidString(rc_np_issued_by) && checkIsBefore(exist?.rc_np_issued_by, rc_np_issued_by) && checkIsBefore(rc_np_issued_by, rc_np_upto)) {
                // Only update if new policy number is longer (more complete)
                // if (exist?.permit_issue_date != permit_issue_date) {
                updateDataArray['rc_np_issued_by'] = rc_np_issued_by;
                if (isValidString(rc_np_upto) && checkIsBefore(rc_np_issued_by, rc_np_upto)) {
                    updateDataArray['rc_np_upto'] = rc_np_upto;
                }
                // }
            }
        }

        // 39. RC Unladen Weight
        if (validateAndUpdateCommonField(exist?.rc_unld_wt, rc_unld_wt, isFullResponse)) {
            updateDataArray['rc_unld_wt'] = rc_unld_wt // e.g., "1000 KG"
        }
        if (validateAndUpdateCommonField(exist?.vehicle_age, vehicle_age, isFullResponse)) {
            updateDataArray['vehicle_age'] = vehicle_age // e.g., "1000 KG"
        }
        if (validateAndUpdateCommonField(exist?.vehicle_model, vehicle_model, isFullResponse)) {
            updateDataArray['vehicle_model'] = vehicle_model // e.g., "PLATINA 100 ES (CBS)" "
        }
        // Return the object containing all fields that need updating
        return updateDataArray;
    } catch (error) {
        console.log("== error", error)
        // In production, you might want to handle this error more gracefully
        throw error; // or return some error object
    }
}
function convertDateFormat(dateString, targetFormat) {
    if (!dateString || !targetFormat) return null; // Handle empty input
    const parsedDate = moment(dateString, [
        'MMM/YYYY',  // e.g., Oct/2019
        'MMMM/YYYY', // e.g., October/2019
        'MM/YYYY',   // e.g., 10/2019
        'YYYY-MM-DD', // e.g., 2019-10-15
        'DD/MM/YYYY', // e.g., 15/10/2019
        'MM-DD-YYYY', // e.g., 10-15-2019
        'YYYY/MM/DD',  // e.g., 2019/10/15,
        'DD-MM-YYYY',
        'DD-MMM-YYYY'
    ], true); // Strict parsing
    return parsedDate.isValid() ? parsedDate.format(targetFormat) : null;
}
export const checkUpdateRcValidationNew = async (owenDBfields, fieldName) => {
    try {
        const {
            regn_dt,
            chasi_no,
            engine_no,
            owner_sr_no,
            owner_name,
            father_name,
            address,
            rto,
            fuel_type,
            maker_modal,
            maker,
            cubic_cap,
            vehicle_color,
            fitness_upto,
            financer_details,
            fuel_norms,
            blacklist_status,
            noc_details,
            insurance_comp,
            body_type_desc,
            puc_upto,
            puc_no,
            insUpto,
            vh_class,
            manufacturer_month_yr,
            policy_no,
            sleeper_cap,
            stand_cap,
            wheelbase,
            vehicle_weight,
            no_of_cyl,
            tax_upto,
            gvw,
            rc_unld_wt,
            no_of_seats,
            mobile_no
        } = fieldName
        const updateDataArray = {};
        let exist = owenDBfields
        if (!exist.regn_dt || exist.regn_dt == "NA") {
            if (regn_dt && regn_dt != "NA") {
                updateDataArray['regn_dt'] = regn_dt;
            }
        }
        if (!exist.policy_no || exist.policy_no == "NA" || exist.policy_no == "") {
            if (policy_no && policy_no != "NA" && policy_no != "") {
                updateDataArray['policy_no'] = policy_no;
            }
        }
        if (!exist.chasi_no || exist.chasi_no?.includes("XXXX") && chasi_no) {
            if (chasi_no && !chasi_no?.includes("XXXX")) {
                updateDataArray['chasi_no'] = chasi_no;
            } else if (chasi_no && !chasi_no?.substr(chasi_no?.length - 5)?.includes("XXXX")) {
                updateDataArray['chasi_no'] = chasi_no;
            }
        }
        if (!exist.engine_no || exist.engine_no?.includes("XXXX")) {
            if (engine_no && !engine_no?.includes("XXXX")) {
                updateDataArray['engine_no'] = engine_no;
            } else if (engine_no && !engine_no?.substr(engine_no.length - 5)?.includes("XXXX")) {
                updateDataArray['engine_no'] = engine_no;
            }
        }

        if ((!exist?.owner_sr_no && owner_sr_no) || exist?.owner_sr_no < owner_sr_no) {
            updateDataArray['owner_sr_no'] = owner_sr_no;

            if (owner_name && owner_name !== "NA") {
                updateDataArray['owner_name'] = owner_name;
            }
            if (father_name && father_name !== "NA" && father_name !== ".") {
                updateDataArray['father_name'] = father_name;
            }
            if (address && address !== "NA") {
                updateDataArray['address'] = address;
            }
            if (rto && rto != '' && rto !== "NA") {
                updateDataArray['rto'] = rto;
            }
        } else {
            if (!exist.owner_name || exist.owner_name === "NA" || exist.owner_name?.includes("*")) {
                if (owner_name && owner_name !== "NA") {
                    updateDataArray['owner_name'] = owner_name;
                }
            } else {
                let maskOwnername = convertString(exist.owner_name)
                if (maskOwnername != owner_name) {
                    updateDataArray['owner_name'] = owner_name;
                }
            }
            if (!exist?.father_name || exist?.father_name?.includes("*") || exist.father_name === "NA") {
                if (father_name && father_name !== "NA" && father_name !== ".") {
                    updateDataArray['father_name'] = father_name;
                }
            } else {
                let maskfather_name = convertString(exist.owner_name)
                if (maskfather_name != father_name) {
                    updateDataArray['father_name'] = father_name;
                }
            }
            if ((!exist.address || exist.address === "NA") && address && address !== "NA") {
                updateDataArray['address'] = address;
            }

            if ((!exist.rto || exist.rto === "NA") && rto && rto != '' && rto !== "NA") {
                updateDataArray['rto'] = rto;
            }
        }

        if (!exist.fuel_type || exist.fuel_type?.includes("XXXXXXXX")) {
            if (!fuel_type?.includes("XXXXXXXX")) {
                updateDataArray['fuel_type'] = fuel_type;
            }
        } else {
            if (fuel_type && !fuel_type?.includes("XXXXXXXX")) {
                if (exist.fuel_type !== fuel_type) {
                    if (fuel_type?.length > exist.fuel_type?.length) {
                        updateDataArray['fuel_type'] = fuel_type;
                        // if (fuel_type?.includes(exist.fuel_type)) {
                        //     updateDataArray['fuel_type'] = fuel_type;
                        // } else {
                        //     updateDataArray['fuel_type'] = fuel_type;
                        // }
                    }
                }
            }
        }

        if (!exist.maker_modal || exist.maker_modal?.includes("XXXXXXXX") || exist.maker_modal === "NA") {
            if (maker && !maker_modal?.includes("XXXXXXXX") && maker_modal !== "NA") {
                updateDataArray['maker_modal'] = maker_modal;
            }
        } else {
            if (maker && !maker_modal?.includes("XXXXXXXX") && maker_modal !== "NA") {
                if (exist.maker_modal !== maker_modal) {
                    if (maker_modal?.length > exist.maker_modal?.length) {
                        updateDataArray['maker_modal'] = maker_modal;
                        // if (maker_modal?.includes(exist.maker_modal)) {
                        //     updateDataArray['maker_modal'] = maker_modal;
                        // } else {
                        //     updateDataArray['maker_modal'] = maker_modal;
                        // }
                    }
                }
            }
        }

        if (!exist.maker || exist.maker?.includes("XXXXXXXX") || exist.maker === "NA") {
            if (maker && !maker?.includes("XXXXXXXX") && maker !== "NA") {
                updateDataArray['maker'] = maker;
            }
        } else {
            if (maker && !maker?.includes("XXXXXXXX") && maker !== "NA") {
                if (exist.maker !== maker) {
                    if (maker?.length > exist.maker?.length) {
                        updateDataArray['maker'] = maker;
                        // if (maker?.includes(exist.maker)) {
                        //     updateDataArray['maker'] = maker;
                        // } else {
                        //     updateDataArray['maker'] = maker;
                        // }
                    }
                }
            }
        }


        if ((exist.cubic_cap === "NA" || !exist.cubic_cap) && cubic_cap && cubic_cap !== "NA") {
            updateDataArray['cubic_cap'] = cubic_cap;
        }

        if ((exist.vehicle_color === "NA" || !exist.vehicle_color) && vehicle_color && vehicle_color !== "NA") {
            updateDataArray['vehicle_color'] = vehicle_color;
        }

        if ((exist.fitness_upto === "NA" || !exist.fitness_upto) && fitness_upto && fitness_upto !== "NA") {
            updateDataArray['fitness_upto'] = fitness_upto;
        } else {
            if (fitness_upto && fitness_upto !== "NA") {
                const existFitness = new Date(exist.fitness_upto).getTime();
                const invisiableFitness = new Date(fitness_upto).getTime();
                if (invisiableFitness > existFitness) {
                    updateDataArray['fitness_upto'] = fitness_upto;
                }
            }
        }

        if ((exist.financer_details === "NA" || !exist.financer_details) && financer_details && financer_details !== "NA") {
            updateDataArray['financer_details'] = financer_details;
        }

        if (exist.fuel_norms === "NA" && fuel_norms && fuel_norms !== "NA") {
            updateDataArray['fuel_norms'] = fuel_norms;
        } else {
            if (fuel_norms !== "NA") {
                if (exist.fuel_norms !== fuel_norms) {
                    if (fuel_norms?.length > exist.fuel_norms?.length) {
                        updateDataArray['fuel_norms'] = fuel_norms;
                        // if (fuel_norms?.includes(exist.fuel_norms)) {
                        //     updateDataArray['fuel_norms'] = fuel_norms;
                        // } else {
                        //     updateDataArray['fuel_norms'] = fuel_norms;
                        // }
                    }
                }
            }
        }

        if (!exist.blacklist_status || exist.blacklist_status === 'NA') {
            if (blacklist_status && blacklist_status !== "NA") {
                updateDataArray['blacklist_status'] = blacklist_status;
            }
        } else {
            if (blacklist_status !== "NA") {
                if (exist.blacklist_status !== blacklist_status) {
                    if (blacklist_status?.length > exist.blacklist_status?.length) {
                        updateDataArray['blacklist_status'] = blacklist_status;
                        // if (blacklist_status?.includes(exist.blacklist_status)) {
                        //     updateDataArray['blacklist_status'] = blacklist_status;
                        // } else {
                        //     updateDataArray['blacklist_status'] = blacklist_status;
                        // }
                    }
                }
            }
        }

        if (!exist.noc_details || exist.noc_details === 'NA') {
            if (noc_details && noc_details !== "NA") {
                updateDataArray['noc_details'] = noc_details;
            }
        } else {
            if (noc_details && noc_details !== "NA") {
                if (exist.noc_details !== noc_details) {
                    updateDataArray['noc_details'] = noc_details;
                }
            }
        }

        if (!exist.insurance_comp || exist.insurance_comp?.includes("XXXXXXXX") || exist.insurance_comp === "NA") {
            if (insurance_comp && !insurance_comp?.includes("XXXXXXXX") && insurance_comp !== "NA") {
                updateDataArray['insurance_comp'] = insurance_comp;
            }
        } else {
            if (insurance_comp && !insurance_comp?.includes("XXXXXXXX") && insurance_comp !== "NA") {
                if (exist.insurance_comp !== insurance_comp) {
                    // console.log("hhhshshs",insurance_comp?.length)
                    // console.log("exist",insurance_comp?.length)
                    // if (insurance_comp?.length > exist.insurance_comp?.length) {
                    //     console.log("sumit patel")
                    updateDataArray['insurance_comp'] = insurance_comp;
                    // if (insurance_comp?.includes(exist.insurance_comp)) {
                    //     updateDataArray['insurance_comp'] = insurance_comp;
                    // } else {
                    //     updateDataArray['insurance_comp'] = insurance_comp;
                    // }
                    //}
                }
            }
        }

        if ((!exist.body_type_desc || exist.body_type_desc === "NA") && body_type_desc && body_type_desc !== "NA") {
            updateDataArray['body_type_desc'] = body_type_desc;
        } else {
            if (body_type_desc && body_type_desc !== "NA" && body_type_desc) {
                if (exist.body_type_desc !== body_type_desc) {
                    if (body_type_desc?.length > exist.body_type_desc?.length) {
                        updateDataArray['body_type_desc'] = body_type_desc;
                        // if (body_type_desc?.includes(exist.body_type_desc)) {
                        //     updateDataArray['body_type_desc'] = body_type_desc;
                        // } else {
                        //     updateDataArray['body_type_desc'] = body_type_desc;
                        // }
                    }
                }
            }
        }

        if (!exist.puc_no || exist.puc_no == "NA" || exist.puc_no == "") {
            if (puc_no && puc_no != "NA" && puc_no != "") {
                updateDataArray['puc_no'] = puc_no;
            }
        }

        if (!exist.puc_upto || exist.puc_upto?.includes("XXXXXXXX")) {
            if (!puc_upto?.includes("XXXXXXXX") && puc_upto !== "NA") {
                updateDataArray['puc_upto'] = puc_upto;
            }
        } else {
            if (puc_upto && !puc_upto?.includes("XXXXXXXX") && puc_upto !== "NA" && puc_upto !== "") {
                // const existPuc = new Date(exist.puc_upto).getTime();
                // const invisiablePuc = new Date(puc_upto).getTime();
                // if (invisiablePuc > existPuc) {
                //     updateDataArray['puc_upto'] = puc_upto;
                // }
                updateDataArray['puc_upto'] = puc_upto;
            }
        }

        if (!exist.insUpto || exist.insUpto?.includes("XXXXXXXX")) {
            if (insUpto && !insUpto?.includes("XXXXXXXX") && insUpto !== "NA") {
                updateDataArray['insUpto'] = insUpto;
            }
        } else {
            if (insUpto && !insUpto?.includes("XXXXXXXX") && insUpto !== "NA") {
                const existInsurence = new Date(exist.insUpto).getTime();
                const invisiableInsurence = new Date(insUpto).getTime();
                if (invisiableInsurence > existInsurence) {
                    updateDataArray['insUpto'] = insUpto;
                }
            }
        }

        if (!exist.vh_class || exist.vh_class?.includes("XXXXXXXX")) {
            if (vh_class && !vh_class?.includes("XXXXXXXX") && vh_class !== "NA") {
                updateDataArray['vh_class'] = vh_class;
            }
        } else {
            if (vh_class && !vh_class?.includes("XXXXXXXX") && vh_class !== "NA") {
                if (exist.vh_class !== vh_class) {
                    if (vh_class?.length > exist.vh_class?.length) {
                        updateDataArray['vh_class'] = vh_class;
                        // if (veh_class?.includes(exist.vh_class)) {
                        //     updateDataArray['vh_class'] = veh_class;
                        // } else {
                        //     updateDataArray['vh_class'] = veh_class;
                        // }
                    }
                }
            }
        }
        if (!exist.manufacturer_month_yr || exist.manufacturer_month_yr?.toUpperCase() === 'NA') {
            if (manufacturer_month_yr && manufacturer_month_yr?.toUpperCase() !== "NA") {
                updateDataArray['manufacturer_month_yr'] = manufacturer_month_yr;
            }
        }

        if (!exist.sleeper_cap || exist.sleeper_cap == "NA" || exist.sleeper_cap == "") {
            if (sleeper_cap && sleeper_cap != "NA" && sleeper_cap != "") {
                updateDataArray['sleeper_cap'] = sleeper_cap;
            }
        }
        if (!exist.stand_cap || exist.stand_cap == "NA" || exist.stand_cap == "") {
            if (stand_cap && stand_cap != "NA" && stand_cap != "") {
                updateDataArray['stand_cap'] = stand_cap;
            }
        }
        if (!exist.wheelbase || exist.wheelbase == "NA" || exist.wheelbase == "") {
            if (wheelbase && wheelbase != "NA" && wheelbase != "") {
                updateDataArray['wheelbase'] = wheelbase;
            }
        }
        if (!exist.vehicle_weight || exist.vehicle_weight == "NA" || exist.vehicle_weight == "") {
            if (vehicle_weight && vehicle_weight != "NA" && vehicle_weight != "") {
                updateDataArray['vehicle_weight'] = vehicle_weight;
            }
        }
        if (!exist.no_of_cyl || exist.no_of_cyl == "NA" || exist.no_of_cyl == "") {
            if (no_of_cyl && no_of_cyl != "NA" && no_of_cyl != "") {
                updateDataArray['no_of_cyl'] = no_of_cyl;
            }
        }
        if (!exist.tax_upto || exist.tax_upto == "NA" || exist.tax_upto == "") {
            if (tax_upto && tax_upto != "NA" && tax_upto != "") {
                updateDataArray['no_of_cyl'] = tax_upto;
            }
        }
        if (!exist.gvw || exist.gvw == "NA" || exist.gvw == "") {
            if (gvw && gvw != "NA" && gvw != "") {
                updateDataArray['gvw'] = gvw;
            }
        }
        if (!exist.rc_unld_wt || exist.rc_unld_wt == "NA" || exist.rc_unld_wt == "") {
            if (rc_unld_wt && rc_unld_wt != "NA" && rc_unld_wt != "") {
                updateDataArray['rc_unld_wt'] = rc_unld_wt;
            }
        }
        if (!exist.no_of_seats || exist.no_of_seats == "NA" || exist.no_of_seats == "" || exist.no_of_seats == 0) {
            if (no_of_seats && no_of_seats != "NA" && no_of_seats != "" && no_of_seats != 0) {
                updateDataArray['no_of_seats'] = no_of_seats;
            }
        }

        if (!exist.mobile_no || exist.mobile_no == "NA" || exist.mobile_no == "" || exist.mobile_no == 0) {
            if (mobile_no && mobile_no != "NA" && mobile_no != "" && mobile_no != 0) {
                updateDataArray['mobile_no'] = mobile_no;
            }
        }
        return updateDataArray
    } catch (error) {
        console.log("== error", error)
    }
}
export const isRecordIsLite = async (data) => {
    try {
        let { chasi_no,
            engine_no,
            owner_name,
            father_name,
            owner_sr_no,
            regn_at,
            fuel_type,
            maker_modal,
            maker,
            cubic_cap,
            vehicle_color,
            fitness_upto,
            financer_details,
            fuel_norms,
            blacklist_status,
            noc_details,
            insurance_comp,
            body_type_desc,
            puc_upto,
            insUpto,
            vh_class,
            manufacturer_month_yr
        } = data

        const allFields = [
            { value: chasi_no, invalidExact: ["NA"], invalidIncludes: ["XXXX"] },
            { value: engine_no, invalidExact: ["NA"], invalidIncludes: ["XXXX"] },
            { value: owner_name, invalidExact: ["NA"], invalidIncludes: ["*"] },
            { value: father_name, invalidExact: ["NA"], invalidIncludes: ["*"] },
            { value: owner_sr_no, invalidExact: [0] },
            { value: regn_at, invalidExact: ["NA"] },
            { value: fuel_type, invalidExact: ["NA"] },
            { value: maker_modal, invalidExact: ["NA"], invalidIncludes: ["XXXX"] },
            { value: maker, invalidExact: ["NA"], invalidIncludes: ["XXXX"] },
            { value: cubic_cap, invalidExact: ["NA"] },
            { value: vehicle_color, invalidExact: ["NA"] },
            { value: fitness_upto, invalidExact: ["NA"] },
            { value: financer_details, invalidExact: ["NA"] },
            { value: fuel_norms, invalidExact: ["NA"] },
            { value: blacklist_status, invalidExact: ["NA"] },
            { value: noc_details, invalidExact: ["NA"] },
            { value: insurance_comp, invalidExact: ["NA"], invalidIncludes: ["XXXX"] },
            { value: body_type_desc, invalidExact: ["NA"], invalidIncludes: ["XXXX"] },
            { value: puc_upto, invalidExact: ["NA"], invalidIncludes: ["XXXX"] },
            { value: insUpto, invalidExact: ["NA"], invalidIncludes: ["XXXX"] },
            { value: vh_class, invalidExact: ["NA"], invalidIncludes: ["XXXX"] },
            { value: manufacturer_month_yr, invalidExact: ["NA"], invalidIncludes: ["XXXX"] }
        ];

        let isLite = allFields.some(field => {
            return !field.value ||
                (field.invalidExact && field.invalidExact == field.value) ||
                (field.invalidIncludes && field.invalidIncludes.some(substring => field.value.includes(substring)));
        });

        // console.log('isLite --->', isLite);
        return isLite;
    } catch (error) {
        console.log('==error', error)
    }


}

export const checkMaskString = (string) => {
    if (string) {
        if (string.includes('XXXX')) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}
function convertString(oldName) {
    let result = '';
    for (let i = 0; i < oldName.length; i++) {
        if (oldName[i] === ' ') {
            result += ' ';
        } else if (i % 2 !== 0) {
            result += '*' + oldName[i];
        }
    }
    return result;
}

export const findRCMobile = async (rcNo, appType, chasisNum) => {
    try {
        const callMobileAPi = process.env.MOBILE_API
        if (callMobileAPi && callMobileAPi == "false") {
            return false;
        }
        const apiUrls = [
            "https://e5p83yhz17.execute-api.ap-south-1.amazonaws.com/default/partner-mobile-script?methodName=searchRCMobile&rcNum=",
            "https://kysce72cx3.execute-api.ap-south-1.amazonaws.com/default/partner-mobile-script-1?methodName=searchRCMobile&rcNum=",
            "https://t1yqa55nrj.execute-api.ap-south-1.amazonaws.com/default/partner-mobile-script-2?methodName=searchRCMobile&rcNum=",
            "https://o4ynvijdwa.execute-api.ap-south-1.amazonaws.com/default/partner-mobile-script-3?methodName=searchRCMobile&rcNum=",
            "https://rhjbbl3s3k.execute-api.ap-south-1.amazonaws.com/default/partner-mobile-script-4?methodName=searchRCMobile&rcNum=",
            "https://f0i8wevat6.execute-api.ap-south-1.amazonaws.com/default/partner-mobile-script-5?methodName=searchRCMobile&rcNum="
        ];

        // Get a random URL from the array
        const apiUrl = apiUrls[Math.floor(Math.random() * apiUrls.length)];

        let url = `${apiUrl}${rcNo}&partnerName=${appType}`;
        console.log(url)
        let final_respone = false;
        for (let i = 0; i < 2; i++) {
            try {
                const response = await axios.get(url, { timeout: 1000 })
                const ReceivedData = await response.data;
                if (ReceivedData?.apiMessage?.statusCode == 200) {
                    final_respone = ReceivedData?.data?.mobileNo
                    await viMobileScriptApiCallingInfo(1)
                    await ViHomeInfoInsert(rcNo, 'Sucess', 1, 'Mobile', '')
                    break
                } else {
                    await viMobileScriptApiCallingInfo(0)
                    await ViHomeInfoInsert(rcNo, ReceivedData?.apiMessage, 0, 'Mobile', '')
                    continue;
                }
            } catch (error) {
                await viMobileScriptApiCallingInfo(2)
                await ViHomeInfoInsert(rcNo, 'Error: ' + error.message, 0, 'Mobile', '')
                continue;
            }
        }
        if (final_respone) {
            return final_respone
        }
        else {
            return false;
        }
    } catch (error) {
        await ViHomeInfoInsert(rcNo, 'Error: ' + error.message, 0, 'Mobile', '');
        return false;
    }
}
export const insertChallanData = async (Data, tablename) => {
    try {
        const insertQuery = `INSERT INTO \`${tablename}\` (reg_no,
             violator_name,
             dl_rc_no,
             challan_no,
             challan_date,
             challan_amount,
             challan_status,
             challan_payment_date,
             transaction_id,
             payment_source,
             challan_url,
             receipt_url,
             payment_url,
             state,
             date
         ) VALUES (
             :reg_no,
             :violator_name,
             :dl_rc_no,
             :challan_no,
             :challan_date,
             :challan_amount,
             :challan_status,
             :challan_payment_date,
             :transaction_id,
             :payment_source,
             :challan_url,
             :receipt_url,
             :payment_url,
             :state,
             :date);`

        const [result] = await db.CHALLAN.query(insertQuery, {
            replacements: Data,
            type: Sequelize.QueryTypes.INSERT,
        })
        if (result) {
            return result
        }
        else {
            return false
        }
    }
    catch (error) {
        return false
    }
}

export const CheckUpdateFeilds = async (owenDBfields, fieldName) => {
    try {
        const {
            violator_name,
            dl_rc_no,
            challan_date,
            challan_amount,
            challan_status,
            challan_payment_date,
            transaction_id,
            payment_source,
            challan_url,
            receipt_url,
            payment_url,
            challan_state,
            isPayable,
            challan_type,
        } = fieldName
        const updateDataArray = {};
        let exist = owenDBfields

        if (!exist?.violator_name || exist?.violator_name == "NA") {
            if (violator_name && violator_name != "NA") {
                updateDataArray['violator_name'] = violator_name;
            }
        }
        if (!exist?.dl_rc_no || exist?.dl_rc_no == "NA") {
            if (dl_rc_no && dl_rc_no != "NA") {
                updateDataArray['dl_rc_no'] = dl_rc_no;
            }
        }
        if (!exist?.challan_date || exist?.challan_date == "NA") {
            if (challan_date && challan_date != "NA") {
                updateDataArray['challan_date'] = challan_date;
            }
        }
        if (!exist?.challan_amount || exist?.challan_amount == "NA") {
            if (challan_amount && challan_amount != "NA") {
                updateDataArray['challan_amount'] = challan_amount;
            }
        }
        if (!exist?.challan_payment_date || exist?.challan_payment_date == "NA") {
            if (challan_payment_date && challan_payment_date != "NA") {
                updateDataArray['challan_payment_date'] = challan_payment_date;
            }
        } if (!exist?.transaction_id || exist?.transaction_id == "NA") {
            if (transaction_id && transaction_id != "NA") {
                updateDataArray['transaction_id'] = transaction_id;
            }
        }
        if (!exist?.payment_source || exist?.payment_source == "NA") {
            if (payment_source && payment_source != "NA") {
                updateDataArray['payment_source'] = payment_source;
            }
        }
        if (!exist?.challan_url || exist?.challan_url == "NA") {
            if (challan_url && challan_url != "NA") {
                updateDataArray['challan_url'] = challan_url;
            }
        }
        if (!exist?.receipt_url || exist?.receipt_url == "NA") {
            if (receipt_url && receipt_url != "NA") {
                updateDataArray['receipt_url'] = receipt_url;
            }
        }
        if (!exist?.payment_url || exist?.payment_url == "NA") {
            if (payment_url && payment_url != "NA") {
                updateDataArray['payment_url'] = payment_url;
            }
        }
        if (!exist?.challan_state || exist?.challan_state == "NA") {
            if (challan_state && challan_state != "NA") {
                updateDataArray['challan_state'] = challan_state;
            }
        }
        updateDataArray['isPayable'] = isPayable
        updateDataArray['challan_type'] = challan_type
        updateDataArray['challan_status'] = challan_status
        return updateDataArray

    } catch (error) {
        console.error('Error in updateChallanDataIfValid:', error);
        return false;
    }
};

export const insertOrUpdateChallanData = async (regNumber, Data, tablename, offenceTableName, source) => {
    try {
        const selectQuery = `SELECT * FROM \`${tablename}\` WHERE reg_no = :reg_no AND challan_no = :challan_no`;

        // Execute the query using Sequelize
        const [ChallanData] = await db.CHALLAN.query(selectQuery, {
            replacements: { reg_no: regNumber, challan_no: Data?.challan_no },
            type: Sequelize.QueryTypes.SELECT,
        });
        if (ChallanData?.challan_status != "Processed") {
            if (ChallanData) {
                let updateChallanFeilds = await CheckUpdateFeilds(ChallanData, Data)
                const setClause = Object.keys({ ...updateChallanFeilds, source: source })
                    .map((col) => `${col} = :${col}`)
                    .join(', ');
                if (setClause) {
                    const sql = `UPDATE \`${tablename}\` SET ${setClause} WHERE id = :id`;
                    const _result = await db.CHALLAN.query(sql, {
                        replacements: { ...updateChallanFeilds, source: source, id: ChallanData.id },
                        type: Sequelize.QueryTypes.UPDATE
                    });
                }

                await db.CHALLAN.query(`DELETE FROM \`${offenceTableName}\` WHERE challan_id = :challan_id`, {
                    replacements: {
                        challan_id: ChallanData.id,
                    },
                    type: Sequelize.QueryTypes.INSERT,
                });
                let values = [];
                let placeholders = Data?.offences?.map(offence => {
                    values.push(ChallanData.id, offence?.offence_name, offence?.penalty || "NA");
                    return '(?, ?, ?)';
                }).join(',');

                // Build the full query
                const insertQuery = `INSERT INTO \`${offenceTableName}\` (challan_id, offence_name, penalty) VALUES ${placeholders}`;
                const insertedData = await db.CHALLAN.query(insertQuery, {
                    type: Sequelize.QueryTypes.INSERT,
                    replacements: values,
                });
                return {
                    status: true,
                    created_at: ChallanData.created_at,
                    updated_at: moment().tz("Asia/Kolkata"),
                };
            } else {
                const insertChallanQuery = `INSERT INTO \`${tablename}\` (
                reg_no,
                violator_name,
                dl_rc_no,
                challan_no,
                challan_date,
                challan_amount,
                challan_status,
                challan_payment_date,
                transaction_id,
                payment_source,
                challan_url,
                receipt_url,
                payment_url,
                state,
                challan_type,
                challan_state,
                date,
                source
            ) VALUES (
                :reg_no,
                :violator_name,
                :dl_rc_no,
                :challan_no,
                :challan_date,
                :challan_amount,
                :challan_status,
                :challan_payment_date,
                :transaction_id,
                :payment_source,
                :challan_url,
                :receipt_url,
                :payment_url,
                :state,
                :challan_type,
                :challan_state,
                :date,
                :source
            )`;
                const [result] = await db.CHALLAN.query(insertChallanQuery, {
                    replacements: Data,
                    type: Sequelize.QueryTypes.INSERT,
                });
                let values = [];
                let placeholders = Data?.offences?.map(offence => {
                    values.push(result, offence?.offence_name, offence?.penalty || "NA");
                    return '(?, ?, ?)';
                }).join(',');

                // Build the full query
                const insertQuery = `INSERT INTO \`${offenceTableName}\` (challan_id, offence_name, penalty) VALUES ${placeholders}`;
                const insertedData = await db.CHALLAN.query(insertQuery, {
                    type: Sequelize.QueryTypes.INSERT,
                    replacements: values,
                });
                return {
                    status: true,
                    created_at: moment().tz("Asia/Kolkata"),
                    updated_at: moment().tz("Asia/Kolkata"),
                }
            }
        } else {
            return {
                status: true,
                created_at: ChallanData.created_at,
                updated_at: ChallanData.updated_at,
                challan_status: "Processed"
            }
        }
    } catch (error) {
        console.error("Error in insertOrUpdateChallanData:", error);
        return false;
    }
};

export const insertChallanOffenceData = async (Data, tablename) => {
    try {
        const insertQuery = `INSERT INTO \`${tablename}\` (challan_id,
             offence_name,
             mva,
             penalty
         ) VALUES (
             :challan_id,
             :offence_name,
             :mva,
             :penalty
             );`

        const [result] = await db.CHALLAN.query(insertQuery, {
            replacements: Data,
            type: Sequelize.QueryTypes.INSERT,
        })
        if (result) {
            return result
        }
        else {
            return false
        }
    }
    catch (error) {
        return false
    }
}

export const updateChallanData = async (Data, tablename, updatefield, updatefieldvalue) => {
    try {
        const updateQuery = `
            UPDATE \`${tablename}\` 
            SET 
                reg_no = :reg_no,
                violator_name = :violator_name,
                dl_rc_no = :dl_rc_no,
                challan_no = :challan_no,
                challan_date = :challan_date,
                challan_amount = :challan_amount,
                challan_status = :challan_status,
                challan_payment_date = :challan_payment_date,
                transaction_id = :transaction_id,
                payment_source = :payment_source,
                challan_url = :challan_url,
                receipt_url = :receipt_url,
                payment_url = :payment_url,
                state = :state
            WHERE ${updatefield} = :updatefieldvalue;
        `;

        // Execute query with replacements
        const [updateResult] = await db.CHALLAN.query(updateQuery, {
            replacements: { ...Data, updatefieldvalue },
            type: Sequelize.QueryTypes.UPDATE,
        });
        return updateResult;
    }
    catch (error) {
        return false
    }
}


export const updateChallanOffenceData = async (Data, tablename, updatefield, updatefieldvalue) => {
    try {
        const updateQuery = `
            UPDATE \`${tablename}\` 
            SET 
                challan_id = :challan_id,
                offence_name = :offence_name,
                mva = :mva,
                penalty = :penalty
            WHERE ${updatefield} = :updatefieldvalue;
        `;

        // Execute query with replacements
        const [updateResult] = await db.CHALLAN.query(updateQuery, {
            replacements: { ...Data, updatefieldvalue },
            type: Sequelize.QueryTypes.UPDATE,
        });
        return updateResult;
    }
    catch (error) {
        console.log(error)
        return false
    }
}

const getAccessToken = async () => {
    const client = new GoogleAuth({
        keyFile: './public/firebase/serviceAccountKey.json', // Use the correct path to your service account file
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const accessToken = await client.getAccessToken();
    return accessToken;
};

const getAccessTokenIos = async () => {
    const client = new GoogleAuth({
        keyFile: './public/firebase/serviceAccountKeyIos.json', // Use the correct path to your service account file
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const accessToken = await client.getAccessToken();
    return accessToken;
};

export const sendNotification = async (reg_no, fcm_token, message, type) => {
    try {
        let accessToken
        let projectKey
        let activity
        if (type == "ios") {
            accessToken = await getAccessTokenIos();
            projectKey = "ios-new-appllication-2020"
            activity = "NextGenShowRCDetailsActivity"
        }
        else {
            accessToken = await getAccessToken();
            projectKey = "plucky-lane-128505"
            activity = "NextGenShowRCDetailsActivity"
        }

        const url = `https://fcm.googleapis.com/v1/projects/${projectKey}/messages:send`

        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        };
        const fcmTokens = Array.isArray(fcm_token)
            ? [fcm_token]
            : fcm_token;


        const payload = {
            message: {
                token: fcmTokens,
                notification: {
                    title: 'RTO Vehicle Information',
                    body: message,
                },
                data: {
                    title: 'RTO Vehicle Information',
                    activity_should_be_open: activity,
                    reg_number: reg_no,
                }
            }
        };
        //return res.send(payload)
        try {
            const response = await axios.post(url, payload, { headers });
            //return res.send(response)
            console.log("Notification sent successfully:", response.data);
        } catch (error) {
            console.error("Error sending notification:", error.response?.data || error.message);
        }

    } catch (error) {
        console.log("Error", error)
        const _response = {
            status: true,
            response_code: 500,
            response_message: "Interal Server Error",
        }

    }
}


// export const insertRcData = async (data,tableName,type)=>{
//     const defaultValues = {
//         status: "",
//         rto: "",
//         reg_no: "",
//         regn_dt: "",
//         chasi_no: "",
//         engine_no: "",
//         owner_name: "",
//         vh_class: "",
//         fuel_type: "",
//         maker: "",
//         maker_modal: "",
//         father_name: "",
//         address: "",
//         owner_sr_no: 0,
//         fitness_upto: "",
//         vehicle_age: "",
//         insUpto: "",
//         state: "",
//         policy_no: "",
//         puc_no: "",
//         puc_upto: "",
//         insurance_comp: "",
//         vehicle_color: "",
//         financer_details: "",
//         fuel_norms: "",
//         no_of_seats: 0,
//         body_type_desc: "",
//         regn_at: "",
//         manufacturer_month_yr: "",
//         gvw: "",
//         no_of_cyl: "",
//         cubic_cap: "",
//         sleeper_cap: "",
//         stand_cap: "",
//         wheelbase: "",
//         mobile_no: "",
//         permit_no: "",
//         permit_issue_date: "",
//         permit_from: "",
//         permit_upto: "",
//         permit_type: "",
//         blacklist_status: "",
//         noc_details: "",
//         tax_upto: "",
//         rc_np_no: "",
//         rc_np_upto: "",
//         rc_np_issued_by: "",
//         rc_unld_wt: "",
//         source: "",
//         // is_update: "",
//         is_lite: 0,
//         is_update:0,
//         insurence_company: "",
//         // parivahan_json: null,
//         // own_json: null,
//         updated_at: null,
//         vehicle_weight:""
//     };
//     console.log("Inside Insert Block------>>>>>");

//     const finalRecord = { ...defaultValues, ...data };

//     let insertQuery = `INSERT INTO \`${tableName}\` (
//                   status,
//                   rto,
//                   reg_no,
//                   regn_dt,
//                   chasi_no,
//                   engine_no,
//                   owner_name,
//                   vh_class,
//                   fuel_type,
//                   maker,
//                   maker_modal,
//                   father_name,
//                   address,
//                   owner_sr_no,
//                   fitness_upto,
//                   vehicle_age,
//                   insUpto,
//                   state,
//                   policy_no,
//                   puc_no,
//                   puc_upto,
//                   insurance_comp,
//                   vehicle_color,
//                   financer_details,
//                   fuel_norms,
//                   no_of_seats,
//                   body_type_desc,
//                   regn_at,
//                   manufacturer_month_yr,
//                   gvw,
//                   no_of_cyl,
//                   cubic_cap,
//                   sleeper_cap,
//                   stand_cap,
//                   wheelbase,
//                   mobile_no,
//                   permit_no,
//                   permit_issue_date,
//                   permit_from,
//                   permit_upto,
//                   permit_type,
//                   blacklist_status,
//                   noc_details,
//                   tax_upto,
//                   rc_np_no,
//                   rc_np_upto,
//                   rc_np_issued_by,
//                   rc_unld_wt,
//                   source,
//                   is_lite,
//                   is_update,
//                   insurence_company,
//                   vehicle_weight,
//                   updated_at
//                 ) VALUES (
//                   :status,
//                   :rto,
//                   :reg_no,
//                   :regn_dt,
//                   :chasi_no,
//                   :engine_no,
//                   :owner_name,
//                   :vh_class,
//                   :fuel_type,
//                   :maker,
//                   :maker_modal,
//                   :father_name,
//                   :address,
//                   :owner_sr_no,
//                   :fitness_upto,
//                   :vehicle_age,
//                   :insUpto,
//                   :state,
//                   :policy_no,
//                   :puc_no,
//                   :puc_upto,
//                   :insurance_comp,
//                   :vehicle_color,
//                   :financer_details,
//                   :fuel_norms,
//                   :no_of_seats,
//                   :body_type_desc,
//                   :regn_at,
//                   :manufacturer_month_yr,
//                   :gvw,
//                   :no_of_cyl,
//                   :cubic_cap,
//                   :sleeper_cap,
//                   :stand_cap,
//                   :wheelbase,
//                   :mobile_no,
//                   :permit_no,
//                   :permit_issue_date,
//                   :permit_from,
//                   :permit_upto,
//                   :permit_type,
//                   :blacklist_status,
//                   :noc_details,
//                   :tax_upto,
//                   :rc_np_no,
//                   :rc_np_upto,
//                   :rc_np_issued_by,
//                   :rc_unld_wt,
//                   :source,
//                   :is_lite,
//                   :is_update,
//                   :insurence_company,
//                   :vehicle_weight,
//                   updated_at
//                   );`
//                 //   console.log('insertQuery', insertQuery)
//                   const [result] = await db.RC.query(insertQuery, {
//                     replacements: finalRecord,
//                     type: Sequelize.QueryTypes.INSERT,
//                 })
//                 if(result)
//                 {
//                     if(data?.reg_no)
//                        if(data?.reg_no)
//                         {
//                             if(type == "ios")
//                             {

//                             }
//                             else{

//                             }
//                         }   
//                     return result
//                 }
//                 else{
//                     return false
//                 }
//    }
export const insertRcData = async (data, tableName, type) => {
    // Retrieve mobile number if required by configuration
    if (process.env.MOBILE_API === "true") {
        if (data.mobile_no == "" || data.mobile_no == 0) {
            const mobileNumber = await findRCMobile(data.reg_no, type);
            //console.log('mobileNumber', mobileNumber)
            if (mobileNumber) {
                data.mobile_no = mobileNumber;
            }
        }
    }
    if (process.env.UPDATE_CHASSIE_STATE.includes(tableName)) {
        const _isValidChassie = isValidChassie(data?.chasi_no)
        if (!_isValidChassie) {
            const getChassiesNumber = await getChassisNumberFromVrn(data.reg_no)
            //console.log('getChassiesNumber', getChassiesNumber)
            let chasisNo = getChassiesNumber?.data?.chasisNo
            data.chasi_no = chasisNo
        }
    }
    // Fetch additional data if chassis number is valid
    if (process.env.INHOUSE_API === "true" && data.source != "VI_SOURCE_FULL") {
        let mainResponse;
        if (data?.chasi_no == "" || data?.chasi_no?.includes("XXXX") || data?.chasi_no === "NA") {
            mainResponse = data;
        } else {
            const inHouseResponse = await scrapping.inHouseAPIForInsertData({
                regNumber: data?.reg_no,
                chasisNo: data.chasi_no,
                appType: type
            });
            if (inHouseResponse.response_code === 200) {
                mainResponse = inHouseResponse.data[0];
            } else {
                mainResponse = data;
            }
        }
        data = mainResponse;
    }
    if ((process.env.UPDATE_OWNER_NAME_API == true || process.env.UPDATE_OWNER_NAME_API == "true")) {
        if ((data?.owner_name == "NA" || data?.owner_name == "" || data?.owner_name?.includes("XXXX"))) {
            const url = `https://uq4v373l7b.execute-api.ap-south-1.amazonaws.com/production/rto-care/ins-puc?rcNumber=${data.reg_no}`;
            const headers = {
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'axios/1.7.7',
                'x-api-key': 'M66QbZ7cEf2BnS5pbgwhh332U9M7p1bb4eN1XJRq'
            };
            const response = await axios.get(url, { headers });
            const responsedata = response?.data;
            if (responsedata?.statusCode == 200) {
                let decryptedData = responsedata.response
                data.owner_name = decryptedData?.rc_owner_name
                if (data.insUpto && data.insUpto == "NA" && data.insUpto == "" && data.insUpto == "") {
                    data.insUpto = decryptedData.rc_insurance_upto
                    data.insurance_comp = decryptedData.rc_insurance_comp
                    data.insurence_company = decryptedData.rc_insurance_comp
                }
            } else {
                const createquery = `INSERT INTO fail_update_ownername(reg_no, source,error_res) VALUES ('${data.reg_no}','VI_BASIC','${responsedata?.message || "Record not found!"}')`
                const [Insert] = await db.RC.query(createquery, {
                    type: Sequelize.QueryTypes.INSERT
                });
                let url = `https://65owbczhv4.execute-api.ap-south-1.amazonaws.com/api/challan-info-n/${data.reg_no}`;
                const options = {
                    method: 'GET',
                };
                const response = await fetch(url, options);
                let responseText = await response.text();
                let vehicleDataResponse = responseText && JSON.parse(responseText);
                if (vehicleDataResponse && (vehicleDataResponse.success == true || vehicleDataResponse.success == "true")) {
                    if (vehicleDataResponse.data) {
                        let vehicleData = decrypted(Buffer.from(vehicleDataResponse.data, "base64"), 'utf8');
                        let finalData = JSON.parse(vehicleData)
                        data.owner_name = finalData.owner_name
                    } else {
                        const createquery = `INSERT INTO fail_update_ownername(reg_no, source, error_res)
                        VALUES ('${data.reg_no}', 'WS_CI', 'DATA NOT FOUND')`;
                        const [Insert] = await db.RC.query(createquery, {
                            type: Sequelize.QueryTypes.INSERT
                        });
                    }
                } else {
                    const createquery = `INSERT INTO fail_update_ownername(reg_no, source, error_res)
                                         VALUES ('${data.reg_no}', 'WS_CI', 'DATA NOT FOUND')`;
                    const [Insert] = await db.RC.query(createquery, {
                        type: Sequelize.QueryTypes.INSERT
                    });
                }
                // let query = `SELECT id,reg_no,owner_name,ownership,maker_modal,insurance_expires,pucc_expires,status FROM vehicles_info WHERE status = 1 AND reg_no='${data.reg_no}' LIMIT 1 `;
                // const [result] = await db.WebRC.query(query, {
                //     type: Sequelize.QueryTypes.SELECT
                // });
                //console.log("calling Web Scrapping ===>", result)
                // if (result) {
                //     data.owner_name = result.owner_name
                //     if (data.insUpto && data.insUpto == "NA" && data.insUpto == "" && data.insUpto == "") {
                //         data.insUpto = result.insurance_expires
                //     }
                // } else {
                //     const createquery = `INSERT INTO fail_update_ownername(reg_no, source,error_res) VALUES ('${data.reg_no}','WS_CI','DATA NOT FOUND')`
                //     const [Insert] = await db.RC.query(createquery, {
                //         type: Sequelize.QueryTypes.INSERT
                //     });
                // }
            }
        }
    }
    if ((process.env.UPDATE_INSURANCE_API == true || process.env.UPDATE_INSURANCE_API == "true")) {
        if (data?.insUpto == "NA" || data?.insUpto == "" || (data?.insUpto && data?.insUpto?.includes("XXXX"))) {
            const url = `https://tvsinsurance.in:8000/api/car/getVehicleDataByRegNo`;
            const headers = {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            };
            let response
            let responsedata
            try {
                response = await axios.post(url, { regno: data.reg_no }, { headers });
                responsedata = response?.data;
            } catch (error) {

            }
            //console.log("=====================calling tvsinsurance=================================")
            if (responsedata) {
                data.insUpto = responsedata?.prevpolicyexpiredate
                data.insurance_comp = responsedata?.ins_company
                data.insurence_company = responsedata?.ins_company
                // if (data.insUpto && data.insUpto == "NA" && data.insUpto == "" && data.insUpto == "") {
                //     data.insUpto = decryptedData.rc_insurance_upto
                // }
            } else {
                const createquery = `INSERT INTO fail_update_insurance(reg_no, source,error_res) VALUES ('${data.reg_no}','TVS_INSURANCE','No record found')`
                const [Insert] = await db.RC.query(createquery, {
                    type: Sequelize.QueryTypes.INSERT
                });
                const url = `https://nodeapiev.jioinsure.in/api/v1/premium/car-details?type=TW&cRegNo=${data.reg_no}`;
                const headers = {
                    Accept: 'application/json, text/plain, */*',
                    'User-Agent': 'axios/1.7.7',
                    "Cookie": "ApplicationGatewayAffinity=1f2ecc2258faf740ac14c6b38debac38; ApplicationGatewayAffinityCORS=1f2ecc2258faf740ac14c6b38debac38"
                };
                //console.log("=====================calling nodeapiev.jioinsure.in/api/v1=================================")
                const response = await axios.get(url, { headers });
                const responsedata = response?.data;
                if (responsedata.error != false || responsedata.error != "false") {
                    if (responsedata.response) {
                        data.insUpto = responsedata?.policy_expiry_date
                    }
                } else {
                    const createquery = `INSERT INTO fail_update_insurance(reg_no, source,error_res) VALUES ('${data.reg_no}','JIO_INSURANCE','${responsedata?.message || 'Record Not found'}')`
                    const [Insert] = await db.RC.query(createquery, {
                        type: Sequelize.QueryTypes.INSERT
                    });
                }
            }
        }
    }

    // Default values for database insertion
    const defaultValues = {
        status: "SUCCESS",
        rto: "",
        reg_no: "",
        regn_dt: "",
        chasi_no: "",
        engine_no: "",
        owner_name: "",
        vh_class: "",
        fuel_type: "",
        maker: "",
        maker_modal: "",
        father_name: "",
        address: "",
        owner_sr_no: 0,
        fitness_upto: "",
        vehicle_age: "",
        insUpto: "",
        state: "",
        policy_no: "",
        puc_no: "",
        puc_upto: "",
        insurance_comp: "",
        vehicle_color: "",
        financer_details: "",
        fuel_norms: "",
        no_of_seats: 0,
        body_type_desc: "",
        regn_at: "",
        manufacturer_month_yr: "",
        gvw: "",
        no_of_cyl: "",
        cubic_cap: "",
        sleeper_cap: "",
        stand_cap: "",
        wheelbase: "",
        mobile_no: "",
        permit_no: "",
        permit_issue_date: "",
        permit_from: "",
        permit_upto: "",
        permit_type: "",
        blacklist_status: "",
        noc_details: "",
        tax_upto: "",
        rc_np_no: "",
        rc_np_upto: "",
        rc_np_issued_by: "",
        rc_unld_wt: "",
        source: "",
        is_lite: 0,
        is_update: 0,
        insurence_company: "",
        updated_at: null,
        vehicle_weight: ""
    };
    //console.log('data', data)
    // Merging default values with actual data
    const finalRecord = { ...defaultValues, ...data };
    finalRecord.chasi_no = finalRecord.chasi_no ? finalRecord.chasi_no : ""
    // Constructing the SQL query for insertion
    const insertQuery = `INSERT INTO \`${tableName}\` (
        status,
        rto,
        reg_no,
        regn_dt,
        chasi_no,
        engine_no,
        owner_name,
        vh_class,
        fuel_type,
        maker,
        maker_modal,
        father_name,
        address,
        owner_sr_no,
        fitness_upto,
        vehicle_age,
        insUpto,
        state,
        policy_no,
        puc_no,
        puc_upto,
        insurance_comp,
        vehicle_color,
        financer_details,
        fuel_norms,
        no_of_seats,
        body_type_desc,
        regn_at,
        manufacturer_month_yr,
        gvw,
        no_of_cyl,
        cubic_cap,
        sleeper_cap,
        stand_cap,
        wheelbase,
        mobile_no,
        permit_no,
        permit_issue_date,
        permit_from,
        permit_upto,
        permit_type,
        blacklist_status,
        noc_details,
        tax_upto,
        rc_np_no,
        rc_np_upto,
        rc_np_issued_by,
        rc_unld_wt,
        source,
        is_lite,
        is_update,
        insurence_company,
        vehicle_weight,
        updated_at
    ) VALUES (
        :status,
        :rto,
        :reg_no,
        :regn_dt,
        :chasi_no,
        :engine_no,
        :owner_name,
        :vh_class,
        :fuel_type,
        :maker,
        :maker_modal,
        :father_name,
        :address,
        :owner_sr_no,
        :fitness_upto,
        :vehicle_age,
        :insUpto,
        :state,
        :policy_no,
        :puc_no,
        :puc_upto,
        :insurance_comp,
        :vehicle_color,
        :financer_details,
        :fuel_norms,
        :no_of_seats,
        :body_type_desc,
        :regn_at,
        :manufacturer_month_yr,
        :gvw,
        :no_of_cyl,
        :cubic_cap,
        :sleeper_cap,
        :stand_cap,
        :wheelbase,
        :mobile_no,
        :permit_no,
        :permit_issue_date,
        :permit_from,
        :permit_upto,
        :permit_type,
        :blacklist_status,
        :noc_details,
        :tax_upto,
        :rc_np_no,
        :rc_np_upto,
        :rc_np_issued_by,
        :rc_unld_wt,
        :source,
        :is_lite,
        :is_update,
        :insurence_company,
        :vehicle_weight,
        updated_at
    );`;

    // Executing the query with error handling
    try {
        const [result] = await db.RC.query(insertQuery, {
            replacements: finalRecord,
            type: Sequelize.QueryTypes.INSERT
        });
        // If insertion is successful, proceed with additional changes
        let today = moment().format('YYYY-MM-DD');
        if (result) {
            // Post-insertion modifications
            if (data.regn_dt && data.regn_dt === "NOT AVAILABLE") {
                // data.regn_dt = today;
                data.regn_dt = "0000-00-00";
            }
            data.created_at = new Date().toISOString();
            // data.created_at = "0000-00-00";
            data.updated_at = new Date().toISOString();
            // data.updated_at = "0000-00-00";

            // if (data.engine_no && data.engine_no !== "XXXXXXXX") {
            //     data.engine_no = data.engine_no?.substr(0, data.engine_no.length - 4) + "XXXX";
            // }
            // if (data.chasi_no && data.chasi_no !== "XXXXXXXX") {
            //     data.chasi_no = data.chasi_no?.substr(0, data.chasi_no.length - 4) + "XXXX";
            // }

            if (data.owner_name && data.owner_name !== "") {
                data.owner_name = await utils.maskString(data.owner_name);
            }
            if (data.father_name && data.father_name !== "") {
                data.father_name = await utils.maskString(data.father_name);
            }
            if (data.owner_sr_no == "NA" || data.owner_sr_no == "") {
                data.owner_sr_no = 0
            }
            if (data.no_of_seats == "" || data.no_of_seats == 0) {
                data.no_of_seats = 0
            }
            // Return the modified data as a full response
            await insertFailUpdateSorurceWiseLogs(finalRecord?.reg_no, finalRecord?.source, "", 1, "")
            data.response_type = 1
            return { status: true, data: [data], insertResult: result };
        } else {
            await insertFailUpdateSorurceWiseLogs(finalRecord?.reg_no, finalRecord?.source, "", 3, "Insertion failed")
            return { status: false, message: "Insertion failed" };
        }
    } catch (error) {
        await insertFailUpdateSorurceWiseLogs(data?.reg_no, data?.source || "", "", 3, error.message)
        console.error('Insert Error:', error);
        return { status: false, error: error.message };
    }
}


export const updateRcRecordV1 = async (tableName, updatefield, updatefieldvalue, sourceRecord, dbrecord, devicetype, previoussource, responsetype = 1) => {
    try {
        let updatedData = await checkUpdateRcValidation(dbrecord, sourceRecord)
        //let updatedData = { ...baseFields, ...updatedFields };
        const setClause = Object.keys(updatedData)
            .filter((col) => col !== 'id' && col !== 'reg_no') // Exclude the `id` field from SET clause
            .map((col) => `${col} = :${col}`)
            .join(', ');
        // const _whereClause = Object.entries(whereClause).map(([key, value]) => `${key}=${value}`).join(', ');    
        delete setClause.reg_no
        delete updatedData.reg_no
        let sql
        sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE ${updatefield}='${updatefieldvalue}'`;
        try {
            const result = await db.RC.query(sql, {
                replacements: { ...updatedData },
                type: Sequelize.QueryTypes.UPDATE
            });
            Object.keys(updatedData).forEach(key => {
                if (dbrecord.hasOwnProperty(key)) {
                    dbrecord[key] = updatedData[key];
                }
            });
            if (dbrecord.regn_dt && dbrecord.regn_dt === "NOT AVAILABLE") {
                // dbrecord.regn_dt = today;
                dbrecord.regn_dt = "0000-00-00";
            }
            dbrecord.created_at = new Date().toISOString();
            // dbrecord.created_at = "0000-00-00";
            dbrecord.updated_at = new Date().toISOString();
            // dbrecord.updated_at = "0000-00-00";

            // if (dbrecord.engine_no && dbrecord.engine_no !== "XXXXXXXX") {
            //     dbrecord.engine_no = dbrecord.engine_no?.substr(0, dbrecord.engine_no.length - 4) + "XXXX";
            // }
            // if (dbrecord.chasi_no && dbrecord.chasi_no !== "XXXXXXXX") {
            //     dbrecord.chasi_no = dbrecord.chasi_no?.substr(0, dbrecord.chasi_no.length - 4) + "XXXX";
            // }

            if (dbrecord.owner_name && dbrecord.owner_name !== "") {
                dbrecord.owner_name = await utils.maskString(dbrecord.owner_name);
            }
            if (dbrecord.father_name && dbrecord.father_name !== "") {
                dbrecord.father_name = await utils.maskString(dbrecord.father_name);
            }
            if (dbrecord.no_of_seats && (dbrecord.no_of_seats == "" || dbrecord.no_of_seats == 0)) {
                dbrecord.no_of_seats = 0
            }
            dbrecord.response_type = 1
            if (result && result[1] == 1) {
                await insertFailUpdateSorurceWiseLogs(sourceRecord?.reg_no, sourceRecord?.source, previoussource, 2, "")
                return {
                    status: true,
                    data: dbrecord
                }
            } else {
                await insertFailUpdateLogs(sourceRecord?.reg_no, sourceRecord?.source, dbrecord?.source, result && JSON.stringify(result))
                await insertFailUpdateSorurceWiseLogs(sourceRecord?.reg_no, sourceRecord?.source || "", previoussource, 4, result && JSON.stringify(result))
                return {
                    status: false,
                    data: []
                }
            }
        } catch (error) {
            await insertFailUpdateSorurceWiseLogs(sourceRecord?.reg_no, sourceRecord?.source || "", previoussource, 4, error.message)
            console.log('error', error)
        }
    } catch (error) {

    }
}
export const Old_updateRcData = async (data, tableName, updatefield, updatefieldvalue, record1, rcdetailsdata, type, previoussource) => {
    try {
        previoussource = previoussource || rcdetailsdata?.source
        if (process.env.MOBILE_API === "true") {
            if ((rcdetailsdata.mobile_no == "" || rcdetailsdata.mobile_no == 0) && (record1.mobile_no == "" || record1.mobile_no == 0 || record1.mobile_no == null)) {
                const mobileNumber = await findRCMobile(rcdetailsdata.reg_no, type);
                if (mobileNumber) {
                    rcdetailsdata.mobile_no = mobileNumber;
                    record1.mobile_no = mobileNumber;
                }
            }
        }
        if (process.env.UPDATE_CHASSIE_STATE.includes(tableName)) {
            const _isValidChassie = isValidChassie(record1?.chasi_no)
            if (!_isValidChassie) {
                const getChassiesNumber = await getChassisNumberFromVrn(rcdetailsdata.reg_no)
                let chasisNo = getChassiesNumber?.data?.chasisNo
                record1.chasi_no = chasisNo
            }
        }
        // Fetch additional data if chassis number is valid
        if (process.env.INHOUSE_API == "true" && rcdetailsdata?.source != "VI_SOURCE_FULL" && record1?.source != "VI_SOURCE_FULL" && rcdetailsdata?.source != "VI_FREELANCER") {
            let mainResponse;
            if (((rcdetailsdata.chasi_no.includes("XXXX") && rcdetailsdata?.chasi_no?.slice(-5) == "XXXXX") || rcdetailsdata.chasi_no === "NA" || rcdetailsdata.chasi_no === "") && ((record1.chasi_no.includes("XXXX") && chasi_no?.slice(-5) == "XXXXX") || record1.chasi_no === "NA" || record1.chasi_no === "")) {
                mainResponse = rcdetailsdata;
            } else {
                let chasi_no
                if ((!rcdetailsdata.chasi_no.includes("XXXX") || rcdetailsdata?.chasi_no?.slice(-5) != "XXXXX") && rcdetailsdata.chasi_no !== "NA" && rcdetailsdata.chasi_no !== "") {
                    chasi_no = rcdetailsdata.chasi_no
                } else if ((!record1.chasi_no.includes("XXXX") || record1?.chasi_no?.slice(-5) != "XXXXX") && record1.chasi_no !== "NA" && record1.chasi_no !== "") {
                    chasi_no = record1.chasi_no
                }
                const inHouseResponse = await scrapping.inHouseAPIForInsertData({
                    regNumber: rcdetailsdata.reg_no,
                    chasisNo: chasi_no,
                    appType: type
                });
                if (inHouseResponse.response_code === 200) {
                    mainResponse = inHouseResponse.data[0];
                } else {
                    mainResponse = rcdetailsdata;
                }
            }
            rcdetailsdata = mainResponse;
        }
        if ((process.env.UPDATE_OWNER_NAME_API == true || process.env.UPDATE_OWNER_NAME_API == "true")) {
            //console.log('rcdetailsdata.owner_name', rcdetailsdata.owner_name)
            if ((record1.owner_name == "NA" || record1.owner_name == "" || record1.owner_name.includes("XXXX")) && (rcdetailsdata?.owner_name == "NA" || rcdetailsdata?.owner_name == "" || rcdetailsdata.owner_name.includes("XXXX"))) {
                const url = `https://uq4v373l7b.execute-api.ap-south-1.amazonaws.com/production/rto-care/ins-puc?rcNumber=${record1?.reg_no}`;
                const headers = {
                    'Accept': 'application/json, text/plain, */*',
                    'User-Agent': 'axios/1.7.7',
                    'x-api-key': 'M66QbZ7cEf2BnS5pbgwhh332U9M7p1bb4eN1XJRq'
                };
                const response = await axios.get(url, { headers });
                const responsedata = response?.data;
                if (responsedata?.statusCode == 200) {
                    let decryptedData = responsedata.response
                    record1.owner_name = decryptedData?.rc_owner_name
                    if (record1.insUpto && record1.insUpto == "NA" && record1.insUpto == "" && record1.insUpto == "") {
                        record1.insUpto = decryptedData.rc_insurance_upto
                        record1.insurance_comp = decryptedData.rc_insurance_comp
                        record1.insurence_company = decryptedData.rc_insurance_comp
                    }
                } else {
                    const createquery = `INSERT INTO fail_update_ownername(reg_no, source,error_res) VALUES ('${record1.reg_no}','VI_BASIC','${responsedata?.message}')`
                    const [Insert] = await db.RC.query(createquery, {
                        type: Sequelize.QueryTypes.INSERT
                    });

                    let url = `https://65owbczhv4.execute-api.ap-south-1.amazonaws.com/api/challan-info-n/${data.reg_no}`;
                    const options = {
                        method: 'GET',
                    };
                    const response = await fetch(url, options);
                    let responseText = await response.text();
                    let vehicleDataResponse = responseText && JSON.parse(responseText);
                    if (vehicleDataResponse && (vehicleDataResponse.success == true || vehicleDataResponse.success == "true")) {
                        if (vehicleDataResponse.data) {
                            let vehicleData = decrypted(Buffer.from(vehicleDataResponse.data, "base64"), 'utf8');
                            let finalData = JSON.parse(vehicleData)
                            data.owner_name = finalData?.owner_name
                            // let query = `UPDATE \`${tableName}\` SET owner_name='${finalData.owner_name}' WHERE id=${exist.id}`
                            // const [result] = await db.RC.query(query, {
                            //     type: Sequelize.QueryTypes.UPDATE
                            // });
                        } else {
                            const createquery = `INSERT INTO fail_update_ownername(reg_no, source, error_res)
                            VALUES ('${data.reg_no}', 'WS_CI', 'DATA NOT FOUND')`;
                            const [Insert] = await db.RC.query(createquery, {
                                type: Sequelize.QueryTypes.INSERT
                            });
                        }
                    } else {
                        const createquery = `INSERT INTO fail_update_ownername(reg_no, source, error_res)
                                             VALUES ('${data.reg_no}', 'WS_CI', 'DATA NOT FOUND')`;
                        const [Insert] = await db.RC.query(createquery, {
                            type: Sequelize.QueryTypes.INSERT
                        });
                    }

                    // let query = `SELECT id,reg_no,owner_name,ownership,maker_modal,insurance_expires,pucc_expires,status FROM vehicles_info WHERE status = 1 AND reg_no='${record1.reg_no}' LIMIT 1 `;
                    // const [result] = await db.WebRC.query(query, {
                    //     type: Sequelize.QueryTypes.SELECT
                    // });
                    // if (result) {
                    //     record1.owner_name = result.owner_name
                    //     if (record1.insUpto && record1.insUpto == "NA" && record1.insUpto == "" && record1.insUpto == "") {
                    //         record1.insUpto = result.insurance_expires
                    //     }
                    // } else {
                    //     const createquery = `INSERT INTO fail_update_ownername(reg_no, source,error_res) VALUES ('${record1.reg_no}','WS_CI','DATA NOT FOUND')`
                    //     const [Insert] = await db.RC.query(createquery, {
                    //         type: Sequelize.QueryTypes.INSERT
                    //     });
                    // }
                }
            }
        }

        if ((process.env.UPDATE_INSURANCE_API == true || process.env.UPDATE_INSURANCE_API == "true")) {
            if (record1.insUpto == "NA" || record1.insUpto == "" || record1.insUpto?.includes("XXXX")) {
                const url = `https://tvsinsurance.in:8000/api/car/getVehicleDataByRegNo`;
                const headers = {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                };
                let response
                let responsedata
                let errormessage
                try {
                    response = await axios.post(url, { regno: record1.reg_no }, { headers });
                    responsedata = response?.data;
                } catch (error) {
                    errormessage = error.message
                    console.log('error', error)
                }
                if (responsedata) {
                    record1.insUpto = responsedata?.prevpolicyexpiredate
                    record1.insurance_comp = responsedata.ins_company
                    record1.insurence_company = responsedata.ins_company
                    // if (data.insUpto && data.insUpto == "NA" && data.insUpto == "" && data.insUpto == "") {
                    //     data.insUpto = decryptedData.rc_insurance_upto
                    // }
                } else {
                    const createquery = `INSERT INTO fail_update_insurance(reg_no, source,error_res) VALUES ('${record1.reg_no}','TVS_INSURANCE','No record found')`
                    const [Insert] = await db.RC.query(createquery, {
                        type: Sequelize.QueryTypes.INSERT
                    });
                    const url = `https://nodeapiev.jioinsure.in/api/v1/premium/car-details?type=TW&cRegNo=${record1.reg_no}`;
                    const headers = {
                        Accept: 'application/json, text/plain, */*',
                        'User-Agent': 'axios/1.7.7',
                        "Cookie": "ApplicationGatewayAffinity=1f2ecc2258faf740ac14c6b38debac38; ApplicationGatewayAffinityCORS=1f2ecc2258faf740ac14c6b38debac38"
                    };
                    const response = await axios.get(url, { headers });
                    const responsedata = response?.data;
                    if (responsedata.error != false || responsedata.error != "false") {
                        if (responsedata.response) {
                            record1.insUpto = responsedata?.policy_expiry_date
                        }
                    } else {
                        const createquery = `INSERT INTO fail_update_insurance(reg_no, source,error_res) VALUES ('${record1.reg_no}','JIO_INSURANCE','${responsedata?.message}')`
                        const [Insert] = await db.RC.query(createquery, {
                            type: Sequelize.QueryTypes.INSERT
                        });
                    }
                }
            }
        }
        let validateData = {
            regn_dt: record1.regn_dt || '',
            chasi_no: record1.chasi_no || '',
            engine_no: record1.engine_no || '',
            owner_sr_no: record1.owner_sr_no || 0,
            owner_name: record1.owner_name || '',
            father_name: record1.father_name || '',
            address: record1.address || '',
            regn_at: record1.regn_at || '',
            fuel_type: record1.fuel_type || '',
            maker_modal: record1.maker_modal || '',
            maker: record1.maker || '',
            cubic_cap: record1.cubic_cap || '',
            vehicle_color: record1.vehicle_color || '',
            fitness_upto: record1.fitness_upto || '',
            financer_details: record1.financer_details || '',
            fuel_norms: record1.fuel_norms || '',
            blacklist_status: record1.blacklist_status || '',
            noc_details: record1.noc_details || '',
            insurance_comp: record1.insurance_comp || '',
            body_type_desc: record1.body_type_desc || '',
            puc_upto: record1.puc_upto || '',
            insurance_upto: record1.insUpto || '',
            veh_class: record1.vh_class || '',
            manufacturer_month_yr: record1.manufacturer_month_yr || '',
            rto: record1?.rto,
            policy_no: record1?.policy_no || "",
            source: record1?.source,
            mobileNo: record1?.mobile_no,
        }
        let baseFields = {
            status: "SUCCESS",
            reg_no: record1?.reg_no,
            vehicle_age: '',
            puc_no: ((record1?.puc_no != "" && record1?.puc_no != "NA" && !record1?.puc_no.includes("XXXX")) ? record1.puc_no : (rcdetailsdata?.puc_no || "")),
            no_of_seats: (record1?.no_of_seats != "" ? record1.no_of_seats : (rcdetailsdata?.no_of_seats || 0)),
            gvw: (record1?.gvw ? record1.gvw != "" : (rcdetailsdata?.gvw || "")),
            no_of_cyl: (record1?.no_of_cyl != "" ? record1?.no_of_cyl : (rcdetailsdata?.no_of_cyl || "")),
            sleeper_cap: (record1?.sleeper_cap != "" ? record1?.sleeper_cap : (rcdetailsdata?.sleeper_cap || "")),
            stand_cap: (record1?.stand_cap != "" ? record1?.stand_cap : (rcdetailsdata?.stand_cap || "")),
            wheelbase: (record1?.wheelbase != "" ? record1?.wheelbase : (rcdetailsdata?.wheelbase || "")),
            // mobile_no: record1?.mobile_no || "",
            permit_no: (record1?.permit_no != "" ? record1?.permit_no : (rcdetailsdata?.permit_no || "")),
            permit_issue_date: (record1?.permit_issue_date != "" ? record1?.permit_issue_date : (rcdetailsdata?.permit_issue_date || "")),
            permit_from: (record1?.permit_from != "" ? record1?.permit_from : (rcdetailsdata?.permit_from || "")),
            permit_upto: (record1?.permit_upto != "" ? record1?.permit_upto : (rcdetailsdata?.permit_upto || "")),
            permit_type: (record1?.permit_type ? record1?.permit_type : (rcdetailsdata?.permit_type || "")),
            tax_upto: (record1?.tax_upto != "" ? record1?.tax_upto : (rcdetailsdata?.tax_upto || "")),
            rc_np_no: record1?.rc_np_no != "" ? record1?.rc_np_no : (rcdetailsdata?.rc_np_no || ""),
            rc_np_upto: record1?.rc_np_upto != "" ? record1?.rc_np_upto : (rcdetailsdata?.rc_np_upto || ""),
            rc_np_issued_by: record1?.rc_np_issued_by != "" ? record1?.rc_np_issued_by : (rcdetailsdata?.rc_np_issued_by || ""),
            rc_unld_wt: record1?.rc_unld_wt != "" ? record1?.rc_unld_wt : (rcdetailsdata?.rc_unld_wt || ""),
            source: record1?.source,
            updated_at: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            // id: rcdetailsdata?.id,
        };
        let updatedFields = await checkUpdateRcValidation(rcdetailsdata, validateData)
        let updatedData = { ...baseFields, ...updatedFields };
        const setClause = Object.keys(updatedData)
            .filter((col) => col !== 'id' && col !== 'reg_no') // Exclude the `id` field from SET clause
            .map((col) => `${col} = :${col}`)
            .join(', ');
        // const _whereClause = Object.entries(whereClause).map(([key, value]) => `${key}=${value}`).join(', ');    
        delete setClause.reg_no
        delete updatedData.reg_no
        let sql
        sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE ${updatefield}='${updatefieldvalue}'`;
        try {
            const result = await db.RC.query(sql, {
                replacements: { ...updatedData },
                type: Sequelize.QueryTypes.UPDATE
            });
            Object.keys(updatedData).forEach(key => {
                if (rcdetailsdata.hasOwnProperty(key)) {
                    rcdetailsdata[key] = updatedData[key];
                }
            });
            if (rcdetailsdata.regn_dt && rcdetailsdata.regn_dt === "NOT AVAILABLE") {
                // rcdetailsdata.regn_dt = today;
                rcdetailsdata.regn_dt = "0000-00-00";
            }
            rcdetailsdata.created_at = new Date().toISOString();
            // rcdetailsdata.created_at = "0000-00-00";
            rcdetailsdata.updated_at = new Date().toISOString();
            // rcdetailsdata.updated_at = "0000-00-00";

            // if (rcdetailsdata.engine_no && rcdetailsdata.engine_no !== "XXXXXXXX") {
            //     rcdetailsdata.engine_no = rcdetailsdata.engine_no?.substr(0, rcdetailsdata.engine_no.length - 4) + "XXXX";
            // }
            // if (rcdetailsdata.chasi_no && rcdetailsdata.chasi_no !== "XXXXXXXX") {
            //     rcdetailsdata.chasi_no = rcdetailsdata.chasi_no?.substr(0, rcdetailsdata.chasi_no.length - 4) + "XXXX";
            // }

            if (rcdetailsdata.owner_name && rcdetailsdata.owner_name !== "") {
                rcdetailsdata.owner_name = await utils.maskString(rcdetailsdata.owner_name);
            }
            if (rcdetailsdata.father_name && rcdetailsdata.father_name !== "") {
                rcdetailsdata.father_name = await utils.maskString(rcdetailsdata.father_name);
            }
            if (rcdetailsdata.no_of_seats && (rcdetailsdata.no_of_seats == "" || rcdetailsdata.no_of_seats == 0)) {
                rcdetailsdata.no_of_seats = 0
            }
            rcdetailsdata.response_type = 1
            if (result && result[1] == 1) {
                // await insertFailUpdateSorurceWiseLogs(record1?.reg_no, record1?.source, previoussource, 2, "")
                return {
                    status: true,
                    data: rcdetailsdata
                }
            } else {
                await insertFailUpdateLogs(record1?.reg_no, record1?.source, rcdetailsdata?.source, result && JSON.stringify(result))
                // await insertFailUpdateSorurceWiseLogs(record1?.reg_no, record1?.source || "", previoussource, 4, result && JSON.stringify(result))
                return {
                    status: false,
                    data: []
                }
            }
        } catch (error) {
            // await insertFailUpdateSorurceWiseLogs(record1?.reg_no, record1?.source || "", previoussource, 4, error.message)
            console.log('error', error)
        }
    } catch (error) {
        // await insertFailUpdateSorurceWiseLogs(record1?.reg_no, record1?.source || "", previoussource, 4, error.message)
        await insertFailUpdateLogs(record1?.reg_no, record1?.source, rcdetailsdata?.source, error.message)
        console.log('Error --====>', error)
        return error?.message
    }
};

export const GetownerName = async (reg_no) => {
    try {
        const url = `https://uq4v373l7b.execute-api.ap-south-1.amazonaws.com/production/rto-care/ins-puc?rcNumber=${reg_no}`;
        const headers = {
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'axios/1.7.7',
            'x-api-key': 'M66QbZ7cEf2BnS5pbgwhh332U9M7p1bb4eN1XJRq'
        };
        let owner_name
        let insUpto
        let insurance_comp
        let insurence_company
        const response = await axios.get(url, { headers });
        const responsedata = response?.data;
        if (responsedata?.statusCode == 200) {
            let decryptedData = responsedata.response
            return {
                status: true,
                owner_name: decryptedData?.rc_owner_name,
                insUpto: decryptedData.rc_insurance_upto,
                insurance_comp: decryptedData.rc_insurance_comp,
                insurence_company: decryptedData.rc_insurance_comp
            }
        } else {
            const createquery = `INSERT INTO fail_update_ownername(reg_no, source,error_res) VALUES ('${reg_no}','VI_BASIC','${responsedata?.message}')`
            const [Insert] = await db.RC.query(createquery, {
                type: Sequelize.QueryTypes.INSERT
            });

            let url = `https://65owbczhv4.execute-api.ap-south-1.amazonaws.com/api/challan-info-n/${reg_no}`;
            const options = {
                method: 'GET',
            };
            const response = await fetch(url, options);
            let responseText = await response.text();
            let vehicleDataResponse = responseText && JSON.parse(responseText);
            if (vehicleDataResponse && (vehicleDataResponse.success == true || vehicleDataResponse.success == "true")) {
                if (vehicleDataResponse.data) {
                    let vehicleData = decrypted(Buffer.from(vehicleDataResponse.data, "base64"), 'utf8');
                    let finalData = JSON.parse(vehicleData)
                    return {
                        return: true,
                        owner_name: finalData?.owner_name
                    }
                } else {
                    const createquery = `INSERT INTO fail_update_ownername(reg_no, source, error_res)
                    VALUES ('${reg_no}', 'WS_CI', 'DATA NOT FOUND')`;
                    const [Insert] = await db.RC.query(createquery, {
                        type: Sequelize.QueryTypes.INSERT
                    });
                }
            } else {
                const createquery = `INSERT INTO fail_update_ownername(reg_no, source, error_res)
                                     VALUES ('${reg_no}', 'WS_CI', 'DATA NOT FOUND')`;
                const [Insert] = await db.RC.query(createquery, {
                    type: Sequelize.QueryTypes.INSERT
                });
            }
        }
    } catch (error) {
        return error.message
    }
}

export const GetInsurance = async (reg_no) => {
    try {
        const url = `https://tvsinsurance.in:8000/api/car/getVehicleDataByRegNo`;
        const headers = {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        };
        let response
        let responsedata
        let errormessage
        try {
            response = await axios.post(url, { regno: reg_no }, { headers });
            responsedata = response?.data;
        } catch (error) {
            errormessage = error.message
            console.log('error', error)
        }
        if (responsedata) {
            return {
                status: true,
                insUpto: responsedata?.prevpolicyexpiredate,
                insurance_comp: responsedata.ins_company,
                insurence_company: responsedata.ins_company
            }

        } else {
            const createquery = `INSERT INTO fail_update_insurance(reg_no, source,error_res) VALUES ('${reg_no}','TVS_INSURANCE','No record found')`
            const [Insert] = await db.RC.query(createquery, {
                type: Sequelize.QueryTypes.INSERT
            });
            const url = `https://nodeapiev.jioinsure.in/api/v1/premium/car-details?type=TW&cRegNo=${reg_no}`;
            const headers = {
                Accept: 'application/json, text/plain, */*',
                'User-Agent': 'axios/1.7.7',
                "Cookie": "ApplicationGatewayAffinity=1f2ecc2258faf740ac14c6b38debac38; ApplicationGatewayAffinityCORS=1f2ecc2258faf740ac14c6b38debac38"
            };
            const response = await axios.get(url, { headers });
            const responsedata = response?.data;
            if (responsedata.error != false || responsedata.error != "false") {
                if (responsedata.response) {
                    return {
                        status: true,
                        insUpto: responsedata?.policy_expiry_date
                    }
                }
            } else {
                return {
                    status: false,
                }
                const createquery = `INSERT INTO fail_update_insurance(reg_no, source,error_res) VALUES ('${reg_no}','JIO_INSURANCE','${responsedata?.message}')`
                const [Insert] = await db.RC.query(createquery, {
                    type: Sequelize.QueryTypes.INSERT
                });
            }
        }
    } catch (error) {
        return {
            status: false,
        }
    }
}

export const checkRcRecordTimePeriod = (date, days) => {
    try {
        const dateToCheck = moment(date);

        // Calculate the date 30 days ago
        const thirtyDaysAgo = moment().subtract(days, 'days');
        // Check if the date is within the last 30 days
        const isWithinLast30Days = dateToCheck.isAfter(thirtyDaysAgo);
        if (isWithinLast30Days) {
            return true
        } else {
            return false
        }
    } catch (error) {
        console.log('error', error)
        return false
    }
}
export const updateRcDataV2 = async (data, partnerName, isUpdateRequire = false, isMobileRequire = false, isOwnerNameRequire = true, isInsurance = true, isNeedRecord = true) => {
    try {
        console.log('isNeedRecord', isNeedRecord)
        const dbRecord = await findExistingRcRecord(data.reg_no)
        if (dbRecord.status == true) {
            let dbRcdata = dbRecord.data
            let tableName = dbRecord.tableName
            const checkRcIsNeedToUpdateFull = checkRcRecordTimePeriod(dbRecord.updated_at)
            if (checkRcIsNeedToUpdateFull && process.env.INHOUSE_API == "true" && dbRcdata?.source != "VI_SOURCE_FULL" && data?.source != "VI_SOURCE_FULL" && dbRcdata?.source != "VI_FREELANCER") {
                let mainResponse;
                if (((dbRcdata.chasi_no.includes("XXXX") && dbRcdata?.chasi_no?.slice(-5) == "XXXXX") || dbRcdata.chasi_no === "NA" || dbRcdata.chasi_no === "") && ((data.chasi_no.includes("XXXX") && chasi_no?.slice(-5) == "XXXXX") || data.chasi_no === "NA" || data.chasi_no === "")) {
                    mainResponse = dbRcdata;
                } else {
                    let chasi_no
                    if ((!dbRcdata.chasi_no.includes("XXXX") || dbRcdata?.chasi_no?.slice(-5) != "XXXXX") && dbRcdata.chasi_no !== "NA" && dbRcdata.chasi_no !== "") {
                        chasi_no = dbRcdata.chasi_no
                    } else if ((!data.chasi_no.includes("XXXX") || data?.chasi_no?.slice(-5) != "XXXXX") && data.chasi_no !== "NA" && data.chasi_no !== "") {
                        chasi_no = data.chasi_no
                    }
                    const inHouseResponse = await scrapping.inHouseAPIForInsertData({
                        regNumber: dbRcdata.reg_no,
                        chasisNo: chasi_no,
                        appType: partnerName
                    });
                    if (inHouseResponse.response_code === 200) {
                        mainResponse = inHouseResponse.data[0];
                    } else {
                        mainResponse = dbRcdata;
                    }
                }
                dbRcdata = mainResponse;
            }

            if (isOwnerNameRequire == true && (process.env.UPDATE_OWNER_NAME_API == true || process.env.UPDATE_OWNER_NAME_API == "true")) {
                if (isInvalidString(data.owner_name) && isValidString(dbRcdata?.owner_name)) {
                    const findOwnerName = await GetownerName(data?.reg_no)
                    if (findOwnerName?.status == true) {
                        data.owner_name = findOwnerName?.rc_owner_name
                    }
                }
            }

            if (isInsurance == true && (process.env.UPDATE_INSURANCE_API == true || process.env.UPDATE_INSURANCE_API == "true")) {
                if (isInvalidString(data.insUpto) && isValidString(dbRcdata?.insUpto)) {
                    const findInsurance = await GetInsurance(data?.reg_no)
                    if (findInsurance?.status == true) {
                        data.insUpto = findInsurance?.insUpto || ''
                        data.insurance_comp = findInsurance?.insurance_comp || ""
                        data.insurence_company = findInsurance?.insurence_company || ""
                    }
                }
            }
            console.log('data', data)
            let updatedFields = await checkUpdateRcValidation(dbRcdata, data, isMobileRequire)
            console.log('updatedFields', updatedFields)
            // let updatedData = { ...baseFields, ...updatedFields };
            const setClause = Object.keys(updatedFields)
                .filter((col) => col !== 'id' && col !== 'reg_no') // Exclude the `id` field from SET clause
                .map((col) => `${col} = :${col}`)
                .join(', ');


            // const _whereClause = Object.entries(whereClause).map(([key, value]) => `${key}=${value}`).join(', ');    
            // delete setClause.reg_no
            // delete updatedData.reg_no
            let sql
            sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE reg_no='${data.reg_no}'`;
            try {
                const result = await db.RC.query(sql, {
                    replacements: { ...updatedFields },
                    type: Sequelize.QueryTypes.UPDATE
                });
                Object.keys(updatedFields).forEach(key => {
                    if (dbRcdata.hasOwnProperty(key)) {
                        dbRcdata[key] = updatedFields[key];
                    }
                });
                if (dbRcdata.regn_dt && dbRcdata.regn_dt === "NOT AVAILABLE") {
                    // dbRcdata.regn_dt = today;
                    dbRcdata.regn_dt = "0000-00-00";
                }
                dbRcdata.created_at = new Date().toISOString();
                // dbRcdata.created_at = "0000-00-00";
                dbRcdata.updated_at = new Date().toISOString();
                // dbRcdata.updated_at = "0000-00-00";

                // if (dbRcdata.engine_no && dbRcdata.engine_no !== "XXXXXXXX") {
                //     dbRcdata.engine_no = dbRcdata.engine_no?.substr(0, dbRcdata.engine_no.length - 4) + "XXXX";
                // }
                // if (dbRcdata.chasi_no && dbRcdata.chasi_no !== "XXXXXXXX") {
                //     dbRcdata.chasi_no = dbRcdata.chasi_no?.substr(0, dbRcdata.chasi_no.length - 4) + "XXXX";
                // }

                // if (dbRcdata.owner_name && dbRcdata.owner_name !== "") {
                //     dbRcdata.owner_name = await utils.maskString(dbRcdata.owner_name);
                // }
                // if (dbRcdata.father_name && dbRcdata.father_name !== "") {
                //     dbRcdata.father_name = await utils.maskString(dbRcdata.father_name);
                // }
                if (dbRcdata.no_of_seats && (dbRcdata.no_of_seats == "" || dbRcdata.no_of_seats == 0)) {
                    dbRcdata.no_of_seats = 0
                }
                dbRcdata.response_type = 1
                if (result && result[1] == 1) {
                    // await insertFailUpdateSorurceWiseLogs(data?.reg_no, data?.source, previoussource, 2, "")
                    if (isNeedRecord == true || isNeedRecord == "true") {
                        return {
                            status: true,
                            data: dbRcdata
                        }
                    } else {
                        return {
                            status: true,
                        }
                    }
                } else {
                    await insertFailUpdateLogs(data?.reg_no, data?.source, dbRcdata?.source, result && JSON.stringify(result))
                    // await insertFailUpdateSorurceWiseLogs(data?.reg_no, data?.source || "", previoussource, 4, result && JSON.stringify(result))
                    return {
                        status: false,
                        data: []
                    }
                }
            } catch (error) {
                // await insertFailUpdateSorurceWiseLogs(data?.reg_no, data?.source || "", previoussource, 4, error.message)
                console.log('error', error)
            }

            /// Create record 
        } else {

        }
    } catch (error) {
        console.log('error', error)
    }
}

export const updateRcData = async (data, tableName, updatefield, updatefieldvalue, record1, rcdetailsdata, type, previoussource) => {
    try {
        previoussource = previoussource || rcdetailsdata?.source
        if (process.env.INHOUSE_API == "true" && rcdetailsdata?.source != "VI_SOURCE_FULL" && record1?.source != "VI_SOURCE_FULL" && rcdetailsdata?.source != "VI_FREELANCER") {
            let mainResponse;
            if (((rcdetailsdata.chasi_no.includes("XXXX") && rcdetailsdata?.chasi_no?.slice(-5) == "XXXXX") || rcdetailsdata.chasi_no === "NA" || rcdetailsdata.chasi_no === "") && ((record1.chasi_no.includes("XXXX") && chasi_no?.slice(-5) == "XXXXX") || record1.chasi_no === "NA" || record1.chasi_no === "")) {
                mainResponse = rcdetailsdata;
            } else {
                let chasi_no
                if ((!rcdetailsdata.chasi_no.includes("XXXX") || rcdetailsdata?.chasi_no?.slice(-5) != "XXXXX") && rcdetailsdata.chasi_no !== "NA" && rcdetailsdata.chasi_no !== "") {
                    chasi_no = rcdetailsdata.chasi_no
                } else if ((!record1.chasi_no.includes("XXXX") || record1?.chasi_no?.slice(-5) != "XXXXX") && record1.chasi_no !== "NA" && record1.chasi_no !== "") {
                    chasi_no = record1.chasi_no
                }
                const inHouseResponse = await scrapping.inHouseAPIForInsertData({
                    regNumber: rcdetailsdata.reg_no,
                    chasisNo: chasi_no,
                    appType: type
                });
                if (inHouseResponse.response_code === 200) {
                    mainResponse = inHouseResponse.data[0];
                } else {
                    mainResponse = rcdetailsdata;
                }
            }
            rcdetailsdata = mainResponse;
        }

        if ((process.env.UPDATE_OWNER_NAME_API == true || process.env.UPDATE_OWNER_NAME_API == "true")) {
            if (isInvalidString(record1.owner_name) && isValidString(rcdetailsdata?.owner_name)) {
                const findOwnerName = await GetownerName(record1?.reg_no)
                if (findOwnerName?.status == true) {
                    record1.owner_name = findOwnerName?.rc_owner_name
                }
            }
        }

        if ((process.env.UPDATE_INSURANCE_API == true || process.env.UPDATE_INSURANCE_API == "true")) {
            if (isInvalidString(record1.insUpto) && isValidString(rcdetailsdata?.insUpto)) {
                const findInsurance = await GetInsurance(record1?.reg_no)
                if (findInsurance?.status == true) {
                    record1.insUpto = findInsurance?.insUpto || ''
                    record1.insurance_comp = findInsurance?.insurance_comp || ""
                    record1.insurence_company = findInsurance?.insurence_company || ""
                }
            }
        }

        let updatedFields = await checkUpdateRcValidation(rcdetailsdata, record1)
        // let updatedData = { ...baseFields, ...updatedFields };
        const setClause = Object.keys(updatedFields)
            .filter((col) => col !== 'id' && col !== 'reg_no') // Exclude the `id` field from SET clause
            .map((col) => `${col} = :${col}`)
            .join(', ');
        // const _whereClause = Object.entries(whereClause).map(([key, value]) => `${key}=${value}`).join(', ');    
        // delete setClause.reg_no
        // delete updatedData.reg_no
        let sql
        sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE ${updatefield}='${updatefieldvalue}'`;
        try {
            const result = await db.RC.query(sql, {
                replacements: { ...updatedFields },
                type: Sequelize.QueryTypes.UPDATE
            });
            // console.log('result', result)
            Object.keys(updatedFields).forEach(key => {
                if (rcdetailsdata.hasOwnProperty(key)) {
                    rcdetailsdata[key] = updatedFields[key];
                }
            });
            if (rcdetailsdata.regn_dt && rcdetailsdata.regn_dt === "NOT AVAILABLE") {
                // rcdetailsdata.regn_dt = today;
                rcdetailsdata.regn_dt = "0000-00-00";
            }
            rcdetailsdata.created_at = new Date().toISOString();
            // rcdetailsdata.created_at = "0000-00-00";
            rcdetailsdata.updated_at = new Date().toISOString();
            // rcdetailsdata.updated_at = "0000-00-00";

            // if (rcdetailsdata.engine_no && rcdetailsdata.engine_no !== "XXXXXXXX") {
            //     rcdetailsdata.engine_no = rcdetailsdata.engine_no?.substr(0, rcdetailsdata.engine_no.length - 4) + "XXXX";
            // }
            // if (rcdetailsdata.chasi_no && rcdetailsdata.chasi_no !== "XXXXXXXX") {
            //     rcdetailsdata.chasi_no = rcdetailsdata.chasi_no?.substr(0, rcdetailsdata.chasi_no.length - 4) + "XXXX";
            // }

            if (rcdetailsdata.owner_name && rcdetailsdata.owner_name !== "") {
                rcdetailsdata.owner_name = await utils.maskString(rcdetailsdata.owner_name);
            }
            if (rcdetailsdata.father_name && rcdetailsdata.father_name !== "") {
                rcdetailsdata.father_name = await utils.maskString(rcdetailsdata.father_name);
            }
            if (rcdetailsdata.no_of_seats && (rcdetailsdata.no_of_seats == "" || rcdetailsdata.no_of_seats == 0)) {
                rcdetailsdata.no_of_seats = 0
            }
            rcdetailsdata.response_type = 1
            if (result && result[1] == 1) {
                await insertFailUpdateSorurceWiseLogs(record1?.reg_no, record1?.source, previoussource, 2, "")
                return {
                    status: true,
                    data: rcdetailsdata
                }
            } else {
                await insertFailUpdateLogs(record1?.reg_no, record1?.source, rcdetailsdata?.source, result && JSON.stringify(result))
                await insertFailUpdateSorurceWiseLogs(record1?.reg_no, record1?.source || "", previoussource, 4, result && JSON.stringify(result))
                return {
                    status: false,
                    data: []
                }
            }
        } catch (error) {
            await insertFailUpdateSorurceWiseLogs(record1?.reg_no, record1?.source || "", previoussource, 4, error.message)
            console.log('error', error)
        }
    } catch (error) {
        await insertFailUpdateSorurceWiseLogs(record1?.reg_no, record1?.source || "", previoussource, 4, error.message)
        await insertFailUpdateLogs(record1?.reg_no, record1?.source, rcdetailsdata?.source, error.message)
        console.log('Error --====>', error)
        return error?.message
    }
};
const convertDateFormatInsert = (response) => {
    try {
        const dateFields = [
            "regn_dt", "fitness_upto", "insUpto", "puc_upto",
            "tax_upto", "rc_np_upto", "permit_upto", "permit_issue_date",
            "permit_from:", "rc_np_issued_by"
        ];
        let rcObj = { ...response };
        const parsedDate = rcObj?.manufacturer_month_yr && moment(rcObj?.manufacturer_month_yr, [
            'M/YYYY',
            'MM/YYYY',
            'M-YYYY',
            'MM-YYYY',
            'YYYY/M',
            'YYYY/MM',
            'YYYY-M',
            'YYYY-MM'
        ]);

        rcObj.manufacturer_month_yr = rcObj?.manufacturer_month_yr ? parsedDate.format('MM/YYYY') : ""
        const dateFormats = [
            "DD-MM-YYYY", "YYYY-MM-DD", "DD-MMM-YYYY", "MM/DD/YYYY",
            "DD/MM/YYYY", "YYYY/MM/DD", "DD Mon YYYY", "YYYY MMM DD"
        ];

        dateFields.forEach(field => {
            if (rcObj[field] && !["LTT", "ltt"]?.includes(rcObj[field])) {
                console.log("rcObj[field]", rcObj[field])
                rcObj[field] = moment(rcObj[field], dateFormats).format("DD-MMM-YYYY");
                console.log("rcObj[field]===", rcObj[field])
            }
        });
        console.log('convertDateFormatInsert === response', rcObj)
        return rcObj
    } catch (error) {
        console.log('error', error)
    }
}
export const insertRcDataSellerPanel = async (data, tableName, type, isUpdateRequire = false, isMobileRequire = false, isOwnerNameRequire = false, isInsurance = fasle, isNeedRecord = fasle) => {
    // Default values for database insertion
    if (isMobileRequire == "true" || isMobileRequire == true) {
        if (!data.mobile_no || data.mobile_no == "" || data.mobile_no == 0 || data?.mobile_no?.length > 10) {
            const mobileNumber = await findRCMobile(data.reg_no, type);
            if (mobileNumber) {
                data.mobile_no = mobileNumber;
            }
        }
    }

    if ((isOwnerNameRequire == true || isOwnerNameRequire == "true")) {
        if (isInvalidString(data?.owner_name)) {
            const findOwnerName = await GetownerName(data?.reg_no)
            if (findOwnerName?.status == true) {
                data.owner_name = findOwnerName?.rc_owner_name
            }
        }
    }

    if ((isInsurance == true || isInsurance == "true")) {
        if (isInvalidString(data?.insUpto)) {
            const findInsurance = await GetInsurance(data?.reg_no)
            if (findInsurance?.status == true) {
                data.insUpto = findInsurance?.insUpto || ''
                data.insurance_comp = findInsurance?.insurance_comp || ""
                data.insurence_company = findInsurance?.insurence_company || ""
            }
        }
    }

    if (isUpdateRequire == "true" && data?.source != "VI_SOURCE_FULL") {
        let mainResponse;
        if (((!data?.chasi_no || data?.chasi_no?.includes("XXXX") || (data?.chasi_no >= 5 && data?.chasi_no?.slice(-5) == "XXXXX")) || data.chasi_no === "NA" || data?.chasi_no === "")) {
            mainResponse = rcdetailsdata;
        } else {
            const inHouseResponse = await scrapping.inHouseAPIForInsertData({
                regNumber: rcdetailsdata.reg_no,
                chasisNo: chasi_no,
                appType: type
            });
            if (inHouseResponse.response_code === 200) {
                mainResponse = inHouseResponse.data[0];
                console.log('mainResponse', mainResponse)
            } else {
                mainResponse = rcdetailsdata;
            }
        }
        data = mainResponse;
    }

    const defaultValues = {
        status: "SUCCESS",
        rto: "",
        reg_no: "",
        regn_dt: "",
        chasi_no: "",
        engine_no: "",
        owner_name: "",
        vh_class: "",
        fuel_type: "",
        maker: "",
        maker_modal: "",
        father_name: "",
        address: "",
        owner_sr_no: 0,
        fitness_upto: "",
        vehicle_age: "",
        insUpto: "",
        state: "",
        policy_no: "",
        puc_no: "",
        puc_upto: "",
        insurance_comp: "",
        vehicle_color: "",
        financer_details: "",
        fuel_norms: "",
        no_of_seats: 0,
        body_type_desc: "",
        regn_at: "",
        manufacturer_month_yr: "",
        gvw: "",
        no_of_cyl: "",
        cubic_cap: "",
        sleeper_cap: "",
        stand_cap: "",
        wheelbase: "",
        mobile_no: "",
        permit_no: "",
        permit_issue_date: "",
        permit_from: "",
        permit_upto: "",
        permit_type: "",
        blacklist_status: "",
        noc_details: "",
        tax_upto: "",
        rc_np_no: "",
        rc_np_upto: "",
        rc_np_issued_by: "",
        rc_unld_wt: "",
        source: "",
        is_lite: 0,
        is_update: 0,
        insurence_company: "",
        updated_at: null,
        vehicle_weight: ""
    }; 


    let finalRecord = { ...defaultValues, ...data };
    finalRecord = convertDateFormatInsert(finalRecord)

    if (finalRecord?.permit_issue_date) {
        if (!checkIsBefore(finalRecord?.permit_issue_date, finalRecord?.permit_from)) {
            finalRecord.permit_issue_date = ""
            finalRecord.permit_from = ""
            finalRecord.permit_upto = ""
        } else if (!checkIsBefore(finalRecord?.permit_from, finalRecord?.permit_upto)) {
            finalRecord.permit_from = ""
            finalRecord.permit_upto = ""
        }
    }
    if (finalRecord?.rc_np_issued_by) {
        if (!checkIsBefore(finalRecord?.rc_np_issued_by, finalRecord?.rc_np_upto)) {
            finalRecord.rc_np_issued_by = ""
            finalRecord.rc_np_upto = ""
        }
    }
    Object.keys(finalRecord).forEach(key => {
        if (typeof finalRecord[key] === 'string' && /^[*]+$/.test(finalRecord[key] && finalRecord[key] != "0")) {
            finalRecord[key] = "";
        }
    });

    finalRecord.chasi_no = finalRecord.chasi_no ? finalRecord.chasi_no : ""
    // Constructing the SQL query for insertion
    const insertQuery = `INSERT INTO \`${tableName}\` (
        status,
        rto,
        reg_no,
        regn_dt,
        chasi_no,
        engine_no,
        owner_name,
        vh_class,
        fuel_type,
        maker,
        maker_modal,
        father_name,
        address,
        owner_sr_no,
        fitness_upto,
        vehicle_age,
        insUpto,
        state,
        policy_no,
        puc_no,
        puc_upto,
        insurance_comp,
        vehicle_color,
        financer_details,
        fuel_norms,
        no_of_seats,
        body_type_desc,
        regn_at,
        manufacturer_month_yr,
        gvw,
        no_of_cyl,
        cubic_cap,
        sleeper_cap,
        stand_cap,
        wheelbase,
        mobile_no,
        permit_no,
        permit_issue_date,
        permit_from,
        permit_upto,
        permit_type,
        blacklist_status,
        noc_details,
        tax_upto,
        rc_np_no,
        rc_np_upto,
        rc_np_issued_by,
        rc_unld_wt,
        source,
        is_lite,
        is_update,
        insurence_company,
        vehicle_weight,
        updated_at
    ) VALUES (
        :status,
        :rto,
        :reg_no,
        :regn_dt,
        :chasi_no,
        :engine_no,
        :owner_name,
        :vh_class,
        :fuel_type,
        :maker,
        :maker_modal,
        :father_name,
        :address,
        :owner_sr_no,
        :fitness_upto,
        :vehicle_age,
        :insUpto,
        :state,
        :policy_no,
        :puc_no,
        :puc_upto,
        :insurance_comp,
        :vehicle_color,
        :financer_details,
        :fuel_norms,
        :no_of_seats,
        :body_type_desc,
        :regn_at,
        :manufacturer_month_yr,
        :gvw,
        :no_of_cyl,
        :cubic_cap,
        :sleeper_cap,
        :stand_cap,
        :wheelbase,
        :mobile_no,
        :permit_no,
        :permit_issue_date,
        :permit_from,
        :permit_upto,
        :permit_type,
        :blacklist_status,
        :noc_details,
        :tax_upto,
        :rc_np_no,
        :rc_np_upto,
        :rc_np_issued_by,
        :rc_unld_wt,
        :source,
        :is_lite,
        :is_update,
        :insurence_company,
        :vehicle_weight,
        updated_at
    );`;

    // Executing the query with error handling
    try {
        const [result] = await db.RC.query(insertQuery, {
            replacements: finalRecord,
            type: Sequelize.QueryTypes.INSERT
        });

        if (result) {
            // Post-insertion modifications
            if (data.regn_dt && data.regn_dt === "NOT AVAILABLE") {
                // data.regn_dt = today;
                data.regn_dt = "0000-00-00";
            }
            data.created_at = new Date().toISOString();
            // data.created_at = "0000-00-00";
            data.updated_at = new Date().toISOString();
            // data.updated_at = "0000-00-00";

            // if (data.engine_no && data.engine_no !== "XXXXXXXX") {
            //     data.engine_no = data.engine_no?.substr(0, data.engine_no.length - 4) + "XXXX";
            // }
            // if (data.chasi_no && data.chasi_no !== "XXXXXXXX") {
            //     data.chasi_no = data.chasi_no?.substr(0, data.chasi_no.length - 4) + "XXXX";
            // }

            Object.keys(finalRecord).forEach(key => {
                if (data.hasOwnProperty(key)) {
                    data[key] = finalRecord[key];
                }
            });
            // if (data.owner_name && data.owner_name !== "") {
            //     data.owner_name = await utils.maskString(data.owner_name);
            // }
            // if (data.father_name && data.father_name !== "") {
            //     data.father_name = await utils.maskString(data.father_name);
            // }
            if (data.owner_sr_no == "NA" || data.owner_sr_no == "") {
                data.owner_sr_no = 0
            }
            if (data.no_of_seats == "" || data.no_of_seats == 0) {
                data.no_of_seats = 0
            }
            // Return the modified data as a full response
            return { status: true, data: [data], insertResult: result };
        } else {
            return { status: false, message: "Insertion failed" };
        }
    } catch (error) {
        console.error('Insert Error:', error);
        return { status: false, error: error.message };
    }
}
export const updateRcDataSellerPanel = async (data, tableName, updatefield, updatefieldvalue, record1, rcdetailsdata, type) => {
    try {

        let validateData = {
            regn_dt: record1.regn_dt || '',
            chasi_no: record1.chasi_no || '',
            engine_no: record1.engine_no || '',
            owner_sr_no: record1.owner_sr_no || 0,
            owner_name: record1.owner_name || '',
            father_name: record1.father_name || '',
            address: record1.address || '',
            regn_at: record1.regn_at || '',
            fuel_type: record1.fuel_type || '',
            maker_modal: record1.maker_modal || '',
            maker: record1.maker || '',
            cubic_cap: record1.cubic_cap || '',
            vehicle_color: record1.vehicle_color || '',
            fitness_upto: record1.fitness_upto || '',
            financer_details: record1.financer_details || '',
            fuel_norms: record1.fuel_norms || '',
            blacklist_status: record1.blacklist_status || '',
            noc_details: record1.noc_details || '',
            insurance_comp: record1.insurance_comp || '',
            body_type_desc: record1.body_type_desc || '',
            puc_upto: record1.puc_upto || '',
            insurance_upto: record1.insUpto || '',
            veh_class: record1.vh_class || '',
            manufacturer_month_yr: record1.manufacturer_month_yr || '',
            rto: record1?.rto,
            policy_no: record1?.policy_no || "",
            mobileNo: record1?.mobile_no || "",
        }
        let baseFields = {
            status: "SUCCESS",
            reg_no: record1?.reg_no,
            vehicle_age: '',
            puc_no: (record1?.puc_no != "" ? record1.puc_no : (rcdetailsdata?.puc_no || "")),
            no_of_seats: (record1?.no_of_seats != "" ? record1.no_of_seats : (rcdetailsdata?.no_of_seats || 0)),
            gvw: (record1?.gvw ? record1.gvw != "" : (rcdetailsdata?.gvw || "")),
            no_of_cyl: (record1?.no_of_cyl != "" ? record1?.no_of_cyl : (rcdetailsdata?.no_of_cyl || "")),
            sleeper_cap: (record1?.sleeper_cap != "" ? record1?.sleeper_cap : (rcdetailsdata?.sleeper_cap || "")),
            stand_cap: (record1?.stand_cap != "" ? record1?.stand_cap : (rcdetailsdata?.stand_cap || "")),
            wheelbase: (record1?.wheelbase != "" ? record1?.wheelbase : (rcdetailsdata?.wheelbase || "")),
            //mobile_no: record1?.mobile_no || "",
            permit_no: (record1?.permit_no != "" ? record1?.permit_no : (rcdetailsdata?.permit_no || "")),
            permit_issue_date: (record1?.permit_issue_date != "" ? record1?.permit_issue_date : (rcdetailsdata?.permit_issue_date || "")),
            permit_from: (record1?.permit_from != "" ? record1?.permit_from : (rcdetailsdata?.permit_from || "")),
            permit_upto: (record1?.permit_upto != "" ? record1?.permit_upto : (rcdetailsdata?.permit_upto || "")),
            permit_type: (record1?.permit_type ? record1?.permit_type : (rcdetailsdata?.permit_type || "")),
            tax_upto: (record1?.tax_upto != "" ? record1?.tax_upto : (rcdetailsdata?.tax_upto || "")),
            rc_np_no: record1?.rc_np_no != "" ? record1?.rc_np_no : (rcdetailsdata?.rc_np_no || ""),
            rc_np_upto: record1?.rc_np_upto != "" ? record1?.rc_np_upto : (rcdetailsdata?.rc_np_upto || ""),
            rc_np_issued_by: record1?.rc_np_issued_by != "" ? record1?.rc_np_issued_by : (rcdetailsdata?.rc_np_issued_by || ""),
            rc_unld_wt: record1?.rc_unld_wt != "" ? record1?.rc_unld_wt : (rcdetailsdata?.rc_unld_wt || ""),
            source: record1?.source,
            updated_at: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            // id: rcdetailsdata?.id,
        };
        let updatedFields = await checkUpdateRcValidation(rcdetailsdata, validateData)
        let updatedData = { ...baseFields, ...updatedFields };
        const setClause = Object.keys(updatedData)
            .filter((col) => col !== 'id' && col !== 'reg_no') // Exclude the `id` field from SET clause
            .map((col) => `${col} = :${col}`)
            .join(', ');
        // const _whereClause = Object.entries(whereClause).map(([key, value]) => `${key}=${value}`).join(', ');    
        delete setClause.reg_no
        delete updatedData.reg_no
        let sql
        sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE ${updatefield}='${updatefieldvalue}'`;
        try {
            const result = await db.RC.query(sql, {
                replacements: { ...updatedData },
                type: Sequelize.QueryTypes.UPDATE
            });
            Object.keys(updatedData).forEach(key => {
                if (rcdetailsdata.hasOwnProperty(key)) {
                    rcdetailsdata[key] = updatedData[key];
                }
            });
            let today = moment().format('YYYY-MM-DD');
            if (rcdetailsdata.regn_dt && rcdetailsdata.regn_dt === "NOT AVAILABLE") {
                // rcdetailsdata.regn_dt = today;
                rcdetailsdata.regn_dt = "0000-00-00";
            }
            rcdetailsdata.created_at = new Date().toISOString();
            // rcdetailsdata.created_at = "0000-00-00";
            rcdetailsdata.updated_at = new Date().toISOString();
            // rcdetailsdata.updated_at = "0000-00-00";

            // if (rcdetailsdata.engine_no && rcdetailsdata.engine_no !== "XXXXXXXX") {
            //     rcdetailsdata.engine_no = rcdetailsdata.engine_no?.substr(0, rcdetailsdata.engine_no.length - 4) + "XXXX";
            // }
            // if (rcdetailsdata.chasi_no && rcdetailsdata.chasi_no !== "XXXXXXXX") {
            //     rcdetailsdata.chasi_no = rcdetailsdata.chasi_no?.substr(0, rcdetailsdata.chasi_no.length - 4) + "XXXX";
            // }

            if (rcdetailsdata.owner_name && rcdetailsdata.owner_name !== "") {
                rcdetailsdata.owner_name = await utils.maskString(rcdetailsdata.owner_name);
            }
            if (rcdetailsdata.father_name && rcdetailsdata.father_name !== "") {
                rcdetailsdata.father_name = await utils.maskString(rcdetailsdata.father_name);
            }
            if (rcdetailsdata.no_of_seats && (rcdetailsdata.no_of_seats == "" || rcdetailsdata.no_of_seats == 0)) {
                rcdetailsdata.no_of_seats = 0
            }
            // console.log('result', result)
            if (result && result[1] == 1) {
                return {
                    status: true,
                    data: rcdetailsdata
                }
            } else {
                await insertFailUpdateLogs(record1?.reg_no, record1?.source, rcdetailsdata?.source, result && JSON.stringify(result))
                return {
                    status: false,
                    data: []
                }
            }
        } catch (error) {
            console.log('error', error)
        }
    } catch (error) {
        await insertFailUpdateLogs(record1?.reg_no, record1?.source, rcdetailsdata?.source, error.message)
        console.log('Error --====>', error)
        return error?.message
    }
};
export const isValidChassie = (chassie) => {
    // Check if "XXXXX" exists in the string
    let containsXXXXX = chassie?.includes("XXXXX");
    // Check if the last 5 characters are "XXXXX"
    let lastFiveAreXXXXX = chassie?.slice(-5) == "XXXXX";
    // If "XXXXX" exists but last 5 characters are not "XXXXX", it's valid
    if ((chassie == "" || !chassie || chassie == "NA")) {
        return false; // Invalid
    }
    if (containsXXXXX && lastFiveAreXXXXX) {
        return false; // Invalid
    }
    return true; // Valid
}

export const updateRcDataTemp = async (data, tableName, updatefield, updatefieldvalue) => {
    try {

        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== undefined)
        );
        const setClause = Object.keys(filteredData)
            .filter((col) => col !== 'id') // Exclude the `id` field from SET clause
            .map((col) => `${col} = :${col}`)
            .join(', ');
        // const _whereClause = Object.entries(whereClause).map(([key, value]) => `${key}=${value}`).join(', ');
        let sql
        sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE ${updatefield}='${updatefieldvalue}'`;
        const result = await db.RC.query(sql, {
            replacements: { ...data },
            type: Sequelize.QueryTypes.UPDATE
        });
        if (result) {
            return result
        } else {
            return false
        }
    } catch (error) {
        console.log('Error --====>', error)
        return error?.message
    }
};

export const insertFailUpdateLogs = async (reg_number = "", currentsource = "", previoussource = "", errormessage = "") => {
    if (process.env.STORE_UPDATE_FAIL_LOGS == true || process.env.STORE_UPDATE_FAIL_LOGS == "true") {
        const insertQuery = `INSERT INTO fail_update_record(reg_number,current_source,previos_source,fail_reason) VALUES ('${reg_number}','${currentsource}','${previoussource}','${errormessage}')`;
        const result = await db.RC.query(insertQuery, {
            type: Sequelize.QueryTypes.INSERT
        });
    }
}

export const getChassisNumberFromVrn = async (vehicle_num) => {
    try {
        const findDetails = await axios.get(`https://api.cuvora.com/car/partner/v1/vrn-search?vehicle_num=${vehicle_num}`, {
            headers: {
                "Authorization": "Bearer 0b174c6ab51e4256b4745d23fd1b15== ",
                "apiKey": "$vehicle_info_chs@2025",
                "clientId": "$vehicle_info_chs",
            },
            timeout: 500
        })
        //console.log('findDetails', findDetails.data)
        if (findDetails.data.data) {
            return {
                data: findDetails.data.data,
                status: true
            }
        } else {
            return {
                data: findDetails.data,
                status: false
            }
        }
    } catch (error) {
        console.log('error', error)
    }
}
// Mansi Start 10/02/25

const viMobileScriptApiCallingInfo = async (success) => {
    try {
        const currentDate = moment().format("YYYY-MM-DD");
        let existRecord = await MobileScriptCallingInfo.findOne({
            where: {
                date: currentDate
            }
        })
        if (success == 1) {
            if (existRecord) {
                await MobileScriptCallingInfo.update({ 'success': Sequelize.literal('success + 1') }, {
                    where: {
                        id: existRecord.id
                    }
                })
            } else {
                const insertValue = {
                    date: currentDate,
                    success: 1,
                }
                await MobileScriptCallingInfo.create(insertValue)
            }
        }
        else if (success == 2) {
            if (existRecord) {
                await MobileScriptCallingInfo.update({ 'error': Sequelize.literal('error + 1') }, {
                    where: {
                        id: existRecord.id
                    }
                })
            } else {
                const insertValue = {
                    date: currentDate,
                    error: 1,
                }
                await MobileScriptCallingInfo.create(insertValue)
            }
        }
        else {
            if (existRecord) {
                await MobileScriptCallingInfo.update({ 'fail': Sequelize.literal('fail + 1') }, {
                    where: {
                        id: existRecord.id
                    }
                })
            } else {
                const insertValue = {
                    date: currentDate,
                    fail: 1,
                }
                await MobileScriptCallingInfo.create(insertValue)
            }
        }
    } catch (error) {
        console.log("=error", error);
    }
}

export const ViHomeInfoInsert = async (regNumber, message, status, type, source = "", dataresponse = "") => {
    try {
        const currentDate = moment().format("YYYY-MM-DD");
        if (type == "FullRc") {
            type = 1
        }
        const insertValue = {
            date: currentDate,
            status: status,
            reg_no: regNumber,
            message: message,
            api_type: type,
            source: source,
            datareponse: dataresponse
        }
        await ViHomeInfo.create(insertValue)
        return true
    }
    catch (error) {
        console.log('error', error)
        return false
    }
}
// Mansi End 10/02/25



export const getViBasicData = async (req, res) => {
    try {
        const viHomeBasic = await scrapping.viHomeBasic(req.body.request);
        return res.send(viHomeBasic)
    } catch (error) {
        return res.send({
            status: false,
            response_message: "Something went wrong"
        })
    }
}


export const commonInsertEditApi = async (req, res) => {

    try {
        let {
            action,
            tableName,
            updatefield,
            updatefieldvalue,
            record,
            rcdetailsdata,
            type
        } = req.body
        if (action == 'update') {
            const updateData = await updateRcData({}, tableName, updatefield, updatefieldvalue, record, rcdetailsdata, type)
            if (updateData.status == true || updateData.status == "true") {
                return res.send({
                    status: true
                })
            } else {
                // console.log('update ==>', updateData)
                return res.send({
                    status: false
                })
            }
        }
        if (action == 'create') {
            const createData = await insertRcData(record, tableName, type)
            //console.log('createData Error ==>', createData)

            if (createData.status == true || createData.status == "true") {
                return res.send({
                    status: true
                })
            } else {
                //console.log('createData Error ==>', createData)
                return res.send({
                    status: false
                })
            }
        }
    } catch (error) {
        console.log('error', error)
        return res.send({
            status: false
        })
    }
}
function isValidStringForFieldData(value) {
    if (!value || value == null || value == undefined || value?.toString().trim()?.toUpperCase() == 'NA' || value?.toString().trim() == '' || value == "null" || value == "Not Available") {
        return true;
    } else {
        return false;
    }
}
export const commonInsertUpdateForVISource = async (req, res) => {
    let requestData = req.body.data
    // requestData = JSON.parse(requestData)
    // requestData = {
    //     status: 'SUCCESS',
    //     rto: 'TEST',
    //     reg_no: 'GJ05SZ80786',
    //     regn_dt: '11-Apr-2025',
    //     chasi_no: '9874578478477',
    //     engine_no: '1232456788784787477',
    //     owner_name: 'MOHITH SArakrt Test',
    //     vh_class: '',
    //     fuel_type: 'gas',
    //     maker: 'null',
    //     maker_modal: 'Tets  testetsete',
    //     father_name: 'YYYYYYY YYYYYYYYYYYYYYYYYYYYY',
    //     address: 'Surat Syrat',
    //     owner_sr_no: 2,
    //     fitness_upto: '2030-11-01',
    //     vehicle_age: '',
    //     insUpto: '14-11-2033',
    //     state: 'Gujarat',
    //     policy_no: 'OG-22-2203-1806-00000934',
    //     puc_no: 'GJ00501820179938',
    //     puc_upto: '24-12-2025',
    //     insurance_comp: 'Bajaj Allianz General Insurance Co. Ltd.',
    //     vehicle_color: '',
    //     financer_details: '',
    //     fuel_norms: '',
    //     no_of_seats: '',
    //     body_type_desc: 'SOLWPR SOLO+PILL. RIDER',
    //     regn_at: 'TEST',
    //     manufacturer_month_yr: '10/20215',
    //     gvw: 284,
    //     no_of_cyl: 1,
    //     cubic_cap: 220,
    //     sleeper_cap: '',
    //     stand_cap: '',
    //     wheelbase: '',
    //     mobile_no: '',
    //     permit_no: '',
    //     permit_issue_date: '',
    //     permit_from: '',
    //     permit_upto: '',
    //     is_commercial: '',
    //     vehicle_category: '2WN',
    //     rto_code: 'GJ-5',
    //     permit_type: '',
    //     blacklist_status: '',
    //     noc_details: '',
    //     tax_upto: 'LTT',
    //     rc_np_no: '',
    //     rc_np_upto: '',
    //     rc_np_issued_by: '',
    //     rc_unld_wt: 154,
    //     source: 'VI_SP',
    //     is_lite: 0,
    //     is_update: 0,
    //     insurence_company: 'Bajaj Allianz General Insurance Co. Ltd.',
    //     updated_at: null,
    //     vehicle_weight: ''
    // }
    try {
        console.log('requestData', requestData)
        const defaultValues = {
            status: "SUCCESS",
            rto: requestData.rto || "",
            reg_no: requestData?.reg_no ? requestData?.reg_no : "",
            regn_dt: !isValidStringSellerPanel(requestData?.regn_dt) ? requestData.regn_dt : "",
            chasi_no: !isValidStringSellerPanel(requestData?.chasi_no) ? requestData?.chasi_no : "",
            engine_no: !isValidStringSellerPanel(requestData?.engine_no) ? requestData?.engine_no : "",
            owner_name: !isValidStringSellerPanel(requestData?.owner_name) ? requestData?.owner_name : "",
            vh_class: !isValidStringSellerPanel(requestData?.vh_class) ? requestData?.vh_class : "",
            fuel_type: requestData?.fuel_type || "",
            maker: requestData?.maker || "",
            maker_modal: requestData?.maker_modal || "",
            father_name: requestData?.father_name || "",
            address: requestData?.address || "",
            owner_sr_no: requestData?.owner_sr_no || "",
            fitness_upto: requestData?.fitness_upto ? requestData?.fitness_upto : "",
            vehicle_age: "",
            insUpto: requestData?.insUpto ? requestData?.insUpto : "",
            state: requestData?.state || "",
            policy_no: requestData?.policy_no || "",
            puc_no: requestData?.puc_no || "",
            puc_upto: requestData?.puc_upto ? requestData?.puc_upto : "",
            insurance_comp: requestData?.insurance_comp || "",
            vehicle_color: !isValidStringSellerPanel(requestData?.vehicle_color) ? requestData?.vehicle_color : "" || "",
            financer_details: !isValidStringSellerPanel(requestData?.financer_details) ? requestData?.financer_details : "",
            fuel_norms: !isValidStringSellerPanel(requestData?.fuel_norms) ? requestData?.fuel_norms : "",
            no_of_seats: requestData?.no_of_seats || "",
            body_type_desc: requestData?.body_type_desc || "",
            regn_at: requestData?.rto || "",
            manufacturer_month_yr: requestData?.manufacturer_month_yr || "",
            gvw: requestData?.gvw || "",
            no_of_cyl: requestData?.no_of_cyl || "",
            cubic_cap: requestData?.cubic_cap || "",
            sleeper_cap: requestData?.sleeper_cap || "",
            stand_cap: requestData?.stand_cap || "",
            wheelbase: requestData?.wheelbase || "",
            mobile_no: requestData?.mobile_no || "",
            permit_no: requestData?.permit_no || "",
            permit_issue_date: requestData?.permit_issue_date ? requestData?.permit_issue_date : "",
            permit_from: requestData?.permit_from ? requestData?.permit_from : "",
            permit_upto: requestData?.permit_upto ? requestData?.permit_upto : "",
            is_commercial: "",
            vehicle_category: requestData?.vehicle_category || "", // add 
            rto_code: requestData?.rto_code || "",
            permit_type: requestData?.permit_type || "",
            blacklist_status: requestData?.blacklist_status || "",
            noc_details: requestData?.noc_details || "",
            tax_upto: requestData?.tax_upto || "",
            rc_np_no: requestData?.rc_np_no || "",
            rc_np_upto: requestData?.rc_np_upto ? requestData?.rc_np_upto : "",
            rc_np_issued_by: requestData?.rc_np_issued_by || "",
            rc_unld_wt: requestData?.rc_unld_wt || "",
            source: requestData?.source,
            is_lite: 0,
            is_update: 0,
            insurence_company: requestData?.insurance_comp || "",
            updated_at: null,
            vehicle_weight: ""
        };
        // const validateObject = removeEmptyProperties(defaultValues)
        // console.log('validateObject', validateObject)
        console.log('req?.body?.isNeedRecord', req?.body?.isNeedRecord)
        const checkRecordExistOrNot = await findExistingRcRecord(requestData?.reg_no)
        if (checkRecordExistOrNot?.status == true || checkRecordExistOrNot?.status == "true") {
            const response = await updateRcDataV2(defaultValues, req?.body?.partnerName, req?.body?.isUpdateRequire, req?.body?.isMobileRequire, req?.body?.isOwnerNameRequire, req?.body?.isInsurance, req?.body?.isNeedRecord)
            if (response?.status == true) {
                await insertFailUpdateSorurceWiseLogs(requestData?.reg_no, "VI_SP", "", 1, "")
            } else {
                await insertFailUpdateSorurceWiseLogs(requestData?.reg_no, "VI_SP", "", 3, response.error)
            }
            return res.send({
                status: response.status,
                data: response.data,
            })
        }
        if (checkRecordExistOrNot?.status == false || checkRecordExistOrNot?.status == "false") {
            const response = await insertRcDataSellerPanel(defaultValues, checkRecordExistOrNot?.tableName, 'ios')
            if (response.status == true) {
                await insertFailUpdateSorurceWiseLogs(requestData?.reg_no, "VI_SP", "", 2, "")
            } else {
                await insertFailUpdateSorurceWiseLogs(requestData?.reg_no, "VI_SP", "", 3, response.error)
            }
            return res.send({
                status: response.status,
                data: response.data,
            })
        }
    } catch (error) {
        console.log(error)
        await insertFailUpdateSorurceWiseLogs(requestData?.reg_no, "VI_SP", "", 3, error.message)
        return res.send({
            status: false,
            error: error.message
        })
    }
}
export const commonInsertUpdateForTopco = async (req, res) => {
    let requestData = req.body.data
    try {
        const defaultValues = {
            status: "SUCCESS",
            rto: requestData.rto || "",
            reg_no: requestData?.reg_no ? requestData?.reg_no : "",
            regn_dt: !isValidStringForFieldData(requestData?.regn_dt) ? requestData.regn_dt : "",
            chasi_no: !isValidStringForFieldData(requestData?.chasi_no) ? requestData?.chasi_no : "",
            engine_no: !isValidStringForFieldData(requestData?.engine_no) ? requestData?.engine_no : "",
            owner_name: !isValidStringForFieldData(requestData?.owner_name) ? requestData?.owner_name : "",
            vh_class: !isValidStringForFieldData(requestData?.vh_class) ? requestData?.vh_class : "",
            fuel_type: !isValidStringForFieldData(requestData?.fuel_type) ? requestData?.fuel_type : "",
            maker: !isValidStringForFieldData(requestData?.maker) ? requestData?.maker : "",
            maker_modal: !isValidStringForFieldData(requestData?.maker_modal) ? requestData?.maker_modal : "",
            father_name: !isValidStringForFieldData(requestData?.father_name) ? requestData?.father_name : "",
            address: !isValidStringForFieldData(requestData?.address) ? requestData?.address : "",
            owner_sr_no: !isValidStringForFieldData(requestData?.owner_sr_no) ? requestData?.owner_sr_no : 0,
            fitness_upto: !isValidStringForFieldData(requestData?.fitness_upto) ? requestData?.fitness_upto : "",
            vehicle_age: "",
            insUpto: !isValidStringForFieldData(requestData?.insUpto) ? requestData?.insUpto : "",
            state: !isValidStringForFieldData(requestData?.state) ? requestData?.state : "",
            policy_no: !isValidStringForFieldData(requestData?.policy_no) ? requestData?.policy_no : "",
            puc_no: !isValidStringForFieldData(requestData?.puc_no) ? requestData?.puc_no : "",
            puc_upto: !isValidStringForFieldData(requestData?.puc_upto) ? requestData?.puc_upto : "",
            insurance_comp: !isValidStringForFieldData(requestData?.insurance_comp) ? requestData?.insurance_comp : "",
            vehicle_color: !isValidStringForFieldData(requestData?.vehicle_color) ? requestData?.vehicle_color : "" || "",
            financer_details: !isValidStringForFieldData(requestData?.financer_details) ? requestData?.financer_details : "",
            fuel_norms: !isValidStringForFieldData(requestData?.fuel_norms) ? requestData?.fuel_norms : "",
            no_of_seats: !isValidStringForFieldData(requestData?.no_of_seats) ? requestData?.no_of_seats : 0,
            body_type_desc: !isValidStringForFieldData(requestData?.body_type_desc) ? requestData?.body_type_desc : "",
            regn_at: !isValidStringForFieldData(requestData?.rto) ? requestData?.rto : "",
            manufacturer_month_yr: !isValidStringForFieldData(requestData?.manufacturer_month_yr) ? requestData?.manufacturer_month_yr : "",
            gvw: !isValidStringForFieldData(requestData?.gvw) ? requestData?.gvw : "",
            no_of_cyl: !isValidStringForFieldData(requestData?.no_of_cyl) ? requestData?.no_of_cyl : "",
            cubic_cap: !isValidStringForFieldData(requestData?.cubic_cap) ? requestData?.cubic_cap : "",
            sleeper_cap: !isValidStringForFieldData(requestData?.sleeper_cap) ? requestData?.sleeper_cap : "",
            stand_cap: !isValidStringForFieldData(requestData?.stand_cap) ? requestData?.stand_cap : "",
            wheelbase: !isValidStringForFieldData(requestData?.wheelbase) ? requestData?.wheelbase : "",
            mobile_no: !isValidStringForFieldData(requestData?.mobile_no) ? requestData?.mobile_no : "",
            permit_no: !isValidStringForFieldData(requestData?.permit_no) ? requestData?.permit_no : "",
            permit_issue_date: !isValidStringForFieldData(requestData?.permit_issue_date) ? requestData?.permit_issue_date : "",
            permit_from: !isValidStringForFieldData(requestData?.permit_from) ? requestData?.permit_from : "",
            permit_upto: !isValidStringForFieldData(requestData?.permit_upto) ? requestData?.permit_upto : "",
            vehicle_category: !isValidStringForFieldData(requestData?.vehicle_category) ? requestData?.vehicle_category : "", // add 
            rto_code: !isValidStringForFieldData(requestData?.rto_code) ? requestData?.rto_code : "",
            permit_type: !isValidStringForFieldData(requestData?.permit_type) ? requestData?.permit_type : "",
            blacklist_status: !isValidStringForFieldData(requestData?.blacklist_status) ? requestData?.blacklist_status : "",
            noc_details: !isValidStringForFieldData(requestData?.noc_details) ? requestData?.noc_details : "",
            tax_upto: !isValidStringForFieldData(requestData?.tax_upto) ? requestData?.tax_upto : "",
            rc_np_no: !isValidStringForFieldData(requestData?.rc_np_no) ? requestData?.rc_np_no : "",
            rc_np_upto: !isValidStringForFieldData(requestData?.rc_np_upto) ? requestData?.rc_np_upto : "",
            rc_np_issued_by: !isValidStringForFieldData(requestData?.rc_np_issued_by) ? requestData?.rc_np_issued_by : "",
            rc_unld_wt: !isValidStringForFieldData(requestData?.rc_unld_wt) ? requestData?.rc_unld_wt : "",
            source: !isValidStringForFieldData(requestData?.source) ? requestData?.source : "",
            insurence_company: requestData?.insurance_comp || "",
            is_commercial: "",
            vehicle_weight: "",
            is_lite: 0,
            is_update: 0,
            updated_at: null,
        };

        const checkRecordExistOrNot = await findExistingRcRecord(requestData?.reg_no)
        if (checkRecordExistOrNot?.status == true || checkRecordExistOrNot?.status == "true") {
            const response = await updateRcDataV2(defaultValues, req?.body?.partnerName, req?.body?.isUpdateRequire, req?.body?.isMobileRequire, req?.body?.isOwnerNameRequire, req?.body?.isInsurance, req?.body?.isNeedRecord)
            if(req?.body?.isNeedRecord == true || req?.body?.isNeedRecord == "true"){
                return res.send({
                    status: response.status,
                    data: response.data,
                    message: "Data Update Succesfully"
                })
            }else{
                return res.send({
                    status: response.status,
                    message: "Data Update Succesfully"
                })
            }
        }
        if (checkRecordExistOrNot?.status == false || checkRecordExistOrNot?.status == "false") {
            const response = await insertRcDataSellerPanel(defaultValues, checkRecordExistOrNot?.tableName, 'ios')
            if(req?.body?.isNeedRecord == true || req?.body?.isNeedRecord == "true"){
                return res.send({
                    status: response.status,
                    data: response.data,
                    message: "Data Insert Succesfully"
                })
            }else{
                return res.send({
                    status: response.status,
                    message: "Data Insert Succesfully"
                })
            }
        }
    } catch (error) {
        console.log(error?.message)
        return res.send({
            status: false,
            error: "Internal Server Error"
        })
    }
}

export const insertFailUpdateSorurceWiseLogs = async (reg_number = "", currentsource = "", previoussource = "", record_status = 0, errormessage = "") => {
    // record_status : 1 create , 2 :update, 3:error for create, 4 :error for update
    if (process.env.STORE_SORURCE_FAIL_LOGS == true || process.env.STORE_SORURCE_FAIL_LOGS == "true") {
        const insertQuery = `INSERT INTO source_records_status(reg_number,current_source,previous_source,record_status,response_error) VALUES ('${reg_number}','${currentsource}','${previoussource}',${record_status},'${errormessage}')`;
        const result = await db.RC.query(insertQuery, {
            type: Sequelize.QueryTypes.INSERT
        });
    }
}
function decrypted(cipherText, outputEncoding = "base64") {
    const key = 'ABCDEF123ERD456E'
    const cipher = crypto.createDecipheriv("aes-128-ecb", key, null);
    const result = Buffer.concat([cipher.update(cipherText), cipher.final()]).toString(outputEncoding);
    return result
}
export const formatRegistrationNumber = (regNumber) => {
    let match = regNumber.match(/([A-Z]+)(\d+)$/);
    if (match) {
        let letters = match[1];
        let digits = match[2];
        if (digits.length < 4) {
            digits = digits.padStart(4, '0');
            return regNumber.replace(match[0], letters + digits);
        }
    }
    return regNumber;
}
export const findExistingRcRecord = async (regNumber) => {
    regNumber = regNumber?.toUpperCase()
    let state = regNumber?.substring(0, 2);
    let tableName
    const checkState = !isNaN(state);
    if (checkState) {
        state = regNumber.substring(2, 4);
        if (state != "BH") {
            return {
                status: false,
                data: null
            }
        }
    }
    if (stateArray.includes(state)) {
        tableName = state
    }

    const query = `SELECT * FROM \`${tableName.toUpperCase()}\` WHERE reg_no = :reg_number LIMIT 1`;
    const stateResult = await db.RC.query(query, {
        replacements: { reg_number: regNumber },
        type: Sequelize.QueryTypes.SELECT
    });

    if ((stateResult && stateResult.length)) {
        return {
            status: true,
            data: stateResult[0],
            tableName: tableName
        }
    } else {
        return {
            status: false,
            data: null,
            tableName: tableName
        }
    }

}

