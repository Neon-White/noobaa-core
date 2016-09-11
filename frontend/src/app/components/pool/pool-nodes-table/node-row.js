import Disposable from 'disposable';
import ko from 'knockout';
import numeral from 'numeral';
import { deepFreeze } from 'utils';

const nodeStateMapping = deepFreeze({
    offline: {
        css: 'error',
        name: 'problem',
        tooltip: 'offline'
    },
    deactivated: {
        css: 'warning',
        name: 'problem',
        tooltip: 'deactivated'
    },
    online: {
        css: 'success',
        name: 'healthy',
        tooltip: 'online'
    }
});

const activityNameMapping = deepFreeze({
    RESTORING: 'Restoring',
    MIGRATING: 'Migrating',
    DECOMMISSIONING: 'Deactivating',
    DELETING: 'Deleting'
});

const activityStageMapping = deepFreeze({
    OFFLINE_GRACE: 'Waiting',
    REBUILDING: 'Rebuilding',
    WIPING: 'Wiping Data'
});

export default class NodeRowViewModel extends Disposable {
    constructor(node) {
        super();

        this.state = ko.pureComputed(
            () => {
                if (!node()) {
                    return '';
                }

                if (!node().online) {
                    return nodeStateMapping.offline;

                } else if (node().decommissioning || node().decommissioned) {
                    return nodeStateMapping.deactivated;

                } else {
                    return nodeStateMapping.online;
                }
            }
        );

        this.name = ko.pureComputed(
            () => {
                if (!node()) {
                    return '';
                }

                let { name } = node();
                return {
                    text: name,
                    href: { route: 'node', params: { node: name, tab: null } }
                };
            }
        );

        this.ip = ko.pureComputed(
            () => node() ? node().ip : ''
        );

        let storage = ko.pureComputed(
            () => node() ? node().storage : {}
        );

        this.capacity = {
            total: ko.pureComputed(
                () => storage().total
            ),
            used: [
                {
                    label: 'Used (Noobaa)',
                    value: ko.pureComputed(
                        () => storage().used
                    )
                },
                {
                    label: 'Used (other)',
                    value: ko.pureComputed(
                        () => storage().used_other
                    )
                }
            ]
        };

        this.trustLevel = ko.pureComputed(
            () => node() ?
                (node().trusted ? 'Trusted' : 'Untrusted') :
                ''
        );

        this.dataActivity = ko.pureComputed(
            () => {
                if (!node() || !node().data_activity) {
                    return 'No activity';
                }

                let { reason, stage, progress } = node().data_activity;
                return `${
                    activityNameMapping[reason]
                } ${
                    numeral(progress).format('0%')
                } | ${
                    activityStageMapping[stage.name]
                }`;
            }
        );
    }
}
