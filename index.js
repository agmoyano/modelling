var Waterline = require('waterline');
var extend = require('extend');
var _ = require("lodash");
//var express = require('express');
var util = require('util');

function modelling(options, callback) {
	this._config = {adapters: {}, connections: {}, collections: {}};
/*	this._app = options.app || express();
	delete options.app;*/

	if(options.models) {
		options.collections = options.models;
		delete options.models;
	}
	if(options.policies) {
		this._policies = options.policies;
		delete options.policies;
	}

	if(options.adapters || options.connections || options.collections) {
		extend(this._config, options);
	} else if(options) {
		if(options.identity) {
			this._config.collections[options.identity] = options;
		} else {
			this._config.collections = options;
		}
	}
	this._orm = new Waterline();
	this.done(callback);
	return this;
};

modelling.prototype = {
		setAdapter: function(add, name, adapter) {
			if(typeof add != 'boolean') {
				adapter = name;
				name = add;
				add = false;
			}
			if(adapter) {
				var tmp = {};
				tmp[name]=adapter;
				adapter=tmp;
			} else {
				adapter = name;
			}
			this._config.adapters = extend(add?this._config.adapters:{}, adapter);
			return this;
		},
		adapters: function(name) {
			if(name) return this._config.adapters[name];
			return this._config.adapters;
		},
		remAdapter: function(name) {
			if(name) {
				delete this._config.adapters[name]
			} else {
				this._config.adapters = {};
			}
			return this;
		},
		setConnections: function(add, name, connection) {
			if(typeof add != 'boolean') {
				connection = name;
				name = add;
				add = false;
			}
			if(connection) {
				var tmp = {};
				tmp[name]=connection;
				connection=tmp;
			} else {
				connection = name;
			}
			this._config.connection = extend(add?this._config.connection:{}, connection);
			return this;
		},
		connections: function(name) {
			if(name) return this._config.connections[name];
			return this._config.connections;
		},
		remConnection: function(name) {
			if(name) {
				delete this._config.connections[name]
			} else {
				this._config.connections = {};
			}
			return this;
		},
		setModels: function(add, name, model) {
			if(typeof add != 'boolean') {
				model = name;
				name = add;
				add = false;
			}
			if(model) {
				var tmp = {};
				tmp[name]=model;
				model=tmp;
			} else {
				model = name;
			}
			this._config.collections = extend(add?this._config.collections:{}, model);
			return this;
		},
		models: function(name) {
			if(name) return this._config.collections[name];
			return this._config.collections;
		},
		remModel: function(name) {
			if(name) {
				delete this._config.collections[name]
			} else {
				this._config.collections = {};
			}
			return this;
		},
		setPolicy: function(add, name, policy) {
			if(typeof add != 'boolean') {
				policy = name;
				name = add;
				add = false;
			}
			if(policy) {
				var tmp = {};
				tmp[name]=policy;
				policy=tmp;
			} else {
				policy = name;
			}
			this._policies = extend(add?this._policies:{}, policy);
			return this;
		},
		policies: function(name) {
			if(name) return this._policies[name];
			return this._policies;
		},
		remPolicy: function(name) {
			if(name) {
				delete this._policies[name]
			} else {
				this._policies = {};
			}
			return this;
		},
		use: function(name) {
			var policies = {};
			var self = this;

			var procPolicies = function(ps) {
				if(util.isArray(ps)) {
					ps.forEach(function(p) {
						setPolicy(p);
					});
				} else {
					setPolicy(ps);
				}
			};
			var setPolicy = function(p) {
				if(typeof p == 'string' && !policies[p] && self._policies[p]) {
					policies[p] = {fn: self._policies[p], after: false};
				} else if(_.isPlainObject(p)) {
					for(var i in p) {
						if(!policies[i]) {
							if(p[i] === false) {
								policies[i] = {fn: function(req, res, next) {next();}, after: false};
							} else if(_.isFunction(p[i])) {
								policies[i] = {fn: p[i], after: false};
							} else if(_.isPlainObject(p[i])) {
								if(p[i].fn) {
									policies[i] = {fn: p[i].fn};
								} else if(self._policies[i]) {
									policies[i] = {fn: self._policies[i]};
								}
								if(policies[i]) {
									policies[i].after = p[i].after||false;
								}
							}
						}
					}
				}
			};
			if(_.isPlainObject(name) && name.policies) {
				procPolicies(name.policies);
			}
			if(name.models) {
				name = name.models;
			}

			return function(req, res, next) {
				var models = {};
				var procModels = function(ms) {
					if(!ms) {
						for(var i in self._config.collections) {
							setModel(i);
						}
					} else {
						setModel(ms);
					}
				}
				var setModel = function(m) {
					if(self._config.collections[m]) {
						var tmp = self._config.collections[m];
						if(tmp.policies) {
							procPolicies(tmp.policies);
						}
						models[m] = self._model.collections[m];
					}
				};
				var retfuncs = [
					function(req, res, next) {
						req.model = models;
						next();
					}
				];
				if(util.isArray(name)) {
					name.forEach(function(m){
						procModels(m);
					});
				} else {
					procModels(name);
				}
				for(var i in policies) {
					if(!policies[i].after) {
						retfuncs.unshift(policies[i].fn);
					} else {
						retfuncs.push(policies[i].fn);
					}
				}
				var n = 0;
				var iter = function(err) {
					if(err) {
						next(err);
					} else {
						if(n+1 < retfuncs.length) {
							n++;
							retfuncs[n](req, res, iter);
						} else {
							next();
						}
					}
				};
				retfuncs[0](req, res, iter);
			};

			return retfuncs;
		},
		done: function(callback) {
			var self = this;
			var start = function() {
				var config = extend(true, {}, self._config);
				for(var i in config.collections) {
					self._orm.loadCollection(Waterline.Collection.extend(config.collections[i]));
				}
				delete config.collections;
				self._orm.initialize(config, function(err, model){
					if(err) {
						callback && callback(err);
					} else {
						self._model = model;
						self._started = true;
						callback && callback(null, model);
					}

				});
			}
			if(this._started) {
				this._orm.teardown(function() {
					self._started=false;
					start();
				});
			} else {
				start();
			}

		}
};

module.exports = modelling;
