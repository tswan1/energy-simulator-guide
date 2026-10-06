/* =========================================================
   Sustainable Energy Guide
   guide.js
========================================================= */

const GUIDE_CONFIG = {

    HIGH_CONSUMPTION_PERCENT: 20,
    MEDIUM_CONSUMPTION_PERCENT: 10,

    HIGH_USAGE_HOURS: 8,
    MEDIUM_USAGE_HOURS: 4,

    MAX_RECOMMENDATIONS: 8
};


/* =========================
   Helpers
========================= */

function guideFormat(
    value,
    decimals = 2
) {

    if (!Number.isFinite(value)) {
        return "0";
    }

    return Number(value).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits:
                decimals
        }
    );
}


function getGuideMonthlyEnergy(
    appliance
) {

    return (
        appliance.quantity *
        appliance.powerWatts *
        appliance.hoursPerDay /
        1000
    ) * 30;
}


/* =========================
   Appliance Recommendations
========================= */

function generateApplianceRecommendations(
    appliance,
    monthlyEnergy,
    totalEnergy
) {

    const recommendations = [];


    if (
        totalEnergy <= 0 ||
        monthlyEnergy <= 0
    ) {
        return recommendations;
    }


    const percentage =
        (
            monthlyEnergy /
            totalEnergy
        ) * 100;


    /*
       Major energy consumer
    */

    if (
        percentage >=
        GUIDE_CONFIG
            .HIGH_CONSUMPTION_PERCENT
    ) {

        recommendations.push({

            priority: 1,

            title:
                `${appliance.name} is a major energy consumer`,

            message:
                `${appliance.name} uses approximately ` +
                `${guideFormat(monthlyEnergy)} kWh/month, ` +
                `which is ${guideFormat(
                    percentage,
                    1
                )}% of your calculated appliance consumption. ` +
                `Consider reducing its usage time or choosing ` +
                `a more energy-efficient model.`
        });
    }


    /*
       Medium energy consumer
    */

    else if (
        percentage >=
        GUIDE_CONFIG
            .MEDIUM_CONSUMPTION_PERCENT
    ) {

        recommendations.push({

            priority: 2,

            title:
                `Monitor ${appliance.name} usage`,

            message:
                `${appliance.name} accounts for about ` +
                `${guideFormat(
                    percentage,
                    1
                )}% of your calculated monthly energy use. ` +
                `Check whether unnecessary operating time can ` +
                `be reduced.`
        });
    }


    /*
       High daily usage
    */

    if (
        appliance.hoursPerDay >=
        GUIDE_CONFIG.HIGH_USAGE_HOURS
    ) {

        recommendations.push({

            priority: 1,

            title:
                `Review ${appliance.name} operating time`,

            message:
                `${appliance.name} runs for about ` +
                `${guideFormat(
                    appliance.hoursPerDay,
                    1
                )} hours/day. If some of this usage is unnecessary, ` +
                `reducing operating time could lower consumption.`
        });
    }


    /*
       Moderate daily usage
    */

    else if (
        appliance.hoursPerDay >=
        GUIDE_CONFIG.MEDIUM_USAGE_HOURS
    ) {

        recommendations.push({

            priority: 2,

            title:
                `Check ${appliance.name} usage`,

            message:
                `${appliance.name} is used for approximately ` +
                `${guideFormat(
                    appliance.hoursPerDay,
                    1
                )} hours/day. Consider reducing unnecessary usage.`
        });
    }


    return recommendations;
}


/* =========================
   General Recommendations
========================= */

function generateGeneralRecommendations(
    totalEnergy
) {

    const recommendations = [];


    if (totalEnergy <= 0) {
        return recommendations;
    }


    if (totalEnergy > 500) {

        recommendations.push({

            priority: 1,

            title:
                "Review your highest-consuming appliances",

            message:
                `Your calculated household appliance consumption ` +
                `is approximately ${guideFormat(
                    totalEnergy
                )} kWh/month. Start with the appliances contributing ` +
                `the most energy before making smaller changes.`
        });

    } else if (totalEnergy < 150) {

        recommendations.push({

            priority: 3,

            title:
                "Maintain efficient energy habits",

            message:
                `Your calculated appliance consumption is approximately ` +
                `${guideFormat(
                    totalEnergy
                )} kWh/month. Continue monitoring usage and avoid ` +
                `unnecessary energy consumption.`
        });
    }


    recommendations.push({

        priority: 3,

        title:
            "Avoid unnecessary standby usage",

        message:
            "Switch off appliances when they are not required. " +
            "For suitable devices, reducing unnecessary standby " +
            "operation can help reduce electricity consumption."
    });


    return recommendations;
}


/* =========================
   Generate Recommendations
========================= */

function generateRecommendations() {

    if (
        !window.energyData ||
        !Array.isArray(
            window.energyData.appliances
        ) ||
        window.energyData.appliances.length === 0
    ) {

        return [];
    }


    const appliances =
        window.energyData.appliances;


    const totalEnergy =
        Number(
            window.energyData.monthlyEnergy
        ) || 0;


    let recommendations = [];


    appliances.forEach(
        appliance => {

            const monthlyEnergy =
                getGuideMonthlyEnergy(
                    appliance
                );


            recommendations.push(
                ...generateApplianceRecommendations(
                    appliance,
                    monthlyEnergy,
                    totalEnergy
                )
            );
        }
    );


    recommendations.push(
        ...generateGeneralRecommendations(
            totalEnergy
        )
    );


    recommendations.sort(
        (a, b) =>
            a.priority - b.priority
    );


    return recommendations.slice(
        0,
        GUIDE_CONFIG.MAX_RECOMMENDATIONS
    );
}


/* =========================
   Display
========================= */

function displayRecommendations() {

    const container =
        document.getElementById(
            "recommendations"
        );

    if (!container) return;


    const recommendations =
        generateRecommendations();


    if (
        recommendations.length === 0
    ) {

        container.innerHTML = `
            <p>
                Add valid appliances in the Energy Calculator
                to receive recommendations.
            </p>
        `;

        return;
    }


    container.innerHTML = "";


    recommendations.forEach(
        recommendation => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "recommendation";


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                recommendation.title;


            const message =
                document.createElement(
                    "p"
                );

            message.textContent =
                recommendation.message;


            card.appendChild(title);
            card.appendChild(message);

            container.appendChild(card);
        }
    );
}


/* =========================
   Events
========================= */

function initializeGuide() {

    document.addEventListener(
        "energyDataUpdated",
        displayRecommendations
    );

    displayRecommendations();
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeGuide
    );

} else {

    initializeGuide();
}