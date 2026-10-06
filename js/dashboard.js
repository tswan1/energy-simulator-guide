/* =========================================================
   Sustainable Energy Guide
   dashboard.js
========================================================= */


/* =========================
   Configuration
========================= */

const DASHBOARD_CONFIG = {

    STORAGE_KEY:
        "sustainableEnergyData",

    /*
       Educational planning assumption.

       Actual grid emission factors vary by
       electricity mix and source.
    */

    CO2_FACTOR_KG_PER_KWH:
        0.82
};


/* =========================
   Chart References
========================= */

let applianceChart = null;
let consumptionChart = null;
let savingsChart = null;


/* =========================
   Helpers
========================= */

function dashboardNumber(
    value
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}


function dashboardFormat(
    value,
    decimals = 2
) {

    return dashboardNumber(
        value
    ).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits:
                decimals
        }
    );
}


/* =========================
   Get Data
========================= */

function getDashboardData() {

    if (
        window.energyData &&
        Array.isArray(
            window.energyData.appliances
        )
    ) {

        return window.energyData;
    }


    try {

        const stored =
            localStorage.getItem(
                DASHBOARD_CONFIG
                    .STORAGE_KEY
            );


        if (!stored) {
            return null;
        }


        return JSON.parse(
            stored
        );

    } catch (error) {

        console.error(
            "Unable to read dashboard data.",
            error
        );

        return null;
    }
}


/* =========================
   Appliance Data
========================= */

function getApplianceChartData(
    data
) {

    const appliances =
        Array.isArray(
            data?.appliances
        )
            ? data.appliances
            : [];


    const labels = [];
    const values = [];


    appliances.forEach(
        appliance => {

            const monthlyEnergy =
                (
                    dashboardNumber(
                        appliance.quantity
                    ) *
                    dashboardNumber(
                        appliance.powerWatts
                    ) *
                    dashboardNumber(
                        appliance.hoursPerDay
                    ) /
                    1000
                ) * 30;


            labels.push(
                appliance.name ||
                "Unnamed appliance"
            );


            values.push(
                monthlyEnergy
            );
        }
    );


    return {
        labels,
        values
    };
}


/* =========================
   Appliance Chart
========================= */

function createApplianceChart(
    data
) {

    const canvas =
        document.getElementById(
            "appliance-chart"
        );


    if (!canvas) return;


    if (applianceChart) {

        applianceChart.destroy();

        applianceChart = null;
    }


    const chartData =
        getApplianceChartData(
            data
        );


    if (
        chartData.labels.length === 0
    ) {

        return;
    }


    applianceChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels:
                        chartData.labels,

                    datasets: [
                        {
                            label:
                                "Monthly Energy (kWh)",

                            data:
                                chartData.values
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        title: {

                            display: true,

                            text:
                                "Appliance-wise Monthly Energy"
                        },

                        legend: {

                            display: false
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            title: {

                                display: true,

                                text:
                                    "Energy (kWh/month)"
                            }
                        },

                        x: {

                            title: {

                                display: true,

                                text:
                                    "Appliance"
                            }
                        }
                    }
                }
            }
        );
}


/* =========================
   Consumption Chart
========================= */

function createConsumptionChart(
    data
) {

    const canvas =
        document.getElementById(
            "consumption-chart"
        );


    if (!canvas) return;


    if (consumptionChart) {

        consumptionChart.destroy();

        consumptionChart = null;
    }


    const daily =
        dashboardNumber(
            data?.dailyEnergy
        );


    const monthly =
        dashboardNumber(
            data?.monthlyEnergy
        );


    const yearly =
        dashboardNumber(
            data?.yearlyEnergy
        );


    consumptionChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels: [
                        "Daily",
                        "Monthly",
                        "Yearly"
                    ],

                    datasets: [
                        {
                            label:
                                "Energy Consumption",

                            data: [
                                daily,
                                monthly,
                                yearly
                            ]
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        title: {

                            display: true,

                            text:
                                "Energy Consumption Overview"
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            title: {

                                display: true,

                                text:
                                    "Energy (kWh)"
                            }
                        }
                    }
                }
            }
        );
}


/* =========================
   Solar Chart
========================= */

