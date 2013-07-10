# newtab
## Grunt tasks
* grunt clean
	* cleans up the working directory by deleting files like newtab.xpi
* grunt version
	* gets the current version of the plugin
* grunt push **warning: this will permanently delete all contents of the destination folder**
	* pushs prototype to the mozilla people server
* grunt cfx:arg0:arg1:…:argn
	* runs the the mozilla sdk cfx command with all of the arguments specified at once
	* examples: grunt cfx:xpi, grunt cfx:run:--force-mobile
* grunt release
	* this will generate the xpi file and upload it to the remote server, call grunt push, and push to the central git repo
	* this will not make a git tag or update the package.json version numbers
* grunt release:major
	* this will increment the version number to the next whole number, make a git tag, update the package.json version numbers, generate the xpi file and upload it to the remote server, call grunt push, and push all code to the central git repo
	* example: 1 &#8594; 2, 1.5 &#8594; 2
* grunt release:minor
	* this will bump up the version number to the next 1/100 , make a git tag, update the package.json version numbers, generate the xpi file and upload it to the remote server, call grunt push, and push all code to the central git repo
	* examples: 1 &#8594; 1.01, 1.61 &#8594; 1.62, 1.5 &#8594; 1.51 1.99 &#8594; 2
* grunt release:x
	* this will set the version number to x , make a git tag, update the package.json version numbers, generate the xpi file and upload it to the remote server, call grunt push, and push all code to the central git repo
	* example: grunt release:2.3