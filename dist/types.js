"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestBody = void 0;
const zod_1 = require("zod");
exports.requestBody = (0, zod_1.object)({
    body: (0, zod_1.object)({
        cities: (0, zod_1.array)((0, zod_1.string)().min(3))
    })
});
