Notes:

Set "browser.newtab.url" pref to people.mo
  Services.prefs.setCharPref('browser.newtab.url',
                             'https://people.mozilla.com/~bwinton/australis/customization/mac/');
Or, override about:newtab handling?
  Perhaps see mobile/android/components/AboutRedirector.js for how to do it?

