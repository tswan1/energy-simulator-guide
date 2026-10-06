/* =========================================================
   Sustainable Energy Guide
   solar.js
========================================================= */


/* =========================================================
   SOLAR CONFIGURATION
========================================================= */

const SOLAR_CONFIG = {

    DAYS_PER_MONTH: 30,
    DAYS_PER_YEAR: 365,

    DEFAULT_EFFICIENCY: 80,

    MIN_CONSUMPTION: 0,
    MAX_CONSUMPTION: 100000,

    MIN_SUN_HOURS: 0.1,
    MAX_SUN_HOURS: 12,

    MIN_EFFICIENCY: 1,
    MAX_EFFICIENCY: 100,

    MIN_CAPACITY: 0.1,
    MAX_CAPACITY: 1000,

    MIN_COST: 0,
    MAX_COST: 100000000,

    MIN_RATE: 0,
    MAX_RATE: 1000,

    ANNUAL_DEGRADATION: 0.5,

    PROJECTION_YEARS: 25,

    STORAGE_KEY: "sustainableEnergyData"
};


/* =========================================================
   HELPERS
========================================================= */

function solarNumber(value) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : NaN;
}


function solarFormat(value, decimals = 2) {

    if (!Number.isFinite(value)) {
        return "0";
    }

    return Number(value).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: decimals
        }
    );
}


function solarSetText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


/* =========================================================
   VALIDATION
========================================================= */

function validateSolarInput(
    input,
    min,
    max
) {

    if (!input) {
        return "Input not found.";
    }

    if (
        input.value === "" ||
        input.value === null
    ) {
        return "This field is required.";
    }

    const value =
        solarNumber(input.value);

    if (!Number.isFinite(value)) {
        return "Enter a valid number.";
    }

    if (value < min || value > max) {
        return `Value must be between ${min} and ${max}.`;
    }

    return "";
}


function showSolarError(
    input,
    message
) {

    if (!input) {
        return;
    }

    input.classList.toggle(
        "input-error",
        Boolean(message)
    );

    let error =
        input.parentElement.parentElement
            .querySelector(".error-message");

    if (!error) {

        error =
            document.createElement("span");

        error.className =
            "error-message";

        input.parentElement.parentElement
            .appendChild(error);
    }

    error.textContent =
        message || "";
}


/* =========================================================
   GET SOLAR INPUTS
========================================================= */

function getSolarInputs() {

    const consumptionInput =
        document.getElementById(
            "solar-consumption"
        );

    const sunHoursInput =
        document.getElementById(
            "sun-hours"
        );

    const efficiencyInput =
        document.getElementById(
            "system-efficiency"
        );

    const capacityInput =
        document.getElementById(
            "solar-capacity"
        );

    const costInput =
        document.getElementById(
            "system-cost"
        );

    const rateInput =
        document.getElementById(
            "solar-electricity-rate"
        );

    const stateInput =
        document.getElementById(
            "solar-state"
        );


    return {

        state:
            stateInput
                ? stateInput.value
                : "",

        consumption:
            solarNumber(
                consumptionInput?.value
            ),

        sunHours:
            solarNumber(
                sunHoursInput?.value
            ),

        efficiency:
            solarNumber(
                efficiencyInput?.value
            ),

        capacity:
            solarNumber(
                capacityInput?.value
            ),

        systemCost:
            solarNumber(
                costInput?.value
            ),

        electricityRate:
            solarNumber(
                rateInput?.value
            )
    };
}


/* =========================================================
   VALIDATE SOLAR INPUTS
========================================================= */

