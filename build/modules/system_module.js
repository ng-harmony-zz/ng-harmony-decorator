import { Reflect } from "reflect-metadata";
import { Log, NotImplementedError, VoidError, InMemoryTypeValidationError } from "ng-harmony-log";

export function Component(val) {
	return function decorator(target) {
		let mod = angular.module(val.module) || angular.module(val.module, []);
		mod.directive(val.selector, () => {
			return {
				controller: val.ctrl,
				controllerAs: val.ctrlAs || null,
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
			name: target.name
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
			Object.keys(mixin).forEach((k, j) => {
				(target.prototype[k] === null || typeof target.prototype[k] === "undefined") && Object.defineProperty(target.prototype, k, Object.getOwnPropertyDescriptor(mixin, k));
			});
		}
	};
}

export function Implements(...interfaces) {
	return function decorator(target) {
		for (let [i, Interface] of interfaces.entries()) {
			Object.keys(Interface).forEach((k, j) => {
				(target.prototype[k] === null || typeof target.prototype[k] === "undefined") && Object.defineProperty(target.prototype, k, {
					value: () => {
						throw new NotImplementedError(k);
					},
					enumerable: true
				});
			});
		}
	};
}

export function Logging(level) {
	return function decorator(target) {
		Object.keys(Log).forEach((k, j) => {
			(target.prototype[k] === null || typeof target.prototype[k] === "undefined") && Object.defineProperty(target.prototype, k, {
				value: () => {
					throw new NotImplementedError(k);
				},
				enumerable: true
			});
		});
		target.DEBUG_LEVEL = level || "info";
	};
}

export function Validate() {
	return function decorator(target, prop, descriptor) {
		let isNullable = Reflect.hasMetadata("nullable", target[prop]) && Reflect.getMetadata("nullable", target[prop]);

		descriptor.configurable = true;
		descriptor.enumerable = true;
		descriptor.writable = true;
		descriptor.get = () => {
			return target[prop];
		};
		descriptor.set = val => {
			if (val === null || typeof val === "undefined") {
				if (isNullable) {
					target[prop] = val;
					return;
				} else {
					throw new VoidError();
				}
			}
			try {
				if (typeof this[`_${prop}`] === "function") {
					this[`_${prop}`](val);
				}
			} catch (e) {
				if (e.level === "info" || e.level === "debug") {
					this.log(e);
					return;
				} else {
					throw e;
				}
			}
			if (Reflect.hasMetadata("typeof", target[prop])) {
				let metadata = Reflect.getMetadata("typeof", target[prop]);
				let t = metadata.type.name.toLowerCase();
				if (val instanceof metadata.type) {
					target[prop] = val;
				} else {
					try {
						target[prop] = new metadata.type(val);
					} catch (e) {
						this.log(new InMemoryTypeValidationError());
						throw e;
					}
				}
			}
		};
	};
}

export function Nullable() {
	return function decorator(target, prop, descriptor) {
		if (typeof target[prop] === "undefined") {
			target[prop] = null;
		}
		Reflect.defineMetadata("nullable", true, target, prop);
	};
}

export function Transform(derive) {
	return function decorator(target, prop, descriptor) {
		let isNullable = Reflect.hasMetadata("nullable", target[prop]) && Reflect.getMetadata("nullable", target[prop]);

		descriptor.configurable = true;
		descriptor.enumerable = false;
		descriptor.writable = true;
		descriptor.get = () => {
			if (target[prop] === null || typeof target[prop] === "undefined") {
				if (isNullable) {
					return null;
				} else {
					throw new VoidError();
				}
			}
			return target[`_$(prop)`];
		};
		descriptor.set = _o => {
			try {
				if (_o === null || typeof _o === "undefined") {
					if (isNullable) {
						return;
					} else {
						throw new VoidError("No Input given");
					}
				}
				target[`_$(prop)`] = derive(_o);
			} catch (e) {
				if (e.level === "info" || e.level === "debug") {
					this.log(e);
					return;
				} else {
					throw e;
				}
			}
		};
	};
}

export function AjaxMap(o) {
	return function decorator(target, prop, descriptor) {
		target.MAP = o;
	};
}

export function Evented(...o) {
	return function decorator(target, prop, descriptor) {
		target.EVENTS = target.EVENTS || [];
		o.forEach(ev => {
			target.EVENTS.push({
				e: ev,
				fn: prop
			});
		});
	};
}

//# sourceMappingURL=system_module.js.map