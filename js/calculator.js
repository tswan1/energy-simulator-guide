/* =========================================================
   Sustainable Energy Guide
   calculator.js
========================================================= */


/* =========================
   Configuration
========================= */

const CALCULATOR_CONFIG = {

    DAYS_PER_MONTH: 30,
    DAYS_PER_YEAR: 365,

    MAX_APPLIANCES: 50,

    INPUT_RANGES: {
        quantity: {
            min: 1,
            max: 50
        },

        powerWatts: {
            min: 1,
            max: 10000
        },

        hoursPerDay: {
            min: 0,
            max: 24
        },

        electricityRate: {
            min: 0,
            max: 1000
        }
    },

    /*
       Typical planning values.

       These are not exact ratings for every appliance.
       Actual appliance power varies by model and efficiency.
    */

    APPLIANCES: {
        "LED Bulb": 9,
        "Ceiling Fan": 60,
        "Table / Wall Fan": 50,
        "Television": 100,
        "Refrigerator": 150,
        "Air Conditioner": 1500,
        "Washing Machine": 500,
        "Water Heater / Geyser": 2000,
        "Microwave Oven": 1200,
        "Induction Cooktop": 1800,
        "Electric Iron": 1000,
        "Laptop": 60,
        "Desktop Computer": 200,
        "Water Pump": 750,
        "Mixer Grinder": 500,
        "Room Cooler": 200,
        "Electric Kettle": 1500,
        "Other Appliance": null
    },

    STORAGE_KEY: "sustainableEnergyData",

    /*
       State-level solar-resource planning estimates.
    */

    INDIA_SOLAR_RESOURCE: {
        "Andhra Pradesh": 5.59,
        "Arunachal Pradesh": 3.60,
        "Assam": 4.15,
        "Bihar": 4.68,
        "Chhattisgarh": 5.20,
        "Goa": 5.17,
        "Gujarat": 4.35,
        "Haryana": 3.95,
        "Himachal Pradesh": 3.50,
        "Jharkhand": 5.10,
        "Karnataka": 5.55,
        "Kerala": 4.84,
        "Madhya Pradesh": 3.45,
        "Maharashtra": 3.50,
        "Manipur": 4.68,
        "Meghalaya": 4.75,
        "Mizoram": 4.65,
        "Nagaland": 4.12,
        "Odisha": 4.35,
        "Punjab": 4.76,
        "Rajasthan": 5.50,
        "Sikkim": 2.72,
        "Tamil Nadu": 5.44,
        "Telangana": 5.72,
        "Tripura": 4.64,
        "Uttar Pradesh": 3.40,
        "Uttarakhand": 4.86,
        "West Bengal": 4.82,
        "Andaman and Nicobar Islands": 4.98,
        "Chandigarh": 5.51,
        "Dadra and Nagar Haveli and Daman and Diu": 5.24,
        "Delhi": 4.70,
        "Jammu and Kashmir": 3.50,
        "Ladakh": 4.30,
        "Lakshadweep": 5.40,
        "Puducherry": 5.46
    }
};


/* =========================
   Application State
========================= */

window.energyData = {
    appliances: [],
    dailyEnergy: 0,
    monthlyEnergy: 0,
    yearlyEnergy: 0,
    electricityRate: 0,
    monthlyCost: 0,
    solar: null
};


/* =========================
   Utility Functions
========================= */

function calculatorNumber(value) {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : NaN;
}


function formatCalculatorNumber(
    value,
    decimals = 2
) {
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


function generateApplianceId() {
    return (
        "appliance-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}


/* =========================
   Navigation
========================= */

function setupNavigation() {

    const navigationButtons =
        document.querySelectorAll(
            "[data-section]"
        );

    navigationButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const sectionId =
                    button.dataset.section;

                document
                    .querySelectorAll(".section")
                    .forEach(section => {
                        section.classList.remove(
                            "active"
                        );
                    });

                const target =
                    document.getElementById(
                        sectionId
                    );

                if (target) {
                    target.classList.add(
                        "active"
                    );
                }

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        );
    });
}


/* =========================
   Appliance Validation
========================= */

