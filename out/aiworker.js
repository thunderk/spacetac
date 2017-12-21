var handler = {
    get(target, name) {
        return function () { }
    }
}
var Phaser = new Proxy({}, handler);

//var debug = console.log;
var debug = function () { };

importScripts("build.js");

onmessage = function (e) {
    debug("[AI Worker] Received", e.data.length);
    var serializer = new TK.Serializer(TK.SpaceTac);
    var battle = serializer.unserialize(e.data);
    var processing = new TK.SpaceTac.AIWorker(battle);
    processing.processHere(function (maneuver) {
        debug("[AI Worker] Send", maneuver);
        postMessage(serializer.serialize(maneuver));
        return maneuver.apply(battle);
    }).catch(postMessage).then(close);
}
