# newtab
## Grunt tasks
* grunt clean
	* cleans up the working directory by deleting files like newtab.xpi
* grunt push
	* deploys only the most recent prototype (#4) to the mozilla people server
* grunt deploy
	* deploys all prototypes to the mozilla people server
* grunt run
	* runs the plugin (all ./website files will be loaded locally so deploying in not neccessary)
* grunt xpi
	* packages up the the plugin and puts it in the main directory
* grunt export
	* runs xpi and deploy
* grunt release:release_number
	* updates package.json files and git with new version number and runs export
* grunt version
	* gets the current version of the plugin