This is the page that lets the user customize their newtab page

* Sizing
	* apps can have 4 sizes but the total of all of the sizes of the apps on a given panel MUST be no greater than 6!
		* **2**: 1/3 (2/6) of the panel
		* **3**: 1/2 (3/6) of the panel
		* **4**: 2/3 (4/6) of the panel
		* **6**: 1/1 (6/6) of the panel
* Code layout
	* there are two basic class
		* Customizer
			* this is the class that is the overlying structure of the customizer application
			* it has many panels
		* Panel
			* panels have many applications
			* each application isn't a class but rather a normal javascript object
* method for expanding apps
	1. increase the size of app
	2. if the new size of the app fits on the panel without resizing any apps before it, then leave the app alone
	3. if the next app still fits on this panel without resizing any of the apps before it, leave it alone and quit
	4. if the next app needs to go to a new panel then prepend