function validateSolarInputs() {

    const inputs =
        getSolarInputs();

    let valid = true;


    const consumptionInput =
        document.getElementById(
            "solar-consumption"
        );

    const sunHoursInput =
        document.getElementById(
            "sun-hours"
        );

    const efficiencyInput =
        document.getElementById(
            "system-efficiency"
        );

    const capacityInput =
        document.getElementById(
            "solar-capacity"
        );

    const costInput =
        document.getElementById(
            "system-cost"
        );

    const rateInput =
        document.getElementById(
            "solar-electricity-rate"
        );


    /* State */

    if (!inputs.state) {
        valid = false;
    }


    /* Consumption */

    let error =
        validateSolarInput(
            consumptionInput,
            SOLAR_CONFIG.MIN_CONSUMPTION,
            SOLAR_CONFIG.MAX_CONSUMPTION
        );

    showSolarError(
        consumptionInput,
        error
    );

    if (error) {
        valid = false;
    }


    /* Peak sun hours */

    error =
        validateSolarInput(
            sunHoursInput,
            SOLAR_CONFIG.MIN_SUN_HOURS,
            SOLAR_CONFIG.MAX_SUN_HOURS
        );

    showSolarError(
        sunHoursInput,
        error
    );

    if (error) {
        valid = false;
    }


    /* Efficiency */

    error =
        validateSolarInput(
            efficiencyInput,
            SOLAR_CONFIG.MIN_EFFICIENCY,
            SOLAR_CONFIG.MAX_EFFICIENCY
        );

    showSolarError(
        efficiencyInput,
        error
    );

    if (error) {
        valid = false;
    }


    /* Capacity */

    error =
        validateSolarInput(
            capacityInput,
            SOLAR_CONFIG.MIN_CAPACITY,
            SOLAR_CONFIG.MAX_CAPACITY
        );

    showSolarError(
        capacityInput,
        error
    );

    if (error) {
        valid = false;
    }


    /* System cost */

    error =
        validateSolarInput(
            costInput,
            SOLAR_CONFIG.MIN_COST,
            SOLAR_CONFIG.MAX_COST
        );

    showSolarError(
        costInput,
        error
    );

    if (error) {
        valid = false;
    }


    /* Electricity rate */

    error =
        validateSolarInput(
            rateInput,
            SOLAR_CONFIG.MIN_RATE,
            SOLAR_CONFIG.MAX_RATE
        );

    showSolarError(
        rateInput,
        error
    );

    if (error) {
        valid = false;
    }


    return valid;
}


/* =========================================================
   SOLAR GENERATION
========================================================= */

function calculateSolarGeneration(inputs) {

    /*
        Efficiency is entered as a percentage.

        Example:
        80% -> 0.80
    */

    const efficiency =
        inputs.efficiency / 100;


    /*
        Daily generation:

        Capacity (kW)
        × Peak Sun Hours
        × Efficiency
    */

    const dailyGeneration =
        inputs.capacity *
        inputs.sunHours *
        efficiency;


    const monthlyGeneration =
        dailyGeneration *
        SOLAR_CONFIG.DAYS_PER_MONTH;


    const annualGeneration =
        dailyGeneration *
        SOLAR_CONFIG.DAYS_PER_YEAR;


    return {

        dailyGeneration,

        monthlyGeneration,

        annualGeneration
    };
}


/* =========================================================
   SOLAR OFFSET
========================================================= */

function calculateSolarOffset(
    generation,
    consumption
) {

    /*
        We do NOT assume every generated kWh
        automatically offsets grid consumption.

        Only the lesser of generation and
        consumption is counted as direct
        consumption offset.

        This avoids claiming 100% utilization.
    */

    const monthlyOffset =
        Math.min(
            generation.monthlyGeneration,
            consumption
        );


    const annualOffset =
        monthlyOffset *
        12;


    return {

        monthlyOffset,

        annualOffset
    };
}


/* =========================================================
   FINANCIAL CALCULATION
========================================================= */

function calculateSolarFinancials(
    offset,
    electricityRate,
    systemCost
) {

    const annualSavings =
        offset.annualOffset *
        electricityRate;


    let paybackYears = null;


    if (
        annualSavings > 0 &&
        systemCost >= 0
    ) {

        paybackYears =
            systemCost /
            annualSavings;
    }


    return {

        annualSavings,

        paybackYears
    };
}


/* =========================================================
   LONG-TERM PROJECTION
========================================================= */

function calculateLongTermProjection(
    annualGeneration,
    annualOffset,
    electricityRate,
    systemCost
) {

    const projection = [];

    let totalSavings = 0;

    let totalGeneration = 0;

    let previousYearGeneration =
        annualGeneration;


    for (
        let year = 1;
        year <= SOLAR_CONFIG.PROJECTION_YEARS;
        year++
    ) {

        /*
            Year 1 uses the original generation.

            Every following year loses
            0.5% due to degradation.
        */

        if (year > 1) {

            previousYearGeneration *=
                1 -
                (
                    SOLAR_CONFIG.ANNUAL_DEGRADATION /
                    100
                );
        }


        const yearlyGeneration =
            previousYearGeneration;


        /*
            Only generated electricity that
            can offset consumption is counted.
        */

        const yearlyOffset =
            Math.min(
                yearlyGeneration,
                annualOffset
            );


        const yearlySavings =
            yearlyOffset *
            electricityRate;


        totalGeneration +=
            yearlyGeneration;

        totalSavings +=
            yearlySavings;


        projection.push({

            year,

            generation:
                yearlyGeneration,

            offset:
                yearlyOffset,

            savings:
                yearlySavings
        });
    }


    /*
        Net savings after system cost.

        This is an estimate and does not include:
        maintenance
        financing
        tariff changes
        export compensation
        battery costs
        replacement costs
        taxes
    */

    const netSavings =
        totalSavings -
        systemCost;


    return {

        projection,

        totalGeneration,

        totalSavings,

        netSavings
    };
}


