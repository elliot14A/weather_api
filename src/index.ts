import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { AnyZodObject } from "zod";
import {
  CurrentCondition,
  GetLocationKey,
  RequestBody,
  requestBody,
} from "./types";

const validationMiddleware =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      return next();
    } catch (err: any) {
      return res.status(400).send(err.errors);
    }
  };

const getWeatherHandler = async (
  req: Request<{}, {}, RequestBody["body"]>,
  res: Response
) => {
  const cities = req.body.cities;
  const API_KEY = process.env.API_KEY;
  const LOCATION_API_BASE_URL = `http://dataservice.accuweather.com/`;
  const response = { weather: new Map() };
  for (let city of cities) {
    let URL =
      LOCATION_API_BASE_URL +
      "locations/v1/cities/autocomplete?" +
      `apikey=${API_KEY}&q=${city}`;
    const res1 = await fetch(URL);
    const data1: GetLocationKey[] = await res1.json();
    //The Api returns Error with Code Property so if Property Code exists there's an error occured in the server
    if ("Code" in data1) return res.send(data1).status(500);
    if (data1.length == 0) return res.send(`${city} Not Found`).status(404);
    if (!data1[0].Key) return res.send("Internal Server Error").status(500);
    const locationKey = parseInt(data1[0].Key);

    URL =
      LOCATION_API_BASE_URL +
      "currentconditions/v1/" +
      locationKey +
      `?apikey=${API_KEY}`;

    const res2 = await fetch(URL);
    const data2: CurrentCondition[] = await res2.json();
    console.log(data2);
    if (data2.length == 0) return res.sendStatus(404);
    if (!data2[0].Temperature)
      return res.send("Internal Server Error").status(500);
    const temp =
      data2[0].Temperature.Metric.Value.toString() +
      " " +
      data2[0].Temperature.Metric.Unit;
    response.weather.set(city, temp);
    console.log(response);
  }

  return res.send({
    weather: JSON.stringify(Object.fromEntries(response.weather)),
  });
};

function main() {
  const app = express();
  app.use(express.json());
  dotenv.config();

  app.get("/getWeather", validationMiddleware(requestBody), getWeatherHandler);

  app.listen(8080, () => console.log("server running at port 8080"));
}

main();
