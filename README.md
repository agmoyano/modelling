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

* __models__

  Waterline models definition, but with few optional extra parameters. 
  
* __collections__

  synonym for _"models"_.
  
* __adapters__

  Waterline adapters definition. For example:
  
  ```
  new modelling({
  	adapters: {
  		disk: require('sails-disk')
  	}
  });
  ```
  
* __connections__

  Waterline adapters definition. For example:
  
  ```
  new modelling({
  	connections: {
  		conn1: {
  			adapter: 'disk'
  		}
  	}
  });
  ```
  
* __policies__

  Policies to be applied to models.
  
## Model Definition

Waterline models definition, but with few optional extra parameters.