function validateApplianceName(name) {

    const trimmed =
        String(name || "").trim();

    if (trimmed.length < 2) {
        return "Appliance name must contain at least 2 characters.";
    }

    if (trimmed.length > 40) {
        return "Appliance name cannot exceed 40 characters.";
    }

    /*
       Prevent HTML/script-like input.
    */

    if (
        /<[^>]*>/i.test(trimmed) ||
        /javascript\s*:/i.test(trimmed)
    ) {
        return "Invalid appliance name.";
    }

    /*
       Allow:
       letters
       numbers
       spaces
       hyphens
       slash
       ampersand
       parentheses
       period
    */

    if (
        !/^[a-zA-Z0-9\s\-\/&().]+$/.test(
            trimmed
        )
    ) {
        return "Use letters, numbers, spaces, hyphens and basic punctuation only.";
    }

    return "";
}


function validateAppliance(
    appliance,
    allAppliances = []
) {

    if (!appliance) {
        return "Invalid appliance.";
    }

    const nameError =
        validateApplianceName(
            appliance.name
        );

    if (nameError) {
        return nameError;
    }

    const quantity =
        calculatorNumber(
            appliance.quantity
        );

    if (
        !Number.isInteger(quantity) ||
        quantity <
            CALCULATOR_CONFIG.INPUT_RANGES
                .quantity.min ||
        quantity >
            CALCULATOR_CONFIG.INPUT_RANGES
                .quantity.max
    ) {
        return "Quantity must be an integer between 1 and 50.";
    }

    const power =
        calculatorNumber(
            appliance.powerWatts
        );

    if (
        !Number.isFinite(power) ||
        power <
            CALCULATOR_CONFIG.INPUT_RANGES
                .powerWatts.min ||
        power >
            CALCULATOR_CONFIG.INPUT_RANGES
                .powerWatts.max
    ) {
        return "Power must be between 1 and 10,000 W.";
    }

    const hours =
        calculatorNumber(
            appliance.hoursPerDay
        );

    if (
        !Number.isFinite(hours) ||
        hours <
            CALCULATOR_CONFIG.INPUT_RANGES
                .hoursPerDay.min ||
        hours >
            CALCULATOR_CONFIG.INPUT_RANGES
                .hoursPerDay.max
    ) {
        return "Usage must be between 0 and 24 hours/day.";
    }

    const duplicate =
        allAppliances.some(
            other =>
                other.id !== appliance.id &&
                other.name.trim().toLowerCase() ===
                    appliance.name.trim().toLowerCase()
        );

    if (duplicate) {
        return "Duplicate appliance names are not allowed.";
    }

    return "";
}


/* =========================
   Appliance Energy
========================= */

function calculateApplianceDailyEnergy(
    appliance
) {

    return (
        appliance.quantity *
        appliance.powerWatts *
        appliance.hoursPerDay
    ) / 1000;
}


function calculateApplianceMonthlyEnergy(
    appliance
) {

    return (
        calculateApplianceDailyEnergy(
            appliance
        ) *
        CALCULATOR_CONFIG.DAYS_PER_MONTH
    );
}


/* =========================
   Appliance Row
========================= */

