const app = require("../../apiServer");

async function GET_factors(req, res, next) {
    console.log("GETTING FACTORS");

    const data = [
        { name: "-4.75", quantity: 456 },
        { name: "-4.25", quantity: 230 },
        { name: "-3.75", quantity: 345 },
        { name: "-3.25", quantity: 450 },
        { name: "-2.75", quantity: 321 },
        { name: "-2.25", quantity: 235 },
        { name: "-1.75", quantity: 267 },
        { name: "-1.25", quantity: 378 },
        { name: "-0.75", quantity: 210 },
        { name: "-0.25", quantity: 23 },
        { name: "0.25", quantity: 45 },
        { name: "0.75", quantity: 90 },
        { name: "1.25", quantity: 130 },
        { name: "1.75", quantity: 11 },
        { name: "2.25", quantity: 107 },
        { name: "2.75", quantity: 926 },
        { name: "3.25", quantity: 653 },
        { name: "3.75", quantity: 366 },
        { name: "4.25", quantity: 486 },
        { name: "4.75", quantity: 512 }
    ];

    const factors = [
        {
            name: "Honesty-Humility",
            dataPoints: data,
            average: 2.3,
            stdDev: 0.41
        },
        { name: "Extraversion", dataPoints: data, average: 2.3, stdDev: 0.41 },
        {
            name: "Dinglification",
            dataPoints: data,
            average: -1.6,
            stdDev: 0.53
        }
    ];

    return res.status(200).send({ factors });
}

app.get("/admin/dataDisplay/factors", GET_factors);

module.exports = {
    GET_factors
};
