import { Reflect } from "reflect-metadata";
import { Log, NotImplementedError, VoidError, InMemoryTypeValidationError } from "ng-harmony-log";

export function Component(val) {
	return function decorator(target) {
		let mod = angular.module(val.module) || angular.module(val.module, []);
		mod.directive(val.selector, () => {
			return {
				controller: val.controller,
				controllerAs: val.controllerAs || target.CTRL_AS || null,
				restrict: val.restrict || "A",
				replace: val.replace || false,
				templateUrl: val.templateUrl || null,
				template: val.template || null,
				scope: val.scope === true ? {} : val.scope || null
			};
		});
	};
}

export function Controller(val) {
	return function decorator(target) {
		target.CTRL_AS = val.controllerAs || null;

		let r = {};
		r[val.module] = {
			type: "controller",
			name: val.name || target.name
		};
		target.$register = r;
		if (val.deps !== null && typeof val.deps !== "undefined") {
			target.$inject = val.deps;
		}
	};
}

export function Service(val) {
	return function decorator(target) {
		let r = {};
		r[val.module] = {
			type: "service",
			name: val.name
		};
		target.$register = r;
		if (val.deps !== null && typeof val.deps !== "undefined") {
			target.$inject = val.deps;
		}
	};
}

export function Mixin(...mixins) {
	return function decorator(target) {
		for (let [i, mixin] of mixins.entries()) {
			Object.getOwnPropertyNames(mixin.prototype).forEach((k, j) => {
				(target.prototype[k] === null || typeof target.prototype[k] === "undefined") && Object.defineProperty(target.prototype, k, Object.getOwnPropertyDescriptor(mixin.prototype, k));
			});
		}
	};
}

export function Logging(config) {
	return function decorator(target) {
		target.prototype.log = function ({ level, msg }, e = {}) {
			this.Logger[level](e, msg);
		}.bind(target.prototype);
		Object.defineProperty(target.prototype, "Logger", {
			value: Log.create.call(target.prototype, {
				loggerName: config.loggerName,
				rollbarToken: config.remoteLoggerToken || null,
				environment: config.environment,
				npmPackageVersion: config.npmPackageVersion
			}),
			enumerable: true
		});
	};
}

export function Evented(...o) {
	return function decorator(target, prop, descriptor) {
		target.constructor.EVENTS = target.constructor.EVENTS || [];
		o.forEach(ev => {
			target.constructor.EVENTS.push({
				ev: ev,
				fn: prop
			});
		});
	};
}

//# sourceMappingURL=common_module.js.map