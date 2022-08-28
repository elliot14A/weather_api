import { array, object, string, TypeOf } from "zod"

export type GetLocationKey = {
    Key: string,
    LocalizedName: string
}

export type CurrentCondition = {
    Temperature: {
        Metric :{
            Value: number,
            Unit: string
        }
    }
}

export const requestBody = object({
    body: object({
        cities: array(string().min(3))
    })
})

export type RequestBody = TypeOf<typeof requestBody>;