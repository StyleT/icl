import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    return knex("routes").insert([
        {
            id: 1,
            orderPos: 0,
            route: '*',
            next: true,
            templateName: 'master',
        }, {
            id: 2,
            orderPos: 10,
            route: '/news/*',
            next: false,
        }, {
            id: 3,
            orderPos: 20,
            route: '/people/*',
            next: false,
        }, {
            id: 4,
            orderPos: 30,
            route: '/planets/*',
            next: false,
        }, {
            id: 7,
            specialRole: '404',
            orderPos: -10000,
            route: '',
            next: false,
            templateName: 'master',
        }, {
            id: 8,
            orderPos: 3,
            route: '/',
            next: false,
        }, {
            id: 9,
            orderPos: 40,
            route: '/wrapper/',
            next: false,
        }
    ]);
}