function createApplianceRow(
    appliance
) {

    const row =
        document.createElement("div");

    row.className =
        "appliance-row";

    row.dataset.id =
        appliance.id;


    /* Appliance selector */

    const applianceGroup =
        document.createElement("div");

    applianceGroup.className =
        "appliance-field";


    const applianceLabel =
        document.createElement("label");

    applianceLabel.textContent =
        "Appliance";


    const select =
        document.createElement("select");

    select.className =
        "appliance-select";


    Object.entries(
        CALCULATOR_CONFIG.APPLIANCES
    ).forEach(
        ([name, power]) => {

            const option =
                document.createElement("option");

            option.value = name;
            option.textContent = name;

            select.appendChild(option);
        }
    );


    select.value =
        appliance.presetName ||
        "Other Appliance";


    applianceGroup.appendChild(
        applianceLabel
    );

    applianceGroup.appendChild(
        select
    );


    /* Custom name */

    const nameGroup =
        document.createElement("div");

    nameGroup.className =
        "appliance-field custom-name-field";


    const nameLabel =
        document.createElement("label");

    nameLabel.textContent =
        "Custom Name";


    const nameInput =
        document.createElement("input");

    nameInput.type =
        "text";

    nameInput.className =
        "appliance-name";

    nameInput.placeholder =
        "e.g. Air Purifier";

    nameInput.maxLength =
        40;

    nameInput.value =
        appliance.name || "";


    nameGroup.appendChild(
        nameLabel
    );

    nameGroup.appendChild(
        nameInput
    );


    /* Quantity */

    const quantityGroup =
        document.createElement("div");

    quantityGroup.className =
        "appliance-field";


    const quantityLabel =
        document.createElement("label");

    quantityLabel.textContent =
        "Quantity";


    const quantityInput =
        document.createElement("input");

    quantityInput.type =
        "number";

    quantityInput.className =
        "appliance-quantity";

    quantityInput.min = 1;
    quantityInput.max = 50;
    quantityInput.step = 1;

    quantityInput.value =
        appliance.quantity;


    quantityGroup.appendChild(
        quantityLabel
    );

    quantityGroup.appendChild(
        quantityInput
    );


    /* Power */

    const powerGroup =
        document.createElement("div");

    powerGroup.className =
        "appliance-field";


    const powerLabel =
        document.createElement("label");

    powerLabel.textContent =
        "Power (W)";


    const powerInput =
        document.createElement("input");

    powerInput.type =
        "number";

    powerInput.className =
        "appliance-power";

    powerInput.min = 1;
    powerInput.max = 10000;
    powerInput.step = 1;

    powerInput.value =
        appliance.powerWatts;


    powerGroup.appendChild(
        powerLabel
    );

    powerGroup.appendChild(
        powerInput
    );


    /* Hours */

    const hoursGroup =
        document.createElement("div");

    hoursGroup.className =
        "appliance-field";


    const hoursLabel =
        document.createElement("label");

    hoursLabel.textContent =
        "Usage (hours/day)";


    const hoursInput =
        document.createElement("input");

    hoursInput.type =
        "number";

    hoursInput.className =
        "appliance-hours";

    hoursInput.min = 0;
    hoursInput.max = 24;
    hoursInput.step = 0.1;

    hoursInput.value =
        appliance.hoursPerDay;


    hoursGroup.appendChild(
        hoursLabel
    );

    hoursGroup.appendChild(
        hoursInput
    );


    /* Remove */

    const removeButton =
        document.createElement("button");

    removeButton.type =
        "button";

    removeButton.className =
        "remove-appliance";

    removeButton.textContent =
        "Remove";


    row.appendChild(
        applianceGroup
    );

    row.appendChild(
        nameGroup
    );

    row.appendChild(
        quantityGroup
    );

    row.appendChild(
        powerGroup
    );

    row.appendChild(
        hoursGroup
    );

    row.appendChild(
        removeButton
    );


    /* =========================
       Preset Behaviour
    ========================= */

    function applyPreset() {

        const selected =
            select.value;

        if (
            selected ===
            "Other Appliance"
        ) {

            nameInput.disabled = false;

            powerInput.disabled = false;

            nameInput.value =
                appliance.presetName ===
                    "Other Appliance"
                    ? appliance.name
                    : "";

            if (
                !nameInput.value
            ) {
                nameInput.placeholder =
                    "Enter appliance name";
            }

            return;
        }


        const presetPower =
            CALCULATOR_CONFIG.APPLIANCES[
                selected
            ];

        nameInput.disabled =
            true;

        powerInput.disabled =
            true;

        nameInput.value =
            selected;

        powerInput.value =
            presetPower;
    }


    select.addEventListener(
        "change",
        () => {

            applyPreset();

            updateApplianceFromRow(
                row
            );

            calculateEnergy();
        }
    );


    /*
       Custom appliance fields
       are only editable for Other Appliance.
    */

    nameInput.addEventListener(
        "input",
        () => {
            updateApplianceFromRow(row);
            calculateEnergy();
        }
    );


    quantityInput.addEventListener(
        "input",
        () => {
            updateApplianceFromRow(row);
            calculateEnergy();
        }
    );


    powerInput.addEventListener(
        "input",
        () => {
            updateApplianceFromRow(row);
            calculateEnergy();
        }
    );


    hoursInput.addEventListener(
        "input",
        () => {
            updateApplianceFromRow(row);
            calculateEnergy();
        }
    );


    removeButton.addEventListener(
        "click",
        () => {

            window.energyData.appliances =
                window.energyData.appliances.filter(
                    item =>
                        item.id !==
                        appliance.id
                );

            row.remove();

            updateAddButtonState();

            calculateEnergy();
        }
    );


    applyPreset();

    return row;
}


