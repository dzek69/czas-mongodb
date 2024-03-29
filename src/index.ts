import mdb from "mongodb";
import type { Collection } from "mongodb";
import type { Persistence, DateConfig, Action as ActionParam } from "czas";

const createDriver = (collection: Collection, onLoad?: () => void): Persistence => {
    const callbacks: Persistence = {
        add: async (config, action, name) => {
            const i = await collection.insertOne({
                config,
                action,
                name,
            });
            return String(i.insertedId);
        },
        update: async (id, config, action, name) => {
            await collection.updateOne({ _id: new mdb.ObjectId(id) }, {
                $set: {
                    config, action, name,
                },
            });
        },
        remove: async (_id) => {
            await collection.deleteOne({
                _id: new mdb.ObjectId(_id),
            });
        },
        load: async () => {
            const list = await collection.find({}).toArray() as {
                _id: mdb.ObjectId;
                name: string;
                config: DateConfig;
                action: ActionParam;
            }[];

            return list.map(i => ({
                ...i,
                id: String(i._id),
            }));
        },
    };

    if (onLoad) {
        callbacks.onLoad = onLoad;
    }

    return callbacks;
};

export {
    createDriver,
};