function createSavingsChart(
    data
) {

    const canvas =
        document.getElementById(
            "savings-chart"
        );


    if (!canvas) return;


    if (savingsChart) {

        savingsChart.destroy();

        savingsChart = null;
    }


    const solar =
        data?.solar;


    if (!solar) {

        savingsChart =
            new Chart(
                canvas,
                {
                    type: "bar",

                    data: {

                        labels: [
                            "Solar data"
                        ],

                        datasets: [
                            {
                                label:
                                    "No solar simulation calculated",

                                data: [0]
                            }
                        ]
                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        plugins: {

                            title: {

                                display: true,

                                text:
                                    "Solar Savings"
                            },

                            legend: {

                                display: false
                            }
                        },

                        scales: {

                            y: {

                                beginAtZero:
                                    true
                            }
                        }
                    }
                }
            );

        return;
    }


    const annualGeneration =
        dashboardNumber(
            solar.annualGeneration
        );


    const annualSavings =
        dashboardNumber(
            solar.annualSavings
        );


    const net25YearSavings =
        dashboardNumber(
            solar.net25YearSavings
        );


    savingsChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels: [
                        "Annual Solar Generation",
                        "Annual Savings",
                        "25-Year Net Savings"
                    ],

                    datasets: [
                        {
                            label:
                                "Solar Simulation",

                            data: [
                                annualGeneration,
                                annualSavings,
                                net25YearSavings
                            ]
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        title: {

                            display: true,

                            text:
                                "Solar Generation and Savings"
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true
                        }
                    }
                }
            }
        );
}


/* =========================
   Dashboard Summary
========================= */

function updateDashboardSummary(
    data
) {

    const existing =
        document.getElementById(
            "dashboard-summary"
        );


    if (existing) {
        existing.remove();
    }


    const dashboard =
        document.getElementById(
            "dashboard"
        );


    if (!dashboard) return;


    const summary =
        document.createElement(
            "div"
        );


    summary.id =
        "dashboard-summary";

    summary.className =
        "dashboard-summary";


    const monthlyEnergy =
        dashboardNumber(
            data?.monthlyEnergy
        );


    const monthlyCost =
        dashboardNumber(
            data?.monthlyCost
        );


    const solar =
        data?.solar;


    const solarGeneration =
        dashboardNumber(
            solar?.annualGeneration
        );


    const annualSolarSavings =
        dashboardNumber(
            solar?.annualSavings
        );


    /*
       Estimated avoided CO2 from solar.

       We use the annual solar energy that
       directly offsets consumption.
    */

    const annualOffset =
        dashboardNumber(
            solar?.annualOffset
        );


    const annualCO2Reduction =
        annualOffset *
        DASHBOARD_CONFIG
            .CO2_FACTOR_KG_PER_KWH;


    summary.innerHTML = `

        <div class="dashboard-card">

            <span>Monthly Consumption</span>

            <strong>
                ${dashboardFormat(
                    monthlyEnergy
                )} kWh
            </strong>

        </div>


        <div class="dashboard-card">

            <span>Estimated Monthly Cost</span>

            <strong>
                ₹${dashboardFormat(
                    monthlyCost
                )}
            </strong>

        </div>


        <div class="dashboard-card">

            <span>Annual Solar Generation</span>

            <strong>
                ${dashboardFormat(
                    solarGeneration
                )} kWh
            </strong>

        </div>


        <div class="dashboard-card">

            <span>Annual Solar Savings</span>

            <strong>
                ₹${dashboardFormat(
                    annualSolarSavings
                )}
            </strong>

        </div>


        <div class="dashboard-card">

            <span>Estimated Annual CO₂ Reduction</span>

            <strong>
                ${dashboardFormat(
                    annualCO2Reduction
                )} kg
            </strong>

        </div>


        <p class="dashboard-note">

            CO₂ reduction is an educational estimate using
            an assumed grid-emission factor of
            ${DASHBOARD_CONFIG.CO2_FACTOR_KG_PER_KWH}
            kg CO₂/kWh. Actual emissions vary with the
            electricity generation mix.

        </p>
    `;


    const heading =
        dashboard.querySelector(
            "h1"
        );


    if (heading) {

        heading.insertAdjacentElement(
            "afterend",
            summary
        );
    }
}


/* =========================
   Update Dashboard
========================= */

function updateDashboard() {

    const data =
        getDashboardData();


    if (!data) {

        createApplianceChart(
            {
                appliances: []
            }
        );

        return;
    }


    createApplianceChart(
        data
    );


    createConsumptionChart(
        data
    );


    createSavingsChart(
        data
    );


    updateDashboardSummary(
        data
    );
}


/* =========================
   Initialization
========================= */

function initializeDashboard() {

    updateDashboard();


    /*
       Calculator changes.
    */

    document.addEventListener(
        "energyDataUpdated",
        updateDashboard
    );


    /*
       Solar calculation changes.
       solar.js does not currently dispatch
       an event, so we also listen for clicks
       on the solar calculation button.
    */

    const solarButton =
        document.getElementById(
            "calculate-solar"
        );


    if (solarButton) {

        solarButton.addEventListener(
            "click",
            () => {

                /*
                   Allow solar.js to finish
                   updating window.energyData.
                */

                setTimeout(
                    updateDashboard,
                    0
                );
            }
        );
    }
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );

} else {

    initializeDashboard();
}