/* =========================
   Update Appliance
========================= */

function updateApplianceFromRow(
    row
) {

    const id =
        row.dataset.id;

    const appliance =
        window.energyData.appliances.find(
            item =>
                item.id === id
        );

    if (!appliance) return;


    const select =
        row.querySelector(
            ".appliance-select"
        );

    const nameInput =
        row.querySelector(
            ".appliance-name"
        );

    const quantityInput =
        row.querySelector(
            ".appliance-quantity"
        );

    const powerInput =
        row.querySelector(
            ".appliance-power"
        );

    const hoursInput =
        row.querySelector(
            ".appliance-hours"
        );


    appliance.presetName =
        select.value;


    appliance.name =
        nameInput.value.trim();


    appliance.quantity =
        calculatorNumber(
            quantityInput.value
        );


    appliance.powerWatts =
        calculatorNumber(
            powerInput.value
        );


    appliance.hoursPerDay =
        calculatorNumber(
            hoursInput.value
        );
}


/* =========================
   Add Appliance
========================= */

function addAppliance(
    data = null
) {

    if (
        window.energyData.appliances.length >=
        CALCULATOR_CONFIG.MAX_APPLIANCES
    ) {

        alert(
            "You can add a maximum of 50 appliances."
        );

        return;
    }


    const appliance =
        data || {
            id: generateApplianceId(),
            presetName: "LED Bulb",
            name: "LED Bulb",
            quantity: 1,
            powerWatts: 9,
            hoursPerDay: 1
        };


    window.energyData.appliances.push(
        appliance
    );


    renderAppliances();

    updateAddButtonState();

    calculateEnergy();
}


/* =========================
   Render Appliances
========================= */

function renderAppliances() {

    const container =
        document.getElementById(
            "appliance-list"
        );

    if (!container) return;

    container.innerHTML = "";


    window.energyData.appliances.forEach(
        appliance => {

            const row =
                createApplianceRow(
                    appliance
                );

            container.appendChild(
                row
            );
        }
    );
}


/* =========================
   Add Button State
========================= */

function updateAddButtonState() {

    const button =
        document.getElementById(
            "add-appliance"
        );

    if (!button) return;


    const count =
        window.energyData.appliances.length;


    button.disabled =
        count >=
        CALCULATOR_CONFIG.MAX_APPLIANCES;


    if (
        count >=
        CALCULATOR_CONFIG.MAX_APPLIANCES
    ) {

        button.textContent =
            "Maximum of 50 appliances reached";

    } else {

        button.textContent =
            "+ Add Appliance";
    }
}


/* =========================
   Electricity Rate
========================= */

function getElectricityRate() {

    const input =
        document.getElementById(
            "electricity-rate"
        );

    if (!input) return NaN;

    return calculatorNumber(
        input.value
    );
}


function validateElectricityRate() {

    const input =
        document.getElementById(
            "electricity-rate"
        );

    if (!input) {
        return false;
    }


    const value =
        getElectricityRate();


    if (
        input.value === "" ||
        !Number.isFinite(value)
    ) {

        showCalculatorError(
            input,
            "Electricity rate is required."
        );

        return false;
    }


    if (
        value <
            CALCULATOR_CONFIG
                .INPUT_RANGES
                .electricityRate.min ||
        value >
            CALCULATOR_CONFIG
                .INPUT_RANGES
                .electricityRate.max
    ) {

        showCalculatorError(
            input,
            "Electricity rate must be between ₹0 and ₹1,000/kWh."
        );

        return false;
    }


    showCalculatorError(
        input,
        ""
    );

    return true;
}


/* =========================
   Validation Display
========================= */

function showCalculatorError(
    input,
    message
) {

    if (!input) return;


    input.classList.toggle(
        "input-error",
        Boolean(message)
    );


    let error =
        input.parentElement
            ?.parentElement
            ?.querySelector(
                ".error-message"
            );


    if (!error) {

        error =
            document.createElement(
                "span"
            );

        error.className =
            "error-message";

        input.parentElement
            ?.parentElement
            ?.appendChild(error);
    }


    error.textContent =
        message || "";
}


