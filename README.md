# Modelling

Simple model part for custom mvc over express/connect routes. 

The idea is quite simple. 

This is the model part, your express route functions are the controllers, and your html is the view part.

It's just a wrapper over [Waterline](https://www.npmjs.org/package/waterline), to make it really easy to use with your express route middleware.

Why do this when you have great mvc frameworks like [Sails](https://www.npmjs.org/package/sails)?

The answer is simple, sometimes you don't need a framework. For example, if you are not creating an app, but a library, where you need to control part of the model, but you don't really know the whole model, a framework can be very annoying.

## Install

Install via npm:

    npm install modelling
    
To use it inside your project:

```
var orm = new modelling(options);
``` 

and then, for example, with express:

```
app.get('/route/:id', orm.use('mymodel'), function(req, res, next) {
	//all waterline collections are placed in req.model
	req.model.mymodel.findOne({id: req.params.id}).exec(...);  
});
```

## Options

* __collections__

  synonym for _"models"_.
  
* __adapters__

  Waterline adapters definition. For example:
  
  ``` 
  var options = {
  	adapters: {
  		disk: require('sails-disk')
  	}
  };
  
  new modelling(options);
  ```
  
* __connections__

  Waterline adapters definition. For example:
  
  ```
  var options = {
	connections: {
		conn1: {
			adapter: 'disk'
		}
	}
  };
  new modelling(options);
  ```
  
* __policies__

  Policies to be applied to models. You write them in the form of express/connect middleware. They can be applied before or after retrieving the model. 
  
  For example:
  
  ```
  var options = {
	policies: {
		loggedIn: function(req, res, next) {
			if(req.session.userId) {
				next();
			} else {
				res.redirect('/login');
			}
		},
		isAdmin: {
			fn: function(req, res, next) {
				(!req.model || !req.model.user) && return next('user model needed');
				req.model.user.findOne({id: req.session.userId}, function(err, user) {
					if(!err && user && user.isAdmin) {
						next();
					} else {
						next(err||'You are not Admin');
					}
				});
			},
			after: true
		}
	}
  };
  new modelling(options);
  ```
  Notice in this example that we have 2 policies defined, _"loggedIn"_ to ensure user is logged in, and _"isAdmin"_ to check if user has admin rights.
  Because we need user data to check admin rights, we set _"after"_ property to true;
  
* __models__

  Waterline models definition, but with an __optional__ extra parameter. The extra parameter is _"policies"_, and is a string, or array of strings where you define the name of default policies to apply to model.
  
  Models __must__ comply with waterline model definition. For example:
  
  ```
  var options = {
  	models: {
  		user: {
  			identity: 'user',
  			connection: 'conn1',
  			schema: true,
  			policies: 'loggedIn',
  			attributes: {
  				name: {type: 'string', required: true},
  				pass: {type: 'string', required: true},
  				isAdmin: 'boolean'
  			}
  		}
  	}
  };
  ```
  
##API

###Adapters

* **setAdapter([add,] [name,] adapter)**

  Returns modelling instance for chaining purposes.
  
  * __add__ Boolean. If _true_, the adapter definition will be added to the rest. Otherwise adapters definition will be replaced. Defaults _false_.
  * __name__ String. The name of the adapter definition. If ommited, _adapter_ definition must include the name as first property.
  * __adapter__ Object. The definition of the adapter. If _name_ parameter was ommited _adapter_ definition must include the name as first property.
  
  The following are equivalent:
    
  ```
  instance.setAdapter('pg', require('sails-postgres'));
  ```
    
  ```
  instance.setAdapter({pg: require('sails-postgres'});
  ```
  
  If the adapter definition was already present, it will be overwritten.
  
  After all changes are made to adapters, _done_ function must be called to be applied in waterline.
  
* **adapters([name])**

  Returns adapters definition. If _name_ is present, will return the definition of the specified adapter.
  
* **remAdapter([name])**

  Returns modelling instance for chaining purposes.
  
  Deletes all adapters definition. If name is present, will only delete the definition for the specified adapter.
  
  After all changes are made to adapters, _done_ function must be called to be applied in waterline.
  
###Connections

* **setConnection([add,] [name,] connection)**

  Returns modelling instance for chaining purposes.
  
  * __add__ Boolean. If _true_, the connection definition will be added to the rest. Otherwise connections definition will be replaced. Defaults _false_.
  * __name__ String. The name of the connection definition. If ommited, _connection_ definition must include the name as first property.
  * __connection__ Object. The definition of the connection. If _name_ parameter was ommited _connection_ definition must include the name as first property.
  
  The following are equivalent:
    
  ```
  instance.setConnection('localhost', {adapter: 'disk'});
  ```
    
  ```
  instance.setConnection({localhost: {adapter: 'disk'}});
  ```
  
  If the connection definition was already present, it will be overwritten.
  
  After all changes are made to connections, _done_ function must be called to be applied in waterline.
  
* **connections([name])**

  Returns connections definition. If _name_ is present, will return the definition of the specified connection.
  
* **remConnection([name])**

  Returns modelling instance for chaining purposes.
  
  Deletes all connections definition. If name is present, will only delete the definition for the specified connection.
  
  After all changes are made to connections, _done_ function must be called to be applied in waterline.
  
###Models

* **setModel([add,] [name,] model)**

  Returns modelling instance for chaining purposes.
  
  * __add__ Boolean. If _true_, the model definition will be added to the rest. Otherwise models definition will be replaced. Defaults _false_.
  * __name__ String. The name of the model definition. If ommited, _model_ definition must include the name as first property.
  * __model__ Object. The definition of the model. If _name_ parameter was ommited _model_ definition must include the name as first property.
  
  The following are equivalent:
    
  ```
  instance.setModel('localhost', {adapter: 'disk'});
  ```
    
  ```
  instance.setModel({localhost: {adapter: 'disk'}});
  ```
  
  If the model definition was already present, it will be overwritten.
  
  After all changes are made to models, _done_ function must be called to be applied in waterline.
  
* **models([name])**

  Returns models definition. If _name_ is present, will return the definition of the specified model.
  
* **remModel([name])**

  Returns modelling instance for chaining purposes.
  
  Deletes all models definition. If name is present, will only delete the definition for the specified model.
  
  After all changes are made to models, _done_ function must be called to be applied in waterline.
  
###Policies

* **setPolicy([add,] [name,] policy)**

  Returns modelling instance for chaining purposes.
  
  * __add__ Boolean. If _true_, the policy definition will be added to the rest. Otherwise policies definition will be replaced. Defaults _false_.
  * __name__ String. The name of the policy definition. If ommited, _policy_ definition must include the name as first property.
  * __policy__ Object. The definition of the policy. If _name_ parameter was ommited _policy_ definition must include the name as first property.
  
  The following are equivalent:
    
  ```
  instance.setPolicy('pg', require('sails-postgres'));
  ```
    
  ```
  instance.setPolicy({pg: require('sails-postgres'});
  ```
  
  If the policy definition was already present, it will be overwritten.
  
  As policies are not a part of waterline, is not necesary to call _done_ function when you only change policies.
  
* **policies([name])**

  Returns policies definition. If _name_ is present, will return the definition of the specified policy.
  
* **remPolicy([name])**

  Returns modelling instance for chaining purposes.
  
  Deletes all policies definition. If name is present, will only delete the definition for the specified policy.
  
  As policies are not a part of waterline, is not necesary to call _done_ function when you only change policies.
  
###General

* **done()**

  Returns void. 
  
  This function is called when you want to apply changes in models, adapters or connections.
  
* **use(options)**

  Returns a function that can be placed as express/connect middleware. If all policies comply, it places all models specified in `req.model`.
	
  __options__ can be a _string_, an _array_ of strings or an _object_.
	
  * If it's a __string__ it will be interpreted as the name of the model you want to access. Default policies of the model will be applied.
  * If it's an __array__ it will be interpreted as an array of names of the models you want to access. Default policies of all models will be applied.
  * If it's an __object__, it must contain a _models_ property, and optionally can contain a _policies_ property.
  	* _models_: Has to be of type _string_ or _array_ of strings.
  	* _policies_: Here you can define custom policies to implement in a particular route. You can also override default policies of models. If you redefine a policy to `false`, it will not be applied this time.
  	
  For example:
  
  ```
  app.get('/user/docs', orm.use('user'), function(req, res, next) {
  	//"user" waterline's model definition is placed in req.model.user
  	req.model.user.findOne({id: req.session.userId}).populate('docs').exec(...);
  });
  ```
  
  Get the _user_ model in this route. Notice you can _populate_ other models; 
  
  ```
  app.post('/user/docs', orm.use(['user', 'docs']), function(req, res, next) {
  	req.model.user.findOne({id: req.session.userId}, function(err, user){
  		if(!err && user) {
  			req.model.docs.find().exec(function(err, docs){
  				//do something
  			});
  		}
  	});
  });
  ```
  
  This is an inefficient clone of the example above, but good for showing how to get both _user_ and _docs_ models in this route.
  
  Now, for the next example, we get a little more complicated. 
  
  Suppose we are making _"The John's Club"_ application, and there is a form where users register themselves. 
  
  Suppose there are two basic rules:
  
  * Your name must be 'John'.
  * There cannot be two Johns with the same lastname.
  
  Here is what we could do:
  
  ```
  app.post('/johns', orm.use({
  	policies: {
  		loggedIn: false,
  		hasJohnName: function(req, res, next) {
  			//ensure username is John
  			if(req.body.name == 'John') {
  				next();
  			} else {
  				next("You'r not a John");
  			}
  		},
  		uniqueLastname: {
  			fn: function(req, res, next) {
  				req.model.user.findOne({lastname: req.body.lastname}, function(err, user) {
  					if(err) return next(err);
  					if(user) return next('There is an other John with your lastname');
  					next();
  				}
  			},
  			after: true
  		}
  	},
  	models: 'user'
  }), function(req, res, next) {
  	//create john user
  });
  ```
  
  As you see, we've got 3 policies. 
  * The first one actually overrides the loggedIn policy of user model. As this is the result of a post from an auto register form, we know the user won't be logged in. So we take this policy out. 
  * The second policy applies before we retrieve the model. It ensures that the name of the user is actually 'John'.
  * The third rule applies after we retrieve the model. It ensures there is no other John with your lastname.

<!--
##What's next

* Pub/Sub using socket.io for automatic data update in view (probably using Angular).
* Automatic REST api for each model (still not sure about this).
-->

## Help!

Any suggestions, bug reports, bug fixes, Pull Requests, etc, are very wellcome ([here](https://github.com/agmoyano/modelling/issues)). 

Thanks for reading!.
  
