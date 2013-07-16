# newtab
## Grunt tasks
* `grunt version`
	* gets the current version of the plugin
	* **warning: this will permanently delete all contents of the destination folder**
* `grunt clean`
	* cleans up the working directory by deleting files like newtab.xpi
* `grunt clean:remote`
	* deletes all newtab related files from the remote server
* `grunt run:arg0:arg1:…:argn`
	* runs the the mozilla sdk cfx run command with all of the arguments specified
	* examples: `grunt run` or `grunt run:--force-mobile`
* `grunt xpi:arg0:arg1:…:argn`
	* runs the the mozilla sdk cfx xpi command with all of the arguments specified and puts the xpi in the project's main directory
	* example: `grunt xpi:--strip-sdk:--force-mobile`
* `grunt push`
	* pushs just prototype to the mozilla people server (does not push the .xpi)
* `grunt release`
	* this will generate the xpi file and upload it to the remote server, call grunt push, and push to the central git repo
	* this will not make a git tag or update the package.json version numbers
* `grunt release:major`
	* this will increment the version number to the next whole number, make a git tag, update the package.json version numbers, generate the xpi file and upload it to the remote server, call grunt push, and push all code to the central git repo
	* for instance: 1 &#8594; 2, 1.5 &#8594; 2
* `grunt release:minor`
	* this will bump up the version number to the next 1/100 , make a git tag, update the package.json version numbers, generate the xpi file and upload it to the remote server, call grunt push, and push all code to the central git repo
	* for instance: 1 &#8594; 1.01, 1.61 &#8594; 1.62, 1.5 &#8594; 1.51 1.99 &#8594; 2
* `grunt release:x`
	* this will set the version number to x , make a git tag, update the package.json version numbers, generate the xpi file and upload it to the remote server, call grunt push, and push all code to the central git repo
	* example: `grunt release:2.3`

## grunt-settings.json
This contains all of your settings for running and deploying the addon.  
The expected format is as follows:

	{
		"host": "example.com",
		"username": "jsmith",
		"path": "/home/jsmith/public_html/newtab/",
		"privateKey": "../secrets/id_rsa",
		"passphrase": "hunter2",
		"base_url": "http://example.com/~jsmith/newtab",
		"binary": "/Applications/FirefoxuUX.app/Contents/MacOS/firefox-bin"
	}
"binary" is firefox binary to run the addon with and is not required.