/* =========================
   Calculate Energy
========================= */

function calculateEnergy() {

    let valid = true;

    let dailyEnergy = 0;


    const appliances =
        window.energyData.appliances;


    appliances.forEach(
        appliance => {

            const error =
                validateAppliance(
                    appliance,
                    appliances
                );


            const row =
                document.querySelector(
                    `.appliance-row[data-id="${appliance.id}"]`
                );


            if (row) {

                const inputs =
                    row.querySelectorAll(
                        "input"
                    );

                inputs.forEach(input => {

                    input.classList.remove(
                        "input-error"
                    );
                });


                if (error) {

                    valid = false;

                    const nameInput =
                        row.querySelector(
                            ".appliance-name"
                        );

                    showCalculatorError(
                        nameInput,
                        error
                    );
                }
            }


            if (!error) {

                dailyEnergy +=
                    calculateApplianceDailyEnergy(
                        appliance
                    );
            }
        }
    );


    if (
        !validateElectricityRate()
    ) {
        valid = false;
    }


    if (!valid) {

        updateDisplayedResults(
            0,
            0,
            0,
            0
        );

        return;
    }


    const monthlyEnergy =
        dailyEnergy *
        CALCULATOR_CONFIG.DAYS_PER_MONTH;


    const yearlyEnergy =
        dailyEnergy *
        CALCULATOR_CONFIG.DAYS_PER_YEAR;


    const electricityRate =
        getElectricityRate();


    const monthlyCost =
        monthlyEnergy *
        electricityRate;


    window.energyData.dailyEnergy =
        dailyEnergy;

    window.energyData.monthlyEnergy =
        monthlyEnergy;

    window.energyData.yearlyEnergy =
        yearlyEnergy;

    window.energyData.electricityRate =
        electricityRate;

    window.energyData.monthlyCost =
        monthlyCost;


    updateDisplayedResults(
        dailyEnergy,
        monthlyEnergy,
        yearlyEnergy,
        monthlyCost
    );


    saveData();


    /*
       Notify guide and dashboard.
    */

    document.dispatchEvent(
        new Event(
            "energyDataUpdated"
        )
    );
}


/* =========================
   Display Results
========================= */

function updateDisplayedResults(
    daily,
    monthly,
    yearly,
    cost
) {

    const dailyElement =
        document.getElementById(
            "daily-energy"
        );

    const monthlyElement =
        document.getElementById(
            "monthly-energy"
        );

    const yearlyElement =
        document.getElementById(
            "yearly-energy"
        );

    const costElement =
        document.getElementById(
            "monthly-cost"
        );


    if (dailyElement) {

        dailyElement.textContent =
            `${formatCalculatorNumber(
                daily
            )} kWh`;
    }


    if (monthlyElement) {

        monthlyElement.textContent =
            `${formatCalculatorNumber(
                monthly
            )} kWh`;
    }


    if (yearlyElement) {

        yearlyElement.textContent =
            `${formatCalculatorNumber(
                yearly
            )} kWh`;
    }


    if (costElement) {

        costElement.textContent =
            `₹${formatCalculatorNumber(
                cost
            )}`;
    }
}


/* =========================
   localStorage
========================= */

function saveData() {

    try {

        localStorage.setItem(
            CALCULATOR_CONFIG.STORAGE_KEY,
            JSON.stringify(
                window.energyData
            )
        );

    } catch (error) {

        console.error(
            "Unable to save energy data.",
            error
        );
    }
}