/* =========================================================
   UPDATE SOLAR RESULTS
========================================================= */

function updateSolarResults(
    generation,
    financials
) {

    solarSetText(
        "solar-daily",
        `${solarFormat(generation.dailyGeneration)} kWh`
    );

    solarSetText(
        "solar-monthly",
        `${solarFormat(generation.monthlyGeneration)} kWh`
    );

    solarSetText(
        "solar-yearly",
        `${solarFormat(generation.annualGeneration)} kWh`
    );


    solarSetText(
        "annual-savings",
        `₹${solarFormat(financials.annualSavings)}`
    );


    if (
        financials.paybackYears === null ||
        !Number.isFinite(
            financials.paybackYears
        )
    ) {

        solarSetText(
            "payback-period",
            "Payback cannot be estimated"
        );

    } else {

        solarSetText(
            "payback-period",
            `${solarFormat(
                financials.paybackYears,
                2
            )} years`
        );
    }
}


/* =========================================================
   SAVE SOLAR DATA
========================================================= */

function saveSolarData(data) {

    let existing = {};

    try {

        const stored =
            localStorage.getItem(
                SOLAR_CONFIG.STORAGE_KEY
            );

        if (stored) {
            existing =
                JSON.parse(stored);
        }

    } catch (error) {

        console.error(
            "Unable to read solar data.",
            error
        );
    }


    existing.solar = data;


    try {

        localStorage.setItem(
            SOLAR_CONFIG.STORAGE_KEY,
            JSON.stringify(existing)
        );

    } catch (error) {

        console.error(
            "Unable to save solar data.",
            error
        );
    }
}


/* =========================================================
   CALCULATE SOLAR
========================================================= */

function calculateSolar() {

    if (!validateSolarInputs()) {

        clearSolarResults();

        return;
    }


    const inputs =
        getSolarInputs();


    /*
        Generation
    */

    const generation =
        calculateSolarGeneration(inputs);


    /*
        Consumption offset
    */

    const offset =
        calculateSolarOffset(
            generation,
            inputs.consumption
        );


    /*
        Financials
    */

    const financials =
        calculateSolarFinancials(
            offset,
            inputs.electricityRate,
            inputs.systemCost
        );


    /*
        Long-term projection
    */

    const projection =
        calculateLongTermProjection(
            generation.annualGeneration,
            offset.annualOffset,
            inputs.electricityRate,
            inputs.systemCost
        );


    /*
        Update visible results
    */

    updateSolarResults(
        generation,
        financials
    );


    /*
        Store globally for dashboard.js
        and guide.js.
    */

    window.energyData =
        window.energyData || {};


    window.energyData.solar = {

        state:
            inputs.state,

        peakSunHours:
            inputs.sunHours,

        efficiency:
            inputs.efficiency,

        capacityKW:
            inputs.capacity,

        systemCost:
            inputs.systemCost,

        electricityRate:
            inputs.electricityRate,

        monthlyConsumption:
            inputs.consumption,

        dailyGeneration:
            generation.dailyGeneration,

        monthlyGeneration:
            generation.monthlyGeneration,

        annualGeneration:
            generation.annualGeneration,

        monthlyOffset:
            offset.monthlyOffset,

        annualOffset:
            offset.annualOffset,

        annualSavings:
            financials.annualSavings,

        paybackYears:
            financials.paybackYears,

        annualDegradation:
            SOLAR_CONFIG.ANNUAL_DEGRADATION,

        projectionYears:
            SOLAR_CONFIG.PROJECTION_YEARS,

        total25YearGeneration:
            projection.totalGeneration,

        total25YearSavings:
            projection.totalSavings,

        net25YearSavings:
            projection.netSavings,

        projection:
            projection.projection
    };


    /*
        Save to localStorage.
    */

    saveSolarData(
        window.energyData.solar
    );
}


/* =========================================================
   CLEAR RESULTS
========================================================= */

function clearSolarResults() {

    solarSetText(
        "solar-daily",
        "0 kWh"
    );

    solarSetText(
        "solar-monthly",
        "0 kWh"
    );

    solarSetText(
        "solar-yearly",
        "0 kWh"
    );

    solarSetText(
        "annual-savings",
        "₹0"
    );

    solarSetText(
        "payback-period",
        "Not calculated"
    );
}


