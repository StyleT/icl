
interface RelatedEntities {
    type: string;
    idColumn: string;
    key: string;
}

interface EntityConf {
    idColumn: string;
    related: RelatedEntities[],
}

const entitiesConf: Record<string, EntityConf> = {
    apps: {
        idColumn: 'name',
        related: [],
    },
    routes: {
        idColumn: 'id',
        related: [{ type: 'route_slots', idColumn: 'id', key: 'routeId' }],
    }
};

export default entitiesConf;
