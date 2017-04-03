


/* Line Class */

/**
 * Класс линии
 *
 * @param start - координаты начала линии относительно канвы
 * @param end - координаты конца линии относительно канвы
 * @constructor
 */
var MarkLine = function (start, end) {
    this.STROKE = 2;

    this.setCoordinates(start, end);

    this.el = this.draw();

    this.el.markType = markPainter.TYPE_LINE;
};

/**
 * Сохранение координат линии
 *
 * @param start - координаты начала линии относительно канвы
 * @param end - координаты конца линии относительно канвы
 */
MarkLine.prototype.setCoordinates = function (start, end) {
    this.x1 = (start ? start.x || 0 : 0);
    this.y1 = (start ? start.y || 0 : 0);
    this.x2 = (end ? end.x || 0 : 0);
    this.y2 = (end ? end.y || 0 : 0);
};

/**
 * Отрисовка линии
 *
 * @returns Raphael Object
 */
MarkLine.prototype.draw = function () {
    return markPainter.paper
        .path(this.getPath())
        .attr({
            'stroke-width': this.STROKE
        })
        .toBack();
};

/**
 * Перерисовка линии
 *
 * @param start - координаты начала линии относительно канвы
 * @param end - координаты конца линии относительно канвы
 * @returns Raphael Object
 */
MarkLine.prototype.reDraw = function (start, end) {
    this.setCoordinates(start, end);

    return this.el.attr('path', this.getPath());
};

/**
 * Формирование описания пути из координат линии
 *
 * @returns {string}
 */
MarkLine.prototype.getPath = function () {
    return 'M' + this.x1 + ' ' + this.y1 + 'L' + this.x2 + ' ' + this.y2;
};/**
 * Created by user on 13.05.15.
 */