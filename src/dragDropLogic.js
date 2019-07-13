(function () {
    "use strict";
    var DragDropLogic = DragDropLogic || {};
    var _elementToMonitor;
    var _platformerGameInstance;
    DragDropLogic.monitorElement = function (elementToMonitor, platformerGameInstance) {
        _elementToMonitor = elementToMonitor;
        _platformerGameInstance = platformerGameInstance;
          _elementToMonitor.addEventListener("dragenter", DragDropLogic.drag, false);
          _elementToMonitor.addEventListener("dragover", DragDropLogic.drag, false);
          _elementToMonitor.addEventListener("drop", DragDropLogic.drop, false);
    };
    DragDropLogic.drag = function (e) {
        e.stopPropagation();
        e.preventDefault();
    };
    DragDropLogic.drop = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var dt = e.dataTransfer;
        var files = dt.files;
        var firstFileDropped = files[0];
        if (firstFileDropped.type.indexOf("text") == 0) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var text = e.target.result;
                var textLevel = text.replace(/[\s\n\r\t]/g, '');
                _platformerGameInstance.LoadThisTextLevel(textLevel);
            }
            reader.readAsText(firstFileDropped);
        }
    };
    window.DragDropLogic = DragDropLogic;
})();