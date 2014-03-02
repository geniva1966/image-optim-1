### Cross platform nodejs wrapper for optipng and jpegtran

####Supported Platforms

* Windows
* Mac
* Linux

####Installation

```
npm install image-optim
```


####Usage

```js

	var optimizer = require('image-optim');

	optimizer.optimize('path-to-image', function(err) {

		if(err) return console.log(err);
	
		console.log('Successfully Optimized');

	})

```

jpeg/jpg files are optimized with jpegtran and png/tiff files are optimized with optipng.


####License
MIT