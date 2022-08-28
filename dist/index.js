"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const types_1 = require("./types");
const validationMiddleware = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        return next();
    }
    catch (err) {
        return res.status(400).send(err.errors);
    }
};
const getWeatherHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cities = req.body.cities;
    const API_KEY = process.env.API_KEY;
    const LOCATION_API_BASE_URL = `http://dataservice.accuweather.com/`;
    const response = { weather: new Map() };
    for (let city of cities) {
        let URL = LOCATION_API_BASE_URL +
            "locations/v1/cities/autocomplete?" +
            `apikey=${API_KEY}&q=${city}`;
        const res1 = yield fetch(URL);
        const data1 = yield res1.json();
        //The Api returns Error with Code Property so if Property Code exists there's an error occured from the server side
        if ("Code" in data1)
            return res.send(data1).status(500);
        if (data1.length == 0)
            return res.send(`${city} Not Found`).status(404);
        if (!data1[0].Key)
            return res.send("Internal Server Error").status(500);
        const locationKey = parseInt(data1[0].Key);
        URL =
            LOCATION_API_BASE_URL +
                "currentconditions/v1/" +
                locationKey +
                `?apikey=${API_KEY}`;
        const res2 = yield fetch(URL);
        const data2 = yield res2.json();
        console.log(data2);
        if (data2.length == 0)
            return res.sendStatus(404);
        if (!data2[0].Temperature)
            return res.send("Internal Server Error").status(500);
        const temp = data2[0].Temperature.Metric.Value.toString() +
            " " +
            data2[0].Temperature.Metric.Unit;
        response.weather.set(city, temp);
        console.log(response);
    }
    return res.send({
        weather: JSON.stringify(Object.fromEntries(response.weather)),
    });
});
function main() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    dotenv_1.default.config();
    app.get("/getWeather", validationMiddleware(types_1.requestBody), getWeatherHandler);
    app.listen(8080, () => console.log("server running at port 8080"));
}
main();
