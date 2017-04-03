


/* Label Class */

/**
 * Класс подписи
 *
 * @param text - текст подписи
 * @constructor
 */
var MarkLabel = function (text) {
    this.COLOR = '#FFF';
    this.SIZE = 24;
    this.WEIGHT = 'bold';
    this.CURSOR = 'default';

    this.text = text;

    this.x = 0;
    this.y = 0;

    this.el = this.draw();

    this.el.markType = markPainter.TYPE_LABEL;
};

/**
 * Отрисовка текста подписи
 *
 * @returns Raphael Object
 */
MarkLabel.prototype.draw = function () {
    return markPainter.paper
        .text(this.x, this.y, this.text)
        .hide()
        .attr({
            'fill': this.COLOR,
            'font-size': this.SIZE,
            'font-weight': this.WEIGHT,
            'cursor': this.CURSOR
        })
        .toFront();
};

/**
 * Изменение позиции подписи
 *
 * @param coordinates - координаты относительно канвы
 */
MarkLabel.prototype.setPosition = function (coordinates) {
    this.x = coordinates.x;
    this.y = coordinates.y;

    this.el
        .attr({
            x: coordinates.x,
            y: coordinates.y
        })
        .show();
};

/**
 * Удаление подписи
 */
MarkLabel.prototype.remove = function () {
    this.el.remove();
};