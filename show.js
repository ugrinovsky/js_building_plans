$(function () {

    var presetsContainer = $('#presets');

    var deletePresetLayoutLayer = $('#delete-preset-layout-layer');
    var painterContextMenuLayer = $('#painter-context-menu-layer');
    var relateAreaLayer = $('#relate-area-layer');

    var layoutCanvas = $('#layout-canvas');

    var layoutImage = layoutCanvas.find('img');
    var painter = null;

    layoutCanvas.css({
        width: layoutImage.width(),
        height: layoutImage.height(),
        background: 'url(' + layoutImage.attr('src') + ')'
    });
    layoutImage.remove();

    painter = new MarkPainter(layoutCanvas, {
        functionContextMenu: painterContextMenu,
        functionContextMenuHide: painterContextMenuHide
    });
    // ---------------------------

    function painterContextMenu(coordinates, area) {
        // if (area.related) {
        //     $('.painter-context-menu-relate').hide();
        //     $('.painter-context-menu-unrelate').show();
        // } else {
        //     $('.painter-context-menu-relate').show();
        //     $('.painter-context-menu-unrelate').hide();
        // }
        // console.log(area)

        painterContextMenuLayer
            .css({
                left: layoutCanvas.offset().left + coordinates.x,
                top: layoutCanvas.offset().top + coordinates.y
            })
            .show();
    }

    function painterContextMenuHide() {
        painterContextMenuLayer.hide();
    }

    $('a.painter-context-menu-delete').click(function (e) {
        e.preventDefault();

        markPainter.deleteActiveArea();
        markPainter.executeContextMenuHide();
    });

    presetsContainer.on('click', 'a.toggle-preset-link', function (e) {
        e.preventDefault();

        $($(this).attr('href')).toggle();

        $(this).toggleClass('uarr darr');
    });


    deletePresetLayoutLayer.on('shown.bs.modal', function (e) {
        var modal = $(this);
        $.getJSON(e.relatedTarget.href, function (response) {
            modal.find('.modal-body').html(response.view);
            _bindDefaults(modal);
        });
    });


    deletePresetLayoutLayer.on('click', 'a.delete-preset-layout-execute', function (e) {
        e.preventDefault();

        $.getJSON($(this).attr('href'), function (response) {
            hideLoader(deletePresetLayoutLayer);

            if (response.success) {
                $('#preset-' + response.layout.preset_id).replaceWith(response.presetView);

                bindFileUpload($('#preset-' + response.layout.preset_id));
                deletePresetLayoutLayer.modal('hide');
            }
        });
    });

    $('a.painter-context-menu-unrelate').click(function (e) {
        e.preventDefault();

        markPainter.unrelateActiveArea();
        markPainter.executeContextMenuHide();
    });


    relateAreaLayer.on('click', '.relate-area-link', function (e) {
        e.preventDefault();

        $(relateAreaLayer).modal('hide');

        markPainter.relateActiveArea($(this).data('id'));
        markPainter.executeContextMenuHide();
    });


    // function bindFileUpload(el) {
    //     el.find('input.upload-preset-layout').fileupload({
    //         start: function () {
    //             showLoader();
    //         },
    //         done: doneFileUpload,
    //         dataType: 'json'
    //     });
    // }

    // function doneFileUpload(e, response) {
    //     hideLoader();

    //     if (response.result.success) {
    //         if (typeof(response.result.preset) !== 'undefined') {
    //             $('#preset-' + response.result.preset.id).replaceWith(response.result.presetView);

    //             bindFileUpload($('#preset-' + response.result.preset.id));
    //         }
    //     } else {
    //         showAlert(response.result.error);
    //     }
    // }

    // bindFileUpload(presetsContainer);

    // $('body').mouseup(function (e) {
    //     if (
    //         !$(e.target).closest(layoutCanvas).length
    //         && !$(e.target).closest(painterContextMenuLayer).length
    //         && painterContextMenuLayer.is(':visible')
    //     ) {
    //         markPainter.executeContextMenuHide();
    //     }
    // });

    

    // relateAreaLayer.on('shown.bs.modal', function (e) {
    //     var modal = $(this);
    //     painterContextMenuHide();

    //     $.getJSON(e.relatedTarget.href, function (response) {
    //         modal.find('.modal-body').html(response.view);
    //         _bindDefaults(modal);

    //     });
    // });

    // function rotateCss(elem, angle) {
    //     elem.style.transform = "rotate(" + angle + "deg)";
    //     elem.style.webkitTransform = "rotate(" + angle + "deg)";
    //     elem.style.mozTransform = "rotate(" + angle + "deg)";
    //     elem.style.oTransform = "rotate(" + angle + "deg)";
    //     elem.style.msTransform = "rotate(" + angle + "deg)";
    // }

    // function rotateWindRose(elem, angle) {
    //     rotateCss(elem, angle);
    //     elem.setAttribute("data-angle", angle);
    //     rotateCss(elem.getElementsByClassName("label-n")[0], -1 * angle);
    //     rotateCss(elem.getElementsByClassName("label-e")[0], -1 * angle);
    //     rotateCss(elem.getElementsByClassName("label-s")[0], -1 * angle);
    //     rotateCss(elem.getElementsByClassName("label-w")[0], -1 * angle);
    // }

    // $('input.layout-upload').fileupload({
    //     start: function () {
    //         showLoader();
    //     },
    //     done: function (e, response) {
    //         if (response.result.success) {
    //             document.location.reload();
    //         } else {
    //             showAlert(response.result.error);
    //         }
    //     },
    //     dataType: 'json'
    // });


});