/* =========================================================
   RESTORE SOLAR INPUTS
========================================================= */

function restoreSolarInputs() {

    let stored;

    try {

        stored =
            localStorage.getItem(
                SOLAR_CONFIG.STORAGE_KEY
            );

        if (!stored) {
            return;
        }

        stored =
            JSON.parse(stored);

    } catch (error) {

        console.error(
            "Unable to restore solar inputs.",
            error
        );

        return;
    }


    const solar =
        stored.solar;


    if (!solar) {
        return;
    }


    const consumptionInput =
        document.getElementById(
            "solar-consumption"
        );

    const efficiencyInput =
        document.getElementById(
            "system-efficiency"
        );

    const capacityInput =
        document.getElementById(
            "solar-capacity"
        );

    const costInput =
        document.getElementById(
            "system-cost"
        );

    const rateInput =
        document.getElementById(
            "solar-electricity-rate"
        );


    if (
        consumptionInput &&
        Number.isFinite(
            Number(solar.monthlyConsumption)
        )
    ) {

        consumptionInput.value =
            solar.monthlyConsumption;
    }


    if (
        efficiencyInput &&
        Number.isFinite(
            Number(solar.efficiency)
        )
    ) {

        efficiencyInput.value =
            solar.efficiency;
    }


    if (
        capacityInput &&
        Number.isFinite(
            Number(solar.capacityKW)
        )
    ) {

        capacityInput.value =
            solar.capacityKW;
    }


    if (
        costInput &&
        Number.isFinite(
            Number(solar.systemCost)
        )
    ) {

        costInput.value =
            solar.systemCost;
    }


    if (
        rateInput &&
        Number.isFinite(
            Number(solar.electricityRate)
        )
    ) {

        rateInput.value =
            solar.electricityRate;
    }


    /*
        State and peak sun hours are handled
        by calculator.js.
    */

    const stateInput =
        document.getElementById(
            "solar-state"
        );


    if (
        stateInput &&
        solar.state
    ) {

        stateInput.value =
            solar.state;

        stateInput.dispatchEvent(
            new Event("change", {
                bubbles: true
            })
        );
    }
}


/* =========================================================
   AUTO-FILL CONSUMPTION FROM CALCULATOR
========================================================= */

function connectCalculatorConsumption() {

    const consumptionInput =
        document.getElementById(
            "solar-consumption"
        );


    if (!consumptionInput) {
        return;
    }


    /*
        If the user has not entered a solar
        consumption value, use the calculator's
        monthly consumption.
    */

    if (
        consumptionInput.value === "" &&
        window.energyData &&
        Number.isFinite(
            window.energyData.monthlyEnergy
        )
    ) {

        consumptionInput.value =
            window.energyData.monthlyEnergy;
    }
}


/* =========================================================
   INPUT EVENT LISTENERS
========================================================= */

function setupSolarEvents() {

    const calculateButton =
        document.getElementById(
            "calculate-solar"
        );


    if (calculateButton) {

        calculateButton.addEventListener(
            "click",
            calculateSolar
        );
    }


    const inputIds = [

        "solar-consumption",
        "system-efficiency",
        "solar-capacity",
        "system-cost",
        "solar-electricity-rate"
    ];


    inputIds.forEach(id => {

        const input =
            document.getElementById(id);

        if (!input) {
            return;
        }

        input.addEventListener(
            "input",
            () => {

                /*
                    Validate while typing,
                    but don't force calculation.
                */

                validateSolarInputs();
            }
        );
    });


    /*
        Peak sun hours are controlled by
        calculator.js and should not be manually edited.
    */

    const sunHoursInput =
        document.getElementById(
            "sun-hours"
        );

    if (sunHoursInput) {

        sunHoursInput.addEventListener(
            "change",
            () => {

                /*
                    Recalculate only if the
                    user already has complete
                    solar inputs.
                */

                const inputs =
                    getSolarInputs();

                if (
                    inputs.state &&
                    Number.isFinite(
                        inputs.capacity
                    ) &&
                    Number.isFinite(
                        inputs.systemCost
                    ) &&
                    Number.isFinite(
                        inputs.electricityRate
                    )
                ) {

                    calculateSolar();
                }
            }
        );
    }
}


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeSolar() {

    /*
        calculator.js loads first and creates
        the state selector.
    */

    connectCalculatorConsumption();

    restoreSolarInputs();

    setupSolarEvents();
}


/* =========================================================
   START
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSolar
    );

} else {

    initializeSolar();
}