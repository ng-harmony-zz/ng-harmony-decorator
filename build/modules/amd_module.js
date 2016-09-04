import "reflect-metadata";
import "ng-harmony-log";
import { PropertyTransformer } from "ng-harmony/ng-harmony-model";

export function Tag(val) {
	return function decorator(target) {
		let mod = angular.module(val.module) || angular.module(val.module, []);
		mod.directive(val.selector, () => {
			return {
				controller: val.ctrl,
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
		let proto = this.prototype;
		Object.getOwnPropertyNames(proto).forEach((key, i) => {
			if (typeof proto[key] === "function" && key[0] === "$") {
				this.$scope[key] = proto[key].bind(this);
			}
		});

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
			if (val === null || typeof val === "undefined") if (isNullable) {
				return;
			} else {
				throw new VoidError();
			}
			try {
				if (typeof this[`_${ prop }`] !== "undefined" && this[`_${ prop }`] !== null) this[`_${ prop }`](val);
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
					target[prop] = new metadata.type(val);
				} else if (typeof val == t) {
					target[prop] = val;
				} else {
					throw new InMemoryTypeValidationError();
				}
			}
		};
	};
}

export function Nullable() {
	return function decorator(target, prop, descriptor) {
		Reflect.defineMetadata("nullable", true, target, prop);

		if (typeof target[prop] === "undefined") {
			target[prop] = null;
		}
	};
}

export function Derived(o) {
	return function decorator(target, prop, descriptor) {
		let metadata = Reflect.hasMetadata("typeof", target[prop]) && Reflect.getMetadata("typeof", target[prop]);

		if (!(new metadata.type() instanceof PropertyTransform)) {
			throw new Error();
		}

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
			return target[prop].out();
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
				target[prop] instanceof PropertyTransformer ? target[prop].in(_o) : new metadata.type(_o);
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

export function IO(o) {
	return function decorator(target) {
		o.server.RECEPTOR.push(target);
		target.MODEL = o.client;
	};
}

export function PubSub(...o) {
	return function decorator(target) {
		target.LISTENERS = o;
	};
}

export function Evented(...o) {
	return function decorator(target, prop, descriptor) {
		target.EVENTS = target.EVENTS || [];
		o.forEach(ev => {
			target.EVENTS.push(ev);
		});
	};
}

export function UniqueArray() {
	return function decorator(target, prop, descriptor) {
		descriptor.configurable = true;
		descriptor.enumerable = false;
		descriptor.writable = true;
		descriptor.get = () => {
			return target[`_${ prop }`] || [];
		};
		descriptor.set = pushee => {
			let valid = !target[prop].filter(currentItem => {
				let truthy = true;
				Object.keys(curentItem).forEach(prop => {
					return truthy &= newItem[prop] === currentItem[prop];
				});
				return !!truthy;
			}).length;
			target[prop].concat(valid ? _pushee : []);
			return valid;
		};
	};
}

//# sourceMappingURL=amd_module.js.map