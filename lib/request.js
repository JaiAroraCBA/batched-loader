'use strict';

const Assert = require('assert');


module.exports = class Request {
    constructor(key, target) {
        this.completed = null;
        this.key = key;
        this.signalHandlers = [];
    }

    isCompleted() {
        return !!this.completed;
    }

    notify(target) {
        this.signalHandlers.push(target);

        if (this.completed) {
            // Handle the case where a callback is added synchronously during
            // the handling of a result. In this case, notify the callback
            // asynchronously to avoid Zalgo.
            this.completed.type === 'error'
                ?   process.nextTick(() => target(this.completed.value))
                :   process.nextTick(() => target(null, this.completed.value));
        }
    }

    signalError(error) {
        if (this.completed){
            return;
        }

        this.completed = {
            type: 'error',
            value: error,
        };

        this.signalHandlers.forEach(target => target(error));
    }

    signalResult(result) {
        if (this.completed){
            return;
        }

        this.completed = {
            type: 'result',
            value: result,
        };

        this.signalHandlers.forEach(target => target(null, result));
    }
};
