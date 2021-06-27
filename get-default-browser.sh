#!/bin/zsh

#/usr/bin/plutil -p ~/Library/Preferences/com.apple.LaunchServices/com.apple.launchservices.secure.plist | grep 'https' -b3 |awk 'NR==3 {split($4, arr, "\""); print arr[2]}' 

# return default browser name that would open the URL

function default_browser () {
    osascript <<-AS
    use framework "AppKit"
    use AppleScript version "2.4"
    use scripting additions

    property NSWorkspace : a reference to current application's NSWorkspace
    property NSURL : a reference to current application's NSURL

    set wurl to NSURL's URLWithString:"https://www.apple.com"
    set thisBrowser to (NSWorkspace's sharedWorkspace)'s ¬
                        URLForApplicationToOpenURL:wurl
    set appname to (thisBrowser's absoluteString) as text
    return appname as text
AS
    return
}

printf '%s\n' $(default_browser)
exit 0