function loadSavedData() {

    try {

        const stored =
            localStorage.getItem(
                CALCULATOR_CONFIG.STORAGE_KEY
            );

        if (!stored) return;

        const data =
            JSON.parse(stored);


        if (
            data &&
            Array.isArray(
                data.appliances
            )
        ) {

            window.energyData =
                {
                    ...window.energyData,
                    ...data
                };


            /*
               Repair old records that may not
               have a presetName.
            */

            window.energyData.appliances =
                data.appliances.map(
                    appliance => ({

                        id:
                            appliance.id ||
                            generateApplianceId(),

                        presetName:
                            appliance.presetName ||
                            (
                                CALCULATOR_CONFIG
                                    .APPLIANCES[
                                        appliance.name
                                    ]
                                    ? appliance.name
                                    : "Other Appliance"
                            ),

                        name:
                            appliance.name ||
                            "",

                        quantity:
                            calculatorNumber(
                                appliance.quantity
                            ),

                        powerWatts:
                            calculatorNumber(
                                appliance.powerWatts
                            ),

                        hoursPerDay:
                            calculatorNumber(
                                appliance.hoursPerDay
                            )
                    })
                );
        }


        if (
            Number.isFinite(
                Number(
                    data.electricityRate
                )
            )
        ) {

            const rateInput =
                document.getElementById(
                    "electricity-rate"
                );

            if (rateInput) {

                rateInput.value =
                    data.electricityRate;
            }
        }

    } catch (error) {

        console.error(
            "Unable to load saved data.",
            error
        );
    }
}


/* =========================
   India Solar Selector
========================= */

function setupIndiaSolarSelector() {

    const formGrid =
        document.querySelector(
            "#solar .form-grid"
        );

    if (!formGrid) return;


    if (
        document.getElementById(
            "solar-state"
        )
    ) {
        return;
    }


    const group =
        document.createElement(
            "div"
        );

    group.className =
        "input-group";


    const label =
        document.createElement(
            "label"
        );

    label.htmlFor =
        "solar-state";

    label.textContent =
        "State / Union Territory";


    const select =
        document.createElement(
            "select"
        );

    select.id =
        "solar-state";


    const placeholder =
        document.createElement(
            "option"
        );

    placeholder.value = "";

    placeholder.textContent =
        "Select your state / UT";

    placeholder.disabled =
        true;

    placeholder.selected =
        true;

    select.appendChild(
        placeholder
    );


    Object.keys(
        CALCULATOR_CONFIG
            .INDIA_SOLAR_RESOURCE
    )
        .sort()
        .forEach(state => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                state;

            option.textContent =
                state;

            select.appendChild(
                option
            );
        });


    const note =
        document.createElement(
            "small"
        );

    note.textContent =
        "State-level solar-resource planning estimate; actual rooftop output varies by site.";


    group.appendChild(label);
    group.appendChild(select);
    group.appendChild(note);

    formGrid.prepend(group);


    select.addEventListener(
        "change",
        () => {

            const resource =
                CALCULATOR_CONFIG
                    .INDIA_SOLAR_RESOURCE[
                        select.value
                    ];


            const sunHours =
                document.getElementById(
                    "sun-hours"
                );


            if (
                sunHours &&
                Number.isFinite(
                    resource
                )
            ) {

                sunHours.value =
                    resource;
            }


            saveSolarState();
        }
    );
}


function saveSolarState() {

    const stateInput =
        document.getElementById(
            "solar-state"
        );

    if (!stateInput) return;


    try {

        const stored =
            localStorage.getItem(
                CALCULATOR_CONFIG
                    .STORAGE_KEY
            );


        const data =
            stored
                ? JSON.parse(stored)
                : {};


        data.solar =
            data.solar || {};

        data.solar.state =
            stateInput.value;


        localStorage.setItem(
            CALCULATOR_CONFIG
                .STORAGE_KEY,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            "Unable to save solar state.",
            error
        );
    }
}


/* =========================
   Initialize
========================= */

function initializeCalculator() {

    setupNavigation();

    setupIndiaSolarSelector();

    loadSavedData();


    /*
       If there are no saved appliances,
       start with one common appliance.
    */

    if (
        !Array.isArray(
            window.energyData.appliances
        ) ||
        window.energyData.appliances.length === 0
    ) {

        addAppliance();

    } else {

        renderAppliances();

        updateAddButtonState();

        calculateEnergy();
    }


    const addButton =
        document.getElementById(
            "add-appliance"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            () => {

                addAppliance();
            }
        );
    }


    const rateInput =
        document.getElementById(
            "electricity-rate"
        );


    if (rateInput) {

        rateInput.addEventListener(
            "input",
            calculateEnergy
        );
    }
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCalculator
    );

} else {

    initializeCalculator();
}