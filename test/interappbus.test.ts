import { conn } from './connect';
import * as assert from 'assert';
import { connect as rawConnect, Fin } from '../src/main';
import { cleanOpenRuntimes } from './multi-runtime-utils';

const id = 'adapter-test-window';
const topic = 'topic';
const topic2 = 'topic2';
const topic3 = 'topic3';

// tslint:disable-next-line
const m = Math.random().toString(36).slice(2);

// tslint:disable-next-line
function noop() { }

describe('InterApplicationBus.', () => {
    let fin: Fin;

    before(async () => {
        await cleanOpenRuntimes();
    });

    beforeEach(async () => {
        fin = await conn();
    });

    it('subscribe to * and publish', (done) => {
        fin.InterApplicationBus.subscribe({ uuid: '*' }, topic, (...got: any[]) => {
            done();
        }).then(() => fin.InterApplicationBus.publish(topic, m));
    });

    it('subscribe to a specified application and publish', (done) => {
        fin.InterApplicationBus.subscribe(fin.me, topic3, (...got: any[]) => {
            done();
        }).then(() => fin.InterApplicationBus.publish(topic3, m));
    });

    it('subscriber added', done => {

        rawConnect({
            address: 'ws://localhost:9696',
            uuid: 'SUBSCRIBER_ADDED'
        }).then((otherFin) => {
            const iab = otherFin.InterApplicationBus;
            const appid = { uuid: 'SUBSCRIBER_ADDED' };
            const topic = 'SUBSCRIBER_ADDED';

            iab.on(iab.events.subscriberAdded, () => {
                iab.removeAllListeners(iab.events.subscriberAdded);
                done();
            });

            fin.InterApplicationBus.subscribe(appid, topic, noop);
        });
    });

    it('subscriber removed', (done) => {

        rawConnect({
            address: 'ws://localhost:9696',
            uuid: 'SUBSCRIBER_REMOVED'
        }).then((otherFin) => {
            const iab = otherFin.InterApplicationBus;
            const appid = { uuid: 'SUBSCRIBER_REMOVED' };
            const topic = 'SUBSCRIBER_REMOVED';

            iab.on(iab.events.subscriberRemoved, () => {
                iab.removeAllListeners(iab.events.subscriberRemoved);
                done();
            });

            fin.InterApplicationBus.subscribe(appid, topic, noop)
                .then(() => {
                    return fin.InterApplicationBus.unsubscribe(appid, topic, noop);
                });
        });
    });

    it('unsubscribe()', () => {
        return fin.InterApplicationBus.subscribe({ uuid: id }, topic2, noop)
            .then(() => fin.InterApplicationBus.unsubscribe({ uuid: id }, topic2, noop))
            .then(() => fin.InterApplicationBus.send({ uuid: id }, topic2, m))
            .catch(err => {
                assert.equal(err.message, 'Error: No subscriptions match', 'Expected to get a no subscriptions match error');
            });

    });
});
