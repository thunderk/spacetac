var handler = {
    get(target, name) {
        return new Proxy(function () { }, handler);
    }
}
var Phaser = new Proxy(function () { }, handler);

//var debug = console.log;
var debug = function () { };

importScripts("app.js");

onmessage = function (e) {
    debug("[AI Worker] Received", e.data.length);
    var serializer = new TK.Serializer(TK.SpaceTac);
    var battle = serializer.unserialize(e.data);
    var processing = new TK.SpaceTac.AIWorker(battle);
    processing.processHere(function (maneuver) {
        debug("[AI Worker] Send", maneuver);
        postMessage(serializer.serialize(maneuver));
        return maneuver.apply(battle);
    }).catch(postMessage);
}
