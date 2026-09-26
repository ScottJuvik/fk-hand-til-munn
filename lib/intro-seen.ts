// The home page intro splash plays once per browser session. This key marks it
// as seen, and the script (inlined in <head>) tags <html> before first paint on
// later loads, so the server-rendered splash is hidden instead of flashing.
export const INTRO_SEEN_KEY = "htm-intro-seen"

export const INTRO_SEEN_SCRIPT = `try{if(sessionStorage.getItem("${INTRO_SEEN_KEY}"))document.documentElement.dataset.introSeen=""}catch(e){}`
